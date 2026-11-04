import z from './vendor/schemastery/lib/index.mjs'

/**
 * Host-backed appearance preferences. Every field is volatile so a settings
 * write updates the live reference in place instead of reloading the plugin.
 */
export const Config = z.object({
  theme: z.union(['native', 'pixel', 'static', 'response', 'review']).default('native').volatile(),
  palette: z.string().default('auto').volatile(),
  mainColor: z.string().default('#4D6BFE').volatile(),
  backgroundColor: z.string().default('').volatile(),
  animation: z.union(['ripple', 'rain', 'aurora', 'pulse']).default('ripple').volatile(),
  composerStyle: z.union(['native', 'glass', 'transparent']).default('glass').volatile(),
  composerColor: z.string().default('').volatile(),
  composerOpacity: z.number().min(0).max(1).default(0.72).volatile(),
  sidebarStyle: z.union(['native', 'glass', 'transparent']).default('glass').volatile(),
  sidebarColor: z.string().default('').volatile(),
  sidebarOpacity: z.number().min(0).max(1).default(0.6).volatile(),
  blur: z.number().min(0).max(40).default(12).volatile(),
  /** The Response theme: radius of the pixel halo around the pointer, in CSS px. */
  responseRadius: z.number().min(40).max(400).default(180).volatile(),
  /** The Response theme: static halo, or a slowly breathing halo. */
  haloStyle: z.union(['static', 'dynamic']).default('static').volatile(),
  /** Deprecated: the old trail-length field, kept for stored config compatibility. */
  haloTrail: z.number().min(0).max(400).default(0).volatile(),
  /** The Response theme: trail strength; 0 = no trail, 1 = longest retention. */
  trailStrength: z.number().min(0).max(1).default(0).volatile(),
  /** All custom themes: main content surface material over the theme backdrop. */
  canvasStyle: z.union(['glass', 'transparent']).default('glass').volatile(),
  /** Pixel themes: CSS pixel block size, shape, and corner radius ratio (0–0.5). */
  pixelSize: z.number().min(6).max(32).default(10).volatile(),
  pixelStyle: z.union(['square', 'rounded']).default('square').volatile(),
  pixelRadius: z.number().min(0).max(0.5).default(0.25).volatile(),
  /** The Review theme: automatic sub-theme selection from content, or a manual lock. */
  reviewSubTheme: z.union(['auto', 'code', 'investigate', 'create', 'discuss']).default('auto').volatile(),
  /** The Response theme: composer wave origin, whole card edge or caret. */
  composerWaveMode: z.union(['whole', 'caret']).default('whole').volatile(),
  /** The Response theme: 0 = no damping (current effect), 1 = fast decay. */
  waveDamping: z.number().min(0).max(1).default(0).volatile(),
  staticImage: z.string().default('').volatile(),
  staticBlur: z.number().min(0).max(40).default(12).volatile(),
  staticDim: z.number().min(0).max(0.8).default(0.2).volatile(),
  nativeMode: z.union(['light', 'dark', 'system']).default('system').volatile(),
})

/** Publish this entry's Config as a Host-backed settings namespace. */
export function apply(ctx) {
  ctx.inject(['settings'], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber))
  })
}
