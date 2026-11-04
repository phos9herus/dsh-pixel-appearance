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
