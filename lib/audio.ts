let primed = false

/**
 * Must be called synchronously inside a user gesture handler (click, keydown, etc.)
 * Creates a silent AudioContext that keeps the browser's autoplay policy satisfied
 * so the roast audio fires even after 8+ seconds of API latency.
 */
export function primeAudio(): void {
  if (primed || typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const buf = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start(0)
    primed = true
  } catch {
    // Safari private mode or unsupported — roast may not autoplay, acceptable fallback
  }
}
