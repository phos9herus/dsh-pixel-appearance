/**
 * 30-settings.js — `settings.section` page for the Appearance plugin.
 *
 * Concatenated inside the plugin factory, so it shares `React`, `h`, `NS`,
 * `APPEARANCE_PALETTES`, `APPEARANCE_ANIMATIONS`, `APPEARANCE_STYLES`, and the
 * engine/store helpers with the other fragments. No imports, no exports.
 *
 * Public: `AppearanceSettingsPage({ t, store, startCreator, close })`.
 * Everything else here is a prefixed private helper.
 */

let appearanceSettingsUid = 0

/**
 * React.useId when the host React exposes it (React 18+), otherwise a stable
 * per-component id. Both are called unconditionally so hook order stays valid.
 */
const appearanceSettingsUseId = typeof React.useId === 'function'
  ? React.useId
  : function appearanceSettingsFallbackUseId() {
    const [id] = React.useState(() => {
      appearanceSettingsUid += 1
      return 'apx-field-' + appearanceSettingsUid
    })
    return id
  }

const appearanceSettingsThemes = [
  { id: 'native', titleKey: 'native', hintKey: 'nativeHint', glyph: 'native' },
  { id: 'pixel', titleKey: 'pixel', hintKey: 'pixelHint', glyph: 'pixel' },
  { id: 'response', titleKey: 'response', hintKey: 'responseHint', glyph: 'response' },
  { id: 'static', titleKey: 'static', hintKey: 'staticHint', glyph: 'static' },
]

/** Fields added after the first release; a stale Host silently drops them. */
const appearanceSettingsHostFields = {
  composerWaveMode: true,
  waveDamping: true,
  pixelSize: true,
  pixelStyle: true,
  pixelRadius: true,
  haloStyle: true,
  trailStrength: true,
}

/** Pixel glyphs drawn with rects only, so they stay crisp at any size. */
const appearanceSettingsGlyphs = {
  native: [
    [3, 4, 18, 2], [3, 6, 2, 14], [19, 6, 2, 14], [3, 19, 18, 2],
    [7, 8, 2, 2, 0.6], [10, 8, 2, 2, 0.35],
  ],
  pixel: [
    [4, 4, 7, 7], [13, 4, 7, 7, 0.55], [4, 13, 7, 7, 0.55], [13, 13, 7, 7],
  ],
  static: [
    [3, 4, 18, 2], [3, 4, 2, 16], [19, 4, 2, 16], [3, 18, 18, 2],
    [6, 15, 2, 2, 0.85], [8, 13, 2, 2, 0.85], [10, 15, 2, 2, 0.85],
    [12, 13, 2, 2, 0.85], [14, 15, 2, 2, 0.85],
    [15, 7, 2, 2, 0.6],
  ],
  sparkle: [
    [11, 3, 2, 18], [3, 11, 18, 2],
    [8, 8, 2, 2, 0.45], [14, 8, 2, 2, 0.45],
    [8, 14, 2, 2, 0.45], [14, 14, 2, 2, 0.45],
  ],
  ripple: [
    [3, 3, 18, 18, 0.22], [7, 7, 10, 10, 0.5], [10, 10, 4, 4, 1],
  ],
  rain: [
    [4, 3, 2, 4], [9, 8, 2, 5, 0.8], [14, 3, 2, 4, 0.65], [19, 9, 2, 5, 0.5],
    [4, 13, 2, 4, 0.65], [9, 18, 2, 3, 0.5], [14, 13, 2, 4, 0.8], [19, 18, 2, 3, 0.5],
  ],
  aurora: [
    [2, 5, 20, 3, 0.9], [4, 10, 16, 3, 0.6], [2, 15, 20, 3, 0.4],
  ],
  pulse: [
    [4, 4, 16, 16, 0.2], [8, 8, 8, 8, 0.45], [11, 11, 2, 2, 1],
  ],
  response: [
    [3, 3, 18, 18, 0.18], [6, 6, 12, 12, 0.32], [9, 9, 6, 6, 0.6], [11, 11, 2, 2],
    [2, 2, 2, 2, 0.75], [20, 4, 2, 2, 0.5], [19, 19, 2, 2, 0.65],
  ],
  check: [
    [5, 12, 2, 2], [7, 14, 2, 2], [9, 12, 2, 2],
    [11, 10, 2, 2], [13, 8, 2, 2], [15, 6, 2, 2],
  ],
  arrow: [
    [8, 7, 2, 2], [10, 9, 2, 2], [12, 11, 2, 2], [10, 13, 2, 2], [8, 15, 2, 2],
  ],
  alert: [
    [11, 4, 2, 10], [11, 16, 2, 2],
  ],
}

function appearanceSettingsHex(value, fallback) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    return ('#' + raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3]).toLowerCase()
  }
  return fallback
}

function appearanceSettingsHexText(value) {
  if (typeof value !== 'string' || value.trim() === '') return ''
  return value.trim().toUpperCase()
}

function appearanceSettingsNumber(value, fallback, min, max) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function appearanceSettingsErrorText(error) {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (typeof error.message === 'string') return error.message
  try {
    return String(error)
  } catch {
    return ''
  }
}

/** Tiny `{name}` interpolation, independent of the locale dictionaries. */
function appearanceSettingsFormat(template, values) {
  return String(template).replace(/\{(\w+)\}/gu, (match, key) => (
    values && values[key] !== undefined ? String(values[key]) : ''
  ))
}

/** Read a local image file as a data URL for the Static theme. */
function appearanceSettingsReadImage(file) {
  return new Promise((resolve, reject) => {
    if (typeof FileReader !== 'function') {
      reject(new Error('FileReader is unavailable'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error || new Error('Image read failed'))
    reader.readAsDataURL(file)
  })
}

/**
 * Keep the Host config small: pictures wider/taller than 1920 px, or whose data
 * URL is already large, are re-encoded as JPEG at 82% quality.
 */
function appearanceSettingsShrinkImage(dataUrl) {
  const maxEdge = 1920
  const maxLength = 720000
  const quality = 0.82
  return new Promise((resolve) => {
    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      resolve(typeof value === 'string' && value ? value : dataUrl)
    }
    if (typeof Image !== 'function' || typeof document === 'undefined') {
      finish(dataUrl)
      return
    }
    const image = new Image()
    image.onload = () => {
      try {
        const width = image.naturalWidth || image.width || 0
        const height = image.naturalHeight || image.height || 0
        const scale = Math.min(1, maxEdge / Math.max(width, height, 1))
        if (scale >= 1 && dataUrl.length <= maxLength) {
          finish(dataUrl)
          return
        }
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(width * scale))
        canvas.height = Math.max(1, Math.round(height * scale))
        const context = canvas.getContext('2d')
        if (!context) {
          finish(dataUrl)
          return
        }
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        finish(canvas.toDataURL('image/jpeg', quality))
      } catch {
        finish(dataUrl)
      }
    }
    image.onerror = () => finish(dataUrl)
    image.src = dataUrl
  })
}

function appearanceSettingsPaletteBackground(palette) {
  if (palette.id === 'custom') {
    return 'conic-gradient(from 45deg, #F87171, #FBBF24, #34D399, #22D3EE, #818CF8, #F472B6, #F87171)'
  }
  if (!palette.bg) {
    return 'linear-gradient(135deg, #F4F4F6 0 50%, #151517 50% 100%)'
  }
  return palette.bg
}

function AppearanceSettingsIcon({ name, size = 20 }) {
  const glyph = appearanceSettingsGlyphs[name] || appearanceSettingsGlyphs.pixel
  return h('svg', {
    className: 'apx-icon',
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    'aria-hidden': 'true',
    focusable: 'false',
    shapeRendering: 'crispEdges',
  }, glyph.map((rect, index) => h('rect', {
    key: index,
    x: rect[0],
    y: rect[1],
    width: rect[2],
    height: rect[3],
    fill: 'currentColor',
    opacity: rect.length > 4 ? rect[4] : 1,
  })))
}

function AppearanceSettingsSection({ title, hint, badge, disabled, children }) {
  return h('section', {
    className: 'apx-section' + (disabled ? ' apx-disabled' : ''),
    'aria-disabled': disabled ? 'true' : undefined,
  },
  h('div', { className: 'apx-section-head' },
    h('h3', { className: 'apx-section-title' }, title),
    badge ? h('span', { className: 'apx-badge' }, badge) : null,
    hint ? h('p', { className: 'apx-section-hint' }, hint) : null),
  h('div', { className: 'apx-section-body' }, children))
}

function AppearanceSettingsSegmented({ label, value, options, disabled, onChange }) {
  return h('div', {
    className: 'apx-segmented',
    role: 'group',
    'aria-label': label,
    'aria-disabled': disabled ? 'true' : undefined,
  }, options.map((option) => h('button', {
    key: option.value,
    type: 'button',
    className: 'apx-segment',
    'aria-pressed': option.value === value,
    disabled: disabled || undefined,
    onClick: () => {
      if (!disabled) onChange(option.value)
    },
  }, option.label)))
}

function AppearanceSettingsSlider({ label, value, min, max, step, format, disabled, srOnly, onChange }) {
  const id = appearanceSettingsUseId()
  const text = typeof format === 'function' ? format(value) : String(value)
  return h('div', { className: 'apx-slider-field' },
    h('label', {
      className: srOnly ? 'apx-slider-label apx-sr-only' : 'apx-slider-label',
      htmlFor: id,
    }, label),
    h('input', {
      id,
      className: 'apx-slider',
      type: 'range',
      min,
      max,
      step,
      value,
      disabled: disabled || undefined,
      'aria-valuetext': text,
      onChange: (event) => {
        if (!disabled) onChange(Number(event.target.value))
      },
    }),
    h('span', { className: 'apx-range-value', 'aria-hidden': 'true' }, text))
}

function AppearanceSettingsColorField({ label, value, fallback, autoLabel, disabled, onChange, onClear }) {
  const id = appearanceSettingsUseId()
  const resolved = appearanceSettingsHex(value, fallback)
  return h('div', { className: 'apx-color-field' },
    h('label', { className: 'apx-color-label', htmlFor: id }, label),
    h('input', {
      id,
      className: 'apx-color-input',
      type: 'color',
      value: resolved,
      disabled: disabled || undefined,
      'aria-label': label,
      onChange: (event) => {
        if (!disabled) onChange(event.target.value)
      },
    }),
    h('span', { className: 'apx-hex' }, value ? appearanceSettingsHexText(value) : autoLabel),
    onClear && value
      ? h('button', {
        type: 'button',
        className: 'apx-clear',
        disabled: disabled || undefined,
        onClick: () => {
          if (!disabled) onClear()
        },
      }, autoLabel)
      : null)
}

function AppearanceSettingsCreative({ title, hint, disabled, busy, onClick }) {
  return h('button', {
    type: 'button',
    className: 'apx-creative',
    disabled: disabled || busy || undefined,
    'aria-busy': busy ? 'true' : undefined,
    onClick,
  },
  h('span', { className: 'apx-creative-icon', 'aria-hidden': 'true' },
    h(AppearanceSettingsIcon, { name: 'sparkle', size: 18 })),
  h('span', { className: 'apx-creative-text' },
    h('span', { className: 'apx-creative-title' }, title),
    h('span', { className: 'apx-creative-hint' }, hint)),
  h('span', { className: 'apx-creative-arrow', 'aria-hidden': 'true' },
    h(AppearanceSettingsIcon, { name: 'arrow', size: 16 })))
}

function AppearanceSettingsMaterialSection({
  t,
  title,
  hint,
  styleValue,
  colorValue,
  colorFallback,
  opacityValue,
  disabled,
  onStyle,
  onColor,
  onClearColor,
  onOpacity,
}) {
  return h(AppearanceSettingsSection, { title, hint, disabled },
    h('div', { className: 'apx-stack' },
      h(AppearanceSettingsSegmented, {
        label: title,
        value: styleValue,
        disabled,
        options: APPEARANCE_STYLES.map((style) => ({
          value: style,
          label: t('style' + style.charAt(0).toUpperCase() + style.slice(1)),
        })),
        onChange: onStyle,
      }),
      h(AppearanceSettingsColorField, {
        label: t('color'),
        value: colorValue,
        fallback: colorFallback,
        autoLabel: t('paletteAuto'),
        disabled,
        onChange: onColor,
        onClear: onClearColor,
      }),
      h(AppearanceSettingsSlider, {
        label: t('opacity'),
        value: opacityValue,
        min: 0,
        max: 1,
        step: 0.01,
        disabled,
        format: (number) => Math.round(Number(number) * 100) + '%',
        onChange: onOpacity,
      })))
}

function AppearanceSettingsPreview({
  t,
  mainColor,
  backgroundColor,
  animation,
  pixelSize,
  pixelStyle,
  pixelRadius,
}) {
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const view = typeof window !== 'undefined' ? window : null
    const reduced = Boolean(
      view && typeof view.matchMedia === 'function'
      && view.matchMedia('(prefers-reduced-motion: reduce)').matches,
    )
    const clock = () => {
      if (view && view.performance && typeof view.performance.now === 'function') {
        return view.performance.now()
      }
      return Date.now()
    }
    const started = clock()
    const resolvedBackground = backgroundColor ? backgroundColor : '#151517'
    let frame = 0
    let disposed = false
    let resizeObserver = null

    const paint = (time) => {
      const width = canvas.width
      const height = canvas.height
      if (!width || !height) return
      try {
        appearancePaintPreview(canvas, {
          mainColor,
          backgroundColor: resolvedBackground,
          animation,
          time,
          cell: Math.max(2, Math.round(pixelSize)),
          pixelStyle,
          pixelRadius,
        })
      } catch {
        // A bad frame must never take the settings page down.
      }
    }

    const measure = () => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width || 640))
      const height = Math.max(1, Math.round(rect.height || 168))
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      paint(reduced ? 1.25 : (clock() - started) / 1000)
    }

    measure()

    if (!reduced && typeof requestAnimationFrame === 'function') {
      const loop = () => {
        if (disposed) return
        paint((clock() - started) / 1000)
        frame = requestAnimationFrame(loop)
      }
      frame = requestAnimationFrame(loop)
    }

    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(measure)
      resizeObserver.observe(canvas)
    } else if (view && typeof view.addEventListener === 'function') {
      view.addEventListener('resize', measure)
    }

    return () => {
      disposed = true
      if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      if (resizeObserver) resizeObserver.disconnect()
      else if (view && typeof view.removeEventListener === 'function') view.removeEventListener('resize', measure)
    }
  }, [mainColor, backgroundColor, animation, pixelSize, pixelStyle, pixelRadius])

  return h('canvas', {
    ref: canvasRef,
    className: 'apx-preview-canvas',
    role: 'img',
    'aria-label': t('preview'),
  })
}

/**
 * Demo preview for the Response theme. It reuses the live reactive painter with
 * an artificial pointer path, one circle wave, and one composer wave, so the
 * settings page shows exactly the pixel language and damping used at runtime.
 */
function AppearanceSettingsResponsePreview({
  t,
  mainColor,
  backgroundColor,
  radius,
  haloStyle,
  trailStrength,
  composerWaveMode,
  damping,
  pixelSize,
  pixelStyle,
  pixelRadius,
}) {
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const view = typeof window !== 'undefined' ? window : null
    const reduced = Boolean(
      view && typeof view.matchMedia === 'function'
      && view.matchMedia('(prefers-reduced-motion: reduce)').matches,
    )
    const clock = () => {
      if (view && view.performance && typeof view.performance.now === 'function') {
        return view.performance.now()
      }
      return Date.now()
    }
    const started = clock()
    let frame = 0
    let disposed = false
    let width = 0
    let height = 0
    let ratio = 1
    let resizeObserver = null

    const paint = (time) => {
      if (!(width > 0) || !(height > 0)) return
      const pulse = appearanceResponseHaloPulse(reduced ? 'static' : haloStyle, time)
      const halo = {
        x: width * (0.5 + 0.3 * Math.sin(time * 0.85)),
        y: height * (0.52 + 0.26 * Math.cos(time * 1.15)),
        radius: radius * pulse.scale,
        strength: pulse.strength,
      }
      const halos = [halo]
      const trailValue = appearanceClamp(Number(trailStrength) || 0, 0, 1)
      const trailRetention = appearanceResponseTrailRetention(trailValue)
      const trail = !reduced && trailRetention > 0
        ? {
          x: halo.x,
          y: halo.y,
          retention: trailRetention,
          now: time * 1000,
          active: true,
          reset: false,
        }
        : null
      const dampingValue = appearanceClamp(Number(damping) || 0, 0, 1)
      const baseReach = Math.hypot(width, height) * 0.62
      const reach = appearanceResponseWaveReach(baseReach, dampingValue)
      const circlePhase = (time * 0.52) % 1
      const cardPhase = (time * 0.36 + 0.55) % 1
      const circleRadius = circlePhase * reach
      const cardRadius = cardPhase * reach
      const waves = [
        {
          kind: 'circle',
          x: halo.x,
          y: halo.y,
          radius: circleRadius,
          width: 34,
          strength: appearanceResponseWaveAmp(0.9, circleRadius, reach, dampingValue),
        },
        composerWaveMode === 'caret'
          ? {
            kind: 'circle',
            x: width * 0.46,
            y: height * 0.76,
            radius: cardRadius,
            width: 34,
            strength: appearanceResponseWaveAmp(0.9, cardRadius, reach, dampingValue),
          }
          : {
            kind: 'rect',
            x: width * 0.5,
            y: height * 0.8,
            halfW: width * 0.27,
            halfH: height * 0.1,
            corner: 14,
            radius: cardRadius,
            width: 36,
            strength: appearanceResponseWaveAmp(0.9, cardRadius, reach, dampingValue),
          },
      ]
      try {
        appearancePaintReactive(canvas, {
          mainColor,
          backgroundColor,
          width,
          height,
          dpr: ratio,
          cell: pixelSize,
          pixelStyle,
          pixelRadius,
          halos,
          trail,
          waves,
        })
      } catch {
        // A bad frame must never take the settings page down.
      }
    }

    const measure = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, Math.round(rect.width || 640))
      height = Math.max(1, Math.round(rect.height || 168))
      ratio = Math.min(2, (view && view.devicePixelRatio) || 1)
      const deviceWidth = Math.max(2, Math.round(width * ratio))
      const deviceHeight = Math.max(2, Math.round(height * ratio))
      if (canvas.width !== deviceWidth) canvas.width = deviceWidth
      if (canvas.height !== deviceHeight) canvas.height = deviceHeight
      paint(reduced ? 1.35 : (clock() - started) / 1000)
    }

    measure()

    if (!reduced && typeof requestAnimationFrame === 'function') {
      const loop = () => {
        if (disposed) return
        paint((clock() - started) / 1000)
        frame = requestAnimationFrame(loop)
      }
      frame = requestAnimationFrame(loop)
    }

    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(measure)
      resizeObserver.observe(canvas)
    } else if (view && typeof view.addEventListener === 'function') {
      view.addEventListener('resize', measure)
    }

    return () => {
      disposed = true
      if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      if (resizeObserver) resizeObserver.disconnect()
      else if (view && typeof view.removeEventListener === 'function') view.removeEventListener('resize', measure)
    }
  }, [mainColor, backgroundColor, radius, haloStyle, trailStrength, composerWaveMode, damping, pixelSize, pixelStyle, pixelRadius])

  return h('canvas', {
    ref: canvasRef,
    className: 'apx-preview-canvas',
    role: 'img',
    'aria-label': t('preview'),
  })
}

function AppearanceSettingsPage({ t, store, startCreator, close }) {
  const snapshot = appearanceUseStore(store) || {}
  const stored = snapshot.config || {}

  /* Always hand the controls fully-typed values, even before the first Host snapshot lands. */
  const config = {
    theme: stored.theme === 'pixel' || stored.theme === 'static' || stored.theme === 'response'
      ? stored.theme
      : 'native',
    palette: typeof stored.palette === 'string' ? stored.palette : 'auto',
    mainColor: typeof stored.mainColor === 'string' && stored.mainColor ? stored.mainColor : '#4D6BFE',
    backgroundColor: typeof stored.backgroundColor === 'string' ? stored.backgroundColor : '',
    animation: APPEARANCE_ANIMATIONS.indexOf(stored.animation) >= 0 ? stored.animation : 'ripple',
    composerStyle: APPEARANCE_STYLES.indexOf(stored.composerStyle) >= 0 ? stored.composerStyle : 'glass',
    composerColor: typeof stored.composerColor === 'string' ? stored.composerColor : '',
    composerOpacity: appearanceSettingsNumber(stored.composerOpacity, 0.72, 0, 1),
    sidebarStyle: APPEARANCE_STYLES.indexOf(stored.sidebarStyle) >= 0 ? stored.sidebarStyle : 'glass',
    sidebarColor: typeof stored.sidebarColor === 'string' ? stored.sidebarColor : '',
    sidebarOpacity: appearanceSettingsNumber(stored.sidebarOpacity, 0.6, 0, 1),
    blur: appearanceSettingsNumber(stored.blur, 12, 0, 40),
    responseRadius: appearanceSettingsNumber(stored.responseRadius, 180, 40, 400),
    haloStyle: stored.haloStyle === 'dynamic' ? 'dynamic' : 'static',
    trailStrength: appearanceSettingsNumber(stored.trailStrength, 0, 0, 1),
    canvasStyle: stored.canvasStyle === 'transparent' ? 'transparent' : 'glass',
    pixelSize: appearanceSettingsNumber(stored.pixelSize, 10, 6, 32),
    pixelStyle: stored.pixelStyle === 'rounded' ? 'rounded' : 'square',
    pixelRadius: appearanceSettingsNumber(stored.pixelRadius, 0.25, 0, 0.5),
    composerWaveMode: stored.composerWaveMode === 'caret' ? 'caret' : 'whole',
    waveDamping: appearanceSettingsNumber(stored.waveDamping, 0, 0, 1),
    staticImage: typeof stored.staticImage === 'string' ? stored.staticImage : '',
    staticBlur: appearanceSettingsNumber(stored.staticBlur, 12, 0, 40),
    staticDim: appearanceSettingsNumber(stored.staticDim, 0.2, 0, 0.8),
    nativeMode: typeof stored.nativeMode === 'string' ? stored.nativeMode : 'system',
  }

  const inactive = config.theme === 'native'
  const staticTheme = config.theme === 'static'
  const responseTheme = config.theme === 'response'
  const motionDisabled = inactive || staticTheme || responseTheme
  const palette = APPEARANCE_PALETTES.find((item) => item.id === config.palette) || null
  const customPalette = !palette || palette.id === 'custom'

  const [writeFailed, setWriteFailed] = React.useState(false)
  const [staleHost, setStaleHost] = React.useState(false)
  const [creatorNotice, setCreatorNotice] = React.useState(null)
  const [creatorBusy, setCreatorBusy] = React.useState(false)
  const [staticBusy, setStaticBusy] = React.useState(false)
  const [staticError, setStaticError] = React.useState('')
  const staticFileRef = React.useRef(null)
  const staticUrlRef = React.useRef(null)

  const write = React.useCallback((patch) => {
    let result
    try {
      result = store.set(patch)
    } catch {
      setWriteFailed(true)
      return
    }
    if (result && typeof result.then === 'function') {
      const entries = Object.entries(patch ?? {})
      const tracksHost = entries.some(([key]) => appearanceSettingsHostFields[key])
      result.then(() => {
        setWriteFailed(false)
        if (!tracksHost) return
        try {
          const next = store.getSnapshot().config || {}
          const dropped = entries.some(([key, value]) => {
            if (!appearanceSettingsHostFields[key]) return false
            const actual = next[key]
            if (typeof value === 'number' && typeof actual === 'number') {
              return Math.abs(actual - value) > 1e-6
            }
            return actual !== value
          })
          setStaleHost(dropped)
        } catch {
          setStaleHost(false)
        }
      }, () => setWriteFailed(true))
    }
  }, [store])

  const openCreator = React.useCallback((kind) => {
    if (creatorBusy) return
    setCreatorBusy(true)
    setCreatorNotice({ kind: 'info' })

    const settle = (result, error) => {
      setCreatorBusy(false)
      if (!error && result && result.ok) {
        setCreatorNotice(null)
        close()
        return
      }
      const detail = error
        ? appearanceSettingsErrorText(error)
        : (result && result.error ? String(result.error) : '')
      setCreatorNotice({ kind: 'error', detail })
    }

    try {
      const result = startCreator(kind)
      if (result && typeof result.then === 'function') {
        result.then((value) => settle(value, null), (error) => settle(null, error))
      } else {
        settle(result, null)
      }
    } catch (error) {
      settle(null, error)
    }
  }, [creatorBusy, close, startCreator])

  const pickStaticImage = React.useCallback(() => {
    const input = staticFileRef.current
    if (input && typeof input.click === 'function') input.click()
  }, [])

  const applyStaticImageFile = React.useCallback(async (event) => {
    const input = event && event.target
    const file = input && input.files && input.files[0]
    if (!file) return
    try {
      input.value = ''
    } catch {}
    setStaticError('')
    if (!/^image\//u.test(file.type || '')) {
      setStaticError(t('staticImageInvalid'))
      return
    }
    setStaticBusy(true)
    try {
      const dataUrl = await appearanceSettingsReadImage(file)
      const compact = await appearanceSettingsShrinkImage(dataUrl)
      write({ staticImage: compact })
    } catch {
      setStaticError(t('staticImageReadFailed'))
    } finally {
      setStaticBusy(false)
    }
  }, [t, write])

  const applyStaticImageUrl = React.useCallback(() => {
    const input = staticUrlRef.current
    const raw = input && typeof input.value === 'string' ? input.value.trim() : ''
    if (!/^(?:https?:\/\/|data:image\/)/iu.test(raw)) {
      setStaticError(t('staticImageInvalid'))
      return
    }
    setStaticError('')
    write({ staticImage: raw })
  }, [t, write])

  const selectTheme = (id) => write({ theme: id })
  const selectPalette = (item) => {
    const patch = { palette: item.id }
    if (item.main) patch.mainColor = item.main
    if (item.bg !== null) patch.backgroundColor = item.bg
    write(patch)
  }
  const selectAnimation = (id) => write({ animation: id })
  const setMainColor = (value) => write({ palette: 'custom', mainColor: value })
  const setBackgroundColor = (value) => write({ palette: 'custom', backgroundColor: value })
  const clearBackgroundColor = () => write({ palette: 'custom', backgroundColor: '' })
  const setComposerStyle = (value) => write({ composerStyle: value })
  const setComposerColor = (value) => write({ composerColor: value })
  const clearComposerColor = () => write({ composerColor: '' })
  const setComposerOpacity = (value) => write({ composerOpacity: value })
  const setSidebarStyle = (value) => write({ sidebarStyle: value })
  const setSidebarColor = (value) => write({ sidebarColor: value })
  const clearSidebarColor = () => write({ sidebarColor: '' })
  const setSidebarOpacity = (value) => write({ sidebarOpacity: value })
  const setBlur = (value) => write({ blur: value })
  const setResponseRadius = (value) => write({ responseRadius: value })
  const setHaloStyle = (value) => write({ haloStyle: value })
  const setTrailStrength = (value) => write({ trailStrength: value })
  const setCanvasStyle = (value) => write({ canvasStyle: value })
  const setPixelSize = (value) => write({ pixelSize: value })
  const setPixelStyle = (value) => write({ pixelStyle: value })
  const setPixelRadius = (value) => write({ pixelRadius: value })
  const setComposerWaveMode = (value) => write({ composerWaveMode: value })
  const setWaveDamping = (value) => write({ waveDamping: value })
  const setStaticBlur = (value) => write({ staticBlur: value })
  const setStaticDim = (value) => write({ staticDim: value })
  const clearStaticImage = () => {
    setStaticError('')
    write({ staticImage: '' })
  }

  const writeError = writeFailed || Boolean(snapshot.error)
  const creatorText = creatorNotice
    ? (creatorNotice.kind === 'error'
      ? appearanceSettingsFormat(t('creatorFailed'), { error: creatorNotice.detail || '—' })
      : t('creatorOpening'))
    : ''

  return h('div', {
    className: 'apx-root',
    role: 'region',
    'aria-label': t('nav'),
  },
  h('style', { key: 'apx-style' }, appearanceSettingsCss),
  h('header', { className: 'apx-header' },
    h('h2', { className: 'apx-title' }, t('title')),
    h('p', { className: 'apx-intro' }, t('intro'))),

  (writeError || staleHost || creatorNotice)
    ? h('div', { className: 'apx-notices' },
      writeError
        ? h('div', { key: 'write', className: 'apx-notice apx-error', role: 'alert' },
          h('span', { className: 'apx-notice-icon', 'aria-hidden': 'true' },
            h(AppearanceSettingsIcon, { name: 'alert', size: 16 })),
          h('span', { className: 'apx-notice-text' }, t('writeFailed')))
        : null,
      staleHost
        ? h('div', { key: 'host', className: 'apx-notice apx-error', role: 'alert' },
          h('span', { className: 'apx-notice-icon', 'aria-hidden': 'true' },
            h(AppearanceSettingsIcon, { name: 'alert', size: 16 })),
          h('span', { className: 'apx-notice-text' }, t('hostOutdated')))
        : null,
      creatorNotice
        ? h('div', {
          key: 'creator',
          className: 'apx-notice' + (creatorNotice.kind === 'error' ? ' apx-error' : ''),
          role: creatorNotice.kind === 'error' ? 'alert' : 'status',
        },
        h('span', { className: 'apx-notice-icon', 'aria-hidden': 'true' },
          h(AppearanceSettingsIcon, {
            name: creatorNotice.kind === 'error' ? 'alert' : 'sparkle',
            size: 16,
          })),
        h('span', { className: 'apx-notice-text' }, creatorText))
        : null)
    : null,

  h(AppearanceSettingsSection, {
    title: t('sectionTheme'),
    hint: t('themeHint'),
  },
  h('div', { className: 'apx-cards', role: 'group', 'aria-label': t('theme') },
    appearanceSettingsThemes.map((option) => {
      const selected = config.theme === option.id
      return h('button', {
        key: option.id,
        type: 'button',
        className: 'apx-card',
        'aria-pressed': selected,
        onClick: () => selectTheme(option.id),
      },
      h('span', { className: 'apx-card-head' },
        h(AppearanceSettingsIcon, { name: option.glyph, size: 22 }),
        h('span', { className: 'apx-card-check', 'aria-hidden': 'true' },
          selected ? h(AppearanceSettingsIcon, { name: 'check', size: 16 }) : null)),
      h('span', { className: 'apx-card-title' }, t(option.titleKey)),
      h('span', { className: 'apx-card-hint' }, t(option.hintKey)))
    })),
  h(AppearanceSettingsCreative, {
    title: t('creativeTheme'),
    hint: t('creativeThemeHint'),
    busy: creatorBusy,
    disabled: creatorBusy,
    onClick: () => openCreator('theme'),
  })),

  staticTheme
    ? h(AppearanceSettingsSection,
      { title: t('sectionStaticImage'), hint: t('staticImageHint') },
      h('div', { className: 'apx-static' },
        h('div', {
          className: 'apx-static-preview',
          role: 'img',
          'aria-label': t('sectionStaticImage'),
        },
        h('div', {
          className: 'apx-static-preview-image',
          style: {
            backgroundImage: appearanceCssUrl(appearanceStaticImageSource(config.staticImage)),
            filter: 'blur(' + config.staticBlur + 'px)',
          },
        }),
        h('div', {
          className: 'apx-static-preview-dim',
          style: { opacity: config.staticDim },
        })),
        h('div', { className: 'apx-static-controls' },
          h('div', { className: 'apx-static-actions' },
            h('button', {
              type: 'button',
              className: 'apx-static-choose',
              disabled: staticBusy || undefined,
              'aria-busy': staticBusy ? 'true' : undefined,
              onClick: pickStaticImage,
            }, staticBusy ? t('staticImageReading') : t('staticImageChoose')),
            config.staticImage
              ? h('button', {
                type: 'button',
                className: 'apx-clear',
                onClick: clearStaticImage,
              }, t('staticImageClear'))
              : null),
          h('input', {
            ref: staticFileRef,
            className: 'apx-sr-only',
            type: 'file',
            accept: 'image/*',
            tabIndex: -1,
            'aria-hidden': 'true',
            onChange: applyStaticImageFile,
          }),
          h('div', { className: 'apx-static-url' },
            h('input', {
              ref: staticUrlRef,
              className: 'apx-static-url-input',
              type: 'url',
              placeholder: t('staticImageUrlPlaceholder'),
              'aria-label': t('staticImageApply'),
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  applyStaticImageUrl()
                }
              },
            }),
            h('button', {
              type: 'button',
              className: 'apx-static-apply',
              onClick: applyStaticImageUrl,
            }, t('staticImageApply'))),
          staticError
            ? h('div', { className: 'apx-static-error', role: 'alert' }, staticError)
            : null,
          h('div', { className: 'apx-static-note' }, t('staticImageDefaultNote')))),
      h('div', { className: 'apx-static-sliders' },
        h(AppearanceSettingsSlider, {
          label: t('staticBlur'),
          value: config.staticBlur,
          min: 0,
          max: 40,
          step: 1,
          format: (number) => Math.round(Number(number)) + 'px',
          onChange: setStaticBlur,
        }),
        h(AppearanceSettingsSlider, {
          label: t('staticDim'),
          value: config.staticDim,
          min: 0,
          max: 0.8,
          step: 0.05,
          format: (number) => Math.round(Number(number) * 100) + '%',
          onChange: setStaticDim,
        })))
    : null,

  h(AppearanceSettingsSection, {
    title: t('sectionCanvas'),
    hint: t('canvasHint'),
    disabled: inactive,
  },
  h(AppearanceSettingsSegmented, {
    label: t('sectionCanvas'),
    value: config.canvasStyle,
    disabled: inactive,
    options: [
      { value: 'glass', label: t('canvasGlass') },
      { value: 'transparent', label: t('canvasTransparent') },
    ],
    onChange: setCanvasStyle,
  })),

  h(AppearanceSettingsSection, {
    title: t('sectionPixel'),
    hint: t('sectionPixelHint'),
    disabled: inactive || staticTheme,
  },
  h('div', { className: 'apx-stack' },
    h(AppearanceSettingsSlider, {
      label: t('pixelSize'),
      value: config.pixelSize,
      min: 6,
      max: 32,
      step: 1,
      disabled: inactive || staticTheme,
      format: (number) => Math.round(Number(number)) + 'px',
      onChange: setPixelSize,
    }),
    h(AppearanceSettingsSegmented, {
      label: t('pixelStyle'),
      value: config.pixelStyle,
      disabled: inactive || staticTheme,
      options: [
        { value: 'square', label: t('pixelStyleDefault') },
        { value: 'rounded', label: t('pixelStyleRounded') },
      ],
      onChange: setPixelStyle,
    }),
    h(AppearanceSettingsSlider, {
      label: t('pixelRadius'),
      value: config.pixelRadius,
      min: 0,
      max: 0.5,
      step: 0.01,
      disabled: inactive || staticTheme || config.pixelStyle !== 'rounded',
      format: (number) => (Math.round(Number(number) * config.pixelSize * 10) / 10) + 'px',
      onChange: setPixelRadius,
    }))),

  responseTheme
    ? h(AppearanceSettingsSection,
      { title: t('sectionResponse'), hint: t('sectionResponseHint') },
      h('div', { className: 'apx-stack' },
        h(AppearanceSettingsSegmented, {
          label: t('haloStyle'),
          value: config.haloStyle,
          options: [
            { value: 'static', label: t('haloStyleStatic') },
            { value: 'dynamic', label: t('haloStyleDynamic') },
          ],
          onChange: setHaloStyle,
        }),
        h(AppearanceSettingsSlider, {
          label: t('responseRadius'),
          value: config.responseRadius,
          min: 40,
          max: 400,
          step: 10,
          format: (number) => Math.round(Number(number)) + 'px',
          onChange: setResponseRadius,
        }),
        h(AppearanceSettingsSlider, {
          label: t('trailStrength'),
          value: config.trailStrength,
          min: 0,
          max: 1,
          step: 0.01,
          format: (number) => Math.round(Number(number) * 100) + '%',
          onChange: setTrailStrength,
        })))
    : null,

  responseTheme
    ? h(AppearanceSettingsSection,
      { title: t('sectionWave'), hint: t('composerWaveHint') },
      h(AppearanceSettingsSegmented, {
        label: t('sectionWave'),
        value: config.composerWaveMode,
        options: [
          { value: 'whole', label: t('composerWaveWhole') },
          { value: 'caret', label: t('composerWaveCaret') },
        ],
        onChange: setComposerWaveMode,
      }))
    : null,

  responseTheme
    ? h(AppearanceSettingsSection,
      { title: t('sectionDamping'), hint: t('waveDampingHint') },
      h(AppearanceSettingsSlider, {
        label: t('waveDamping'),
        value: config.waveDamping,
        min: 0,
        max: 1,
        step: 0.01,
        format: (number) => Math.round(Number(number) * 100) + '%',
        onChange: setWaveDamping,
      }))
    : null,

  inactive
    ? h('div', { className: 'apx-native-note', role: 'note' },
      h('span', { className: 'apx-badge' }, t('nativeInactive')),
      h('span', { className: 'apx-native-note-text' }, t('themeNativeNote')))
    : null,

  h(AppearanceSettingsSection, {
    title: t('sectionColor'),
    hint: t('paletteHint'),
    disabled: inactive,
  },
  h('div', { className: 'apx-palettes', role: 'group', 'aria-label': t('palette') },
    APPEARANCE_PALETTES.map((item) => {
      const selected = config.palette === item.id
      return h('button', {
        key: item.id,
        type: 'button',
        className: 'apx-palette',
        'aria-pressed': selected,
        disabled: inactive || undefined,
        onClick: () => {
          if (!inactive) selectPalette(item)
        },
      },
      h('span', {
        className: 'apx-swatch',
        style: { background: appearanceSettingsPaletteBackground(item) },
      }, item.main
        ? h('span', { className: 'apx-swatch-dot', style: { background: item.main } })
        : null),
      h('span', { className: 'apx-palette-name' },
        h('span', null, t(item.nameKey)),
        h('span', { className: 'apx-palette-check', 'aria-hidden': 'true' },
          selected ? h(AppearanceSettingsIcon, { name: 'check', size: 14 }) : null)))
    })),
  customPalette
    ? h('div', { className: 'apx-custom-colors' },
      h(AppearanceSettingsColorField, {
        label: t('mainColor'),
        value: config.mainColor,
        fallback: '#4D6BFE',
        autoLabel: t('paletteAuto'),
        disabled: inactive,
        onChange: setMainColor,
      }),
      h(AppearanceSettingsColorField, {
        label: t('backgroundColor'),
        value: config.backgroundColor,
        fallback: '#151517',
        autoLabel: t('paletteAuto'),
        disabled: inactive,
        onChange: setBackgroundColor,
        onClear: clearBackgroundColor,
      }))
    : null),

  h(AppearanceSettingsSection, {
    title: t('sectionMotion'),
    hint: staticTheme
      ? t('animationHintStatic')
      : responseTheme ? t('animationHintResponse') : t('animationHint'),
    disabled: motionDisabled,
  },
  h('div', { className: 'apx-anims', role: 'group', 'aria-label': t('animation') },
    APPEARANCE_ANIMATIONS.map((id) => {
      const selected = config.animation === id
      return h('button', {
        key: id,
        type: 'button',
        className: 'apx-card apx-anim',
        'aria-pressed': selected,
        disabled: motionDisabled || undefined,
        onClick: () => {
          if (!motionDisabled) selectAnimation(id)
        },
      },
      h('span', { className: 'apx-card-head' },
        h(AppearanceSettingsIcon, { name: id, size: 18 }),
        h('span', { className: 'apx-card-title' }, t(id)),
        h('span', { className: 'apx-card-check', 'aria-hidden': 'true' },
          selected ? h(AppearanceSettingsIcon, { name: 'check', size: 15 }) : null)))
    })),
  h(AppearanceSettingsCreative, {
    title: t('creativeAnimation'),
    hint: t('creativeAnimationHint'),
    busy: creatorBusy,
    disabled: creatorBusy || motionDisabled,
    onClick: () => openCreator('animation'),
  })),

  responseTheme
    ? h(AppearanceSettingsSection, {
      title: t('preview'),
      hint: t('responseRadiusHint'),
    },
    h('div', { className: 'apx-preview-wrap' },
      h(AppearanceSettingsResponsePreview, {
        t,
        mainColor: config.mainColor,
        backgroundColor: config.backgroundColor,
        radius: config.responseRadius,
        haloStyle: config.haloStyle,
        trailStrength: config.trailStrength,
        composerWaveMode: config.composerWaveMode,
        damping: config.waveDamping,
        pixelSize: config.pixelSize,
        pixelStyle: config.pixelStyle,
        pixelRadius: config.pixelRadius,
      }),
      h('span', { className: 'apx-preview-meta', 'aria-hidden': 'true' }, t('response'))))
    : staticTheme
      ? h(AppearanceSettingsSection, {
        title: t('preview'),
        hint: t('staticPreviewHint'),
      },
      h('div', { className: 'apx-preview-wrap' },
        h('div', {
          className: 'apx-static-stage',
          role: 'img',
          'aria-label': t('preview'),
        },
        h('div', {
          className: 'apx-static-stage-image',
          style: {
            backgroundImage: appearanceCssUrl(appearanceStaticImageSource(config.staticImage)),
            filter: 'blur(' + config.staticBlur + 'px)',
          },
        }),
        h('div', {
          className: 'apx-static-stage-dim',
          style: { background: 'rgba(0, 0, 0, ' + config.staticDim + ')' },
        }),
        h('span', { className: 'apx-preview-meta', 'aria-hidden': 'true' }, t('static')))))
      : h(AppearanceSettingsSection, {
        title: t('preview'),
        hint: t('previewHint'),
      },
      h('div', { className: 'apx-preview-wrap' },
        h(AppearanceSettingsPreview, {
          t,
          mainColor: config.mainColor,
          backgroundColor: config.backgroundColor,
          animation: config.animation,
          pixelSize: config.pixelSize,
          pixelStyle: config.pixelStyle,
          pixelRadius: config.pixelRadius,
        }),
        h('span', { className: 'apx-preview-meta', 'aria-hidden': 'true' }, t(config.animation)))),

  h(AppearanceSettingsMaterialSection, {
    t,
    title: t('sectionComposer'),
    hint: t('composerHint'),
    styleValue: config.composerStyle,
    colorValue: config.composerColor,
    colorFallback: appearanceSettingsHex(config.mainColor, '#4D6BFE'),
    opacityValue: config.composerOpacity,
    disabled: inactive,
    onStyle: setComposerStyle,
    onColor: setComposerColor,
    onClearColor: clearComposerColor,
    onOpacity: setComposerOpacity,
  }),

  h(AppearanceSettingsMaterialSection, {
    t,
    title: t('sectionSidebar'),
    hint: t('sidebarHint'),
    styleValue: config.sidebarStyle,
    colorValue: config.sidebarColor,
    colorFallback: appearanceSettingsHex(config.mainColor, '#4D6BFE'),
    opacityValue: config.sidebarOpacity,
    disabled: inactive,
    onStyle: setSidebarStyle,
    onColor: setSidebarColor,
    onClearColor: clearSidebarColor,
    onOpacity: setSidebarOpacity,
  }),

  h(AppearanceSettingsSection, {
    title: t('blur'),
    disabled: inactive,
  },
  h(AppearanceSettingsSlider, {
    label: t('blur'),
    value: config.blur,
    min: 0,
    max: 40,
    step: 1,
    disabled: inactive,
    srOnly: true,
    format: (number) => Math.round(Number(number)) + 'px',
    onChange: setBlur,
  })))
}

const appearanceSettingsCss = `
.apx-root {
  width: 100%;
  max-width: 720px;
  padding: 0 0 40px;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  line-height: 22px;
}
.apx-root *,
.apx-root *::before,
.apx-root *::after { box-sizing: border-box; }
.apx-root :focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary);
  outline-offset: 2px;
}
.apx-icon { display: block; flex: none; }
.apx-header { margin: 0; }
.apx-title {
  margin: 0 0 6px;
  color: var(--dsw-alias-label-primary);
  font-size: 20px;
  line-height: 30px;
  font-weight: 600;
}
.apx-intro {
  margin: 0;
  max-width: 62ch;
  color: var(--dsw-alias-label-secondary);
  font-size: 14px;
  line-height: 22px;
}
.apx-notices {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}
.apx-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
}
.apx-notice.apx-error {
  border-color: var(--dsw-alias-state-error-primary);
  color: var(--dsw-alias-label-error);
}
.apx-notice-icon { flex: none; margin-top: 2px; }
.apx-notice-text { min-width: 0; overflow-wrap: anywhere; }
.apx-section { margin-top: 26px; }
.apx-section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  margin-bottom: 10px;
}
.apx-section-title {
  margin: 0;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
}
.apx-section-hint {
  flex: 1 1 100%;
  margin: 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 13px;
  line-height: 20px;
}
.apx-badge {
  flex: none;
  padding: 0 8px;
  border: 0.5px solid var(--dsw-alias-state-warn-primary);
  border-radius: 999px;
  color: var(--dsw-alias-state-warn-primary);
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}
.apx-section-body {
  padding: 16px;
  border: 0.5px solid var(--dsw-alias-settings-card-stroke, var(--dsw-alias-border-l2));
  border-radius: 12px;
  background: var(--dsw-alias-settings-card-fill, var(--dsw-alias-bg-l1));
  color: var(--dsw-alias-label-primary);
}
.apx-section.apx-disabled .apx-section-body {
  opacity: 0.55;
  user-select: none;
}
.apx-section.apx-disabled .apx-section-body > * { pointer-events: none; }
.apx-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 10px;
}
.apx-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  padding: 14px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
}
.apx-card:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.apx-card[aria-pressed="true"] {
  border-color: var(--dsw-alias-state-business-primary);
  background: var(--dsw-alias-bg-module-platform);
  box-shadow: inset 0 0 0 0.5px var(--dsw-alias-state-business-primary);
}
.apx-card:disabled { opacity: 0.55; cursor: not-allowed; }
.apx-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  color: var(--dsw-alias-label-secondary);
}
.apx-card[aria-pressed="true"] .apx-card-head,
.apx-card[aria-pressed="true"] .apx-card-title { color: var(--dsw-alias-label-primary); }
.apx-card-check {
  display: inline-flex;
  margin-left: auto;
  color: var(--dsw-alias-state-business-primary);
}
.apx-card-title {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
}
.apx-card-hint {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.apx-anims {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}
.apx-anim {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
}
.apx-anim .apx-card-title { font-weight: 500; }
.apx-anim[aria-pressed="true"] .apx-card-title { font-weight: 600; }
.apx-creative {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 10px;
  padding: 12px 14px;
  border: 0.5px dashed var(--dsw-alias-border-l3);
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}
.apx-creative:hover:not(:disabled) {
  border-color: var(--dsw-alias-state-business-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.apx-creative:disabled { opacity: 0.55; cursor: not-allowed; }
.apx-creative-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-brand-primary);
}
.apx-creative-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.apx-creative-title {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
}
.apx-creative-hint {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.apx-creative-arrow { margin-left: auto; color: var(--dsw-alias-label-tertiary); }
.apx-native-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
  padding: 12px 14px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-left: 2px solid var(--dsw-alias-state-warn-primary);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
}
.apx-native-note-text { min-width: 0; }
.apx-palettes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(102px, 1fr));
  gap: 8px;
}
.apx-palette {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
}
.apx-palette:hover:not(:disabled) {
  border-color: var(--dsw-alias-border-l3);
  background: var(--dsw-alias-interactive-bg-hover);
}
.apx-palette[aria-pressed="true"] {
  border-color: var(--dsw-alias-state-business-primary);
  box-shadow: inset 0 0 0 0.5px var(--dsw-alias-state-business-primary);
}
.apx-palette:disabled { opacity: 0.55; cursor: not-allowed; }
.apx-swatch {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 7px;
  overflow: hidden;
}
.apx-swatch-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 1px 3px rgba(0, 0, 0, 0.35);
}
.apx-palette-name {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}
.apx-palette[aria-pressed="true"] .apx-palette-name { color: var(--dsw-alias-label-primary); }
.apx-palette-check {
  display: inline-flex;
  margin-left: auto;
  color: var(--dsw-alias-state-business-primary);
}
.apx-custom-colors {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 0.5px solid var(--dsw-alias-border-l2);
}
.apx-stack { display: flex; flex-direction: column; gap: 14px; }
.apx-color-field {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.apx-color-label {
  flex: none;
  color: var(--dsw-alias-label-secondary);
  font-size: 14px;
  line-height: 22px;
}
.apx-color-input {
  flex: none;
  width: 38px;
  height: 30px;
  padding: 0;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  cursor: pointer;
  appearance: none;
}
.apx-color-input::-webkit-color-swatch-wrapper { padding: 3px; }
.apx-color-input::-webkit-color-swatch { border: 0; border-radius: 5px; }
.apx-color-input::-moz-color-swatch { border: 0; border-radius: 5px; }
.apx-color-input:disabled { cursor: not-allowed; }
.apx-hex {
  color: var(--dsw-alias-label-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.apx-clear {
  margin-left: auto;
  padding: 2px 8px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}
.apx-clear:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.apx-clear:disabled { cursor: not-allowed; }
.apx-segmented {
  display: inline-flex;
  flex-wrap: wrap;
  max-width: 100%;
  padding: 2px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-2);
}
.apx-segment {
  flex: 1 1 auto;
  padding: 5px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
}
.apx-segment:hover:not(:disabled):not([aria-pressed="true"]) {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.apx-segment[aria-pressed="true"] {
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 0.5px 2px rgba(0, 0, 0, 0.12);
  font-weight: 500;
}
.apx-segment:disabled { cursor: not-allowed; }
.apx-slider-field {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.apx-slider-label {
  flex: none;
  width: 92px;
  color: var(--dsw-alias-label-secondary);
  font-size: 14px;
  line-height: 22px;
}
.apx-slider {
  flex: 1;
  min-width: 120px;
  height: 20px;
  margin: 0;
  background: transparent;
  appearance: none;
  cursor: pointer;
}
.apx-slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: var(--dsw-alias-border-l3);
}
.apx-slider::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  margin-top: -5px;
  border: 2px solid var(--dsw-alias-bg-layer-1);
  border-radius: 50%;
  background: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  appearance: none;
}
.apx-slider::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: var(--dsw-alias-border-l3);
}
.apx-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: 2px solid var(--dsw-alias-bg-layer-1);
  border-radius: 50%;
  background: var(--dsw-alias-label-primary);
}
.apx-slider:disabled { opacity: 0.5; cursor: not-allowed; }
.apx-range-value {
  flex: none;
  min-width: 44px;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.apx-preview-wrap {
  position: relative;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  overflow: hidden;
  background: #151517;
}
.apx-preview-canvas {
  display: block;
  width: 100%;
  height: 168px;
}
.apx-preview-meta {
  position: absolute;
  left: 10px;
  bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: rgba(255, 255, 255, 0.82);
  font-size: 11px;
  line-height: 18px;
  pointer-events: none;
}
.apx-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.apx-static {
  display: grid;
  grid-template-columns: minmax(0, 168px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}
.apx-static-preview {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: #07090f;
}
.apx-static-preview-image {
  position: absolute;
  inset: -40px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.apx-static-preview-dim {
  position: absolute;
  inset: 0;
  background: #000;
}
.apx-static-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.apx-static-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.apx-static-choose,
.apx-static-apply {
  padding: 5px 12px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
}
.apx-static-choose:hover:not(:disabled),
.apx-static-apply:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
}
.apx-static-choose:disabled { opacity: 0.6; cursor: progress; }
.apx-static-url {
  display: flex;
  gap: 8px;
  min-width: 0;
}
.apx-static-url-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
}
.apx-static-url-input::placeholder { color: var(--dsw-alias-label-tertiary); }
.apx-static-note {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.apx-static-error {
  color: var(--dsw-alias-label-error);
  font-size: 12px;
  line-height: 18px;
}
.apx-static-sliders {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 0.5px solid var(--dsw-alias-border-l2);
}
.apx-static-stage {
  position: relative;
  height: 168px;
  overflow: hidden;
  background: #07090f;
}
.apx-static-stage-image {
  position: absolute;
  inset: -48px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.apx-static-stage-dim {
  position: absolute;
  inset: 0;
}
@media (max-width: 560px) {
  .apx-cards { grid-template-columns: 1fr; }
  .apx-static { grid-template-columns: 1fr; }
  .apx-palettes { grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); }
  .apx-segmented { width: 100%; }
  .apx-segment { flex: 1 1 40%; }
  .apx-slider-label { width: auto; min-width: 64px; }
  .apx-custom-colors { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .apx-root *,
  .apx-root *::before,
  .apx-root *::after {
    transition: none !important;
    animation: none !important;
  }
}
`

