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
