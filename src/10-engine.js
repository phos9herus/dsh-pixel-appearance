/* ============================================================================
 * 10-engine.js — Appearance pixel field engine
 *
 * Two-colour ordered-dither pixel art. The field is generated on a low
 * resolution grid (cols × rows, square cells) and emitted in exactly two
 * colours: the background colour and the main colour. Ordered dithering
 * (Bayer 8×8) turns the continuous field into the pixel pattern.
 *
 * Public API (see INTERFACE.md):
 *   appearanceParseColor(value)                         → { r, g, b, a } | null
 *   appearanceLuminance(value)                          → 0..1 (unknown → 0)
 *   appearanceWantsDark(hex)                            → boolean
 *   appearancePaintPreview(canvas, options)             → void (fills canvas)
 *   appearanceBuildSprite(options)                      → sprite sheet
 *
 * Assumptions:
 * - Colours that fail to parse fall back to EngineDEFAULT_MAIN/BACKGROUND.
 *   An empty/invalid backgroundColor therefore paints the dark fallback; the
 *   caller (store) always resolves the "auto" palette to a real hex colour.
 * - Unknown animation names fall back to 'ripple'.
 * - appearanceWantsDark() returns false for unparseable/empty hex values,
 *   because there is no custom background to reason about.
 * - The sprite loop is structural: every time-dependent term is a sinusoid of
 *   theta = 2π·(time / duration) with an integer harmonic, so field(0) equals
 *   field(duration) mathematically. u is wrapped with frac() so time = duration
 *   evaluates exactly at u = 0.
 * ========================================================================== */

/* -------------------------------------------------------------------------- *
 * Constants and lookup tables
 * -------------------------------------------------------------------------- */

const EngineTWO_PI = Math.PI * 2
const EngineSIN_SIZE = 4096
const EngineSIN_MASK = EngineSIN_SIZE - 1
const EngineSIN_SCALE = EngineSIN_SIZE / EngineTWO_PI
const EngineSIN = (function () {
  const table = new Float32Array(EngineSIN_SIZE)
  for (let i = 0; i < EngineSIN_SIZE; i += 1) {
    table[i] = Math.sin((i / EngineSIN_SIZE) * EngineTWO_PI)
  }
  return table
})()

/* Standard 8×8 Bayer matrix, normalised to (0, 1). */
const EngineBAYER8 = (function () {
  const matrix = [
    0, 32, 8, 40, 2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37,
    63, 31, 55, 23, 61, 29, 53, 21,
  ]
  const table = new Float32Array(64)
  for (let i = 0; i < 64; i += 1) table[i] = (matrix[i] + 0.5) / 64
  return table
})()

const EngineSPRITE_FRAMES = 64
const EngineSPRITE_DURATION = 8
const EngineSPRITE_COLS_TARGET = 150
const EngineSPRITE_MAX_WIDTH = 15000
const EngineSPRITE_MAX_ROWS = 2000
const EnginePREVIEW_MAX_CELLS = 4000
/* Live canvases may keep a much finer grid because they render through one
 * offscreen layer instead of one fillRect per cell. */
const EngineLIVE_MAX_CELLS = 90000

const EngineDEFAULT_MAIN = { r: 77, g: 107, b: 254, a: 1 } // #4D6BFE
const EngineDEFAULT_BACKGROUND = { r: 16, g: 17, b: 21, a: 1 } // #101115

const EngineLITTLE_ENDIAN = (function () {
  try {
    const probe = new Uint8Array(4)
    new Uint32Array(probe.buffer)[0] = 1
    return probe[0] === 1
  } catch (error) {
    return true
  }
})()

const EnginePreviewCache = typeof WeakMap === 'function' ? new WeakMap() : null

/* -------------------------------------------------------------------------- *
 * Colour helpers (public)
 * -------------------------------------------------------------------------- */

function EngineIsHexDigit(code) {
  return (code >= 48 && code <= 57)
    || (code >= 65 && code <= 70)
    || (code >= 97 && code <= 102)
}

/** '#4D6BFE' | '#4d6bfe' | '#4D6BFEAA' | '#RGB' | '#RGBA' → { r, g, b, a } | null. */
function appearanceParseColor(value) {
  if (typeof value !== 'string') return null
  const raw = value.trim()
  if (raw.length < 4 || raw.length > 9) return null
  if (raw.charCodeAt(0) !== 35) return null
  const hex = raw.slice(1)
  const length = hex.length
  if (length !== 3 && length !== 4 && length !== 6 && length !== 8) return null
  for (let i = 0; i < length; i += 1) {
    if (!EngineIsHexDigit(hex.charCodeAt(i))) return null
  }
  let r = 0
  let g = 0
  let b = 0
  let a = 1
  if (length === 3 || length === 4) {
    r = parseInt(hex.slice(0, 1), 16) * 17
    g = parseInt(hex.slice(1, 2), 16) * 17
    b = parseInt(hex.slice(2, 3), 16) * 17
    if (length === 4) a = parseInt(hex.slice(3, 4), 16) / 15
  } else {
    r = parseInt(hex.slice(0, 2), 16)
    g = parseInt(hex.slice(2, 4), 16)
    b = parseInt(hex.slice(4, 6), 16)
    if (length === 8) a = parseInt(hex.slice(6, 8), 16) / 255
  }
  return { r, g, b, a }
}

function EngineLinearChannel(value) {
  const channel = value / 255
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
}

function EngineLuminanceRGB(r, g, b) {
  return 0.2126 * EngineLinearChannel(r)
    + 0.7152 * EngineLinearChannel(g)
    + 0.0722 * EngineLinearChannel(b)
}

/** Relative luminance 0..1; unparseable colours → 0. */
function appearanceLuminance(value) {
  const color = appearanceParseColor(value)
  if (!color) return 0
  return EngineLuminanceRGB(color.r, color.g, color.b)
}

/** True when the hex background is dark enough to want the dark colour scheme. */
function appearanceWantsDark(hex) {
  const color = appearanceParseColor(hex)
  if (!color) return false
  return EngineLuminanceRGB(color.r, color.g, color.b) < 0.42
}

/* -------------------------------------------------------------------------- *
 * Small private helpers
 * -------------------------------------------------------------------------- */

function EngineClamp(value, min, max) {
  return value < min ? min : (value > max ? max : value)
}

function EngineFrac(value) {
  return value - Math.floor(value)
}

function EngineNumber(value, fallback) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : fallback
}

/** sin(angle) through a 4096-entry table; angle may be any real number. */
function EngineSinAt(angle) {
  return EngineSIN[(angle * EngineSIN_SCALE) & EngineSIN_MASK]
}

/** Deterministic 0..1 hash used for per-column rain seeds. */
function EngineHash(value) {
  const raw = Math.sin(value * 127.1 + 311.7) * 43758.5453123
  return raw - Math.floor(raw)
}

function EngineNormalizeAnimation(value) {
  if (value === 'rain' || value === 'aurora' || value === 'pulse') return value
  return 'ripple'
}

function EngineResolveMain(value) {
  return appearanceParseColor(value) || EngineDEFAULT_MAIN
}

function EngineResolveBackground(value) {
  return appearanceParseColor(value) || EngineDEFAULT_BACKGROUND
}

function EngineCssColor(color) {
  const alpha = EngineClamp(color.a, 0, 1)
  if (alpha >= 1) return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')'
  return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ','
    + Math.round(alpha * 1000) / 1000 + ')'
}

function EnginePackColor(color) {
  const r = EngineClamp(Math.round(color.r), 0, 255) | 0
  const g = EngineClamp(Math.round(color.g), 0, 255) | 0
  const b = EngineClamp(Math.round(color.b), 0, 255) | 0
  const a = EngineClamp(Math.round(EngineClamp(color.a, 0, 1) * 255), 0, 255) | 0
  if (EngineLITTLE_ENDIAN) {
    return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0
  }
  return ((r << 24) | (g << 16) | (b << 8) | a) >>> 0
}

/* Ordered ramp from background to main. The interior entries are the
 * generated transition colours the pixel field uses between the two ends. */
const EnginePALETTE_LEVELS = 6

function EngineMixColor(background, main, t) {
  return {
    r: background.r + (main.r - background.r) * t,
    g: background.g + (main.g - background.g) * t,
    b: background.b + (main.b - background.b) * t,
    a: background.a + (main.a - background.a) * t,
  }
}

function EngineBuildPalette(background, main) {
  const palette = []
  for (let level = 0; level < EnginePALETTE_LEVELS; level += 1) {
    palette.push(EngineMixColor(background, main, level / (EnginePALETTE_LEVELS - 1)))
  }
  return palette
}

/** Quantise coverage to a palette level, dithering between adjacent levels. */
function EnginePaletteLevel(coverage, threshold) {
  let scaled = coverage * (EnginePALETTE_LEVELS - 1)
  if (scaled < 0) scaled = 0
  else if (scaled > EnginePALETTE_LEVELS - 1) scaled = EnginePALETTE_LEVELS - 1
  let base = Math.floor(scaled)
  const fraction = scaled - base
  if (fraction > threshold && base < EnginePALETTE_LEVELS - 1) base += 1
  return base
}

/* -------------------------------------------------------------------------- *
 * Main-colour gradient
 *
 * A gradient never paints a CSS layer: it makes the MAIN colour of the six-level
 * ramp vary across the grid, so the pixel language stays identical while lit
 * pixels shift hue. Ramp level 0 is still the background colour, so the empty
 * backdrop never changes.
 * -------------------------------------------------------------------------- */

/** Palette variants across the gradient; 32 keeps the shift visually smooth. */
const EngineGRADIENT_VARIANTS = 32
const EngineGRADIENT_TARGETS = [
  'ripple', 'rain', 'aurora', 'pulse',
  'halo', 'waves', 'trail',
  'code', 'investigate', 'create', 'discuss',
]

/** Normalised target map; unknown / missing ids fall back to `auto`. */
function EngineGradientTargets(value) {
  const targets = {}
  for (let index = 0; index < EngineGRADIENT_TARGETS.length; index += 1) {
    targets[EngineGRADIENT_TARGETS[index]] = 'auto'
  }
  if (!value || typeof value !== 'object') return targets
  for (let index = 0; index < EngineGRADIENT_TARGETS.length; index += 1) {
    const id = EngineGRADIENT_TARGETS[index]
    const raw = value[id]
    if (raw === 'horizontal' || raw === 'vertical' || raw === 'radial' || raw === 'off') {
      targets[id] = raw
    }
  }
  return targets
}

/** Validate the paint-time gradient bundle; null when disabled or malformed. */
function EngineNormalizeGradient(value) {
  if (!value || typeof value !== 'object') return null
  if (value.mode !== 'universal' && value.mode !== 'custom') return null
  const from = appearanceParseColor(value.from)
  const to = appearanceParseColor(value.to)
  if (!from || !to) return null
  return {
    mode: value.mode,
    from,
    to,
    angle: EngineClamp(EngineNumber(value.angle, 135), 0, 360),
    strength: EngineClamp(EngineNumber(value.strength, 1), 0, 1),
    targets: EngineGradientTargets(value.targets),
  }
}

/** Mapping for one target: universal always uses the shared linear ramp. */
function EngineGradientTargetMapping(gradient, id) {
  if (!gradient) return 'off'
  if (gradient.mode === 'universal') return 'linear'
  const value = gradient.targets[id]
  return value || 'auto'
}

/** Designed mapping for a target's `auto` option. */
function EngineGradientNaturalMapping(id) {
  switch (id) {
    case 'rain':
    case 'aurora':
    case 'code':
      return 'vertical'
    case 'create':
    case 'discuss':
      return 'horizontal'
    case 'trail':
      return 'temporal'
    case 'investigate':
      return 'spot'
    case 'ripple':
    case 'pulse':
    case 'halo':
    case 'waves':
    default:
      return 'radial'
  }
}

/** Linear gradient factor for a normalised (u, v) cell; angle in degrees. */
function EngineGradientLinearFactor(angle, u, v) {
  const radians = (angle * Math.PI) / 180
  const dx = Math.cos(radians)
  const dy = Math.sin(radians)
  const min = Math.min(dx, 0) + Math.min(dy, 0)
  const max = Math.max(dx, 0) + Math.max(dy, 0)
  const range = max - min
  if (!(range > 1e-6)) return 0
  return EngineClamp((u * dx + v * dy - min) / range, 0, 1)
}

/**
 * Canvas-space gradient factor. `spot` uses a precomputed normalised distance
 * field (the Review radar), everything else derives from (u, v).
 */
function EngineGradientCanvasFactor(mapping, u, v, angle, spot) {
  if (mapping === 'horizontal') return u
  if (mapping === 'vertical') return v
  if (mapping === 'spot') return EngineClamp(EngineNumber(spot, 0), 0, 1)
  if (mapping === 'linear') return EngineGradientLinearFactor(angle, u, v)
  const dx = u - 0.5
  const dy = v - 0.5
  return EngineClamp(Math.sqrt(dx * dx + dy * dy) / Math.SQRT1_2, 0, 1)
}

/** Build the per-variant ramps: variant t blends the main colour toward A→B. */
function EngineBuildGradientPalettes(background, main, gradient) {
  const from = gradient.from
  const to = gradient.to
  const strength = gradient.strength
  const packed = []
  const bytes = []
  for (let step = 0; step < EngineGRADIENT_VARIANTS; step += 1) {
    const factor = step / (EngineGRADIENT_VARIANTS - 1)
    const variant = {
      r: main.r + (from.r + (to.r - from.r) * factor - main.r) * strength,
      g: main.g + (from.g + (to.g - from.g) * factor - main.g) * strength,
      b: main.b + (from.b + (to.b - from.b) * factor - main.b) * strength,
      a: main.a + (from.a + (to.a - from.a) * factor - main.a) * strength,
    }
    const palette = EngineBuildPalette(background, variant)
    packed.push(palette.map(EnginePackColor))
    bytes.push(palette.map((color) => [
      EngineClamp(Math.round(color.r), 0, 255),
      EngineClamp(Math.round(color.g), 0, 255),
      EngineClamp(Math.round(color.b), 0, 255),
      EngineClamp(Math.round(EngineClamp(color.a, 0, 1) * 255), 0, 255),
    ]))
  }
  return { count: EngineGRADIENT_VARIANTS, packed, bytes }
}

/** Nearest palette variant for one gradient factor. */
function EngineGradientVariantIndex(palettes, factor) {
  const scaled = EngineClamp(factor, 0, 1) * (palettes.count - 1)
  return Math.round(scaled)
}


/* -------------------------------------------------------------------------- *
 * Field specs (static per grid size; per-frame state is mutated in place)
 * -------------------------------------------------------------------------- */

function EngineCreateSpec(animation, cols, rows) {
  const count = cols * rows
  const nx = new Float32Array(cols) // x in "height units": 0..aspect
  const ny = new Float32Array(rows) // y in 0..1
  for (let x = 0; x < cols; x += 1) nx[x] = (x + 0.5) / rows
  for (let y = 0; y < rows; y += 1) ny[y] = (y + 0.5) / rows
  const spec = {
    animation,
    cols,
    rows,
    aspect: cols / rows,
    nx,
    ny,
    cov: new Float32Array(count),
    data: null,
  }
  if (animation === 'rain') spec.data = EngineCreateRainSpec(nx, ny)
  else if (animation === 'aurora') spec.data = EngineCreateAuroraSpec(cols, nx)
  else if (animation === 'pulse') spec.data = EngineCreatePulseSpec(cols, rows, nx, ny, spec.aspect)
  else spec.data = EngineCreateRippleSpec(cols, rows, nx, ny, spec.aspect)
  return spec
}

/**
 * Ripple: five sources, each a damped travelling ring field
 *   amp(r) · crest( sin(freq·r − cycles·theta + phase) )
 * where crest() thresholds and cubes the positive part, so every source emits
 * thin outward-moving rings (r = distance to its centre in height units; the
 * wave never reflects because r keeps growing). cycles is an integer, so the
 * loop is seamless. amp() fades rings out within a short radius, which keeps
 * the five pools readable against the background.
 */
function EngineCreateRippleSpec(cols, rows, nx, ny, aspect) {
  const definitions = [
    { fx: 0.16, fy: 0.22, freq: 24, cycles: 2, phase: 0.35, weight: 1.0 },
    { fx: 0.83, fy: 0.30, freq: 33, cycles: 3, phase: 1.85, weight: 0.9 },
    { fx: 0.28, fy: 0.79, freq: 19, cycles: 1, phase: 3.6, weight: 0.95 },
    { fx: 0.72, fy: 0.74, freq: 41, cycles: 2, phase: 5.15, weight: 0.8 },
    { fx: 0.52, fy: 0.48, freq: 27, cycles: 3, phase: 2.5, weight: 0.7 },
  ]
  const cells = cols * rows
  const sources = []
  for (let s = 0; s < definitions.length; s += 1) {
    const definition = definitions[s]
    const cx = definition.fx * aspect
    const cy = definition.fy
    const arg = new Float32Array(cells)
    const amp = new Float32Array(cells)
    let i = 0
    for (let y = 0; y < rows; y += 1) {
      const dy = ny[y] - cy
      const dy2 = dy * dy
      for (let x = 0; x < cols; x += 1, i += 1) {
        const dx = nx[x] - cx
        const distance = Math.sqrt(dx * dx + dy2)
        arg[i] = distance * definition.freq * EngineSIN_SCALE
        let envelope = 1 - distance * 2.2
        if (envelope <= 0) {
          amp[i] = 0
        } else {
          envelope *= envelope
          let rise = distance * 5
          if (rise > 1) rise = 1
          amp[i] = definition.weight * envelope * rise * 4.2
        }
      }
    }
    sources.push({
      arg,
      amp,
      phase: definition.phase,
      cycles: definition.cycles,
      offset: 0,
    })
  }
  return { sources }
}

/**
 * Rain: three parallax layers of falling columns. Each column has a wrapped
 * head position head = frac(phase + cycles·u) (integer cycles per loop), a
 * trail above the head and a constant slant. Trails wrap across the bottom.
 */
function EngineCreateRainSpec(nx, ny) {
  const layerDefinitions = [
    { spacing: 3, trail: 0.17, slant: 0.05, weight: 0.60 },
    { spacing: 5, trail: 0.26, slant: -0.04, weight: 0.74 },
    { spacing: 9, trail: 0.36, slant: 0.02, weight: 0.90 },
  ]
  const cols = nx.length
  const layers = []
  for (let l = 0; l < layerDefinitions.length; l += 1) {
    const definition = layerDefinitions[l]
    const phase = new Float32Array(cols)
    const cycles = new Float32Array(cols)
    const heads = new Float32Array(cols)
    const columnWeight = new Float32Array(cols)
    const colX = new Int32Array(cols)
    const offset = Math.floor(EngineHash(l * 37.7 + 5.3) * definition.spacing)
    for (let x = 0; x < cols; x += 1) {
      if ((x + offset) % definition.spacing !== 0) {
        colX[x] = -1
        continue
      }
      colX[x] = x
      phase[x] = EngineHash(x * 12.9898 + l * 78.233 + 1.7)
      cycles[x] = 1 + Math.floor(EngineHash(x * 39.3467 + l * 11.135 + 7.1) * 3)
      columnWeight[x] = definition.weight * (0.6 + 0.4 * EngineHash(x * 17.13 + l * 31.7))
    }
    const slantX = new Float32Array(cols)
    for (let x = 0; x < cols; x += 1) slantX[x] = nx[x] * definition.slant
    layers.push({
      phase,
      cycles,
      heads,
      columnWeight,
      colX,
      slantX,
      invTrail: 1 / definition.trail,
    })
  }
  return { layers }
}

/**
 * Aurora: two broad ribbons whose centre lines are warped by a couple of slow
 * travelling sines, plus a vertical curtain modulation that travels sideways.
 * Kernel (1 − d²)² gives soft edges that dither nicely.
 */
function EngineCreateAuroraSpec(cols, nx) {
  return {
    cy1: new Float32Array(cols),
    cy2: new Float32Array(cols),
    ray: new Float32Array(cols),
    nx,
  }
}

/**
 * Pulse: two concentric ring systems expanding from slightly offset centres,
 * with damped amplitude, plus a breathing central glow.
 */
function EngineCreatePulseSpec(cols, rows, nx, ny, aspect) {
  const cells = cols * rows
  const arg1 = new Float32Array(cells)
  const amp1 = new Float32Array(cells)
  const arg2 = new Float32Array(cells)
  const amp2 = new Float32Array(cells)
  const glow = new Float32Array(cells)
  const cx1 = 0.5 * aspect
  const cy1 = 0.5
  const cx2 = 0.34 * aspect
  const cy2 = 0.42
  let i = 0
  for (let y = 0; y < rows; y += 1) {
    const dy1 = ny[y] - cy1
    const dy2 = ny[y] - cy2
    const dy1s = dy1 * dy1
    const dy2s = dy2 * dy2
    for (let x = 0; x < cols; x += 1, i += 1) {
      const dx1 = nx[x] - cx1
      const dx2 = nx[x] - cx2
      const distance1 = Math.sqrt(dx1 * dx1 + dy1s)
      const distance2 = Math.sqrt(dx2 * dx2 + dy2s)
      arg1[i] = distance1 * 22 * EngineSIN_SCALE
      amp1[i] = 1.10 / (1 + 1.7 * distance1)
      arg2[i] = distance2 * 34 * EngineSIN_SCALE
      amp2[i] = 0.78 / (1 + 2.2 * distance2)
      glow[i] = 1 / (1 + 150 * distance1 * distance1)
    }
  }
  return { arg1, amp1, arg2, amp2, glow }
}

/* -------------------------------------------------------------------------- *
 * Coverage generation — one Float32Array in 0..1 per grid cell
 * -------------------------------------------------------------------------- */

function EngineComputeCoverage(spec, u) {
  if (!spec) return
  if (spec.animation === 'rain') EngineCoverageRain(spec, u)
  else if (spec.animation === 'aurora') EngineCoverageAurora(spec, u)
  else if (spec.animation === 'pulse') EngineCoveragePulse(spec, u)
  else EngineCoverageRipple(spec, u)
}

function EngineCoverageRipple(spec, u) {
  const sources = spec.data.sources
  const sourceCount = sources.length
  const theta = EngineTWO_PI * u
  for (let s = 0; s < sourceCount; s += 1) {
    const source = sources[s]
    source.offset = (source.phase - source.cycles * theta) * EngineSIN_SCALE
  }
  const cov = spec.cov
  const cols = spec.cols
  const rows = spec.rows
  const sin = EngineSIN
  const mask = EngineSIN_MASK
  let i = 0
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1, i += 1) {
      let value = 0
      for (let s = 0; s < sourceCount; s += 1) {
        const source = sources[s]
        const wave = sin[(source.arg[i] + source.offset) & mask]
        if (wave > 0.55) {
          const crest = (wave - 0.55) * 2.222
          value += source.amp[i] * crest * crest * crest
        }
      }
      let p = value
      if (p > 1) p = 1
      cov[i] = p
    }
  }
}

function EngineCoverageRain(spec, u) {
  const layers = spec.data.layers
  const layerCount = layers.length
  for (let l = 0; l < layerCount; l += 1) {
    const layer = layers[l]
    const phase = layer.phase
    const cycles = layer.cycles
    const heads = layer.heads
    for (let c = 0; c < heads.length; c += 1) {
      const value = phase[c] + cycles[c] * u
      heads[c] = value - Math.floor(value)
    }
  }
  const cov = spec.cov
  const cols = spec.cols
  const rows = spec.rows
  const ny = spec.ny
  let i = 0
  for (let y = 0; y < rows; y += 1) {
    const yv = ny[y]
    for (let x = 0; x < cols; x += 1, i += 1) {
      let value = 0
      for (let l = 0; l < layerCount; l += 1) {
        const layer = layers[l]
        const c = layer.colX[x]
        if (c < 0) continue
        let delta = layer.heads[c] - (yv + layer.slantX[x])
        delta -= Math.floor(delta)
        const falloff = 1 - delta * layer.invTrail
        if (falloff > 0) {
          value += layer.columnWeight[c] * falloff * (0.6 + 0.4 * falloff)
        }
      }
      if (value > 1) value = 1
      cov[i] = Math.sqrt(value)
    }
  }
}

function EngineCoverageAurora(spec, u) {
  const data = spec.data
  const cols = spec.cols
  const rows = spec.rows
  const nx = spec.nx
  const ny = spec.ny
  const theta = EngineTWO_PI * u
  const sin = EngineSinAt
  const cy1 = data.cy1
  const cy2 = data.cy2
  const ray = data.ray
  for (let x = 0; x < cols; x += 1) {
    const a = nx[x]
    cy1[x] = 0.34
      + 0.13 * sin(a * 2.1 + theta)
      + 0.065 * sin(a * 5.3 - theta * 2 + 1.7)
      + 0.025 * sin(theta + 2.0)
    cy2[x] = 0.70
      + 0.09 * sin(a * 1.7 - theta + 3.1)
      + 0.055 * sin(a * 4.3 + theta * 2 + 0.6)
    const curtain = 0.5
      + 0.3 * sin(a * 23 + theta * 2 + 1.3)
      + 0.2 * sin(a * 11 - theta + 0.4)
    ray[x] = curtain < 0 ? 0 : (curtain > 1 ? 1 : curtain)
  }
  const cov = spec.cov
  const invWidth1 = 1 / 0.145
  const invWidth2 = 1 / 0.115
  let i = 0
  for (let y = 0; y < rows; y += 1) {
    const yv = ny[y]
    for (let x = 0; x < cols; x += 1, i += 1) {
      let d = (yv - cy1[x]) * invWidth1
      let k = 1 - d * d
      let value = k > 0 ? k * k : 0
      d = (yv - cy2[x]) * invWidth2
      k = 1 - d * d
      if (k > 0) value += 0.72 * k * k
      value *= 0.45 + 0.55 * ray[x]
      if (value > 1) value = 1
      cov[i] = value * (0.5 + 0.5 * value)
    }
  }
}

function EngineCoveragePulse(spec, u) {
  const data = spec.data
  const theta = EngineTWO_PI * u
  const offset1 = (-3 * theta) * EngineSIN_SCALE
  const offset2 = (5 * theta + 0.9) * EngineSIN_SCALE
  const breath1 = 0.68 + 0.32 * EngineSinAt(theta * 2 + 0.7)
  const breath2 = 0.62 + 0.38 * EngineSinAt(theta + 2.1)
  const glowBreath = 0.55 + 0.45 * EngineSinAt(theta * 2 + 1.4)
  const arg1 = data.arg1
  const amp1 = data.amp1
  const arg2 = data.arg2
  const amp2 = data.amp2
  const glow = data.glow
  const cov = spec.cov
  const cells = spec.cols * spec.rows
  const sin = EngineSIN
  const mask = EngineSIN_MASK
  for (let i = 0; i < cells; i += 1) {
    let value = amp1[i] * sin[(arg1[i] + offset1) & mask] * breath1
    value += amp2[i] * sin[(arg2[i] + offset2) & mask] * breath2
    value += glow[i] * glowBreath
    if (value < 0) value = 0
    else if (value > 1) value = 1
    cov[i] = value * (0.5 + 0.5 * value)
  }
}

/* -------------------------------------------------------------------------- *
 * Dithering into an ImageData (sprite sheet path)
 * -------------------------------------------------------------------------- */

function EngineFillFrame(spec, u, imageData, main, background) {
  EngineComputeCoverage(spec, u)
  const cols = spec.cols
  const rows = spec.rows
  const cells = cols * rows
  const cov = spec.cov
  const bayer = EngineBAYER8
  const palette = EngineBuildPalette(background, main)
  const palettePacked = palette.map(EnginePackColor)
  const paletteBytes = palette.map((color) => [
    EngineClamp(Math.round(color.r), 0, 255),
    EngineClamp(Math.round(color.g), 0, 255),
    EngineClamp(Math.round(color.b), 0, 255),
    EngineClamp(Math.round(EngineClamp(color.a, 0, 1) * 255), 0, 255),
  ])
  const data = imageData && imageData.data
  if (!data) return
  if (data.buffer && typeof Uint32Array === 'function') {
    let words = null
    try {
      words = new Uint32Array(data.buffer, data.byteOffset || 0, cells)
    } catch (error) {
      words = null
    }
    if (words) {
      let i = 0
      for (let y = 0; y < rows; y += 1) {
        const rowBase = (y & 7) << 3
        for (let x = 0; x < cols; x += 1, i += 1) {
          words[i] = palettePacked[EnginePaletteLevel(cov[i], bayer[rowBase + (x & 7)])]
        }
      }
      return
    }
  }
  /* Byte fallback for exotic ImageData-like objects. */
  let i = 0
  let out = 0
  for (let y = 0; y < rows; y += 1) {
    const rowBase = (y & 7) << 3
    for (let x = 0; x < cols; x += 1, i += 1) {
      const color = paletteBytes[EnginePaletteLevel(cov[i], bayer[rowBase + (x & 7)])]
      data[out] = color[0]
      data[out + 1] = color[1]
      data[out + 2] = color[2]
      data[out + 3] = color[3]
      out += 4
    }
  }
}

/* -------------------------------------------------------------------------- *
 * Preview painter (settings live preview, ~12 fps)
 * -------------------------------------------------------------------------- */

function EnginePreviewGrid(width, height, requestedCell) {
  const fixed = requestedCell !== undefined && requestedCell > 0
  let cell = fixed
    ? Math.max(2, Math.round(requestedCell))
    : Math.max(3, Math.ceil(Math.sqrt((width * height) / 3000)))
  let cols = 0
  let rows = 0
  for (let guard = 0; guard < 64; guard += 1) {
    cols = Math.ceil(width / cell)
    rows = Math.ceil(height / cell)
    if (!fixed && cols * rows <= EnginePREVIEW_MAX_CELLS) break
    if (fixed && cols * rows <= EngineLIVE_MAX_CELLS) break
    cell += 1
  }
  return { cell, cols, rows }
}

function EngineNormalizePixelStyle(value) {
  return value === 'rounded' ? 'rounded' : 'square'
}

/** Corner radius for a pixel cell; `ratio` is 0..0.5 of the cell size. */
function EnginePixelCorner(cell, ratio) {
  const amount = EngineClamp(EngineNumber(ratio, 0), 0, 0.5)
  return Math.max(0, cell * amount)
}

function EnginePathRoundRect(context, left, top, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
  if (r <= 0.01) {
    context.rect(left, top, width, height)
    return
  }
  if (typeof context.roundRect === 'function') {
    context.roundRect(left, top, width, height, r)
    return
  }
  context.moveTo(left + r, top)
  context.arcTo(left + width, top, left + width, top + height, r)
  context.arcTo(left + width, top + height, left, top + height, r)
  context.arcTo(left, top + height, left, top, r)
  context.arcTo(left, top, left + width, top, r)
  context.closePath()
}

function EngineCreatePixelMask(size, radius) {
  const doc = typeof document !== 'undefined' ? document : null
  if (!doc || typeof doc.createElement !== 'function') return null
  const canvas = doc.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null
  if (!context) return null
  context.clearRect(0, 0, size, size)
  context.fillStyle = '#ffffff'
  context.beginPath()
  EnginePathRoundRect(context, 0, 0, size, size, radius)
  context.fill()
  return canvas
}

/**
 * Repeating rounded-pixel mask shared by both painters. The tile is exactly one
 * pixel cell, so rounding follows the live pixel size automatically.
 */
function EnginePixelMaskPattern(entry, context, cell, ratio) {
  const size = Math.max(1, Math.round(cell))
  const radius = Math.round(EnginePixelCorner(size, ratio) * 10) / 10
  const key = size + ':' + radius
  if (entry.maskKey !== key) {
    entry.maskKey = key
    entry.mask = EngineCreatePixelMask(size, radius)
    entry.maskPattern = null
    entry.maskPatternContext = null
  }
  if (!entry.mask) return null
  if (!entry.maskPattern || entry.maskPatternContext !== context) {
    if (typeof context.createPattern !== 'function') return null
    entry.maskPattern = context.createPattern(entry.mask, 'repeat')
    entry.maskPatternContext = context
  }
  return entry.maskPattern
}

/** Keep only the rounded cell interior of everything already painted. */
function EngineApplyPixelMask(entry, context, cell, ratio, width, height) {
  const pattern = EnginePixelMaskPattern(entry, context, cell, ratio)
  if (!pattern) return false
  context.globalCompositeOperation = 'destination-in'
  context.fillStyle = pattern
  context.fillRect(0, 0, width, height)
  context.globalCompositeOperation = 'source-over'
  return true
}

/** Put the background behind the (possibly transparent-gapped) pixel layer. */
function EngineFillPixelBackground(context, palette, width, height) {
  context.globalCompositeOperation = 'destination-over'
  context.fillStyle = EngineCssColor(palette[0])
  context.fillRect(0, 0, width, height)
  context.globalCompositeOperation = 'source-over'
}

function EngineEnsurePreviewLayer(entry) {
  if (entry.layer && entry.layerImage) return entry
  const doc = typeof document !== 'undefined' ? document : null
  if (!doc || typeof doc.createElement !== 'function') return null
  const layer = doc.createElement('canvas')
  layer.width = entry.cols
  layer.height = entry.rows
  const context = typeof layer.getContext === 'function' ? layer.getContext('2d') : null
  if (!context) return null
  let image = null
  try {
    image = context.createImageData(entry.cols, entry.rows)
  } catch (error) {
    image = null
  }
  if (!image || !image.data) return null
  let words = null
  if (image.data.buffer && typeof Uint32Array === 'function') {
    try {
      words = new Uint32Array(image.data.buffer, image.data.byteOffset || 0, entry.cols * entry.rows)
    } catch (error) {
      words = null
    }
  }
  entry.layer = layer
  entry.layerContext = context
  entry.layerImage = image
  entry.layerWords = words
  entry.mask = null
  entry.maskKey = ''
  entry.maskPattern = null
  entry.maskPatternContext = null
  return entry
}

function EngineWritePreviewLayer(entry, levels, palettePacked, paletteBytes) {
  const data = entry.layerImage.data
  const words = entry.layerWords
  const count = entry.cols * entry.rows
  if (words) {
    for (let index = 0; index < count; index += 1) {
      const level = levels[index]
      words[index] = level > 0 ? palettePacked[level] : 0
    }
    return
  }
  for (let index = 0; index < count; index += 1) {
    const level = levels[index]
    const color = level > 0 ? paletteBytes[level] : null
    const offset = index * 4
    data[offset] = color ? color[0] : 0
    data[offset + 1] = color ? color[1] : 0
    data[offset + 2] = color ? color[2] : 0
    data[offset + 3] = color ? color[3] : 0
  }
}

function EnginePreviewEntry(canvas, width, height, animation, requestedCell) {
  const cellKey = requestedCell !== undefined && requestedCell > 0 ? Math.max(2, Math.round(requestedCell)) : 0
  let entry = null
  if (EnginePreviewCache) entry = EnginePreviewCache.get(canvas) || null
  if (entry && entry.width === width && entry.height === height
    && entry.animation === animation && entry.cellKey === cellKey) {
    return entry
  }
  const grid = EnginePreviewGrid(width, height, cellKey || undefined)
  entry = {
    width,
    height,
    animation,
    cellKey,
    cell: grid.cell,
    cols: grid.cols,
    rows: grid.rows,
    spec: EngineCreateSpec(animation, grid.cols, grid.rows),
    layer: null,
    layerContext: null,
    layerImage: null,
    layerWords: null,
    mask: null,
    maskKey: '',
    maskPattern: null,
    maskPatternContext: null,
  }
  if (EnginePreviewCache) EnginePreviewCache.set(canvas, entry)
  return entry
}

/**
 * Paint one frame into a caller-provided canvas at its current pixel size.
 * The field is computed on a capped cell grid, written into one offscreen
 * pixel layer, then scaled with nearest-neighbour sampling; rounded pixel
 * styles use a repeating cell-sized mask so every block follows the same
 * pixel size.
 */
function appearancePaintPreview(canvas, options) {
  if (!canvas || typeof canvas.getContext !== 'function') return
  const context = canvas.getContext('2d')
  if (!context) return
  const width = Math.floor(EngineNumber(canvas.width, 0))
  const height = Math.floor(EngineNumber(canvas.height, 0))
  if (!(width > 0) || !(height > 0)) return
  const settings = options && typeof options === 'object' ? options : {}
  const animation = EngineNormalizeAnimation(settings.animation)
  const main = EngineResolveMain(settings.mainColor)
  const background = EngineResolveBackground(settings.backgroundColor)
  const time = EngineNumber(settings.time, 0)
  const requestedCell = EngineNumber(settings.cell, 0)
  const pixelStyle = EngineNormalizePixelStyle(settings.pixelStyle)
  const pixelRadius = EngineNumber(settings.pixelRadius, 0)
  const entry = EnginePreviewEntry(canvas, width, height, animation, requestedCell > 0 ? requestedCell : undefined)
  if (!EngineEnsurePreviewLayer(entry)) return
  const spec = entry.spec
  const u = EngineFrac(time / EngineSPRITE_DURATION)
  EngineComputeCoverage(spec, u)
  const cov = spec.cov
  const cell = entry.cell
  const cols = spec.cols
  const rows = spec.rows
  const bayer = EngineBAYER8
  const palette = EngineBuildPalette(background, main)
  const palettePacked = palette.map(EnginePackColor)
  const paletteBytes = palette.map((color) => [
    EngineClamp(Math.round(color.r), 0, 255),
    EngineClamp(Math.round(color.g), 0, 255),
    EngineClamp(Math.round(color.b), 0, 255),
    EngineClamp(Math.round(EngineClamp(color.a, 0, 1) * 255), 0, 255),
  ])
  const gradient = EngineNormalizeGradient(settings.gradient)
  const gradientMapping = gradient ? EngineGradientTargetMapping(gradient, animation) : 'off'
  let gradientPalettes = null
  let gradientMode = 'off'
  if (gradient && gradientMapping !== 'off') {
    gradientPalettes = EngineBuildGradientPalettes(background, main, gradient)
    if (gradient.mode === 'universal') gradientMode = 'linear'
    else if (gradientMapping === 'auto') gradientMode = EngineGradientNaturalMapping(animation)
    else gradientMode = gradientMapping
  }
  let levels = spec.levels
  if (!levels || levels.length < cols * rows) {
    levels = new Uint8Array(cols * rows)
    spec.levels = levels
  }
  let i = 0
  if (gradientPalettes) {
    const words = entry.layerWords
    const data = entry.layerImage.data
    const angle = gradient.angle
    for (let y = 0; y < rows; y += 1) {
      const rowBase = (y & 7) << 3
      const v = (y + 0.5) / rows
      for (let x = 0; x < cols; x += 1, i += 1) {
        const level = EnginePaletteLevel(cov[i], bayer[rowBase + (x & 7)])
        levels[i] = level
        if (level <= 0) {
          if (words) {
            words[i] = 0
          } else {
            const offset = i * 4
            data[offset] = 0
            data[offset + 1] = 0
            data[offset + 2] = 0
            data[offset + 3] = 0
          }
          continue
        }
        const factor = EngineGradientCanvasFactor(
          gradientMode, (x + 0.5) / cols, v, angle,
        )
        const variantIndex = EngineGradientVariantIndex(gradientPalettes, factor)
        if (words) {
          words[i] = gradientPalettes.packed[variantIndex][level]
        } else {
          const color = gradientPalettes.bytes[variantIndex][level]
          const offset = i * 4
          data[offset] = color[0]
          data[offset + 1] = color[1]
          data[offset + 2] = color[2]
          data[offset + 3] = color[3]
        }
      }
    }
  } else {
    for (let y = 0; y < rows; y += 1) {
      const rowBase = (y & 7) << 3
      for (let x = 0; x < cols; x += 1, i += 1) {
        levels[i] = EnginePaletteLevel(cov[i], bayer[rowBase + (x & 7)])
      }
    }
    EngineWritePreviewLayer(entry, levels, palettePacked, paletteBytes)
  }
  entry.layerContext.putImageData(entry.layerImage, 0, 0)
  context.imageSmoothingEnabled = false
  context.clearRect(0, 0, width, height)
  context.drawImage(entry.layer, 0, 0, cols * cell, rows * cell)
  if (pixelStyle === 'rounded') {
    EngineApplyPixelMask(entry, context, cell, pixelRadius, width, height)
  }
  EngineFillPixelBackground(context, palette, width, height)
}

/* -------------------------------------------------------------------------- *
 * Reactive field painter (Response theme)
 *
 * Unlike the looping animations above, the Response theme paints an event-
 * driven field: one pointer halo plus a short list of expanding waves. The
 * same six-level palette and Bayer 8×8 ordered dithering are reused, so the
 * result is the same pixel art language at rest and in motion.
 * -------------------------------------------------------------------------- */

const EngineReactiveCache = typeof WeakMap === 'function' ? new WeakMap() : null

/**
 * Signed distance from (px, py) to a rounded rectangle centred at (cx, cy).
 * Negative inside, zero on the border, positive outside.
 */
function EngineRoundedRectDistance(px, py, cx, cy, halfWidth, halfHeight, corner) {
  const radius = Math.max(0, Math.min(corner, halfWidth, halfHeight))
  const qx = Math.abs(px - cx) - (halfWidth - radius)
  const qy = Math.abs(py - cy) - (halfHeight - radius)
  const ax = qx > 0 ? qx : 0
  const ay = qy > 0 ? qy : 0
  const outside = Math.sqrt(ax * ax + ay * ay)
  const inside = Math.min(Math.max(qx, qy), 0)
  return outside + inside - radius
}

/**
 * One low-resolution offscreen layer per live canvas. Painting the field at
 * cell resolution and scaling it up with image smoothing disabled is far
 * cheaper than issuing one fillRect per cell on a device-pixel canvas.
 */
function EngineReactiveEntry(canvas, width, height, cell, dpr) {
  let gridCell = Math.max(2, Math.round(cell))
  let cols = 2
  let rows = 2
  for (let guard = 0; guard < 64; guard += 1) {
    cols = Math.max(2, Math.ceil(width / gridCell))
    rows = Math.max(2, Math.ceil(height / gridCell))
    if (cols * rows <= EngineLIVE_MAX_CELLS) break
    gridCell += 1
  }
  let entry = EngineReactiveCache ? EngineReactiveCache.get(canvas) : null
  if (entry && entry.cols === cols && entry.rows === rows
    && entry.cell === gridCell && entry.canvasWidth === canvas.width
    && entry.canvasHeight === canvas.height) {
    return entry
  }
  const doc = typeof document !== 'undefined' ? document : null
  if (!doc || typeof doc.createElement !== 'function') return null
  const layer = doc.createElement('canvas')
  layer.width = cols
  layer.height = rows
  const context = typeof layer.getContext === 'function' ? layer.getContext('2d') : null
  if (!context) return null
  let image = null
  try {
    image = context.createImageData(cols, rows)
  } catch (error) {
    image = null
  }
  if (!image || !image.data) return null
  let words = null
  if (image.data.buffer && typeof Uint32Array === 'function') {
    try {
      words = new Uint32Array(image.data.buffer, image.data.byteOffset || 0, cols * rows)
    } catch (error) {
      words = null
    }
  }
  entry = {
    cols,
    rows,
    cell: gridCell,
    dpr,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    layer,
    context,
    image,
    words,
    mask: null,
    maskKey: '',
    maskPattern: null,
    maskPatternContext: null,
    trailBirth: new Float32Array(cols * rows).fill(-1),
    trailLastX: null,
    trailLastY: null,
    trailLastAt: 0,
    trailActive: false,
  }
  if (EngineReactiveCache) EngineReactiveCache.set(canvas, entry)
  return entry
}

function EngineStampTrailCell(entry, gx, gy, now) {
  const col = Math.floor(gx)
  const row = Math.floor(gy)
  if (col < 0 || col >= entry.cols || row < 0 || row >= entry.rows) return
  entry.trailBirth[row * entry.cols + col] = now
}

/**
 * Stamp the persistent main-colour trail along the pointer segment since the
 * previous paint. The trail is a per-cell birth-time buffer, so it can fade
 * smoothly for an arbitrary retention time without extra canvas layers.
 */
function EngineStampTrail(entry, trail, now) {
  const x = EngineNumber(trail.x, NaN) / entry.cell
  const y = EngineNumber(trail.y, NaN) / entry.cell
  if (!Number.isFinite(x) || !Number.isFinite(y)) return
  const lastX = entry.trailLastX
  const lastY = entry.trailLastY
  const reconnect = trail.reset === true
    || lastX === null
    || lastY === null
    || now < entry.trailLastAt
    || now - entry.trailLastAt > 120
  if (reconnect) {
    EngineStampTrailCell(entry, x, y, now)
  } else {
    const dx = x - lastX
    const dy = y - lastY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const steps = Math.min(256, Math.max(1, Math.ceil(distance)))
    for (let index = 1; index <= steps; index += 1) {
      const t = index / steps
      EngineStampTrailCell(entry, lastX + dx * t, lastY + dy * t, now)
    }
  }
  EngineStampTrailCell(entry, x, y, now)
  entry.trailLastX = x
  entry.trailLastY = y
  entry.trailLastAt = now
}

/**
 * Paint an event-driven pixel field into a canvas.
 *
 * `halos` is `{ x, y, radius, strength }` in CSS pixels relative to the canvas.
 * Each wave is `{ kind: 'circle' | 'rect', radius, width, strength, ... }`:
 * circle waves use `x`/`y`, rectangle waves use the centre `x`/`y` plus
 * `halfW`/`halfH`/`corner`. Radius and width are CSS pixels. Coverage is
 * quantised through the same palette ramp and Bayer matrix as the looping
 * animations, so the renderer never leaves the two-colour pixel language.
 * `trail` stamps main-colour pixels at the pointer and fades them from a
 * per-cell birth-time buffer: `{ x, y, retention, now, active, reset }`.
 */
function appearancePaintReactive(canvas, options) {
  if (!canvas || typeof canvas.getContext !== 'function') return
  const context = canvas.getContext('2d')
  if (!context) return
  const settings = options && typeof options === 'object' ? options : {}
  const dpr = EngineClamp(EngineNumber(settings.dpr, 1), 0.5, 4)
  const cssWidth = Math.max(1, EngineNumber(settings.width, canvas.width / dpr))
  const cssHeight = Math.max(1, EngineNumber(settings.height, canvas.height / dpr))
  const cell = EngineClamp(EngineNumber(settings.cell, 10), 4, 40)
  const pixelStyle = EngineNormalizePixelStyle(settings.pixelStyle)
  const pixelRadius = EngineNumber(settings.pixelRadius, 0)
  const main = EngineResolveMain(settings.mainColor)
  const background = EngineResolveBackground(settings.backgroundColor)
  const entry = EngineReactiveEntry(canvas, cssWidth, cssHeight, cell, dpr)
  if (!entry) return
  const gridCell = entry.cell
  const cols = entry.cols
  const rows = entry.rows
  const bayer = EngineBAYER8
  const palette = EngineBuildPalette(background, main)
  const palettePacked = palette.map(EnginePackColor)
  const paletteBytes = palette.map((color) => [
    EngineClamp(Math.round(color.r), 0, 255),
    EngineClamp(Math.round(color.g), 0, 255),
    EngineClamp(Math.round(color.b), 0, 255),
    EngineClamp(Math.round(EngineClamp(color.a, 0, 1) * 255), 0, 255),
  ])

  const gradient = EngineNormalizeGradient(settings.gradient)
  let gradientPalettes = null
  let haloGradient = 'off'
  let waveGradient = 'off'
  let waveGradientAuto = false
  let trailGradient = 'off'
  if (gradient) {
    gradientPalettes = EngineBuildGradientPalettes(background, main, gradient)
    if (gradient.mode === 'universal') {
      haloGradient = 'linear'
      waveGradient = 'linear'
      trailGradient = 'linear'
    } else {
      haloGradient = EngineGradientTargetMapping(gradient, 'halo')
      const waveMapping = EngineGradientTargetMapping(gradient, 'waves')
      trailGradient = EngineGradientTargetMapping(gradient, 'trail')
      waveGradientAuto = waveMapping === 'auto'
      waveGradient = waveMapping === 'auto' ? 'radial' : waveMapping
      if (haloGradient === 'auto') haloGradient = 'radial'
      if (trailGradient === 'auto') trailGradient = 'temporal'
    }
    if (haloGradient === 'off' && waveGradient === 'off' && trailGradient === 'off') {
      gradientPalettes = null
    }
  }
  const gradientAngle = gradient ? gradient.angle : 135

  const haloSource = Array.isArray(settings.halos)
    ? settings.halos
    : (settings.halo && typeof settings.halo === 'object' ? [settings.halo] : [])
  const halos = []
  for (let index = 0; index < haloSource.length && halos.length < 8; index += 1) {
    const item = haloSource[index]
    if (!item || typeof item !== 'object') continue
    const strength = EngineClamp(EngineNumber(item.strength, 0), 0, 1)
    if (strength <= 0) continue
    halos.push({
      x: EngineNumber(item.x, 0),
      y: EngineNumber(item.y, 0),
      radius: Math.max(1, EngineNumber(item.radius, 180)),
      strength,
    })
  }

  const source = Array.isArray(settings.waves) ? settings.waves : []
  const waves = []
  for (let index = 0; index < source.length && waves.length < 16; index += 1) {
    const wave = source[index]
    if (!wave || typeof wave !== 'object') continue
    const strength = EngineClamp(EngineNumber(wave.strength, 0), 0, 1)
    if (strength <= 0) continue
    const circle = wave.kind !== 'rect'
    const wx = EngineNumber(wave.x, 0)
    const wy = EngineNumber(wave.y, 0)
    const span = Math.max(
      Math.hypot(wx, wy),
      Math.hypot(cssWidth - wx, wy),
      Math.hypot(wx, cssHeight - wy),
      Math.hypot(cssWidth - wx, cssHeight - wy),
    ) || 1
    waves.push({
      circle,
      x: wx,
      y: wy,
      halfW: Math.max(1, EngineNumber(wave.halfW, 1)),
      halfH: Math.max(1, EngineNumber(wave.halfH, 1)),
      corner: Math.max(0, EngineNumber(wave.corner, 0)),
      radius: Math.max(0, EngineNumber(wave.radius, 0)),
      width: Math.max(2, EngineNumber(wave.width, 34)),
      strength,
      span,
      /** Runtime-supplied damped travel used by the natural gradient mapping. */
      gradientSpan: Math.max(0, EngineNumber(wave.gradientSpan, 0)),
    })
  }

  const data = entry.image.data
  let words = entry.words
  const trail = settings.trail && typeof settings.trail === 'object' ? settings.trail : null
  const trailRetention = trail ? Math.max(0, EngineNumber(trail.retention, 0)) : 0
  const trailNow = trail ? EngineNumber(trail.now, 0) : 0
  const trailEnabled = trail !== null && trailRetention > 0
  if (trailEnabled) {
    entry.trailActive = true
    if (trail.active !== false) EngineStampTrail(entry, trail, trailNow)
  } else if (entry.trailActive) {
    entry.trailBirth.fill(-1)
    entry.trailLastX = null
    entry.trailLastY = null
    entry.trailLastAt = 0
    entry.trailActive = false
  }
  const trailBirth = entry.trailBirth
  let i = 0
  for (let row = 0; row < rows; row += 1) {
    const py = (row + 0.5) * gridCell
    const rowBase = (row & 7) << 3
    const v = (row + 0.5) / rows
    for (let col = 0; col < cols; col += 1, i += 1) {
      const px = (col + 0.5) * gridCell
      const u = (col + 0.5) / cols
      let coverage = 0
      let gradFactor = 0
      let gradWeight = -1
      let gradSolid = false
      if (trailEnabled) {
        const birth = trailBirth[i]
        if (birth >= 0) {
          const age = trailNow - birth
          if (age >= 0 && age < trailRetention) {
            const fade = 1 - age / trailRetention
            if (fade > coverage) {
              coverage = fade
              gradWeight = fade
              if (trailGradient === 'temporal') {
                gradFactor = 1 - fade
              } else if (trailGradient === 'off') {
                gradSolid = true
              } else {
                gradFactor = EngineGradientCanvasFactor(trailGradient, u, v, gradientAngle)
              }
            }
          } else {
            trailBirth[i] = -1
          }
        }
      }
      for (let h = 0; h < halos.length; h += 1) {
        const item = halos[h]
        const dx = px - item.x
        const dy = py - item.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < item.radius) {
          const t = 1 - distance / item.radius
          const value = item.strength * t * t
          if (value > coverage) {
            coverage = value
            gradWeight = value
            if (haloGradient === 'off') {
              gradSolid = true
            } else {
              gradSolid = false
              gradFactor = haloGradient === 'radial'
                ? EngineClamp(distance / item.radius, 0, 1)
                : EngineGradientCanvasFactor(haloGradient, u, v, gradientAngle)
            }
          }
        }
      }
      for (let w = 0; w < waves.length; w += 1) {
        const wave = waves[w]
        let distance
        if (wave.circle) {
          const dx = px - wave.x
          const dy = py - wave.y
          distance = Math.sqrt(dx * dx + dy * dy)
        } else {
          distance = EngineRoundedRectDistance(
            px, py, wave.x, wave.y, wave.halfW, wave.halfH, wave.corner,
          )
          /* A rectangle wave starts at the border and only travels outward. */
          if (distance < 0) continue
        }
        const k = 1 - Math.abs(distance - wave.radius) / wave.width
        if (k > 0) {
          const contribution = wave.strength * k * k
          coverage += contribution
          if (contribution > gradWeight) {
            gradWeight = contribution
            if (waveGradient === 'off') {
              gradSolid = true
            } else {
              gradSolid = false
              gradFactor = waveGradient === 'radial'
                ? EngineClamp(
                  distance / (waveGradientAuto && wave.gradientSpan > 0 ? wave.gradientSpan : wave.span),
                  0,
                  1,
                )
                : EngineGradientCanvasFactor(waveGradient, u, v, gradientAngle)
            }
          }
        }
      }
      if (coverage > 1) coverage = 1
      const level = EnginePaletteLevel(coverage, bayer[rowBase + (col & 7)])
      const paletteIndex = gradientPalettes && level > 0 && !gradSolid
        ? EngineGradientVariantIndex(gradientPalettes, gradFactor)
        : -1
      if (words) {
        if (level <= 0) {
          words[i] = 0
        } else if (paletteIndex >= 0) {
          words[i] = gradientPalettes.packed[paletteIndex][level]
        } else {
          words[i] = palettePacked[level]
        }
      } else {
        const color = level > 0
          ? (paletteIndex >= 0
            ? gradientPalettes.bytes[paletteIndex][level]
            : paletteBytes[level])
          : null
        const offset = i * 4
        data[offset] = color ? color[0] : 0
        data[offset + 1] = color ? color[1] : 0
        data[offset + 2] = color ? color[2] : 0
        data[offset + 3] = color ? color[3] : 0
      }
    }
  }

  const targetCell = Math.max(2, Math.round(gridCell * dpr))
  entry.context.putImageData(entry.image, 0, 0)
  context.imageSmoothingEnabled = false
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(entry.layer, 0, 0, cols * targetCell, rows * targetCell)
  if (pixelStyle === 'rounded') {
    EngineApplyPixelMask(entry, context, targetCell, pixelRadius, canvas.width, canvas.height)
  }
  EngineFillPixelBackground(context, palette, canvas.width, canvas.height)
}

/* -------------------------------------------------------------------------- *
 * Sprite sheet builder
 * -------------------------------------------------------------------------- */

/**
 * Render a horizontal sprite sheet: `cols × rows` per frame, `frames` frames
 * side by side. Cell size adapts so cols stays near 150 (64 frames × 150 cols
 * = 9600 < 15000) and every grid cell is a square sprite pixel.
 */
function appearanceBuildSprite(options) {
  const settings = options && typeof options === 'object' ? options : {}
  const width = Math.round(EngineClamp(EngineNumber(settings.width, 320), 16, 8192))
  const height = Math.round(EngineClamp(EngineNumber(settings.height, 180), 16, 8192))
  const animation = EngineNormalizeAnimation(settings.animation)
  const main = EngineResolveMain(settings.mainColor)
  const background = EngineResolveBackground(settings.backgroundColor)
  const frames = EngineSPRITE_FRAMES
  const duration = EngineSPRITE_DURATION
  let cell = Math.max(2, Math.ceil(Math.max(width, height) / EngineSPRITE_COLS_TARGET))
  let cols = 2
  let rows = 2
  for (let guard = 0; guard < 64; guard += 1) {
    cols = Math.max(2, Math.ceil(width / cell))
    rows = Math.max(2, Math.ceil(height / cell))
    if (cols * frames <= EngineSPRITE_MAX_WIDTH && rows <= EngineSPRITE_MAX_ROWS) break
    cell += 1
  }
  const empty = { dataUrl: '', cols, rows, frames, duration }
  const doc = typeof document !== 'undefined' ? document : null
  if (!doc || typeof doc.createElement !== 'function') return empty
  const frameCanvas = doc.createElement('canvas')
  frameCanvas.width = cols
  frameCanvas.height = rows
  const frameContext = typeof frameCanvas.getContext === 'function'
    ? frameCanvas.getContext('2d')
    : null
  if (!frameContext) return empty
  const spriteCanvas = doc.createElement('canvas')
  spriteCanvas.width = cols * frames
  spriteCanvas.height = rows
  const spriteContext = typeof spriteCanvas.getContext === 'function'
    ? spriteCanvas.getContext('2d')
    : null
  if (!spriteContext) return empty
  spriteContext.imageSmoothingEnabled = false
  let dataUrl = ''
  try {
    const imageData = frameContext.createImageData(cols, rows)
    const spec = EngineCreateSpec(animation, cols, rows)
    for (let frame = 0; frame < frames; frame += 1) {
      EngineFillFrame(spec, frame / frames, imageData, main, background)
      frameContext.putImageData(imageData, 0, 0)
      spriteContext.drawImage(frameCanvas, frame * cols, 0)
    }
    dataUrl = typeof spriteCanvas.toDataURL === 'function'
      ? spriteCanvas.toDataURL('image/png')
      : ''
    if (typeof dataUrl !== 'string') dataUrl = ''
  } catch (error) {
    dataUrl = ''
  }
  return { dataUrl, cols, rows, frames, duration }
}
