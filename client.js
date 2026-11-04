window.__ModuleLoader__.load({
  id: 'dsh-pixel-appearance',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'appearance'
    const APPEARANCE_ANIMATIONS = ['ripple', 'rain', 'aurora', 'pulse']
    const APPEARANCE_STYLES = ['native', 'glass', 'transparent']
    const APPEARANCE_STATIC_DEFAULT_SVG = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1200" viewBox="0 0 1920 1200">',
      '<defs>',
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0" stop-color="#070b16"/>',
      '<stop offset="0.55" stop-color="#172748"/>',
      '<stop offset="1" stop-color="#05070d"/>',
      '</linearGradient>',
      '<radialGradient id="moon" cx="0.72" cy="0.24" r="0.46">',
      '<stop offset="0" stop-color="#dbe6ff" stop-opacity="0.95"/>',
      '<stop offset="0.32" stop-color="#7592ff" stop-opacity="0.34"/>',
      '<stop offset="1" stop-color="#000000" stop-opacity="0"/>',
      '</radialGradient>',
      '<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0" stop-color="#6b8cff" stop-opacity="0"/>',
      '<stop offset="1" stop-color="#6b8cff" stop-opacity="0.18"/>',
      '</linearGradient>',
      '</defs>',
      '<rect width="1920" height="1200" fill="url(#sky)"/>',
      '<rect width="1920" height="1200" fill="url(#moon)"/>',
      '<g fill="#bfd0ff">',
      '<circle cx="1418" cy="268" r="26" opacity="0.9"/>',
      '<circle cx="1532" cy="360" r="3.5" opacity="0.8"/>',
      '<circle cx="1176" cy="200" r="3" opacity="0.7"/>',
      '<circle cx="1700" cy="230" r="3.5" opacity="0.7"/>',
      '<circle cx="1308" cy="430" r="2.5" opacity="0.5"/>',
      '<circle cx="1622" cy="470" r="2" opacity="0.5"/>',
      '</g>',
      '<path d="M0 910 L286 620 L504 828 L768 516 L1080 864 L1344 672 L1632 888 L1920 720 L1920 1200 L0 1200 Z" fill="#0d1728" opacity="0.94"/>',
      '<path d="M0 1030 L360 792 L624 960 L936 720 L1248 984 L1536 840 L1920 1020 L1920 1200 L0 1200 Z" fill="#101b2e"/>',
      '<rect y="760" width="1920" height="440" fill="url(#haze)"/>',
      '<path d="M0 1120 L456 984 L768 1080 L1176 960 L1512 1080 L1920 1008 L1920 1200 L0 1200 Z" fill="#080d16"/>',
      '</svg>',
    ].join('')
    const APPEARANCE_STATIC_DEFAULT_IMAGE = 'data:image/svg+xml;charset=utf-8,'
      + encodeURIComponent(APPEARANCE_STATIC_DEFAULT_SVG)
    const APPEARANCE_PALETTES = [
      { id: 'auto', nameKey: 'paletteAuto', main: '#4D6BFE', bg: '', mode: 'auto' },
      { id: 'deepsea', nameKey: 'paletteDeepsea', main: '#4D6BFE', bg: '#151517', mode: 'dark' },
      { id: 'neon', nameKey: 'paletteNeon', main: '#22D3EE', bg: '#0B1020', mode: 'dark' },
      { id: 'sunset', nameKey: 'paletteSunset', main: '#F59E0B', bg: '#2A1320', mode: 'dark' },
      { id: 'forest', nameKey: 'paletteForest', main: '#34D399', bg: '#0F1F1A', mode: 'dark' },
      { id: 'paper', nameKey: 'palettePaper', main: '#4338CA', bg: '#F7F4EC', mode: 'light' },
      { id: 'custom', nameKey: 'paletteCustom', main: null, bg: null, mode: 'custom' },
    ]

    const ZH = {
      nav: '外观',
      title: '外观',
      intro: '选择主题、配色和组件材质。像素主题提供动态像素背景，响应主题的像素动画会随鼠标、输入和 Agent 消息变化，静态主题会在主页与侧边栏下层显示一张你选择的图片。',
      sectionTheme: '主题',
      themeHint: '选择应用整体的视觉主题。原生主题保留 DSH 的原始外观，静态主题使用图片作为背景，响应主题用像素动画回应用户与 Agent 的操作。',
      theme: '主题',
      native: '原生',
      nativeHint: '保留 DSH 原始外观，只关闭自创主题的覆盖层。',
      pixel: '像素',
      pixelHint: '动态像素背景。',
      static: '静态',
      staticHint: '在主页和侧边栏下层显示一张图片，可调节模糊和暗化；展开右侧边栏时图片保持原样。',
      response: '响应',
      responseHint: '像素动画随鼠标与消息响应：鼠标处出现圆形像素晕影，输入卡、点击和 Agent 新消息会扩散像素波。',
      creativeTheme: '使用创造模式创作',
      creativeThemeHint: '让 Creator 为你设计一个新的主题。',
      sectionColor: '色彩组合',
      palette: '色彩组合',
      paletteHint: '一组预设的主体色与背景色。选择“自动”会跟随当前原生背景。',
      paletteAuto: '自动',
      paletteDeepsea: '深海',
      paletteNeon: '霓虹',
      paletteSunset: '日落',
      paletteForest: '森林',
      palettePaper: '纸白',
      paletteCustom: '自定义',
      mainColor: '主体色',
      backgroundColor: '背景色',
      sectionMotion: '动画内容',
      animation: '动画内容',
      animationHint: '背景像素动画。所有动画都是无缝循环的。',
      animationHintResponse: '响应主题不使用固定背景动画；像素动画由鼠标、输入卡和 Agent 新消息驱动。',
      ripple: '涟漪',
      rain: '像素雨',
      aurora: '极光波',
      pulse: '呼吸脉冲',
      creativeAnimation: '使用创造模式创作',
      creativeAnimationHint: '让 Creator 为你设计一个新的像素动画。',
      sectionCanvas: '画布样式',
      canvasHint: '所有自创主题的主内容画布材质：毛玻璃会模糊背后的像素动画或静态图片并叠一层底色，透明则让背景直接透出。',
      canvasGlass: '毛玻璃',
      canvasTransparent: '透明',
      sectionPixel: '像素',
      sectionPixelHint: '像素尺寸与样式作用于像素和响应主题的动态像素背景。默认样式保持当前的方形像素；圆角样式下所有像素使用圆角，圆角半径按像素尺寸的比例自动适配。',
      pixelSize: '像素尺寸',
      pixelStyle: '像素样式',
      pixelStyleDefault: '默认',
      pixelStyleRounded: '圆角',
      pixelRadius: '圆角半径',
      sectionResponse: '响应效果',
      sectionResponseHint: '静态保持当前晕影效果；动态样式让晕影半径与亮度按呼吸节奏缓慢起伏。晕影半径可调；尾迹强度描述像素尾迹的保留时间，0 表示无尾迹。',
      responseRadius: '晕影半径',
      responseRadiusHint: '鼠标处圆形像素晕影的半径；晕影中心为主体色，向外逐渐过渡为背景色。',
      haloStyle: '晕影样式',
      haloStyleStatic: '静态',
      haloStyleDynamic: '动态',
      trailStrength: '尾迹强度',
      sectionWave: '输入卡波形',
      composerWaveHint: '输入卡内输入、删除或移动光标时产生的波形。“整体”从输入卡边缘向外扩散；“光标”以文本光标处为中心产生类似点击的圆形波形。',
      composerWaveWhole: '整体',
      composerWaveCaret: '光标',
      sectionDamping: '波形阻尼',
      waveDamping: '波形阻尼',
      waveDampingHint: '100% 时波形极快衰减，不会扩散到整个画布；0% 为当前效果。阻尼作用于点击、输入卡和 Agent 新消息产生的所有波形。',
      sectionComposer: '输入卡样式',
      composerHint: '主页面输入卡的材质、颜色和透明度。',
      sectionSidebar: '侧边栏样式',
      sidebarHint: '左侧边栏的材质、颜色和透明度。',
      styleNative: '原生',
      styleGlass: '毛玻璃',
      styleTransparent: '透明',
      color: '颜色',
      opacity: '不透明度',
      blur: '模糊',
      preview: '预览',
      previewHint: '预览会跟随当前配色和动画设置。',
      nativeInactive: '原生主题下不生效',
      creatorOpening: '正在打开创造模式…',
      creatorFailed: '无法打开创造模式：{error}',
      writeFailed: '保存失败，请重试。',
      hostOutdated: '设置没有保存：当前运行的 DSH 还没有加载本插件的新版 Host 配置。请完全退出并重新启动 DSH 后再试。',
      themeNativeNote: '当前是原生主题。切换到像素、响应或静态主题后，色彩组合、动画和组件材质才会生效。',
      sectionStaticImage: '静态图片',
      staticImageHint: '图片显示在主页和侧边栏的下层。选中的图片会记住在“静态”主题下，切回该主题时仍会保留。',
      staticImageChoose: '选择图片',
      staticImageReading: '读取图片…',
      staticImageClear: '恢复默认图片',
      staticImageApply: '应用链接',
      staticImageUrlPlaceholder: '粘贴图片链接（https://…）',
      staticImageInvalid: '请选择图片文件，或输入以 http(s):// 开头的图片链接。',
      staticImageReadFailed: '无法读取这张图片，请换一张重试。',
      staticImageDefaultNote: '未选择时会显示内置默认图片；本地图片会压缩后保存在本插件的 Host 设置中。',
      staticBlur: '图片模糊',
      staticDim: '图片暗化',
      staticPreviewHint: '预览跟随当前图片、模糊和暗化设置。',
      animationHintStatic: '像素主题下生效；静态主题使用图片背景，不使用像素动画。',
      creatorPromptTheme: `请使用创造模式为当前 DSH「像素外观」插件创作一个新的视觉主题。目标是让新主题出现在“设置 > 外观 > 主题”菜单中。请在当前插件根目录（包含 index.js、src/INTERFACE.md 和 src/build.mjs 的目录）内工作；请先阅读 src/INTERFACE.md 和现有 client.js 生成源码，沿用 Host-backed Config、配色组合和像素引擎接口；实现后运行 node src/build.mjs、node --check client.js，并说明如何安装与验证。所有新增或修改的文件都必须保存在该插件目录内，不要写入其他位置，也不要修改无关文件。`,
      creatorPromptAnimation: `请使用创造模式为当前 DSH「像素外观」插件创作一个新的像素背景动画。目标是让新动画出现在“设置 > 外观 > 动画内容”菜单中。请在当前插件根目录内工作；请先阅读 src/INTERFACE.md 和现有像素引擎实现，新增一个无缝循环、两色有序抖动的动画，并沿用现有菜单和 Host-backed Config；实现后运行 node src/build.mjs、node --check client.js，并说明如何安装与验证。所有新增或修改的文件都必须保存在该插件目录内，不要写入其他位置，也不要修改无关文件。`,
    }
    const EN = {
      nav: 'Appearance',
      title: 'Appearance',
      intro: 'Choose a theme, a colour combination, and component materials. The Pixel theme animates the background, the Response theme reacts to the pointer, typing, and Agent messages, and the Static theme shows a picture you pick behind the main page and sidebar.',
      sectionTheme: 'Theme',
      themeHint: 'Choose the overall visual theme. Native keeps the original DSH look, Static uses a picture as the backdrop, and Response draws pixel animations that answer your pointer and Agent activity.',
      theme: 'Theme',
      native: 'Native',
      nativeHint: 'Keep the original DSH look and only remove the custom theme layer.',
      pixel: 'Pixel',
      pixelHint: 'Animated pixel background.',
      static: 'Static',
      staticHint: 'Show a picture behind the main page and sidebar with adjustable blur and dim; the picture does not distort when the right sidebar expands.',
      response: 'Response',
      responseHint: 'Pixel animation that answers the pointer and messages: a round pixel halo follows the pointer, while composer typing, clicks, and new Agent lines spread pixel waves.',
      creativeTheme: 'Create with Creator',
      creativeThemeHint: 'Ask Creator to design a new theme for you.',
      sectionColor: 'Colour combination',
      palette: 'Colour combination',
      paletteHint: 'A preset pair of main and background colours. Auto follows the current native background.',
      paletteAuto: 'Auto',
      paletteDeepsea: 'Deep sea',
      paletteNeon: 'Neon',
      paletteSunset: 'Sunset',
      paletteForest: 'Forest',
      palettePaper: 'Paper',
      paletteCustom: 'Custom',
      mainColor: 'Main colour',
      backgroundColor: 'Background',
      sectionMotion: 'Animation',
      animation: 'Animation',
      animationHint: 'Animated pixel background. Every animation loops seamlessly.',
      animationHintResponse: 'The Response theme does not use a fixed background animation; the pixel animation is driven by the pointer, the composer, and new Agent messages.',
      ripple: 'Ripple',
      rain: 'Pixel rain',
      aurora: 'Aurora',
      pulse: 'Breathing pulse',
      creativeAnimation: 'Create with Creator',
      creativeAnimationHint: 'Ask Creator to design a new pixel animation.',
      sectionCanvas: 'Canvas style',
      canvasHint: 'Main content canvas material for every custom theme. Frosted glass blurs the pixel animation or static picture behind it and adds a tint; Transparent lets the backdrop show through directly.',
      canvasGlass: 'Frosted glass',
      canvasTransparent: 'Transparent',
      sectionPixel: 'Pixels',
      sectionPixelHint: 'Pixel size and style apply to the animated pixel backgrounds of the Pixel and Response themes. Default keeps the current square pixels; Rounded rounds every pixel, and the corner radius scales with the pixel size.',
      pixelSize: 'Pixel size',
      pixelStyle: 'Pixel style',
      pixelStyleDefault: 'Default',
      pixelStyleRounded: 'Rounded',
      pixelRadius: 'Corner radius',
      sectionResponse: 'Response effect',
      sectionResponseHint: 'Static keeps the current halo; Dynamic makes the halo radius and brightness breathe slowly. The halo radius is adjustable; Trail strength controls how long stamped trail pixels survive, and 0 disables the trail.',
      responseRadius: 'Halo radius',
      responseRadiusHint: 'Radius of the round pixel halo at the pointer; its centre uses the main colour and fades out to the background colour.',
      haloStyle: 'Halo style',
      haloStyleStatic: 'Static',
      haloStyleDynamic: 'Dynamic',
      trailStrength: 'Trail strength',
      sectionWave: 'Composer wave',
      composerWaveHint: 'Wave origin for typing, deleting, and caret movement inside the composer. Whole spreads from the composer card edge; Caret starts a click-like round wave at the text caret.',
      composerWaveWhole: 'Whole',
      composerWaveCaret: 'Caret',
      sectionDamping: 'Wave damping',
      waveDamping: 'Wave damping',
      waveDampingHint: 'At 100% waves decay almost immediately and never reach the whole canvas; 0% keeps the current effect. Applies to every wave from clicks, the composer, and new Agent messages.',
      sectionComposer: 'Composer',
      composerHint: 'Material, colour, and opacity of the main-page composer card.',
      sectionSidebar: 'Sidebar',
      sidebarHint: 'Material, colour, and opacity of the left sidebar.',
      styleNative: 'Native',
      styleGlass: 'Frosted glass',
      styleTransparent: 'Transparent',
      color: 'Colour',
      opacity: 'Opacity',
      blur: 'Blur',
      preview: 'Preview',
      previewHint: 'The preview follows the current colours and animation.',
      nativeInactive: 'Inactive with the Native theme',
      creatorOpening: 'Opening Creator…',
      creatorFailed: 'Could not open Creator: {error}',
      writeFailed: 'Could not save. Try again.',
      hostOutdated: 'The setting was not saved: the running DSH has not loaded this plugin’s new Host configuration yet. Fully quit and restart DSH, then try again.',
      themeNativeNote: 'The Native theme is active. Colour, animation, and material settings apply after you switch to Pixel, Response, or Static.',
      sectionStaticImage: 'Static picture',
      staticImageHint: 'The picture is shown behind the main page and the sidebar. The selected picture is remembered under the Static theme and comes back when you switch back.',
      staticImageChoose: 'Choose picture',
      staticImageReading: 'Reading picture…',
      staticImageClear: 'Use default picture',
      staticImageApply: 'Apply link',
      staticImageUrlPlaceholder: 'Paste an image link (https://…)',
      staticImageInvalid: 'Choose an image file, or enter an image link starting with http(s)://.',
      staticImageReadFailed: 'Could not read that picture. Try another one.',
      staticImageDefaultNote: 'The built-in default picture is used until you pick one. Local pictures are compressed and saved in this plugin’s Host settings.',
      staticBlur: 'Picture blur',
      staticDim: 'Picture dim',
      staticPreviewHint: 'The preview follows the current picture, blur, and dim settings.',
      animationHintStatic: 'Applies to the Pixel theme; the Static theme uses a picture instead of a pixel animation.',
      creatorPromptTheme: `Use Creator mode to author a new visual theme for the current DSH Pixel Appearance plugin. The new theme must appear in Settings > Appearance > Theme. Work inside the plugin root (the directory containing index.js, src/INTERFACE.md, and src/build.mjs); first read src/INTERFACE.md and the existing client.js sources, reuse the Host-backed Config, palette, and pixel engine interfaces, then run node src/build.mjs and node --check client.js and explain how to install and verify it. Keep every new or modified file inside that plugin directory; do not write elsewhere and do not edit unrelated files.`,
      creatorPromptAnimation: `Use Creator mode to author a new pixel background animation for the current DSH Pixel Appearance plugin. The new animation must appear in Settings > Appearance > Animation. Work inside the plugin root (the directory containing index.js, src/INTERFACE.md, and src/build.mjs); first read src/INTERFACE.md and the existing pixel engine, add a seamless, two-colour ordered-dither animation, and reuse the existing menu and Host-backed Config; then run node src/build.mjs and node --check client.js and explain how to install and verify it. Keep every new or modified file inside that plugin directory; do not write elsewhere and do not edit unrelated files.`,
    }

    const APPEARANCE_DEFAULTS = {
      theme: 'native',
      palette: 'auto',
      mainColor: '#4D6BFE',
      backgroundColor: '',
      animation: 'ripple',
      composerStyle: 'glass',
      composerColor: '',
      composerOpacity: 0.72,
      sidebarStyle: 'glass',
      sidebarColor: '',
      sidebarOpacity: 0.6,
      blur: 12,
      responseRadius: 180,
      haloStyle: 'static',
      trailStrength: 0,
      canvasStyle: 'glass',
      pixelSize: 10,
      pixelStyle: 'square',
      pixelRadius: 0.25,
      composerWaveMode: 'whole',
      waveDamping: 0,
      staticImage: '',
      staticBlur: 12,
      staticDim: 0.2,
      nativeMode: 'system',
    }

    function appearanceClamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    }

    function appearanceIsHex(value) {
      return typeof value === 'string' && /^#[0-9a-f]{3,8}$/iu.test(value)
    }

    function appearanceDeepEqual(a, b) {
      return JSON.stringify(a) === JSON.stringify(b)
    }

    function appearanceLocaleDict(locale) {
      return locale === 'zh' ? ZH : EN
    }

    function appearanceFormat(template, values) {
      return String(template).replace(/\{(\w+)\}/gu, (_, key) => String(values?.[key] ?? ''))
    }

    /** Resolve the stored static picture to a safe CSS image source. */
    function appearanceStaticImageSource(value) {
      if (typeof value !== 'string') return APPEARANCE_STATIC_DEFAULT_IMAGE
      const raw = value.trim()
      if (raw === '') return APPEARANCE_STATIC_DEFAULT_IMAGE
      if (/^data:image\//iu.test(raw) || /^https?:\/\//iu.test(raw)) return raw
      return APPEARANCE_STATIC_DEFAULT_IMAGE
    }

    /** Build a quoted CSS url() while keeping quotes/backslashes out of the value. */
    function appearanceCssUrl(value) {
      const escaped = String(value).replace(/["\\\r\n]/gu, (character) => {
        if (character === '"') return '%22'
        if (character === '\\') return '%5C'
        return ''
      })
      return 'url("' + escaped + '")'
    }
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
  let levels = spec.levels
  if (!levels || levels.length < cols * rows) {
    levels = new Uint8Array(cols * rows)
    spec.levels = levels
  }
  let i = 0
  for (let y = 0; y < rows; y += 1) {
    const rowBase = (y & 7) << 3
    for (let x = 0; x < cols; x += 1, i += 1) {
      levels[i] = EnginePaletteLevel(cov[i], bayer[rowBase + (x & 7)])
    }
  }

  EngineWritePreviewLayer(entry, levels, palettePacked, paletteBytes)
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
    waves.push({
      circle,
      x: EngineNumber(wave.x, 0),
      y: EngineNumber(wave.y, 0),
      halfW: Math.max(1, EngineNumber(wave.halfW, 1)),
      halfH: Math.max(1, EngineNumber(wave.halfH, 1)),
      corner: Math.max(0, EngineNumber(wave.corner, 0)),
      radius: Math.max(0, EngineNumber(wave.radius, 0)),
      width: Math.max(2, EngineNumber(wave.width, 34)),
      strength,
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
    for (let col = 0; col < cols; col += 1, i += 1) {
      const px = (col + 0.5) * gridCell
      let coverage = 0
      if (trailEnabled) {
        const birth = trailBirth[i]
        if (birth >= 0) {
          const age = trailNow - birth
          if (age >= 0 && age < trailRetention) {
            const fade = 1 - age / trailRetention
            if (fade > coverage) coverage = fade
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
          if (value > coverage) coverage = value
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
        if (k > 0) coverage += wave.strength * k * k
      }
      if (coverage > 1) coverage = 1
      const level = EnginePaletteLevel(coverage, bayer[rowBase + (col & 7)])
      if (words) {
        words[i] = level > 0 ? palettePacked[level] : 0
      } else {
        const color = level > 0 ? paletteBytes[level] : null
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
function appearanceThemeController(ctx, store) {
  let overrideDispose = null
  let lastTheme = null
  let applying = false

  const disposeOverride = () => {
    try {
      overrideDispose?.()
    } catch {}
    overrideDispose = null
  }

  const apply = () => {
    if (applying) return
    applying = true
    try {
      const { config } = store.getSnapshot()
      const mode = config.theme === 'pixel'
        ? 'pixel'
        : config.theme === 'static'
          ? 'static'
          : config.theme === 'response' ? 'response' : null
      if (mode === null) {
        disposeOverride()
        if (lastTheme !== null) {
          try {
            ctx.theme.setTheme(config.nativeMode || 'system')
          } catch {}
        }
        lastTheme = null
        return
      }

      const scheme = appearanceResolvedScheme(ctx)
      const effective = appearanceEffective(config, scheme)
      const tokens = {}
      if (mode === 'pixel' || mode === 'response') {
        tokens['--dsw-alias-bg-base'] = {
          light: effective.backgroundColor,
          dark: effective.backgroundColor,
        }
      }
      if (effective.sidebarFill) {
        tokens['--dsw-specific-sidebar-fill'] = {
          light: effective.sidebarFill,
          dark: effective.sidebarFill,
        }
      }
      if (effective.composerFill) {
        tokens['--dsw-specific-input-major'] = {
          light: 'transparent',
          dark: 'transparent',
        }
      }
      try {
        overrideDispose = ctx.theme.overrideTokens('appearance', tokens)
      } catch (cause) {
        console.error('appearance: token override failed', cause)
      }

      if (mode === 'pixel' || mode === 'response') {
        const desired = effective.autoBackground ? null : effective.dark ? 'dark' : 'light'
        if (desired !== null && appearanceResolvedScheme(ctx) !== desired) {
          try {
            ctx.theme.setTheme(desired)
          } catch {}
        }
      }
      lastTheme = mode
    } finally {
      applying = false
    }
  }

  const offStore = store.subscribe(apply)
  const offTheme = ctx.on('theme/change', () => {
    try {
      const { config } = store.getSnapshot()
      const preference = ctx.theme.getTheme().preference
      if (
        config.theme === 'native' &&
        (preference === 'light' || preference === 'dark' || preference === 'system') &&
        preference !== config.nativeMode
      ) {
        store.set({ nativeMode: preference })
      }
    } catch {}
    apply()
  })
  apply()
  return () => {
    offStore?.()
    offTheme?.()
    disposeOverride()
  }
}

function appearanceBuildCss(config, effective) {
  const mode = config.theme === 'static'
    ? 'static'
    : config.theme === 'response' ? 'response' : 'pixel'
  const scene = '[data-appearance-scene]'
  const bg = effective.backgroundColor
  const blur = effective.blur
  const composerStyle = config.composerStyle
  const composerFill = effective.composerFill || appearanceColorWithAlpha(bg, 0.72)
  const composerFallback = appearanceColorWithAlpha(bg, 0.92)

  const composerRules =
    composerStyle !== 'native'
      ? `
      ${scene} [data-composer-card] {
        isolation: isolate;
        background: transparent;
        --dsw-specific-input-major: transparent;
        border-color: rgba(128, 128, 128, .2);
        box-shadow: 0 12px 36px #0000000d, inset 0 1px 0 #ffffff80;
      }
      ${scene} [data-composer-card]::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        border-radius: inherit;
        background: ${composerFill};
        backdrop-filter: blur(${blur}px) saturate(1.08);
        -webkit-backdrop-filter: blur(${blur}px) saturate(1.08);
      }
      body[data-ds-dark-theme] ${scene} [data-composer-card] {
        border-color: #ffffff30;
        box-shadow: 0 12px 36px #0003, inset 0 1px 0 #ffffff12;
      }
      @supports not (backdrop-filter: blur(1px)) {
        ${scene} [data-composer-card]::before {
          background: ${composerFallback};
        }
      }`
      : ''

  const sidebarMaterial =
    mode === 'static' || config.sidebarStyle !== 'native'
      ? `
      div:has(> [data-slot="sidebar"]) {
        background-color: ${effective.sidebarFill} !important;
        background-image: none !important;
        backdrop-filter: blur(${blur}px) saturate(1.12);
        -webkit-backdrop-filter: blur(${blur}px) saturate(1.12);
      }
      div:has(> [data-slot="sidebar"]) [data-slot="sidebar"] > * {
        background-color: transparent !important;
      }`
      : ''

  const canvasMaterial = effective.canvasStyle === 'transparent'
    ? `
      ${scene} [data-slot="main"] {
        background-color: transparent !important;
      }
      ${scene} [data-slot="main"]::before {
        content: none;
      }`
    : `
      ${scene} [data-slot="main"] {
        position: relative;
        isolation: isolate;
        background-color: transparent !important;
      }
      ${scene} [data-slot="main"]::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background-color: ${appearanceColorWithAlpha(bg, 0.34)};
        backdrop-filter: blur(${blur}px) saturate(1.06);
        -webkit-backdrop-filter: blur(${blur}px) saturate(1.06);
      }
      @supports not (backdrop-filter: blur(1px)) {
        ${scene} [data-slot="main"]::before {
          background-color: ${appearanceColorWithAlpha(bg, 0.84)};
        }
      }`

  const staticRules = mode === 'static'
    ? `
    .appearance-static-layer {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: var(--dsh-frame-top-clearance, 0px);
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
      background: #07090f;
    }
    .appearance-static-layer::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-color: rgba(0, 0, 0, var(--apx-static-dim, 0.2));
    }
    .appearance-static-image {
      position: absolute;
      inset: -80px;
      background-image: var(--apx-static-image, none);
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      filter: blur(var(--apx-static-blur, 0px));
      transition: filter .18s ease;
    }
    @media (prefers-reduced-motion: reduce) {
      .appearance-static-image { transition: none; }
    }
    `
    : ''

  return `
    ${scene} {
      position: relative;
    }
    ${scene} > div:has(> [data-slot="sidebar"]),
    ${scene} > div:has(> [data-slot="main"]),
    ${scene} > div:has(> [data-slot="rightbar"]),
    ${scene} > [data-shell-bottom] {
      position: relative;
      z-index: 1;
    }
    ${scene} > div:has(> [data-slot="main"]),
    ${scene} > div:has(> [data-slot="rightbar"]),
    ${scene} > [data-shell-bottom],
    ${scene} [data-slot="main"],
    ${scene} [data-slot="main"] > *,
    ${scene} [data-slot="main"] :has([data-conversation-content]),
    ${scene} [data-conversation-content],
    ${scene} [data-conversation-content] > *,
    ${scene} [data-conversation-scroll] {
      background-color: transparent !important;
      background-image: none !important;
    }
    .appearance-pixel-canvas {
      position: absolute;
      left: 0;
      top: var(--dsh-frame-top-clearance, 0px);
      display: block;
      width: 100%;
      height: calc(100% - var(--dsh-frame-top-clearance, 0px));
      pointer-events: none;
      z-index: 0;
    }
    ${staticRules}
    ${composerRules}
    ${sidebarMaterial}
    ${canvasMaterial}
  `
}

function AppearanceLayer({ store, ctx }) {
  const { config } = appearanceUseStore(store)
  const [, setThemeRevision] = React.useState(0)
  React.useEffect(() => {
    const off = ctx.on('theme/change', () => setThemeRevision((value) => value + 1))
    return () => {
      if (typeof off === 'function') off()
    }
  }, [ctx])
  if (config.theme !== 'pixel' && config.theme !== 'static' && config.theme !== 'response') {
    return null
  }
  const effective = appearanceEffective(config, appearanceResolvedScheme(ctx))
  return h('style', { 'data-appearance-layer': '' }, appearanceBuildCss(config, effective))
}

function appearanceMountScenes(ctx, store) {
  if (typeof document === 'undefined') return () => {}
  const mounted = new Map()
  let disposed = false
  let queued = false
  const reduced = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null

  const readState = () => {
    const { config } = store.getSnapshot()
    const mode = config.theme === 'pixel'
      ? 'pixel'
      : config.theme === 'static'
        ? 'static'
        : config.theme === 'response' ? 'response' : null
    return {
      config,
      mode,
      effective: appearanceEffective(config, appearanceResolvedScheme(ctx)),
    }
  }

  const responseRuntime = appearanceResponseCreateRuntime({
    ctx,
    store,
    requestPaint: () => paintResponseNow(),
  })

  const drawEntry = (entry, now) => {
    entry.frame = null
    if (disposed || !entry.active) return
    if (entry.mode === 'pixel') {
      const state = readState()
      try {
        appearancePaintPreview(entry.canvas, {
          mainColor: state.effective.mainColor,
          backgroundColor: state.effective.backgroundColor,
          animation: state.config.animation,
          time: now / 1000,
          cell: Math.max(4, Math.round(state.effective.pixelSize * (window.devicePixelRatio || 1))),
          pixelStyle: state.effective.pixelStyle,
          pixelRadius: state.effective.pixelRadius,
        })
      } catch (cause) {
        console.error('appearance: canvas paint failed', cause)
      }
    } else if (entry.mode === 'response') {
      responseRuntime.paint(entry.canvas, entry.canvasRect, now)
    } else {
      return
    }
    if (entry.active
      && (entry.mode === 'pixel' || entry.mode === 'response')
      && !document.hidden
      && !(reduced && reduced.matches)) {
      entry.frame = requestAnimationFrame((next) => drawEntry(entry, next))
    }
  }

  function paintResponseNow() {
    if (disposed) return
    const now = performance.now()
    for (const entry of mounted.values()) {
      if (entry.active && entry.mode === 'response') {
        responseRuntime.paint(entry.canvas, entry.canvasRect, now)
      }
    }
  }

  const startEntry = (entry) => {
    if (entry.frame !== null || !entry.active) return
    entry.frame = requestAnimationFrame((now) => drawEntry(entry, now))
  }

  const stopEntry = (entry) => {
    if (entry.frame === null) return
    cancelAnimationFrame(entry.frame)
    entry.frame = null
  }

  const applyStaticLayer = (entry, state) => {
    const source = state.effective.staticImage
    const blur = state.effective.staticBlur
    const dim = state.effective.staticDim
    const key = source + '\u0000' + blur + '\u0000' + dim
    if (entry.staticKey === key) return
    entry.staticKey = key
    entry.staticLayer.style.setProperty('--apx-static-image', appearanceCssUrl(source))
    entry.staticLayer.style.setProperty('--apx-static-blur', blur + 'px')
    entry.staticLayer.style.setProperty('--apx-static-dim', String(dim))
  }

  const updateEntry = (entry) => {
    const state = readState()
    const pixelActive = state.mode === 'pixel'
    const responseActive = state.mode === 'response'
    const staticActive = state.mode === 'static'
    const active = pixelActive || staticActive || responseActive
    entry.active = active
    entry.mode = state.mode
    entry.canvas.hidden = !(pixelActive || responseActive)
    entry.staticLayer.hidden = !staticActive
    entry.scene.toggleAttribute('data-appearance-scene', active)
    if (!active) {
      stopEntry(entry)
      return
    }
    if (staticActive) {
      applyStaticLayer(entry, state)
      stopEntry(entry)
      return
    }
    if (responseActive) responseRuntime.activate()
    entry.resize()
    if (document.hidden || (reduced && reduced.matches)) {
      stopEntry(entry)
      drawEntry(entry, performance.now())
    } else {
      startEntry(entry)
    }
  }

  const disposeEntry = (entry) => {
    stopEntry(entry)
    try {
      entry.resizeObserver.disconnect()
    } catch {}
    entry.canvas.remove()
    entry.staticLayer.remove()
    entry.scene.removeAttribute('data-appearance-scene')
    entry.scene.style.position = entry.previousPosition
    if (!entry.scene.getAttribute('style')) entry.scene.removeAttribute('style')
  }

  const attach = (scene) => {
    const canvas = document.createElement('canvas')
    canvas.className = 'appearance-pixel-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    canvas.hidden = true

    const staticLayer = document.createElement('div')
    staticLayer.className = 'appearance-static-layer'
    staticLayer.setAttribute('aria-hidden', 'true')
    staticLayer.hidden = true
    const staticImage = document.createElement('div')
    staticImage.className = 'appearance-static-image'
    staticLayer.appendChild(staticImage)

    const previousPosition = scene.style.position
    if (getComputedStyle(scene).position === 'static') scene.style.position = 'relative'
    scene.prepend(staticLayer)
    scene.prepend(canvas)
    const entry = {
      scene,
      canvas,
      staticLayer,
      staticImage,
      staticKey: '',
      previousPosition,
      active: false,
      mode: null,
      frame: null,
      width: 0,
      height: 0,
      canvasRect: null,
      resize() {
        const rect = canvas.getBoundingClientRect()
        entry.canvasRect = rect
        const sceneRect = scene.getBoundingClientRect()
        const top = parseFloat(getComputedStyle(scene).getPropertyValue('--dsh-frame-top-clearance')) || 0
        const cssWidth = rect.width || sceneRect.width || scene.clientWidth || 1
        const cssHeight = rect.height || (sceneRect.height ? sceneRect.height - top : scene.clientHeight) || 1
        const ratio = Math.min(2, window.devicePixelRatio || 1)
        const width = Math.max(2, Math.round(cssWidth * ratio))
        const height = Math.max(2, Math.round(cssHeight * ratio))
        if (entry.width === width && entry.height === height) return
        entry.width = width
        entry.height = height
        canvas.width = width
        canvas.height = height
      },
      resizeObserver: null,
    }
    entry.resizeObserver = new ResizeObserver(() => {
      if (!entry.active || (entry.mode !== 'pixel' && entry.mode !== 'response')) return
      entry.resize()
      if (document.hidden || (reduced && reduced.matches)) drawEntry(entry, performance.now())
    })
    entry.resizeObserver.observe(scene)
    mounted.set(scene, entry)
    updateEntry(entry)
  }

  const scan = () => {
    queued = false
    if (disposed) return
    for (const [scene, entry] of mounted) {
      if (!scene.isConnected) {
        disposeEntry(entry)
        mounted.delete(scene)
      }
    }
    for (const scene of document.querySelectorAll('[data-slot="root"] > div')) {
      if (!mounted.has(scene)) attach(scene)
    }
    for (const entry of mounted.values()) updateEntry(entry)
    syncResponseActive()
  }

  const updateAll = () => {
    for (const entry of mounted.values()) updateEntry(entry)
    syncResponseActive()
  }

  const syncResponseActive = () => {
    let active = false
    for (const entry of mounted.values()) {
      if (entry.active && entry.mode === 'response') {
        active = true
        break
      }
    }
    if (active) responseRuntime.activate()
    else responseRuntime.deactivate()
  }

  const observer = new MutationObserver((records) => {
    responseRuntime.onMutations(records)
    if (queued) return
    queued = true
    queueMicrotask(scan)
  })
  observer.observe(document.body, { childList: true, subtree: true })

  const offStore = store.subscribe(updateAll)
  const offTheme = ctx.on('theme/change', updateAll)
  const onResize = () => updateAll()
  const onVisibility = () => updateAll()
  window.addEventListener('resize', onResize, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  if (reduced) reduced.addEventListener?.('change', updateAll)

  scan()

  return () => {
    disposed = true
    observer.disconnect()
    responseRuntime.dispose()
    offStore?.()
    offTheme?.()
    window.removeEventListener('resize', onResize)
    document.removeEventListener('visibilitychange', onVisibility)
    if (reduced) reduced.removeEventListener?.('change', updateAll)
    for (const entry of mounted.values()) disposeEntry(entry)
    mounted.clear()
  }
}

function appearanceStartCreator(ctx, kind, t) {
  const uiWorkspace = ctx.get('uiWorkspace')
  if (!uiWorkspace || typeof uiWorkspace.startSession !== 'function') {
    return { ok: false, error: 'Workspace navigation is unavailable' }
  }
  const prompt = kind === 'animation' ? t('creatorPromptAnimation') : t('creatorPromptTheme')
  try {
    uiWorkspace.startSession(undefined, {
      agentPreset: 'cordis',
      prompt,
      whenDraftExists: 'append',
      clearPreviousDraft: false,
    })
    return { ok: true }
  } catch (cause) {
    return { ok: false, error: cause instanceof Error ? cause.message : String(cause) }
  }
}

function apply(ctx) {
  appearanceApplyInner(ctx)
}

function appearanceApplyInner(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), 'appearance: dictionaries')
  const form = ctx.configForms.get(NS)
  const store = appearanceCreateStore(form)
  ctx.effect(() => () => store.dispose(), 'appearance: store')
  ctx.effect(() => appearanceThemeController(ctx, store), 'appearance: theme controller')
  ctx.effect(() => appearanceMountScenes(ctx, store), 'appearance: theme scenes')
  const t = ctx.locale.bind(NS)

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'appearance',
    order: 12,
    label: () => t('nav'),
    locale: NS,
    inject: () => ({
      store,
      startCreator: (kind) => appearanceStartCreator(ctx, kind, t),
    }),
  }, AppearanceSettingsPage))

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'appearance-pixel-layer',
    locale: NS,
    inject: () => ({ store, ctx }),
  }, AppearanceLayer))
}
/**
 * 45-response.js — event-driven pixel field for the Response theme.
 *
 * The fixed animation engine (10-engine.js) paints a loop. This fragment owns
 * the opposite model: a small live state machine that watches the pointer, the
 * composer, and the Chat flow, then hands the reactive painter one halo and a
 * short list of expanding waves per frame.
 *
 * Public: `appearanceResponseCreateRuntime({ ctx, store, requestPaint })`.
 * Everything else here is prefixed private state or a helper.
 */

/** Keys that move the caret inside the composer without changing the text. */
const APPEARANCE_RESPONSE_CARET_KEYS = {
  ArrowLeft: true,
  ArrowRight: true,
  ArrowUp: true,
  ArrowDown: true,
  Home: true,
  End: true,
  PageUp: true,
  PageDown: true,
}

/** Markdown block elements that represent one rendered line of a message. */
const APPEARANCE_RESPONSE_LINE_TAGS = {
  P: true,
  LI: true,
  PRE: true,
  BLOCKQUOTE: true,
  H1: true,
  H2: true,
  H3: true,
  H4: true,
  H5: true,
  H6: true,
  TABLE: true,
}

const APPEARANCE_RESPONSE_ROW_SELECTOR = '[data-chat-anchor-key]'
const APPEARANCE_RESPONSE_WAVE_LIMIT = 12
const APPEARANCE_RESPONSE_WAVE_SPEED = 520
const APPEARANCE_RESPONSE_WAVE_WIDTH = 40
const APPEARANCE_RESPONSE_TRAIL_MIN_MS = 250
const APPEARANCE_RESPONSE_TRAIL_MAX_MS = 2000

function appearanceResponseElementOf(target) {
  if (!target) return null
  if (target.nodeType === 1) return target
  return target.parentElement || null
}

/**
 * Damping-aware wave reach. `maxEdge` is the farthest canvas distance from the
 * wave origin; damping shrinks that travel so 100% never covers the canvas.
 */
function appearanceResponseWaveReach(maxEdge, damping) {
  const amount = appearanceClamp(Number(damping) || 0, 0, 1)
  return Math.max(1, maxEdge * (1 - 0.8 * amount))
}

/**
 * Damping-aware wave amplitude at a radius. At 0% damping this is exactly the
 * previous flat amplitude with a 120 px fade at the end of the travel; higher
 * damping also decays the wave with distance so it dies quickly.
 */
function appearanceResponseWaveAmp(strength, radius, reach, damping) {
  if (!(reach > 0) || radius > reach) return 0
  const edge = Math.min(1, (reach - radius) / 120)
  if (edge <= 0) return 0
  const amount = appearanceClamp(Number(damping) || 0, 0, 1)
  if (amount <= 0) return strength * edge
  const progress = appearanceClamp(radius / reach, 0, 1)
  return strength * edge * Math.pow(1 - progress, amount * 4)
}

/**
 * Breathing multiplier for the pointer halo. Static is exactly the previous
 * halo (scale 1, strength 1); dynamic oscillates the radius by ±12% and the
 * brightness by ±10% over a 2.6 s cycle.
 */
function appearanceResponseHaloPulse(style, timeSeconds) {
  if (style !== 'dynamic') return { scale: 1, strength: 1 }
  const seconds = Number(timeSeconds) || 0
  const breath = Math.sin((seconds / 2.6) * Math.PI * 2)
  return {
    scale: 1 + 0.12 * breath,
    strength: 0.9 + 0.1 * breath,
  }
}

/**
 * Trail strength describes how long a stamped main-colour pixel survives:
 * 0 = no trail, 1 = the longest retention (2 s after the pointer leaves it).
 */
function appearanceResponseTrailRetention(strength) {
  const amount = appearanceClamp(Number(strength) || 0, 0, 1)
  if (amount <= 0) return 0
  return APPEARANCE_RESPONSE_TRAIL_MIN_MS
    + (APPEARANCE_RESPONSE_TRAIL_MAX_MS - APPEARANCE_RESPONSE_TRAIL_MIN_MS) * amount
}

function appearanceResponseCreateRuntime(options) {
  const ctx = options?.ctx
  const store = options?.store
  const requestPaint = typeof options?.requestPaint === 'function' ? options.requestPaint : null
  const view = typeof window !== 'undefined' ? window : null
  const doc = typeof document !== 'undefined' ? document : null

  let active = false
  let disposed = false
  let startedAt = 0
  let cleanups = []
  let waves = []
  let lastComposerWave = -Infinity
  let lastAgentWave = -Infinity
  let lastPointerPaint = 0
  let trailReset = true
  const pointer = { x: 0, y: 0, inside: false }
  const seenAgentRows = typeof WeakSet === 'function' ? new WeakSet() : null
  const reduced = view && typeof view.matchMedia === 'function'
    ? view.matchMedia('(prefers-reduced-motion: reduce)')
    : null

  const clock = () => {
    if (view && view.performance && typeof view.performance.now === 'function') {
      return view.performance.now()
    }
    return Date.now()
  }

  const isReduced = () => Boolean(reduced && reduced.matches)

  const addListener = (target, type, handler, listenerOptions) => {
    if (!target || typeof target.addEventListener !== 'function') return
    target.addEventListener(type, handler, listenerOptions)
    cleanups.push(() => {
      try {
        target.removeEventListener(type, handler, listenerOptions)
      } catch {}
    })
  }

  const composerCard = () => {
    if (!doc) return null
    try {
      return doc.querySelector('[data-composer-card]')
    } catch {
      return null
    }
  }

  const composerOf = (target) => {
    const element = appearanceResponseElementOf(target)
    if (!element || typeof element.closest !== 'function') return null
    try {
      return element.closest('[data-composer-card]')
    } catch {
      return null
    }
  }

  /**
   * Client coordinates of the collapsed text caret. The composer is a Lexical
   * contenteditable, so the DOM Selection is authoritative; a one-character
   * probe covers browsers that report an empty rect for a collapsed range.
   */
  const caretClientPoint = () => {
    if (!doc) return null
    try {
      const selection = doc.getSelection ? doc.getSelection() : null
      if (!selection || selection.rangeCount === 0) return null
      const range = selection.getRangeAt(0)
      if (!range) return null
      const focusElement = appearanceResponseElementOf(selection.focusNode || range.startContainer)
      if (!focusElement || !composerOf(focusElement)) return null
      let rect = typeof range.getBoundingClientRect === 'function'
        ? range.getBoundingClientRect()
        : null
      if (!rect || (!rect.width && !rect.height)) {
        const rects = typeof range.getClientRects === 'function' ? range.getClientRects() : null
        if (rects && rects.length > 0) rect = rects[rects.length - 1]
      }
      if (!rect || (!rect.width && !rect.height)) {
        const node = selection.focusNode || range.startContainer
        const offset = selection.focusOffset ?? range.startOffset
        if (node && typeof doc.createRange === 'function') {
          const probe = doc.createRange()
          if (node.nodeType === 3) {
            if (offset < node.length) {
              probe.setStart(node, offset)
              probe.setEnd(node, Math.min(node.length, offset + 1))
            } else if (offset > 0) {
              probe.setStart(node, offset - 1)
              probe.setEnd(node, offset)
            }
          } else {
            probe.selectNodeContents(node)
          }
          const probeRect = probe.getBoundingClientRect()
          if (probeRect && (probeRect.width || probeRect.height)) rect = probeRect
        }
      }
      if (!rect || (!rect.width && !rect.height)) return null
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }
    } catch {
      return null
    }
  }

  const rectIsVisible = (rect) => {
    if (!rect || !(rect.width > 1) || !(rect.height > 1)) return false
    const height = view && view.innerHeight ? view.innerHeight : 0
    const width = view && view.innerWidth ? view.innerWidth : 0
    if (!height || !width) return true
    return rect.bottom > 0 && rect.top < height && rect.right > 0 && rect.left < width
  }

  const pushWave = (wave) => {
    if (!active || disposed || isReduced()) return
    if (waves.length >= APPEARANCE_RESPONSE_WAVE_LIMIT) {
      waves.splice(0, waves.length - APPEARANCE_RESPONSE_WAVE_LIMIT + 1)
    }
    waves.push(wave)
    requestPaint?.()
  }

  const spawnCircleWave = (clientX, clientY, strength) => {
    pushWave({
      kind: 'circle',
      x: clientX,
      y: clientY,
      halfW: 0,
      halfH: 0,
      corner: 0,
      start: clock(),
      speed: APPEARANCE_RESPONSE_WAVE_SPEED,
      width: APPEARANCE_RESPONSE_WAVE_WIDTH,
      strength,
    })
  }

  const spawnRectWave = (rect, strength) => {
    if (!rect || !rectIsVisible(rect)) return
    const width = rect.right - rect.left
    const height = rect.bottom - rect.top
    if (!(width > 1) || !(height > 1)) return
    pushWave({
      kind: 'rect',
      x: (rect.left + rect.right) / 2,
      y: (rect.top + rect.bottom) / 2,
      halfW: width / 2,
      halfH: height / 2,
      corner: Math.min(18, width / 2, height / 2),
      start: clock(),
      speed: APPEARANCE_RESPONSE_WAVE_SPEED,
      width: APPEARANCE_RESPONSE_WAVE_WIDTH,
      strength,
    })
  }

  const spawnComposerWave = (gap) => {
    if (!active || disposed) return
    const time = clock()
    if (time - lastComposerWave < gap) return
    const card = composerCard()
    if (!card) return
    const rect = card.getBoundingClientRect()
    if (!rectIsVisible(rect)) return
    lastComposerWave = time
    const { config } = store.getSnapshot()
    if (config.composerWaveMode === 'caret') {
      const point = caretClientPoint()
      if (point) {
        spawnCircleWave(point.x, point.y, 0.92)
        return
      }
    }
    spawnRectWave(rect, 0.92)
  }

  const spawnAgentWave = (rect) => {
    const time = clock()
    if (time - lastAgentWave < 130) return
    if (!rectIsVisible(rect)) return
    lastAgentWave = time
    spawnRectWave(rect, 0.95)
  }

  const onPointerMove = (event) => {
    const x = Number(event.clientX) || 0
    const y = Number(event.clientY) || 0
    if (!pointer.inside) trailReset = true
    pointer.x = x
    pointer.y = y
    pointer.inside = true
    if (isReduced()) {
      const now = clock()
      if (now - lastPointerPaint > 16) {
        lastPointerPaint = now
        requestPaint?.()
      }
    }
  }

  const onPointerDown = (event) => {
    pointer.x = Number(event.clientX) || 0
    pointer.y = Number(event.clientY) || 0
    pointer.inside = true
    trailReset = true
    spawnCircleWave(pointer.x, pointer.y, 0.95)
  }

  const onPointerLeave = () => {
    pointer.inside = false
    trailReset = true
    requestPaint?.()
  }

  const onInput = (event) => {
    if (composerOf(event.target)) spawnComposerWave(90)
  }

  const onKeyDown = (event) => {
    if (!event || !APPEARANCE_RESPONSE_CARET_KEYS[event.key]) return
    if (!composerOf(event.target)) return
    const { config } = store.getSnapshot()
    /* In caret mode the browser moves the caret after keydown; the following
     * selectionchange event owns the wave, so do not emit one from the old
     * caret position here. */
    if (config.composerWaveMode === 'caret') return
    spawnComposerWave(70)
  }

  const onComposerPointerUp = (event) => {
    if (composerOf(event.target)) spawnComposerWave(60)
  }

  const onSelectionChange = () => {
    if (!active || disposed || !doc) return
    let selection = null
    try {
      selection = doc.getSelection()
    } catch {
      selection = null
    }
    if (!selection || !selection.isCollapsed) return
    const anchor = selection.anchorNode
    const element = appearanceResponseElementOf(anchor)
    if (!element || !composerOf(element)) return
    spawnComposerWave(170)
  }

  const bind = () => {
    if (!view || !doc) return
    addListener(view, 'pointermove', onPointerMove, { passive: true })
    addListener(view, 'pointerdown', onPointerDown, { passive: true, capture: true })
    addListener(view, 'blur', onPointerLeave)
    addListener(doc.documentElement, 'pointerleave', onPointerLeave)
    addListener(doc, 'input', onInput, true)
    addListener(doc, 'keydown', onKeyDown, true)
    addListener(doc, 'pointerup', onComposerPointerUp, true)
    addListener(doc, 'selectionchange', onSelectionChange)
  }

  const unbind = () => {
    for (const dispose of cleanups) dispose()
    cleanups = []
  }

  /**
   * Inspect added DOM nodes for Chat rows. A new assistant row is one message
   * line; a new block element inside an assistant row is a streamed line.
   * The Chat view marks every row with `data-chat-anchor-key` and its kind with
   * `data-chat-flow-kind`, so no component coupling is needed.
   */
  const onMutations = (records) => {
    if (!active || disposed || isReduced()) return
    if (clock() - startedAt < 600) return
    for (let index = 0; index < records.length; index += 1) {
      const record = records[index]
      if (!record || record.type !== 'childList' || !record.addedNodes || !record.addedNodes.length) continue
      for (let nodeIndex = 0; nodeIndex < record.addedNodes.length; nodeIndex += 1) {
        const node = record.addedNodes[nodeIndex]
        if (!node || node.nodeType !== 1) continue
        const element = node
        if (typeof element.closest !== 'function') continue
        if (!element.closest('[data-conversation-content]')) continue
        if (element.matches?.(APPEARANCE_RESPONSE_ROW_SELECTOR)) {
          if (seenAgentRows) {
            if (seenAgentRows.has(element)) continue
            seenAgentRows.add(element)
          }
          if (element.getAttribute('data-chat-flow-kind') === 'assistant-step') {
            spawnAgentWave(element.getBoundingClientRect())
          }
          continue
        }
        const row = element.closest(APPEARANCE_RESPONSE_ROW_SELECTOR)
        if (!row || row.getAttribute('data-chat-flow-kind') !== 'assistant-step') continue
        if (!APPEARANCE_RESPONSE_LINE_TAGS[element.tagName]) continue
        spawnAgentWave(element.getBoundingClientRect())
      }
    }
  }

  const paint = (canvas, rect, nowMs) => {
    if (!active || disposed || !canvas || !rect) return
    const { config } = store.getSnapshot()
    const effective = appearanceEffective(config, appearanceResolvedScheme(ctx))
    const now = typeof nowMs === 'number' ? nowMs : clock()
    const dpr = Math.min(2, (view && view.devicePixelRatio) || 1)
    const cssWidth = Math.max(1, rect.width || canvas.width / dpr)
    const cssHeight = Math.max(1, rect.height || canvas.height / dpr)
    const localWaves = []
    const corners = [
      { x: 0, y: 0 },
      { x: cssWidth, y: 0 },
      { x: 0, y: cssHeight },
      { x: cssWidth, y: cssHeight },
    ]

    for (let index = waves.length - 1; index >= 0; index -= 1) {
      const wave = waves[index]
      const elapsed = Math.max(0, now - wave.start) / 1000
      const radius = elapsed * wave.speed
      const x = wave.x - rect.left
      const y = wave.y - rect.top
      let maxEdge = 0
      if (wave.kind === 'rect') {
        for (const corner of corners) {
          const distance = EngineRoundedRectDistance(
            corner.x, corner.y, x, y, wave.halfW, wave.halfH, wave.corner,
          )
          if (distance > maxEdge) maxEdge = distance
        }
      } else {
        for (const corner of corners) {
          const dx = corner.x - x
          const dy = corner.y - y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance > maxEdge) maxEdge = distance
        }
      }
      const reach = appearanceResponseWaveReach(maxEdge, effective.waveDamping)
      if (!(reach > 0) || radius > reach) {
        waves.splice(index, 1)
        continue
      }
      const strength = appearanceResponseWaveAmp(
        wave.strength, radius, reach, effective.waveDamping,
      )
      if (strength <= 0.01) continue
      localWaves.push({
        kind: wave.kind,
        x,
        y,
        halfW: wave.halfW,
        halfH: wave.halfH,
        corner: wave.corner,
        radius,
        width: wave.width,
        strength,
      })
    }

    const halos = []
    if (pointer.inside) {
      const haloStyle = isReduced() ? 'static' : effective.haloStyle
      const pulse = appearanceResponseHaloPulse(haloStyle, now / 1000)
      halos.push({
        x: pointer.x - rect.left,
        y: pointer.y - rect.top,
        radius: effective.responseRadius * pulse.scale,
        strength: pulse.strength,
      })
    }

    let trail = null
    const trailStrength = effective.trailStrength
    const trailRetention = appearanceResponseTrailRetention(trailStrength)
    if (!isReduced() && trailRetention > 0) {
      trail = {
        x: pointer.x - rect.left,
        y: pointer.y - rect.top,
        retention: trailRetention,
        now,
        active: pointer.inside,
        reset: trailReset,
      }
      if (pointer.inside) trailReset = false
    }

    try {
      appearancePaintReactive(canvas, {
        mainColor: effective.mainColor,
        backgroundColor: effective.backgroundColor,
        width: cssWidth,
        height: cssHeight,
        dpr,
        cell: effective.pixelSize,
        pixelStyle: effective.pixelStyle,
        pixelRadius: effective.pixelRadius,
        halos,
        trail,
        waves: localWaves,
      })
    } catch (cause) {
      console.error('appearance: response paint failed', cause)
    }
  }

  const activate = () => {
    if (disposed || active) return
    active = true
    startedAt = clock()
    waves = []
    trailReset = true
    bind()
  }

  const deactivate = () => {
    if (!active) return
    active = false
    waves = []
    trailReset = true
    pointer.inside = false
    unbind()
  }

  return {
    activate,
    deactivate,
    onMutations,
    paint,
    isActive: () => active,
    dispose() {
      deactivate()
      disposed = true
    },
  }
}
    return {
      inject: ['slots', 'locale', 'theme', 'configForms'],
      apply,
    }
  },
})
