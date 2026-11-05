function appearanceCreateStore(form) {
  let config = { ...APPEARANCE_DEFAULTS }
  let revision = 0
  let error = null
  let disposed = false
  const listeners = new Set()
  let unsubscribe = null

  const readValue = () => {
    try {
      const snapshot = form?.getSnapshot?.()
      const value = snapshot?.value
      return value && typeof value === 'object' ? value : {}
    } catch {
      return {}
    }
  }

  const adopt = () => {
    if (disposed) return
    const value = readValue()
    const next = { ...APPEARANCE_DEFAULTS, ...value }
    if (appearanceDeepEqual(next, config)) return
    config = next
    revision += 1
    notify()
  }

  const notify = () => {
    for (const listener of [...listeners]) {
      try {
        listener()
      } catch (cause) {
        console.error('appearance: store listener failed', cause)
      }
    }
  }

  config = { ...APPEARANCE_DEFAULTS, ...readValue() }
  try {
    unsubscribe = form?.subscribe?.(() => adopt())
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause)
  }

  return {
    getSnapshot() {
      return { config, revision, error }
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    set(patch) {
      if (disposed) return Promise.resolve()
      const entries = Object.entries(patch ?? {})
      if (entries.length === 0) return Promise.resolve()
      const next = { ...config, ...patch }
      config = next
      revision += 1
      error = null
      notify()
      let write
      try {
        if (entries.length === 1 && typeof form?.set === 'function') {
          write = form.set(entries[0][0], entries[0][1])
        } else if (typeof form?.mutate === 'function') {
          write = form.mutate(entries.map(([key, value]) => ({ op: 'set', path: [key], value })))
        } else {
          write = Promise.all(entries.map(([key, value]) => form.set(key, value)))
        }
      } catch (cause) {
        write = Promise.reject(cause)
      }
      return Promise.resolve(write)
        .then(() => {
          adopt()
        })
        .catch((cause) => {
          if (disposed) return
          error = cause instanceof Error ? cause.message : String(cause)
          config = { ...APPEARANCE_DEFAULTS, ...readValue() }
          revision += 1
          notify()
        })
    },
    dispose() {
      disposed = true
      listeners.clear()
      try {
        unsubscribe?.()
      } catch {}
      unsubscribe = null
    },
  }
}

function appearanceUseStore(store) {
  const [snapshot, setSnapshot] = React.useState(() => store.getSnapshot())
  React.useEffect(() => {
    setSnapshot(store.getSnapshot())
    return store.subscribe(() => setSnapshot(store.getSnapshot()))
  }, [store])
  return snapshot
}

function appearanceResolvePalette(config) {
  return (
    APPEARANCE_PALETTES.find((palette) => palette.id === config.palette) ??
    APPEARANCE_PALETTES.find((palette) => palette.id === 'custom')
  )
}

function appearanceResolveColors(config, scheme) {
  const palette = appearanceResolvePalette(config)
  const presetMain = palette && palette.main ? palette.main : null
  const presetBackground = palette && palette.bg ? palette.bg : null
  const mainColor = presetMain ?? (appearanceIsHex(config.mainColor)
    ? config.mainColor
    : APPEARANCE_DEFAULTS.mainColor)
  let backgroundColor = presetBackground ?? (appearanceIsHex(config.backgroundColor) ? config.backgroundColor : '')
  let autoBackground = false
  if (backgroundColor === '') {
    backgroundColor = scheme === 'dark' ? '#151517' : '#FFFFFF'
    autoBackground = true
  }
  return {
    mainColor,
    backgroundColor,
    autoBackground,
    dark: appearanceWantsDark(backgroundColor),
    palette,
  }
}

function appearanceResolvedScheme(ctx) {
  try {
    const snapshot = ctx.theme.getTheme()
    return snapshot?.active?.colorScheme === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/* -------------------------------------------------------------------------- *
 * Main-colour gradient
 * -------------------------------------------------------------------------- */

/** Target ids in their configured order, with `auto` defaults. */
function appearanceGradientTargetDefaults() {
  const targets = {}
  for (const group of APPEARANCE_GRADIENT_TARGET_GROUPS) {
    for (const item of group.items) targets[item.id] = 'auto'
  }
  return targets
}

/** Parse the Host-stored JSON map; unknown ids/values fall back to `auto`. */
function appearanceParseGradientTargets(raw) {
  const targets = appearanceGradientTargetDefaults()
  if (typeof raw !== 'string' || raw.trim() === '') return targets
  let parsed = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = null
  }
  if (!parsed || typeof parsed !== 'object') return targets
  for (const id of Object.keys(targets)) {
    const value = parsed[id]
    if (value === 'horizontal' || value === 'vertical' || value === 'radial' || value === 'off') {
      targets[id] = value
    }
  }
  return targets
}

/** Auto gradient end: rotate the main hue and lift its lightness. */
function appearanceDeriveGradientEnd(mainColor) {
  const color = appearanceParseColor(mainColor) || appearanceParseColor('#4D6BFE')
  const red = color.r / 255
  const green = color.g / 255
  const blue = color.b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2
  let hue = 0
  let saturation = 0
  if (max !== min) {
    const delta = max - min
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6
    else if (max === green) hue = ((blue - red) / delta + 2) / 6
    else hue = ((red - green) / delta + 4) / 6
  }
  hue = (hue + 42 / 360) % 1
  saturation = appearanceClamp(saturation * 0.92 + 0.06, 0.35, 0.9)
  const light = appearanceClamp(lightness + 0.09, 0.35, 0.84)
  const hueToChannel = (p, q, t) => {
    let value = t
    if (value < 0) value += 1
    if (value > 1) value -= 1
    if (value < 1 / 6) return p + (q - p) * 6 * value
    if (value < 1 / 2) return q
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6
    return p
  }
  let channels
  if (saturation === 0) {
    channels = [light, light, light]
  } else {
    const q = light < 0.5 ? light * (1 + saturation) : light + saturation - light * saturation
    const p = 2 * light - q
    channels = [
      hueToChannel(p, q, hue + 1 / 3),
      hueToChannel(p, q, hue),
      hueToChannel(p, q, hue - 1 / 3),
    ]
  }
  return '#' + channels.map((channel) => {
    const value = Math.round(appearanceClamp(channel, 0, 1) * 255).toString(16)
    return value.length < 2 ? '0' + value : value
  }).join('').toUpperCase()
}

/**
 * Resolve gradient settings into the paint-time bundle:
 * `{ mode, from, to, angle, strength, targets }`, or null when disabled.
 */
function appearanceResolveGradient(config, mainColor) {
  const mode = config && (config.gradientMode === 'universal' || config.gradientMode === 'custom')
    ? config.gradientMode
    : null
  if (!mode) return null
  const baseMain = appearanceIsHex(mainColor) ? mainColor : APPEARANCE_DEFAULTS.mainColor
  let from = baseMain
  let to = appearanceDeriveGradientEnd(baseMain)
  const presetId = typeof config.gradientPreset === 'string' ? config.gradientPreset : 'auto'
  if (presetId === 'custom') {
    from = appearanceIsHex(config.gradientFrom) ? config.gradientFrom : baseMain
    to = appearanceIsHex(config.gradientTo) ? config.gradientTo : appearanceDeriveGradientEnd(baseMain)
  } else {
    const preset = APPEARANCE_GRADIENT_PRESETS.find((item) => item.id === presetId)
    if (preset && preset.from && preset.to) {
      from = preset.from
      to = preset.to
    }
  }
  const angle = typeof config.gradientAngle === 'number' && Number.isFinite(config.gradientAngle)
    ? appearanceClamp(config.gradientAngle, 0, 360)
    : 135
  const strength = typeof config.gradientStrength === 'number' && Number.isFinite(config.gradientStrength)
    ? appearanceClamp(config.gradientStrength, 0, 1)
    : 1
  return {
    mode,
    from,
    to,
    angle,
    strength,
    targets: appearanceParseGradientTargets(config.gradientTargets),
  }
}


function appearanceColorWithAlpha(value, opacity) {
  const color = appearanceParseColor(value)
  if (color === null) return value
  const alpha = appearanceClamp(Number(opacity) || 0, 0, 1)
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
}

function appearanceComponentFill(config, style, color, opacity, fallback) {
  if (style === 'native') return null
  if (style === 'transparent') {
    return appearanceColorWithAlpha(color || fallback, Math.min(appearanceClamp(Number(opacity) || 0, 0, 1), 0.35))
  }
  if (style === 'glass') {
    return appearanceColorWithAlpha(color || fallback, appearanceClamp(Number(opacity) || 0, 0, 1))
  }
  return appearanceColorWithAlpha(color || fallback, appearanceClamp(Number(opacity) || 0, 0, 1))
}

function appearanceEffective(config, scheme) {
  const colors = appearanceResolveColors(config, scheme)
  const composerFill = appearanceComponentFill(
    config,
    config.composerStyle,
    config.composerColor,
    config.composerOpacity,
    colors.backgroundColor,
  )
  let sidebarFill = appearanceComponentFill(
    config,
    config.sidebarStyle,
    config.sidebarColor,
    config.sidebarOpacity,
    colors.backgroundColor,
  )
  /* The Static theme keeps the picture visible under the sidebar even when the
   * sidebar material is set to Native, so it always falls back to a glass fill. */
  if (sidebarFill === null && config.theme === 'static') {
    sidebarFill = appearanceColorWithAlpha(colors.backgroundColor, 0.42)
  }
  return {
    ...colors,
    composerFill,
    sidebarFill,
    blur: appearanceClamp(Number(config.blur) || 0, 0, 40),
    composerStyle: config.composerStyle,
    sidebarStyle: config.sidebarStyle,
    canvasStyle: config.canvasStyle === 'transparent' ? 'transparent' : 'glass',
    pixelSize: appearanceClamp(Number(config.pixelSize) || 10, 6, 32),
    pixelStyle: config.pixelStyle === 'rounded' ? 'rounded' : 'square',
    pixelRadius: appearanceClamp(
      typeof config.pixelRadius === 'number' ? config.pixelRadius : 0.25,
      0,
      0.5,
    ),
    gradient: appearanceResolveGradient(config, colors.mainColor),
    responseRadius: appearanceClamp(Number(config.responseRadius) || 180, 40, 400),
    haloStyle: config.haloStyle === 'dynamic' ? 'dynamic' : 'static',
    trailStrength: appearanceClamp(
      typeof config.trailStrength === 'number' ? config.trailStrength : 0,
      0,
      1,
    ),
    composerWaveMode: config.composerWaveMode === 'caret' ? 'caret' : 'whole',
    waveDamping: appearanceClamp(Number(config.waveDamping) || 0, 0, 1),
    staticImage: appearanceStaticImageSource(config.staticImage),
    staticBlur: appearanceClamp(Number(config.staticBlur) || 0, 0, 40),
    staticDim: appearanceClamp(Number(config.staticDim) || 0, 0, 0.8),
  }
}
