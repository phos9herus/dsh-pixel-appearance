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
