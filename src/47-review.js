/**
 * 47-review.js — Review (回顾 / Retrospective) theme content engine.
 *
 * The Pixel and Response themes paint a fixed loop or an event-driven field.
 * The Review theme is content-driven: it samples the rendered conversation (or,
 * on a new session screen, the most recent session), scores the sample against
 * four sub-themes, and hands the painter a small plain-JSON guide. The painter
 * turns that guide into one of four exclusive 8 s pixel animations.
 *
 * Public API (see INTERFACE.md):
 *   appearanceReviewCollectCurrent()                     → sample
 *   appearanceReviewReadRecent(sessions, id)             → Promise<sample|null>
 *   appearanceReviewClassify(sample, title, previous)    → { kind, scores }
 *   appearanceReviewBuildGuide({kind, source, title, sample, progress}) → guide
 *   appearanceReviewNeutralGuide()                       → guide
 *   appearancePaintReview(canvas, options)               → void (fills canvas)
 *   appearanceReviewGuideStore                           → plain snapshot store
 *   appearanceReviewUseGuide()                           → React hook
 *   appearanceReviewCreateRuntime({ctx, store, requestPaint}) → runtime
 *
 * The runtime never switches the UI to another session; it only reads a
 * retained session's event window and releases it immediately.
 */

/* -------------------------------------------------------------------------- *
 * Constants
 * -------------------------------------------------------------------------- */

const APPEARANCE_REVIEW_DURATION = 8
const APPEARANCE_REVIEW_TWO_PI = Math.PI * 2
const APPEARANCE_REVIEW_NEUTRAL_SEED = 0x5eed1e
const APPEARANCE_REVIEW_TEXT_CAP = 20000
const APPEARANCE_REVIEW_ROW_TEXT_CAP = 1600
const APPEARANCE_REVIEW_ROW_LIMIT = 100
const APPEARANCE_REVIEW_RECENT_ENTRIES = 120
const APPEARANCE_REVIEW_RECENT_TIMEOUT = 2500
const APPEARANCE_REVIEW_RECOMPUTE_DELAY = 500
const APPEARANCE_REVIEW_SWITCH_MARGIN = 1.2
const APPEARANCE_REVIEW_SWITCH_EPSILON = 0.75
const APPEARANCE_REVIEW_SWITCH_MIN = 2.6
const APPEARANCE_REVIEW_GUIDE_FIELDS = [
  'kind', 'source', 'title', 'ready', 'locked', 'manualKind',
]
const APPEARANCE_REVIEW_ROW_SELECTOR = '[data-conversation-content] [data-chat-anchor-key]'
const APPEARANCE_REVIEW_SESSION_ROW_SELECTOR = '[data-row-key^="session:"][aria-selected="true"]'
const APPEARANCE_REVIEW_RECENT_SOURCE = 'gateway'

const appearanceReviewCache = typeof WeakMap === 'function' ? new WeakMap() : null

/* -------------------------------------------------------------------------- *
 * Sample collection
 * -------------------------------------------------------------------------- */

/** Empty sample shape shared by every scoring path. */
function appearanceReviewEmptySample() {
  return {
    text: '',
    chars: 0,
    codeBlocks: 0,
    toolCalls: 0,
    rows: 0,
    userRows: 0,
    assistantRows: 0,
    questions: 0,
    kinds: {},
  }
}

function appearanceReviewCountOccurrences(text, needle, limit) {
  if (!text || !needle) return 0
  let count = 0
  let index = text.indexOf(needle)
  const cap = limit === undefined ? 1000 : limit
  while (index >= 0 && count < cap) {
    count += 1
    index = text.indexOf(needle, index + needle.length)
  }
  return count
}

function appearanceReviewCountQuestions(text) {
  if (!text) return 0
  let count = 0
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    /* '?' and the full-width '？'. */
    if (code === 63 || code === 65311) count += 1
  }
  return count
}

/**
 * Read the current, rendered Chat flow. Only the latest rows are sampled; the
 * result is a plain JSON sample with no DOM references. Safe when no DOM exists.
 */
function appearanceReviewCollectCurrent() {
  const doc = typeof document !== 'undefined' ? document : null
  const sample = appearanceReviewEmptySample()
  if (!doc) return sample
  let nodes = []
  try {
    nodes = doc.querySelectorAll(APPEARANCE_REVIEW_ROW_SELECTOR)
  } catch (cause) {
    return sample
  }
  const total = nodes && typeof nodes.length === 'number' ? nodes.length : 0
  sample.rows = total
  const start = Math.max(0, total - APPEARANCE_REVIEW_ROW_LIMIT)
  const parts = []
  let collected = 0
  const kinds = {}
  for (let index = start; index < total; index += 1) {
    const row = nodes[index]
    if (!row) continue
    let kind = ''
    try {
      kind = row.getAttribute('data-chat-flow-kind') || ''
    } catch {
      kind = ''
    }
    const kindKey = kind || 'other'
    kinds[kindKey] = (kinds[kindKey] || 0) + 1
    if (kind === 'user') sample.userRows += 1
    else if (kind === 'assistant-step') sample.assistantRows += 1
    else if (kind === 'tool-call') sample.toolCalls += 1
    let text = ''
    try {
      text = (row.innerText || row.textContent || '').slice(0, APPEARANCE_REVIEW_ROW_TEXT_CAP)
    } catch {
      text = ''
    }
    if (text) {
      sample.questions += appearanceReviewCountQuestions(text)
      if (collected < APPEARANCE_REVIEW_TEXT_CAP) {
        const room = APPEARANCE_REVIEW_TEXT_CAP - collected
        const chunk = text.slice(0, room)
        if (chunk) {
          parts.push(chunk)
          collected += chunk.length
        }
      }
    }
    let codeCount = 0
    try {
      codeCount = row.querySelectorAll('pre, code').length
    } catch {
      codeCount = 0
    }
    if (codeCount > 0) sample.codeBlocks = Math.min(80, sample.codeBlocks + codeCount)
  }
  sample.kinds = kinds
  sample.text = parts.join('\n')
  sample.chars = collected
  return sample
}

/** Depth/width-capped string harvest for retained session events. */
function appearanceReviewHarvestStrings(value, state, depth) {
  if (state.chars >= state.limit || depth > 4) return
  if (typeof value === 'string') {
    if (value.length === 0) return
    const capped = value.length > 800 ? value.slice(0, 800) : value
    const room = state.limit - state.chars
    if (room <= 0) return
    const chunk = capped.slice(0, room)
    if (chunk) {
      state.parts.push(chunk)
      state.chars += chunk.length
    }
    return
  }
  if (value === null || value === undefined) return
  if (typeof value !== 'object') return
  if (state.seen.has(value)) return
  state.seen.add(value)
  state.nodes += 1
  if (state.nodes > 4000) return
  if (Array.isArray(value)) {
    const length = Math.min(value.length, 24)
    for (let index = 0; index < length; index += 1) {
      appearanceReviewHarvestStrings(value[index], state, depth + 1)
    }
    return
  }
  let keys = []
  try {
    keys = Object.keys(value)
  } catch {
    keys = []
  }
  const length = Math.min(keys.length, 60)
  for (let index = 0; index < length; index += 1) {
    let child
    try {
      child = value[keys[index]]
    } catch {
      child = undefined
    }
    appearanceReviewHarvestStrings(child, state, depth + 1)
  }
}

/** Resolve one reference's `ready` promise with a hard timeout; never throws. */
function appearanceReviewWaitReady(reference, timeoutMs) {
  return new Promise((resolve) => {
    let settled = false
    let timer = null
    const finish = (value) => {
      if (settled) return
      settled = true
      if (timer !== null) clearTimeout(timer)
      resolve(value || null)
    }
    timer = setTimeout(() => finish(null), Math.max(0, timeoutMs))
    let ready = null
    try {
      ready = reference && reference.ready
    } catch {
      ready = null
    }
    Promise.resolve(ready).then(
      (binding) => finish(binding || null),
      () => finish(null),
    )
  })
}

/**
 * Read the tail of a retained session read-only. The reference is always
 * released; nothing here throws to the caller. Returns null when the session
 * cannot be retained or the read times out, so the runtime can fall back to the
 * session title alone.
 */
async function appearanceReviewReadRecent(sessions, id) {
  if (!sessions || typeof sessions.retain !== 'function') return null
  if (typeof id !== 'string' || id === '') return null
  let reference = null
  try {
    reference = sessions.retain(id, { source: APPEARANCE_REVIEW_RECENT_SOURCE })
  } catch (cause) {
    return null
  }
  if (!reference) return null
  try {
    const binding = await appearanceReviewWaitReady(reference, APPEARANCE_REVIEW_RECENT_TIMEOUT)
    if (!binding) return null
    const eventSource = binding.eventSource
    if (!eventSource || typeof eventSource.getSnapshot !== 'function') return null
    let snapshot = null
    try {
      snapshot = eventSource.getSnapshot()
    } catch {
      return null
    }
    const entries = snapshot && snapshot.entries ? snapshot.entries : []
    const total = entries && typeof entries.length === 'number' ? entries.length : 0
    const start = Math.max(0, total - APPEARANCE_REVIEW_RECENT_ENTRIES)
    const sample = appearanceReviewEmptySample()
    sample.rows = Math.max(0, total - start)
    const kinds = {}
    const state = {
      parts: [],
      chars: 0,
      limit: APPEARANCE_REVIEW_TEXT_CAP,
      seen: new Set(),
      nodes: 0,
    }
    for (let index = start; index < total; index += 1) {
      const entry = entries[index]
      const event = entry && entry.event ? entry.event : null
      if (!event) continue
      const type = typeof event.type === 'string' ? event.type : ''
      if (type) kinds[type] = (kinds[type] || 0) + 1
      if (type === 'user/message') sample.userRows += 1
      else if (type === 'assistant/message') sample.assistantRows += 1
      else if (type === 'tool/call') sample.toolCalls += 1
      if (event.data !== undefined) appearanceReviewHarvestStrings(event.data, state, 0)
    }
    const text = state.parts.join('\n')
    sample.text = text.slice(0, APPEARANCE_REVIEW_TEXT_CAP)
    sample.chars = Math.min(text.length, APPEARANCE_REVIEW_TEXT_CAP)
    sample.kinds = kinds
    sample.codeBlocks = Math.min(40, Math.floor(appearanceReviewCountOccurrences(text, '```') / 2))
    sample.questions = Math.min(200, appearanceReviewCountQuestions(text))
    return sample
  } catch (cause) {
    return null
  } finally {
    try {
      if (reference && typeof reference.release === 'function') reference.release()
    } catch {}
  }
}

/* -------------------------------------------------------------------------- *
 * Scoring and classification
 * -------------------------------------------------------------------------- */

/** Weighted zh + en keyword tables; a word may intentionally appear twice. */
const APPEARANCE_REVIEW_KEYWORDS = {
  code: [
    'code', 'function', 'class', 'const', 'import', 'export', 'compile', 'debug',
    'bug', 'error', 'stack', 'api', 'sql', 'regex', 'refactor', 'typescript',
    'javascript', 'python', 'syntax', 'patch', 'commit', 'build', 'tests',
    '代码', '编译', '调试', '报错', '重构', '接口', '脚本', '程序', '变量',
    '函数', '补丁', '单元测试',
  ],
  investigate: [
    'search', 'find', 'read', 'grep', 'inspect', 'investigate', 'why', 'cause',
    'issue', 'check', 'verify', 'log', 'evidence', 'trace', 'lookup', 'source',
    'root cause', 'diagnose',
    '调查', '排查', '搜索', '查找', '为什么', '原因', '日志', '验证', '检查',
    '定位', '线索', '溯源', '分析',
  ],
  create: [
    'create', 'design', 'build', 'implement', 'write', 'draft', 'compose', 'make',
    'generate', 'add', 'new', 'feature', 'draw', 'paint', 'produce', 'scaffold',
    '创作', '创建', '设计', '实现', '编写', '生成', '制作', '新增', '开发',
    '画', '搭建', '完成',
  ],
  discuss: [
    'discuss', 'talk', 'chat', 'ask', 'question', 'opinion', 'think', 'explain',
    'compare', 'team', 'debate', 'plan', 'idea', 'agree', 'consider', 'suggest',
    '讨论', '聊天', '对话', '问题', '想法', '意见', '解释', '比较', '团队',
    '商量', '计划', '建议',
  ],
}

const APPEARANCE_REVIEW_KEYWORD_WEIGHTS = {
  code: 1,
  investigate: 1.06,
  create: 1.04,
  discuss: 0.9,
}

/** Count non-overlapping occurrences of one keyword, capped per word. */
function appearanceReviewCountWord(text, word) {
  if (!word) return 0
  let count = 0
  let index = text.indexOf(word)
  while (index >= 0 && count < 5) {
    count += 1
    index = text.indexOf(word, index + word.length)
  }
  return count
}

function appearanceReviewScoreText(text, scores, multiplier) {
  if (!text) return
  for (let kindIndex = 0; kindIndex < APPEARANCE_REVIEW_SUBTHEMES.length; kindIndex += 1) {
    const kind = APPEARANCE_REVIEW_SUBTHEMES[kindIndex]
    const words = APPEARANCE_REVIEW_KEYWORDS[kind]
    if (!words) continue
    const weight = (APPEARANCE_REVIEW_KEYWORD_WEIGHTS[kind] || 1) * multiplier
    let hits = 0
    for (let index = 0; index < words.length; index += 1) {
      hits += appearanceReviewCountWord(text, words[index])
    }
    scores[kind] += hits * weight
  }
}

/**
 * Score one sample against the four sub-themes. Keyword density is normalised
 * by sampled volume so the score of a growing conversation stays comparable,
 * and the title always contributes at a higher per-hit weight.
 */
function appearanceReviewScoreSample(sample, title) {
  const scores = { code: 0, investigate: 0, create: 0, discuss: 0 }
  const source = sample && typeof sample === 'object' ? sample : appearanceReviewEmptySample()
  const body = typeof source.text === 'string' ? source.text.toLowerCase() : ''
  const heading = typeof title === 'string' ? title.toLowerCase() : ''
  appearanceReviewScoreText(body, scores, 1)
  appearanceReviewScoreText(heading, scores, 2.4)
  const chars = Math.max(0, EngineNumber(source.chars, body.length))
  const rows = Math.max(1, EngineNumber(source.rows, 0))
  const codeBlocks = Math.max(0, EngineNumber(source.codeBlocks, 0))
  const toolCalls = Math.max(0, EngineNumber(source.toolCalls, 0))
  const userRows = Math.max(0, EngineNumber(source.userRows, 0))
  const assistantRows = Math.max(0, EngineNumber(source.assistantRows, 0))
  const questions = Math.max(0, EngineNumber(source.questions, 0))
  scores.code += codeBlocks * 2.4 + toolCalls * 0.3
  scores.investigate += toolCalls * 1.1 + questions * 0.8
  scores.create += codeBlocks * 0.25 + toolCalls * 0.4
    + Math.min(1.8, assistantRows * 0.1)
  scores.discuss += (userRows + assistantRows) * 0.3 + questions * 0.3
  if (codeBlocks === 0 && toolCalls === 0) scores.discuss += 2
  if (toolCalls === 0 && rows > 2) scores.investigate += 0.4
  const volume = 1 + Math.log10(1 + chars / 1500)
  scores.code /= volume
  scores.investigate /= volume
  scores.create /= volume
  scores.discuss /= volume
  return scores
}

/**
 * Pick a sub-theme with a margin + hysteresis rule. A new kind only wins when
 * its score clearly exceeds the previous kind's score (and clears a minimum),
 * so ordinary mutations never flip the animation. Ties prefer the previous
 * kind, then Discussion; empty content starts with Discussion.
 */
function appearanceReviewClassify(sample, title, previousKind) {
  const scores = appearanceReviewScoreSample(sample, title)
  let previous = APPEARANCE_REVIEW_SUBTHEMES.indexOf(previousKind) >= 0
    ? previousKind
    : ''
  if (previous === '') {
    let best = 'discuss'
    let bestScore = scores.discuss
    for (let index = 0; index < APPEARANCE_REVIEW_SUBTHEMES.length; index += 1) {
      const kind = APPEARANCE_REVIEW_SUBTHEMES[index]
      if (scores[kind] > bestScore + 0.001) {
        best = kind
        bestScore = scores[kind]
      }
    }
    return { kind: bestScore >= APPEARANCE_REVIEW_SWITCH_MIN ? best : 'discuss', scores }
  }
  let challenger = ''
  let challengerScore = -Infinity
  for (let index = 0; index < APPEARANCE_REVIEW_SUBTHEMES.length; index += 1) {
    const kind = APPEARANCE_REVIEW_SUBTHEMES[index]
    if (kind === previous) continue
    if (scores[kind] > challengerScore) {
      challenger = kind
      challengerScore = scores[kind]
    }
  }
  const currentScore = scores[previous]
  if (challenger
    && challengerScore >= APPEARANCE_REVIEW_SWITCH_MIN
    && challengerScore > currentScore * APPEARANCE_REVIEW_SWITCH_MARGIN
      + APPEARANCE_REVIEW_SWITCH_EPSILON) {
    return { kind: challenger, scores }
  }
  return { kind: previous, scores }
}

/* -------------------------------------------------------------------------- *
 * Guide building
 * -------------------------------------------------------------------------- */

/** FNV-1a 32-bit hash; stable for the same sample text and title. */
function appearanceReviewHashSeed(text) {
  let hash = 2166136261
  const value = String(text || '')
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Deterministic 0..1 pseudo-random value for seeded layouts. */
function appearanceReviewRandom(seed, salt) {
  let value = (seed >>> 0) ^ Math.imul((salt + 1) | 0, 0x9e3779b9)
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad)
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97)
  value = (value ^ (value >>> 15)) >>> 0
  return value / 4294967296
}

function appearanceReviewNormalizeKind(value) {
  return APPEARANCE_REVIEW_SUBTHEMES.indexOf(value) >= 0 ? value : 'discuss'
}

/** Build the stable, plain-JSON guide the painter consumes. */
function appearanceReviewBuildGuide(input) {
  const options = input && typeof input === 'object' ? input : {}
  const sample = options.sample && typeof options.sample === 'object'
    ? options.sample
    : appearanceReviewEmptySample()
  const kind = appearanceReviewNormalizeKind(options.kind)
  const source = options.source === 'recent' ? 'recent' : 'current'
  const title = typeof options.title === 'string' ? options.title.slice(0, 240) : ''
  const text = typeof sample.text === 'string' ? sample.text : ''
  const chars = Math.max(0, EngineNumber(sample.chars, text.length))
  const rows = Math.max(0, EngineNumber(sample.rows, 0))
  const toolCalls = Math.max(0, EngineNumber(sample.toolCalls, 0))
  const codeBlocks = Math.max(0, EngineNumber(sample.codeBlocks, 0))
  let progress = EngineNumber(options.progress, NaN)
  if (!Number.isFinite(progress)) {
    progress = source === 'current' ? Math.min(1, rows / 40) : 0
  }
  progress = appearanceClamp(progress, 0, 1)
  let energy = Math.log10(1 + chars / 900) / 1.6
  energy += Math.min(0.35, rows * 0.012)
  energy += Math.min(0.2, toolCalls * 0.012)
  const densitySignals = codeBlocks * 1.8 + toolCalls * 1.2
  const density = appearanceClamp(
    (densitySignals / (rows + 2)) * 1.4 + (codeBlocks > 0 ? 0.12 : 0),
    0,
    1,
  )
  /* Hash a stable prefix (the oldest sampled text) rather than the streaming
   * tail, so live token appends do not rebuild the animation layout. */
  const seed = appearanceReviewHashSeed(
    kind + '\u0000' + title + '\u0000' + text.slice(0, 1200),
  ) || APPEARANCE_REVIEW_NEUTRAL_SEED
  return {
    kind,
    source,
    title,
    seed,
    energy: appearanceClamp(energy, 0, 1),
    density: appearanceClamp(density, 0, 1),
    progress,
    at: Date.now(),
  }
}

/** Neutral guide used before detection completes and when nothing is recallable. */
function appearanceReviewNeutralGuide() {
  return {
    kind: 'discuss',
    source: 'current',
    title: '',
    seed: APPEARANCE_REVIEW_NEUTRAL_SEED,
    energy: 0.34,
    density: 0.22,
    progress: 0,
    at: Date.now(),
  }
}

/** Fill in a missing/malformed guide so the painter can never crash on it. */
function appearanceReviewNormalizeGuide(guide) {
  const source = guide && typeof guide === 'object' ? guide : {}
  return {
    kind: appearanceReviewNormalizeKind(source.kind),
    source: source.source === 'recent' ? 'recent' : 'current',
    title: typeof source.title === 'string' ? source.title.slice(0, 240) : '',
    seed: Number.isFinite(source.seed) ? (source.seed >>> 0) : APPEARANCE_REVIEW_NEUTRAL_SEED,
    energy: appearanceClamp(EngineNumber(source.energy, 0.34), 0, 1),
    density: appearanceClamp(EngineNumber(source.density, 0.22), 0, 1),
    progress: appearanceClamp(EngineNumber(source.progress, 0), 0, 1),
    at: EngineNumber(source.at, 0),
  }
}

/** Signature for the painter cache: layout-affecting guide fields only. */
function appearanceReviewGuideKey(guide) {
  return guide.seed + ':'
    + Math.round(guide.energy * 1000) + ':'
    + Math.round(guide.density * 1000) + ':'
    + Math.round(guide.progress * 1000)
}

/* -------------------------------------------------------------------------- *
 * Guide snapshot store and React hook
 * -------------------------------------------------------------------------- */

function appearanceReviewCreateGuideStore() {
  let snapshot = {
    kind: 'discuss',
    source: 'current',
    title: '',
    ready: false,
    locked: false,
    manualKind: 'auto',
  }
  const listeners = new Set()
  return {
    getSnapshot() {
      return snapshot
    },
    subscribe(listener) {
      if (typeof listener !== 'function') return () => {}
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    set(patch) {
      if (!patch || typeof patch !== 'object') return
      const next = { ...snapshot }
      let changed = false
      for (let index = 0; index < APPEARANCE_REVIEW_GUIDE_FIELDS.length; index += 1) {
        const key = APPEARANCE_REVIEW_GUIDE_FIELDS[index]
        if (Object.prototype.hasOwnProperty.call(patch, key) && patch[key] !== next[key]) {
          next[key] = patch[key]
          changed = true
        }
      }
      if (!changed) return
      snapshot = next
      for (const listener of [...listeners]) {
        try {
          listener(snapshot)
        } catch (cause) {
          console.error('appearance: review guide listener failed', cause)
        }
      }
    },
  }
}

const appearanceReviewGuideStore = appearanceReviewCreateGuideStore()

/** Subscribe the settings page to the latest guide snapshot. */
function appearanceReviewUseGuide() {
  const [snapshot, setSnapshot] = React.useState(() => appearanceReviewGuideStore.getSnapshot())
  React.useEffect(() => {
    setSnapshot(appearanceReviewGuideStore.getSnapshot())
    const off = appearanceReviewGuideStore.subscribe((next) => setSnapshot(next))
    return () => {
      if (typeof off === 'function') off()
    }
  }, [])
  return snapshot
}

/* -------------------------------------------------------------------------- *
 * Painter helpers
 * -------------------------------------------------------------------------- */

/**
 * Canvas pixel size vs CSS pixel size. The live scene canvas is device-pixel
 * sized (ratio ~ devicePixelRatio) while the settings preview canvas is 1:1, so
 * callers can always pass the CSS pixel block size.
 */
function appearanceReviewCanvasScale(canvas) {
  try {
    if (typeof canvas.getBoundingClientRect !== 'function') return 1
    const rect = canvas.getBoundingClientRect()
    if (!rect || !(rect.width > 0)) return 1
    return appearanceClamp(canvas.width / rect.width, 1, 4)
  } catch {
    return 1
  }
}

function appearanceReviewZeroCoverage(spec) {
  if (!spec.cov || spec.cov.length !== spec.cols * spec.rows) {
    spec.cov = new Float32Array(spec.cols * spec.rows)
  } else {
    spec.cov.fill(0)
  }
}

function appearanceReviewFinalizeCoverage(spec) {
  const cov = spec.cov
  for (let index = 0; index < cov.length; index += 1) {
    const value = cov[index]
    cov[index] = value !== value ? 0 : (value < 0 ? 0 : (value > 1 ? 1 : value))
  }
}

/** Add a soft capsule between two points (height-unit coordinates). */
function appearanceReviewStampSegment(spec, x0, y0, x1, y1, thickness, value) {
  const rows = spec.rows
  const cols = spec.cols
  const nx = spec.nx
  const ny = spec.ny
  const cov = spec.cov
  const minX = Math.min(x0, x1) - thickness
  const maxX = Math.max(x0, x1) + thickness
  const minY = Math.min(y0, y1) - thickness
  const maxY = Math.max(y0, y1) + thickness
  const colStart = Math.max(0, Math.floor(minX * rows) - 1)
  const colEnd = Math.min(cols - 1, Math.ceil(maxX * rows) + 1)
  const rowStart = Math.max(0, Math.floor(minY * rows) - 1)
  const rowEnd = Math.min(rows - 1, Math.ceil(maxY * rows) + 1)
  const dx = x1 - x0
  const dy = y1 - y0
  const lengthSquared = dx * dx + dy * dy
  const invThickness = thickness > 0 ? 1 / thickness : 0
  for (let row = rowStart; row <= rowEnd; row += 1) {
    const py = ny[row]
    const base = row * cols
    for (let col = colStart; col <= colEnd; col += 1) {
      const px = nx[col]
      let t = lengthSquared > 0 ? ((px - x0) * dx + (py - y0) * dy) / lengthSquared : 0
      if (t < 0) t = 0
      else if (t > 1) t = 1
      const qx = x0 + dx * t - px
      const qy = y0 + dy * t - py
      const distance = Math.sqrt(qx * qx + qy * qy)
      const k = 1 - distance * invThickness
      if (k > 0) cov[base + col] += value * k * k
    }
  }
}

/** Add a soft ring centred at a point (height-unit coordinates). */
function appearanceReviewStampRing(spec, cx, cy, radius, width, value) {
  if (!(width > 0) || !(value > 0)) return
  const rows = spec.rows
  const cols = spec.cols
  const nx = spec.nx
  const ny = spec.ny
  const cov = spec.cov
  const outer = radius + width
  const colStart = Math.max(0, Math.floor((cx - outer) * rows) - 1)
  const colEnd = Math.min(cols - 1, Math.ceil((cx + outer) * rows) + 1)
  const rowStart = Math.max(0, Math.floor((cy - outer) * rows) - 1)
  const rowEnd = Math.min(rows - 1, Math.ceil((cy + outer) * rows) + 1)
  const invWidth = 1 / width
  for (let row = rowStart; row <= rowEnd; row += 1) {
    const py = ny[row]
    const base = row * cols
    for (let col = colStart; col <= colEnd; col += 1) {
      const px = nx[col]
      const dx = px - cx
      const dy = py - cy
      const distance = Math.sqrt(dx * dx + dy * dy)
      const k = 1 - Math.abs(distance - radius) * invWidth
      if (k > 0) cov[base + col] += value * k * k
    }
  }
}

/** Add a soft dot centred at a point (height-unit coordinates). */
function appearanceReviewStampDot(spec, cx, cy, radius, value) {
  if (!(radius > 0) || !(value > 0)) return
  const rows = spec.rows
  const cols = spec.cols
  const nx = spec.nx
  const ny = spec.ny
  const cov = spec.cov
  const colStart = Math.max(0, Math.floor((cx - radius) * rows) - 1)
  const colEnd = Math.min(cols - 1, Math.ceil((cx + radius) * rows) + 1)
  const rowStart = Math.max(0, Math.floor((cy - radius) * rows) - 1)
  const rowEnd = Math.min(rows - 1, Math.ceil((cy + radius) * rows) + 1)
  const invRadius = 1 / radius
  for (let row = rowStart; row <= rowEnd; row += 1) {
    const py = ny[row]
    const base = row * cols
    for (let col = colStart; col <= colEnd; col += 1) {
      const px = nx[col]
      const dx = px - cx
      const dy = py - cy
      const k = 1 - Math.sqrt(dx * dx + dy * dy) * invRadius
      if (k > 0) cov[base + col] += value * k * k
    }
  }
}

/** Fill one flat mosaic block (height-unit coordinates). */
function appearanceReviewStampBlock(spec, cx, cy, halfWidth, halfHeight, value) {
  if (!(halfWidth > 0) || !(halfHeight > 0) || !(value > 0)) return
  const rows = spec.rows
  const cols = spec.cols
  const nx = spec.nx
  const ny = spec.ny
  const cov = spec.cov
  const colStart = Math.max(0, Math.floor((cx - halfWidth) * rows) - 1)
  const colEnd = Math.min(cols - 1, Math.ceil((cx + halfWidth) * rows) + 1)
  const rowStart = Math.max(0, Math.floor((cy - halfHeight) * rows) - 1)
  const rowEnd = Math.min(rows - 1, Math.ceil((cy + halfHeight) * rows) + 1)
  for (let row = rowStart; row <= rowEnd; row += 1) {
    const py = ny[row]
    const base = row * cols
    for (let col = colStart; col <= colEnd; col += 1) {
      const px = nx[col]
      if (px >= cx - halfWidth && px <= cx + halfWidth
        && py >= cy - halfHeight && py <= cy + halfHeight) {
        cov[base + col] += value
      }
    }
  }
}

/* -------------------------------------------------------------------------- *
 * Spec builders — static layout per animation, seeded from the guide
 * -------------------------------------------------------------------------- */

function appearanceReviewCreateCodeSpec(spec, guide) {
  const seed = guide.seed
  const rows = spec.rows
  const aspect = spec.aspect
  const maxLines = Math.max(4, Math.floor(rows / 2.4))
  const lineCount = Math.max(4, Math.min(maxLines, 8 + Math.round(guide.density * 8)))
  const lines = []
  for (let index = 0; index < lineCount; index += 1) {
    const indentLevel = Math.min(3, Math.floor(
      appearanceReviewRandom(seed, index * 7 + 1) * 4,
    ))
    const indent = Math.min(
      aspect * 0.4,
      0.02 + indentLevel * 0.035 + appearanceReviewRandom(seed, index * 7 + 2) * 0.02,
    )
    const maxLength = Math.max(0.08, aspect - indent - 0.08)
    const length = maxLength * (0.28 + appearanceReviewRandom(seed, index * 7 + 3) * 0.62)
    const tokenCount = 2 + Math.floor(appearanceReviewRandom(seed, index * 7 + 4) * 4)
    const tokens = []
    let cursor = indent
    for (let tokenIndex = 0; tokenIndex < tokenCount; tokenIndex += 1) {
      const salt = index * 61 + tokenIndex * 5 + 11
      const tokenLength = (length / tokenCount)
        * (0.45 + appearanceReviewRandom(seed, salt) * 1.1)
      const end = Math.min(indent + length, cursor + tokenLength)
      if (end > cursor + 0.008) tokens.push({ start: cursor, end })
      cursor = end + 0.008 + appearanceReviewRandom(seed, salt + 1) * 0.022
      if (cursor >= indent + length) break
    }
    if (tokens.length === 0) tokens.push({ start: indent, end: indent + length * 0.5 })
    lines.push({
      tokens,
      weight: 0.55 + appearanceReviewRandom(seed, index * 7 + 5) * 0.4,
      indent,
    })
  }
  const guides = []
  for (let level = 0; level < 4; level += 1) guides.push(0.025 + level * 0.04)
  return { lines, guides, lineGap: 1 / lineCount, lineCount, guide }
}

function appearanceReviewCreateInvestigateSpec(spec, guide) {
  const seed = guide.seed
  const cols = spec.cols
  const rows = spec.rows
  const aspect = spec.aspect
  const nx = spec.nx
  const ny = spec.ny
  const cx = aspect * (0.3 + appearanceReviewRandom(seed, 1) * 0.4)
  const cy = 0.3 + appearanceReviewRandom(seed, 2) * 0.4
  const maxR = Math.sqrt((aspect * 0.55) * (aspect * 0.55) + 0.55 * 0.55)
  const dist = new Float32Array(cols * rows)
  const ang = new Float32Array(cols * rows)
  let index = 0
  for (let row = 0; row < rows; row += 1) {
    const dy = ny[row] - cy
    for (let col = 0; col < cols; col += 1, index += 1) {
      const dx = nx[col] - cx
      const distance = Math.sqrt(dx * dx + dy * dy)
      dist[index] = Math.min(1, distance / maxR)
      ang[index] = EngineFrac(Math.atan2(dy, dx) / APPEARANCE_REVIEW_TWO_PI + 1)
    }
  }
  const spots = []
  const spotCount = Math.min(
    20,
    6 + Math.round(guide.density * 10 + guide.energy * 4),
  )
  for (let spot = 0; spot < spotCount; spot += 1) {
    const salt = spot * 7 + 40
    const angle = appearanceReviewRandom(seed, salt)
    const radius = 0.16 + appearanceReviewRandom(seed, salt + 1) * 0.72
    const x = cx + Math.cos(angle * APPEARANCE_REVIEW_TWO_PI) * radius * maxR
    const y = cy + Math.sin(angle * APPEARANCE_REVIEW_TWO_PI) * radius * maxR
    spots.push({
      angle: angle,
      dist: radius,
      weight: 0.45 + appearanceReviewRandom(seed, salt + 2) * 0.55,
      x,
      y,
    })
  }
  const rings = [
    {
      cycles: 1,
      offset: appearanceReviewRandom(seed, 3),
      width: 0.035,
      weight: 0.55,
    },
    {
      cycles: 2,
      offset: appearanceReviewRandom(seed, 4),
      width: 0.026,
      weight: 0.4,
    },
  ]
  return {
    dist,
    ang,
    spots,
    rings,
    phase: appearanceReviewRandom(seed, 5),
    beamWidth: 0.05 + (1 - guide.density) * 0.035,
    glow: 0.1 + guide.energy * 0.12,
    guide,
  }
}

/** Smooth 0→1 ramp used by the writing and fade envelopes. */
function appearanceReviewSmoothstep(edge0, edge1, value) {
  if (!(edge1 > edge0)) return value >= edge1 ? 1 : 0
  const t = appearanceClamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Build one abstract poem character inside a slot: a few short horizontal ink
 * strokes plus an occasional calligraphic tick, so a line of slots reads as
 * handwritten text at pixel resolution.
 */
function appearanceReviewCreatePoemStrokes(lineY, slot, charH, rows, seed, salt) {
  const strokes = []
  const baseWidth = Math.max(1.15 / rows, charH * 0.14)
  const count = 2 + Math.floor(appearanceReviewRandom(seed, salt) * 3)
  for (let index = 0; index < count; index += 1) {
    const branch = index * 3
    const offset = (appearanceReviewRandom(seed, salt + branch + 1) - 0.5) * charH * 0.9
    const length = slot.w * (0.35 + appearanceReviewRandom(seed, salt + branch + 2) * 0.6)
    const start = slot.x + appearanceReviewRandom(seed, salt + branch + 3) * (slot.w - length)
    strokes.push({
      x0: start,
      y0: lineY + offset,
      x1: start + length,
      y1: lineY + offset,
      width: baseWidth * (0.8 + appearanceReviewRandom(seed, salt + branch + 4) * 0.5),
      value: 0.5 + appearanceReviewRandom(seed, salt + branch + 5) * 0.45,
    })
  }
  /* Occasional vertical/diagonal accent, the way a poem character carries a
   * long stroke down the paper. */
  if (appearanceReviewRandom(seed, salt + 17) > 0.58) {
    const x = slot.x + slot.w * (0.3 + appearanceReviewRandom(seed, salt + 18) * 0.4)
    const top = lineY - charH * (0.24 + appearanceReviewRandom(seed, salt + 19) * 0.18)
    strokes.push({
      x0: x,
      y0: top,
      x1: x + slot.w * 0.1,
      y1: lineY + charH * 0.3,
      width: baseWidth * 0.9,
      value: 0.62,
    })
  }
  return strokes
}

/**
 * Stamp one artistic fountain pen whose nib tip sits at (tipX, tipY) and whose
 * body extends along `angle` (screen radians; negative = up-right). The shape
 * has a split nib, a grip section, a tapered body with a highlight, a cap
 * band, a pocket clip, a finial and a wet ink bead at the tip.
 */
function appearanceReviewStampPen(spec, tipX, tipY, angle, penLength, alpha) {
  if (!(alpha > 0.001) || !(penLength > 0)) return
  const rows = spec.rows
  const dirX = Math.cos(angle)
  const dirY = Math.sin(angle)
  const perpX = -dirY
  const perpY = dirX
  const body = Math.max(2.2 / rows, penLength * 0.18)
  const nibWidth = Math.max(1 / rows, penLength * 0.06)
  const at = (along, side) => ({
    x: tipX + dirX * penLength * along + perpX * (side || 0),
    y: tipY + dirY * penLength * along + perpY * (side || 0),
  })
  const nibEnd = at(0.26)
  /* Split nib: two tapering side rails leave a thin breather opening. */
  for (let side = -1; side <= 1; side += 2) {
    const root = at(0.25, body * 0.26 * side)
    const point = { x: tipX + perpX * nibWidth * 0.3 * side, y: tipY + perpY * nibWidth * 0.3 * side }
    appearanceReviewStampSegment(
      spec, point.x, point.y, root.x, root.y, nibWidth, 0.92 * alpha,
    )
  }
  /* Nib shoulder widening into the grip section. */
  appearanceReviewStampSegment(
    spec, nibEnd.x, nibEnd.y, at(0.33).x, at(0.33).y, body * 0.6, 0.9 * alpha,
  )
  /* Grip section */
  appearanceReviewStampSegment(
    spec, at(0.33, 0).x, at(0.33, 0).y, at(0.44).x, at(0.44).y, body * 0.74, 0.95 * alpha,
  )
  /* Tapered body */
  appearanceReviewStampSegment(
    spec, at(0.44).x, at(0.44).y, at(0.94).x, at(0.94).y, body * 0.92, 0.78 * alpha,
  )
  /* Body highlight along one side */
  appearanceReviewStampSegment(
    spec, at(0.5, body * 0.42).x, at(0.5, body * 0.42).y,
    at(0.9, body * 0.42).x, at(0.9, body * 0.42).y,
    body * 0.3, 0.42 * alpha,
  )
  /* Cap band across the barrel */
  appearanceReviewStampSegment(
    spec, at(0.62, -body * 1.02).x, at(0.62, -body * 1.02).y,
    at(0.62, body * 1.02).x, at(0.62, body * 1.02).y,
    body * 0.3, 0.98 * alpha,
  )
  /* Pocket clip on the far side */
  appearanceReviewStampSegment(
    spec, at(0.66, -body * 0.8).x, at(0.66, -body * 0.8).y,
    at(0.9, -body * 0.8).x, at(0.9, -body * 0.8).y,
    body * 0.26, 0.9 * alpha,
  )
  /* Finial and wet nib bead */
  const finial = at(0.96)
  appearanceReviewStampDot(spec, finial.x, finial.y, body * 1.1, 0.82 * alpha)
  appearanceReviewStampDot(
    spec, tipX, tipY, Math.max(0.9 / rows, penLength * 0.028), 0.5 * alpha,
  )
}

function appearanceReviewCreatePenPose(data, u) {
  const writeProgress = appearanceClamp(
    (u - data.writeStart) / (data.writeEnd - data.writeStart),
    0,
    1,
  )
  const position = writeProgress * data.totalWeight
  let pose = null
  for (let index = 0; index < data.segments.length; index += 1) {
    const segment = data.segments[index]
    const last = index === data.segments.length - 1
    if (!last && position >= segment.start + segment.weight) continue
    const local = appearanceClamp((position - segment.start) / segment.weight, 0, 1)
    if (segment.kind === 'write') {
      const slots = segment.slots
      const scaled = local * slots.length
      const slotIndex = Math.min(slots.length - 1, Math.max(0, Math.floor(scaled)))
      const fraction = scaled - slotIndex
      const slot = slots[slotIndex]
      pose = {
        x: slot.x + slot.w * fraction,
        y: segment.y,
        angle: -0.58,
        lift: 0,
      }
    } else {
      const t = local
      pose = {
        x: segment.fromX + (segment.toX - segment.fromX) * t,
        y: segment.fromY + (segment.toY - segment.fromY) * t
          - Math.sin(Math.PI * t) * data.spacing * 0.55,
        angle: -0.94 + 0.36 * t,
        lift: Math.sin(Math.PI * t),
      }
    }
    break
  }
  if (writeProgress >= 1) {
    const lastLine = data.lines[data.lines.length - 1]
    pose = { x: lastLine.endX, y: lastLine.y, angle: -0.58, lift: 0 }
  }
  return { pose, position, writeProgress }
}

function appearanceReviewCreateCreateSpec(spec, guide) {
  const seed = guide.seed
  const rows = spec.rows
  const aspect = spec.aspect
  const lineCount = Math.max(
    3,
    Math.min(5, 3 + Math.round(guide.energy * 1.8 + guide.density * 1.4)),
  )
  const marginX = Math.min(0.12, aspect * 0.07)
  const rightMargin = Math.min(0.1, aspect * 0.055)
  const top = 0.16
  const bottom = 0.84
  const spacing = (bottom - top) / lineCount
  const charH = Math.max(2.6 / rows, Math.min(spacing * 0.5, 0.055))
  const lines = []
  const segments = []
  let weight = 0
  for (let index = 0; index < lineCount; index += 1) {
    const y = top + spacing * (index + 0.5)
      + (appearanceReviewRandom(seed, index * 31 + 1) - 0.5) * spacing * 0.08
    const indent = marginX
      + appearanceReviewRandom(seed, index * 31 + 2) * Math.min(0.06, aspect * 0.035)
    const maxWidth = Math.max(0.12, aspect - indent - rightMargin)
    const lineWidth = maxWidth * (0.5 + appearanceReviewRandom(seed, index * 31 + 3) * 0.42)
    const charWidth = Math.max(
      2.2 / rows,
      charH * (0.55 + appearanceReviewRandom(seed, index * 31 + 4) * 0.25),
    )
    const charGap = Math.max(1.2 / rows, charWidth * 0.42)
    const slots = []
    let cursor = indent
    while (slots.length < 14 && cursor + charWidth <= indent + lineWidth) {
      const salt = index * 53 + slots.length * 7 + 11
      const width = charWidth * (0.75 + appearanceReviewRandom(seed, salt) * 0.5)
      if (cursor + width > indent + lineWidth) break
      const slot = { x: cursor, w: width }
      slot.strokes = appearanceReviewCreatePoemStrokes(y, slot, charH, rows, seed, salt)
      slots.push(slot)
      cursor += width + charGap * (0.75 + appearanceReviewRandom(seed, salt + 1) * 0.5)
    }
    if (slots.length === 0) {
      const slot = { x: indent, w: Math.max(charWidth, 0.02) }
      slot.strokes = appearanceReviewCreatePoemStrokes(y, slot, charH, rows, seed, index * 53 + 11)
      slots.push(slot)
    }
    /* A small ink full stop closes a line, like the last character of a poem. */
    if (appearanceReviewRandom(seed, index * 31 + 5) > 0.3) {
      const last = slots[slots.length - 1]
      const dotX = last.x + last.w + charGap * 1.3
      const dotWidth = Math.max(1.1 / rows, charH * 0.24)
      slots.push({
        x: dotX,
        w: dotWidth,
        strokes: [{
          x0: dotX,
          y0: y,
          x1: dotX + dotWidth,
          y1: y,
          width: Math.max(1.1 / rows, charH * 0.16),
          value: 0.9,
        }],
        punctuation: true,
      })
    }
    if (lines.length > 0) {
      const previous = lines[lines.length - 1]
      segments.push({
        kind: 'travel',
        start: weight,
        weight: 2.6,
        fromX: previous.endX,
        fromY: previous.y,
        toX: slots[0].x,
        toY: y,
      })
      weight += 2.6
    }
    const lineStartWeight = weight
    for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
      slots[slotIndex].startWeight = lineStartWeight + slotIndex
    }
    segments.push({ kind: 'write', start: lineStartWeight, weight: slots.length, slots, y })
    weight += slots.length
    const lastSlot = slots[slots.length - 1]
    lines.push({
      y,
      slots,
      startX: slots[0].x,
      endX: lastSlot.x + lastSlot.w,
    })
  }
  return {
    lines,
    segments,
    totalWeight: weight,
    writeStart: 0.055,
    writeEnd: 0.78,
    charH,
    spacing,
    penLength: Math.max(5 / rows, Math.min(spacing * 1.2, charH * 5.5)),
    phase: appearanceReviewRandom(seed, 777) * APPEARANCE_REVIEW_TWO_PI,
    guide,
  }
}

function appearanceReviewCreateDiscussSpec(spec, guide) {
  const seed = guide.seed
  const aspect = spec.aspect
  const dots = []
  const dotCount = Math.max(
    2,
    Math.min(9, 3 + Math.round(guide.density * 4 + guide.energy * 2)),
  )
  for (let dot = 0; dot < dotCount; dot += 1) {
    const salt = dot * 9 + 300
    const direction = appearanceReviewRandom(seed, salt) < 0.5 ? 1 : -1
    dots.push({
      phaseOffset: appearanceReviewRandom(seed, salt + 1),
      direction,
      cycles: 1 + Math.floor(appearanceReviewRandom(seed, salt + 2) * 2),
      yBase: 0.32 + appearanceReviewRandom(seed, salt + 3) * 0.36,
      wobble: 1 + Math.floor(appearanceReviewRandom(seed, salt + 4) * 2),
      wobblePhase: appearanceReviewRandom(seed, salt + 5) * APPEARANCE_REVIEW_TWO_PI,
      weight: 0.5 + appearanceReviewRandom(seed, salt + 6) * 0.5,
    })
  }
  return {
    aspect,
    freq1: 6 + Math.round(guide.density * 5),
    freq2: 9 + Math.round(guide.energy * 6),
    cycles1: 1,
    cycles2: 2,
    phase1: appearanceReviewRandom(seed, 6) * APPEARANCE_REVIEW_TWO_PI,
    phase2: appearanceReviewRandom(seed, 7) * APPEARANCE_REVIEW_TWO_PI,
    pulseOffset: appearanceReviewRandom(seed, 8),
    pulsePhase: appearanceReviewRandom(seed, 9) * APPEARANCE_REVIEW_TWO_PI,
    dots,
    guide,
  }
}

/** Static grid/spec used for one canvas + animation + guide signature. */
function appearanceReviewCreateSpec(animation, cols, rows, guide) {
  const nx = new Float32Array(cols)
  const ny = new Float32Array(rows)
  for (let col = 0; col < cols; col += 1) nx[col] = (col + 0.5) / rows
  for (let row = 0; row < rows; row += 1) ny[row] = (row + 0.5) / rows
  const spec = {
    animation,
    cols,
    rows,
    aspect: cols / rows,
    nx,
    ny,
    cov: new Float32Array(cols * rows),
    levels: null,
    data: null,
  }
  if (animation === 'code') spec.data = appearanceReviewCreateCodeSpec(spec, guide)
  else if (animation === 'investigate') {
    spec.data = appearanceReviewCreateInvestigateSpec(spec, guide)
  } else if (animation === 'create') {
    spec.data = appearanceReviewCreateCreateSpec(spec, guide)
  } else {
    spec.data = appearanceReviewCreateDiscussSpec(spec, guide)
  }
  return spec
}

/* -------------------------------------------------------------------------- *
 * Coverage per animation. Every time term is an integer harmonic of
 * theta = 2π·frac(time / 8); guide-derived phases stay constant per sample.
 * -------------------------------------------------------------------------- */

function appearanceReviewCoverageCode(spec, u) {
  appearanceReviewZeroCoverage(spec)
  const data = spec.data
  const guide = data.guide
  const lines = data.lines
  const guides = data.guides
  const lineGap = data.lineGap
  const lineCount = data.lineCount
  const aspect = spec.aspect
  const cols = spec.cols
  const rows = spec.rows
  const nx = spec.nx
  const ny = spec.ny
  const cov = spec.cov
  const theta = APPEARANCE_REVIEW_TWO_PI * u
  const progress = guide.progress
  const energy = guide.energy
  const cursorX = aspect * (0.06 + 0.82 * progress)
  const cursorY = EngineFrac(0.12 + 0.76 * progress - 2 * u)
  const scanY = EngineFrac(0.18 + 0.68 * progress - 2 * u + 0.25)
  const cursorBlink = 0.55 + 0.45 * EngineSinAt(theta * 4 + 0.7)
  const scanPulse = 0.55 + 0.45 * EngineSinAt(theta * 2 + 1.3)
  for (let row = 0; row < rows; row += 1) {
    const y = ny[row]
    const wrapped = EngineFrac(y - 2 * u + progress * 0.35)
    const lineIndex = Math.min(lineCount - 1, Math.floor(wrapped / lineGap))
    const line = lines[lineIndex]
    const band = (wrapped - lineIndex * lineGap) / lineGap
    const inBand = band >= 0.16 && band <= 0.58
    const base = row * cols
    for (let col = 0; col < cols; col += 1) {
      let value = 0
      const x = nx[col]
      if (inBand) {
        for (let token = 0; token < line.tokens.length; token += 1) {
          const item = line.tokens[token]
          if (x >= item.start && x < item.end) {
            value = line.weight
            break
          }
        }
      }
      for (let level = 0; level < guides.length; level += 1) {
        if (Math.abs(x - guides[level]) < 0.006) {
          const guideValue = 0.14 * (0.55 + 0.45 * EngineSinAt(theta * 2 + level))
          if (guideValue > value) value = guideValue
        }
      }
      if (Math.abs(x - cursorX) < 0.028 && Math.abs(y - cursorY) < lineGap * 0.45) {
        value = 0.55 + 0.45 * cursorBlink
      }
      if (Math.abs(y - scanY) < 0.012) {
        const scanValue = 0.3 * scanPulse
        if (scanValue > value) value = scanValue
      }
      cov[base + col] = value * (0.72 + 0.3 * energy)
    }
  }
  appearanceReviewFinalizeCoverage(spec)
}

function appearanceReviewCoverageInvestigate(spec, u) {
  appearanceReviewZeroCoverage(spec)
  const data = spec.data
  const guide = data.guide
  const cols = spec.cols
  const rows = spec.rows
  const cov = spec.cov
  const dist = data.dist
  const ang = data.ang
  const theta = APPEARANCE_REVIEW_TWO_PI * u
  const beamAngle = EngineFrac(u + data.phase)
  const beamWidth = data.beamWidth
  const rings = data.rings
  const energy = guide.energy
  for (let index = 0; index < cov.length; index += 1) {
    const d = dist[index]
    let delta = ang[index] - beamAngle
    delta -= Math.round(delta)
    let value = 0
    const beamDelta = Math.abs(delta)
    if (beamDelta < beamWidth) {
      const k = 1 - beamDelta / beamWidth
      const radial = (1 - d * 0.8) * (0.25 + 0.75 / (1 + 2.4 * d))
      value = k * k * k * radial * (0.85 + 0.15 * energy)
    }
    for (let ring = 0; ring < rings.length; ring += 1) {
      const item = rings[ring]
      const radius = EngineFrac(u * item.cycles + item.offset)
      const band = 1 - Math.abs(d - radius) / item.width
      if (band > 0) {
        value += band * band * item.weight * (1 - d * 0.7) * (0.35 + 0.65 * energy)
      }
    }
    value += data.glow / (1 + 220 * d * d) * (0.6 + 0.4 * EngineSinAt(theta * 2))
    cov[index] = value
  }
  for (let spotIndex = 0; spotIndex < data.spots.length; spotIndex += 1) {
    const spot = data.spots[spotIndex]
    let delta = spot.angle - beamAngle
    delta -= Math.round(delta)
    const flash = delta >= 0 && delta < 0.18
      ? (1 - delta / 0.18) * (1 - delta / 0.18)
      : 0
    const brightness = (0.14 + 0.95 * flash)
      * (0.45 + 0.55 * spot.weight)
      * (1 - spot.dist * 0.5)
    const radius = (1.1 + 2.4 * flash) / rows
    appearanceReviewStampDot(spec, spot.x, spot.y, radius, brightness)
  }
  appearanceReviewFinalizeCoverage(spec)
}

function appearanceReviewCoverageCreate(spec, u) {
  appearanceReviewZeroCoverage(spec)
  const data = spec.data
  const rows = spec.rows
  const theta = APPEARANCE_REVIEW_TWO_PI * u
  const inkAlpha = 1 - appearanceReviewSmoothstep(0.9, 0.985, u)
  const visible = appearanceReviewSmoothstep(0, 0.035, u)
    * (1 - appearanceReviewSmoothstep(0.955, 0.999, u))
  const { pose, position, writeProgress } = appearanceReviewCreatePenPose(data, u)
  const wobble = EngineSinAt(theta * 3 + data.phase) * 0.055
    + EngineSinAt(theta * 7 + data.phase * 1.7) * 0.02
  /* Ink first, then the pen on top, so the nib always reads against the page. */
  if (inkAlpha > 0.001) {
    for (let lineIndex = 0; lineIndex < data.lines.length; lineIndex += 1) {
      const slots = data.lines[lineIndex].slots
      for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
        const slot = slots[slotIndex]
        const completion = appearanceClamp(position - slot.startWeight, 0, 1)
        if (completion <= 0) continue
        const revealX = slot.x + slot.w * completion
        for (let strokeIndex = 0; strokeIndex < slot.strokes.length; strokeIndex += 1) {
          const stroke = slot.strokes[strokeIndex]
          const minX = Math.min(stroke.x0, stroke.x1)
          const maxX = Math.max(stroke.x0, stroke.x1)
          const fraction = maxX - minX < 0.001
            ? (revealX >= minX ? 1 : 0)
            : appearanceClamp((revealX - minX) / (maxX - minX), 0, 1)
          if (fraction <= 0) continue
          appearanceReviewStampSegment(
            spec,
            stroke.x0,
            stroke.y0,
            stroke.x1,
            stroke.y1,
            stroke.width,
            stroke.value * fraction * inkAlpha,
          )
        }
      }
    }
    /* Wet ink pooled under the nib while the pen is writing. */
    if (pose && writeProgress > 0 && writeProgress < 1 && visible > 0.2) {
      appearanceReviewStampDot(
        spec, pose.x, pose.y,
        Math.max(1.1 / rows, data.charH * 0.14), 0.5 * inkAlpha * visible,
      )
      appearanceReviewStampDot(
        spec,
        pose.x - data.charH * 0.45,
        pose.y + data.charH * 0.12,
        Math.max(0.85 / rows, data.charH * 0.08),
        0.26 * inkAlpha * visible,
      )
    }
  }
  if (visible > 0.001 && pose) {
    const angle = pose.angle + wobble
      + (pose.lift > 0 ? -0.12 * pose.lift : 0)
    appearanceReviewStampPen(
      spec,
      pose.x,
      pose.y - data.charH * 0.12,
      angle,
      data.penLength,
      visible,
    )
  }
  appearanceReviewFinalizeCoverage(spec)
}

function appearanceReviewCoverageDiscuss(spec, u) {
  appearanceReviewZeroCoverage(spec)
  const data = spec.data
  const guide = data.guide
  const aspect = spec.aspect
  const cols = spec.cols
  const rows = spec.rows
  const nx = spec.nx
  const ny = spec.ny
  const cov = spec.cov
  const theta = APPEARANCE_REVIEW_TWO_PI * u
  const energy = guide.energy
  const amplitude = 0.55 + 0.35 * energy
  const freq1 = data.freq1
  const freq2 = data.freq2
  const phase1 = data.phase1 + theta * data.cycles1
  const phase2 = data.phase2 - theta * data.cycles2
  for (let row = 0; row < rows; row += 1) {
    const y = ny[row]
    const vertical = 1 - Math.abs(y - 0.5) * 1.2
    const base = row * cols
    for (let col = 0; col < cols; col += 1) {
      const x = nx[col]
      const xr = x / aspect
      const envLeft = 1 - xr * 0.85
      const envRight = 1 - (1 - xr) * 0.85
      const left = EngineSinAt(xr * freq1 * APPEARANCE_REVIEW_TWO_PI + phase1)
      const right = EngineSinAt(
        (1 - xr) * freq2 * APPEARANCE_REVIEW_TWO_PI + phase2,
      )
      let value = (left > 0 ? left * envLeft : 0) + (right > 0 ? right * envRight : 0)
      const middle = 1 - Math.min(1, Math.abs(xr - 0.5) * 3)
      value += middle * Math.abs(left * right) * 0.55
      cov[base + col] = vertical > 0 ? value * vertical * amplitude : 0
    }
  }
  /* Alternating left/right speech pulses (integer cycle so the loop closes). */
  const alternation = EngineSinAt(theta + data.pulsePhase)
  const leftWeight = 0.25 + 0.6 * Math.max(0, alternation)
  const rightWeight = 0.25 + 0.6 * Math.max(0, -alternation)
  const reach = aspect * 0.85
  const radiusLeft = EngineFrac(u * 2 + data.pulseOffset) * reach
  const radiusRight = EngineFrac(u * 2 + data.pulseOffset + 0.5) * reach
  appearanceReviewStampRing(spec, 0, 0.5, radiusLeft, 0.02, leftWeight * 0.45)
  appearanceReviewStampRing(spec, aspect, 0.5, radiusRight, 0.02, rightWeight * 0.45)
  /* Travelling turn dots. */
  for (let index = 0; index < data.dots.length; index += 1) {
    const dot = data.dots[index]
    const travel = EngineFrac(dot.phaseOffset + dot.direction * u * dot.cycles)
    const x = dot.direction > 0 ? travel * aspect : (1 - travel) * aspect
    const y = dot.yBase + 0.05 * EngineSinAt(theta * dot.wobble + dot.wobblePhase)
    const pulse = 0.6 + 0.4 * EngineSinAt(theta * 2 + dot.phaseOffset * APPEARANCE_REVIEW_TWO_PI)
    appearanceReviewStampDot(
      spec,
      x,
      y,
      (1 + 0.8 * pulse) / rows,
      dot.weight * (0.45 + 0.35 * pulse),
    )
  }
  appearanceReviewFinalizeCoverage(spec)
}

function appearanceReviewCoverage(spec, u) {
  if (!spec || !spec.data) return
  if (spec.animation === 'code') appearanceReviewCoverageCode(spec, u)
  else if (spec.animation === 'investigate') appearanceReviewCoverageInvestigate(spec, u)
  else if (spec.animation === 'create') appearanceReviewCoverageCreate(spec, u)
  else appearanceReviewCoverageDiscuss(spec, u)
}

/* -------------------------------------------------------------------------- *
 * Painter
 * -------------------------------------------------------------------------- */

/**
 * Resolve (or reuse) the per-canvas grid, spec, and offscreen pixel layer.
 * The cache key is animation + guide signature + grid, so a guide update
 * rebuilds only the layout while the canvas keeps its layer.
 */
function appearanceReviewEntry(canvas, width, height, canvasCell, animation, guide) {
  const grid = EnginePreviewGrid(width, height, canvasCell)
  let entry = appearanceReviewCache ? appearanceReviewCache.get(canvas) : null
  if (!entry || entry.cols !== grid.cols || entry.rows !== grid.rows) {
    entry = {
      cols: grid.cols,
      rows: grid.rows,
      cell: grid.cell,
      key: '',
      spec: null,
      layer: null,
      layerContext: null,
      layerImage: null,
      layerWords: null,
      mask: null,
      maskKey: '',
      maskPattern: null,
      maskPatternContext: null,
    }
    if (appearanceReviewCache) appearanceReviewCache.set(canvas, entry)
  }
  entry.cell = grid.cell
  const key = animation + '|' + appearanceReviewGuideKey(guide)
    + '|' + grid.cols + 'x' + grid.rows + '|' + grid.cell
  if (entry.key !== key) {
    entry.key = key
    entry.spec = appearanceReviewCreateSpec(animation, grid.cols, grid.rows, guide)
  }
  return entry
}

/**
 * Paint one Review frame. The grid is generated on a low-resolution field,
 * written into one offscreen pixel layer, scaled with nearest-neighbour
 * sampling, then rounded-mask clipped and backed by the background colour —
 * the same pipeline as the other pixel painters.
 */
function appearancePaintReview(canvas, options) {
  if (!canvas || typeof canvas.getContext !== 'function') return
  let context = null
  try {
    context = canvas.getContext('2d')
  } catch {
    context = null
  }
  if (!context) return
  const width = Math.floor(EngineNumber(canvas.width, 0))
  const height = Math.floor(EngineNumber(canvas.height, 0))
  if (!(width > 0) || !(height > 0)) return
  const settings = options && typeof options === 'object' ? options : {}
  const animation = appearanceReviewNormalizeKind(settings.animation)
  const guide = appearanceReviewNormalizeGuide(settings.guide)
  const main = EngineResolveMain(settings.mainColor)
  const background = EngineResolveBackground(settings.backgroundColor)
  const time = EngineNumber(settings.time, 0)
  const requestedCell = appearanceClamp(EngineNumber(settings.cell, 10), 2, 80)
  const scale = appearanceReviewCanvasScale(canvas)
  const canvasCell = Math.max(2, Math.round(requestedCell * scale))
  const pixelStyle = EngineNormalizePixelStyle(settings.pixelStyle)
  const pixelRadius = EngineNumber(settings.pixelRadius, 0)
  const entry = appearanceReviewEntry(canvas, width, height, canvasCell, animation, guide)
  if (!entry || !EngineEnsurePreviewLayer(entry)) return
  const spec = entry.spec
  const u = EngineFrac(time / APPEARANCE_REVIEW_DURATION)
  appearanceReviewCoverage(spec, u)
  const cols = spec.cols
  const rows = spec.rows
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
  let levels = spec.levels
  if (!levels || levels.length < cols * rows) {
    levels = new Uint8Array(cols * rows)
    spec.levels = levels
  }
  let index = 0
  for (let row = 0; row < rows; row += 1) {
    const rowBase = (row & 7) << 3
    for (let col = 0; col < cols; col += 1, index += 1) {
      levels[index] = EnginePaletteLevel(cov[index], bayer[rowBase + (col & 7)])
    }
  }
  EngineWritePreviewLayer(entry, levels, palettePacked, paletteBytes)
  entry.layerContext.putImageData(entry.layerImage, 0, 0)
  context.imageSmoothingEnabled = false
  context.clearRect(0, 0, width, height)
  const cell = entry.cell
  context.drawImage(entry.layer, 0, 0, cols * cell, rows * cell)
  if (pixelStyle === 'rounded') {
    EngineApplyPixelMask(entry, context, cell, pixelRadius, width, height)
  }
  EngineFillPixelBackground(context, palette, width, height)
}

/* -------------------------------------------------------------------------- *
 * Runtime
 * -------------------------------------------------------------------------- */

function appearanceReviewRowTitle(row) {
  if (!row || typeof row !== 'object') return ''
  const title = typeof row.displayTitle === 'string' && row.displayTitle !== ''
    ? row.displayTitle
    : row.title
  return typeof title === 'string' ? title.slice(0, 240) : ''
}

/** True when a record was produced inside the Chat flow (or added it). */
function appearanceReviewNodeTouchesChat(node) {
  if (!node || node.nodeType !== 1) return false
  if (typeof node.closest !== 'function') return false
  try {
    return Boolean(node.closest('[data-conversation-content]'))
  } catch {
    return false
  }
}

function appearanceReviewRecordTouchesChat(record) {
  if (!record) return false
  if (appearanceReviewNodeTouchesChat(record.target)) return true
  const added = record.addedNodes
  if (added) {
    for (let index = 0; index < added.length; index += 1) {
      if (appearanceReviewNodeTouchesChat(added[index])) return true
    }
  }
  const removed = record.removedNodes
  if (removed) {
    for (let index = 0; index < removed.length; index += 1) {
      if (appearanceReviewNodeTouchesChat(removed[index])) return true
    }
  }
  return false
}

/** Comparably cheap signature for "did the painted guide change". */
function appearanceReviewRuntimeSignature(guide) {
  return guide.kind + '|' + guide.source + '|' + guide.title + '|'
    + guide.seed + '|' + Math.round(guide.energy * 1000) + '|'
    + Math.round(guide.density * 1000) + '|' + Math.round(guide.progress * 1000)
}

/**
 * Create the Review runtime: detects the guiding session, keeps the shared
 * guide snapshot current, and paints frames through `appearancePaintReview`.
 * Detection is debounced and never switches the UI to another session.
 */
function appearanceReviewCreateRuntime(options) {
  const ctx = options?.ctx
  const store = options?.store
  const requestPaint = typeof options?.requestPaint === 'function' ? options.requestPaint : null
  const doc = typeof document !== 'undefined' ? document : null

  let active = false
  let disposed = false
  let guide = appearanceReviewNeutralGuide()
  let lastSignature = appearanceReviewRuntimeSignature(guide)
  let lastDetectedKind = ''
  let recomputeTimer = null
  let recomputeToken = 0
  let unsubscribeList = null
  let unsubscribeStore = null
  let observer = null
  let lastListKey = ''
  /* Recently-read recent-session sample keyed by id + updatedAt, so unrelated
   * list activity on a new-session screen does not re-open history. */
  let recentSampleCache = null

  const sessionsOf = () => {
    if (!ctx || typeof ctx.get !== 'function') return null
    try {
      return ctx.get('sessions') || null
    } catch {
      return null
    }
  }

  const configOf = () => {
    try {
      const snapshot = store && store.getSnapshot ? store.getSnapshot() : null
      return snapshot && snapshot.config && typeof snapshot.config === 'object'
        ? snapshot.config
        : {}
    } catch {
      return {}
    }
  }

  const listSnapshotOf = () => {
    const sessions = sessionsOf()
    try {
      return sessions && sessions.list && sessions.list.getSnapshot
        ? sessions.list.getSnapshot()
        : null
    } catch {
      return null
    }
  }

  /**
   * Content-relevant list signature. The runtime's own read-only retain bumps
   * `retainedBy` on the recent row; excluding the per-source counts (but keeping
   * the main-view marker) avoids a read → list-change → read feedback loop.
   */
  const listKeyOf = () => {
    const snapshot = listSnapshotOf()
    if (!snapshot || !snapshot.byId) return ''
    const ids = Array.isArray(snapshot.ids) ? snapshot.ids : Object.keys(snapshot.byId)
    const parts = []
    for (let index = 0; index < ids.length; index += 1) {
      const id = ids[index]
      const row = snapshot.byId[id]
      if (!row) continue
      const mainView = row.retainedBy && Number(row.retainedBy.mainView) > 0 ? 'v' : '-'
      parts.push(id
        + ':' + (row.blank === true ? 'b' : '-')
        + ':' + EngineNumber(row.updatedAt, 0)
        + ':' + (row.running === true ? 'r' : '-')
        + ':' + mainView
        + ':' + (typeof row.title === 'string' ? row.title : ''))
    }
    return parts.join('|')
  }

  const rowOf = (id) => {
    if (!id) return null
    const snapshot = listSnapshotOf()
    if (!snapshot || !snapshot.byId) return null
    return snapshot.byId[id] || null
  }

  const manualKindOf = (config) => {
    const value = config ? config.reviewSubTheme : 'auto'
    return APPEARANCE_REVIEW_SUBTHEMES.indexOf(value) >= 0 ? value : 'auto'
  }

  /** Main-view retention marks the session the user is looking at. */
  const currentSessionId = () => {
    const snapshot = listSnapshotOf()
    if (snapshot && snapshot.byId) {
      const ids = Array.isArray(snapshot.ids) ? snapshot.ids : Object.keys(snapshot.byId)
      for (let index = 0; index < ids.length; index += 1) {
        const row = snapshot.byId[ids[index]]
        if (!row) continue
        const count = row.retainedBy ? Number(row.retainedBy.mainView) : 0
        if (count > 0) return ids[index]
      }
    }
    if (!doc) return ''
    const selectors = [
      '[data-sidebar] ' + APPEARANCE_REVIEW_SESSION_ROW_SELECTOR,
      APPEARANCE_REVIEW_SESSION_ROW_SELECTOR,
    ]
    for (let index = 0; index < selectors.length; index += 1) {
      try {
        const element = doc.querySelector(selectors[index])
        if (!element) continue
        const key = element.getAttribute('data-row-key') || ''
        if (key.indexOf('session:') === 0) return key.slice('session:'.length)
      } catch {}
    }
    return ''
  }

  const pickRecentSession = (currentId) => {
    const snapshot = listSnapshotOf()
    if (!snapshot || !snapshot.byId) return null
    const ids = Array.isArray(snapshot.ids) ? snapshot.ids : Object.keys(snapshot.byId)
    let best = null
    let bestUpdatedAt = -Infinity
    for (let index = 0; index < ids.length; index += 1) {
      const id = ids[index]
      if (!id || id === currentId) continue
      const row = snapshot.byId[id]
      if (!row || row.blank === true) continue
      if (row.origin === 'subagent') continue
      const updatedAt = EngineNumber(row.updatedAt, 0)
      if (updatedAt > bestUpdatedAt) {
        best = row
        bestUpdatedAt = updatedAt
      }
    }
    return best
  }

  /** Apply one guide to the shared store and the painted guide. */
  const applyGuide = (candidate, manualKind, ready) => {
    const next = appearanceReviewNormalizeGuide(candidate)
    const manual = APPEARANCE_REVIEW_SUBTHEMES.indexOf(manualKind) >= 0 ? manualKind : 'auto'
    const patch = {
      kind: next.kind,
      source: next.source,
      title: next.title,
      ready: ready !== false,
      locked: manual !== 'auto',
      manualKind: manual,
    }
    const snapshot = appearanceReviewGuideStore.getSnapshot()
    let changed = false
    for (let index = 0; index < APPEARANCE_REVIEW_GUIDE_FIELDS.length; index += 1) {
      const key = APPEARANCE_REVIEW_GUIDE_FIELDS[index]
      if (snapshot[key] !== patch[key]) {
        changed = true
        break
      }
    }
    if (changed) appearanceReviewGuideStore.set(patch)
    const signature = appearanceReviewRuntimeSignature(next)
    guide = next
    if (signature !== lastSignature) {
      lastSignature = signature
      requestPaint?.()
    }
  }

  const resetStore = () => {
    appearanceReviewGuideStore.set({
      kind: 'discuss',
      source: 'current',
      title: '',
      ready: false,
      locked: false,
      manualKind: 'auto',
    })
  }

  const scheduleRecompute = (delay) => {
    if (!active || disposed) return
    if (recomputeTimer !== null) clearTimeout(recomputeTimer)
    recomputeTimer = setTimeout(() => {
      recomputeTimer = null
      if (!active || disposed) return
      recompute()
    }, Math.max(0, EngineNumber(delay, APPEARANCE_REVIEW_RECOMPUTE_DELAY)))
  }

  /**
   * One debounced detection pass. A current session with rendered rows wins;
   * otherwise the most recent non-blank session is read read-only; otherwise a
   * neutral Discussion guide is used. Detection failures degrade to neutral.
   */
  const recompute = async () => {
    if (!active || disposed) return
    const token = (recomputeToken += 1)
    const config = configOf()
    const manualKind = manualKindOf(config)
    try {
      const currentId = currentSessionId()
      const currentRow = currentId ? rowOf(currentId) : null
      const domSample = appearanceReviewCollectCurrent()
      /* New session: no rendered Chat rows, or the current row is known blank.
       * An unknown current row with rendered rows still counts as the current
       * session (the sessions service may simply not be ready yet). */
      const currentIsNew = domSample.rows === 0
        || (currentRow ? currentRow.blank === true : false)
      if (domSample.rows > 0 && !currentIsNew) {
        const title = appearanceReviewRowTitle(currentRow)
        const classification = appearanceReviewClassify(
          domSample,
          title,
          lastDetectedKind || undefined,
        )
        lastDetectedKind = classification.kind
        const kind = manualKind === 'auto' ? classification.kind : manualKind
        applyGuide(appearanceReviewBuildGuide({
          kind,
          source: 'current',
          title,
          sample: domSample,
          progress: Math.min(1, domSample.rows / 40),
        }), manualKind, true)
        return
      }
      const recent = pickRecentSession(currentId)
      if (!recent) {
        const neutral = appearanceReviewNeutralGuide()
        if (manualKind !== 'auto') neutral.kind = manualKind
        applyGuide(neutral, manualKind, true)
        return
      }
      const recentId = typeof recent.id === 'string'
        ? recent.id
        : (typeof recent.sessionId === 'string' ? recent.sessionId : '')
      const recentTitle = appearanceReviewRowTitle(recent)
      const recentUpdatedAt = EngineNumber(recent.updatedAt, 0)
      let recentSample = null
      if (recentId) {
        const cached = recentSampleCache
        if (cached
          && cached.id === recentId
          && cached.updatedAt === recentUpdatedAt
          && cached.sample) {
          recentSample = cached.sample
        } else {
          if (appearanceReviewGuideStore.getSnapshot().ready) {
            appearanceReviewGuideStore.set({ ready: false })
          }
          recentSample = await appearanceReviewReadRecent(sessionsOf(), recentId)
          if (recentSample) {
            recentSampleCache = {
              id: recentId,
              updatedAt: recentUpdatedAt,
              sample: recentSample,
            }
          }
        }
      }
      if (!active || disposed || token !== recomputeToken) return
      const sample = recentSample || appearanceReviewEmptySample()
      const classification = appearanceReviewClassify(
        sample,
        recentTitle,
        lastDetectedKind || undefined,
      )
      lastDetectedKind = classification.kind
      const kind = manualKind === 'auto' ? classification.kind : manualKind
      applyGuide(appearanceReviewBuildGuide({
        kind,
        source: 'recent',
        title: recentTitle,
        sample,
        progress: 0,
      }), manualKind, true)
    } catch (cause) {
      if (!active || disposed) return
      console.error('appearance: review guide detection failed', cause)
      try {
        const neutral = appearanceReviewNeutralGuide()
        if (manualKind !== 'auto') neutral.kind = manualKind
        applyGuide(neutral, manualKind, true)
      } catch (fallbackCause) {
        console.error('appearance: review guide fallback failed', fallbackCause)
      }
    }
  }

  const onMutations = (records) => {
    if (!active || disposed) return
    if (!Array.isArray(records) || records.length === 0) return
    for (let index = 0; index < records.length; index += 1) {
      if (appearanceReviewRecordTouchesChat(records[index])) {
        scheduleRecompute(APPEARANCE_REVIEW_RECOMPUTE_DELAY)
        return
      }
    }
  }

  const bindSources = () => {
    const sessions = sessionsOf()
    const list = sessions && sessions.list
    if (list && typeof list.subscribe === 'function') {
      lastListKey = listKeyOf()
      try {
        const off = list.subscribe(() => {
          const nextKey = listKeyOf()
          if (nextKey === lastListKey) return
          lastListKey = nextKey
          scheduleRecompute(APPEARANCE_REVIEW_RECOMPUTE_DELAY)
        })
        if (typeof off === 'function') unsubscribeList = off
      } catch (cause) {
        console.error('appearance: review session list subscribe failed', cause)
      }
    }
    try {
      if (store && typeof store.subscribe === 'function') {
        const off = store.subscribe(() => {
          scheduleRecompute(APPEARANCE_REVIEW_RECOMPUTE_DELAY)
        })
        if (typeof off === 'function') unsubscribeStore = off
      }
    } catch (cause) {
      console.error('appearance: review settings subscribe failed', cause)
    }
    /* Only the fallback path needs its own DOM observer; the scene runtime
     * forwards Chat-flow mutations to `onMutations` otherwise. */
    if (!list || typeof list.subscribe !== 'function') {
      if (doc && typeof MutationObserver === 'function') {
        try {
          observer = new MutationObserver((records) => onMutations(records))
          const target = doc.querySelector('[data-conversation-content]')
            || doc.body || doc.documentElement
          observer.observe(target, { childList: true, subtree: true })
        } catch (cause) {
          console.error('appearance: review observer failed', cause)
          observer = null
        }
      }
    }
  }

  const unbindSources = () => {
    if (typeof unsubscribeList === 'function') {
      try {
        unsubscribeList()
      } catch {}
    }
    unsubscribeList = null
    if (typeof unsubscribeStore === 'function') {
      try {
        unsubscribeStore()
      } catch {}
    }
    unsubscribeStore = null
    if (observer) {
      try {
        observer.disconnect()
      } catch {}
      observer = null
    }
  }

  const activate = () => {
    if (disposed || active) return
    active = true
    recomputeToken += 1
    bindSources()
    scheduleRecompute(80)
  }

  const deactivate = () => {
    if (!active) return
    active = false
    recomputeToken += 1
    if (recomputeTimer !== null) {
      clearTimeout(recomputeTimer)
      recomputeTimer = null
    }
    unbindSources()
  }

  const paint = (canvas, rect, nowMs) => {
    if (!active || disposed || !canvas) return
    try {
      const config = configOf()
      const effective = appearanceEffective(config, appearanceResolvedScheme(ctx))
      const manualKind = manualKindOf(config)
      const animation = manualKind === 'auto' ? guide.kind : manualKind
      const time = EngineNumber(nowMs, Date.now()) / 1000
      appearancePaintReview(canvas, {
        mainColor: effective.mainColor,
        backgroundColor: effective.backgroundColor,
        animation,
        guide,
        time,
        cell: effective.pixelSize,
        pixelStyle: effective.pixelStyle,
        pixelRadius: effective.pixelRadius,
      })
    } catch (cause) {
      console.error('appearance: review paint failed', cause)
    }
  }

  return {
    activate,
    deactivate,
    onMutations,
    paint,
    guide: () => guide,
    isActive: () => active,
    dispose() {
      deactivate()
      disposed = true
      unbindSources()
      guide = appearanceReviewNeutralGuide()
      try {
        resetStore()
      } catch {}
    },
  }
}
