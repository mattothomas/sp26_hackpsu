'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { FAKE_VITALS } from '@/constants'

const ANIM_DURATION_MS = 4000
const SCAN_RESULTS = [
  { label: 'Heart Rate', value: `${FAKE_VITALS.heartRate} BPM`, time: 800, color: 'text-red-400' },
  { label: 'Respiratory Rate', value: `${FAKE_VITALS.respiratoryRate}/min`, time: 1800, color: 'text-blue-400' },
  { label: 'Stress Index', value: `${FAKE_VITALS.stressScore}/10`, time: 2800, color: 'text-yellow-400' },
]

export default function AnalyzePage() {
  const router = useRouter()
  const walletAddress = useAppStore((s) => s.walletAddress)
  const godModeActive = useAppStore((s) => s.godModeActive)
  const biometricForce = useAppStore((s) => s.biometricForce)

  const [progress, setProgress] = useState(0)
  const [visibleScans, setVisibleScans] = useState<number[]>([])
  const [animDone, setAnimDone] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const routedRef = useRef(false)

  useEffect(() => {
    if (!walletAddress) router.replace('/')
  }, [walletAddress, router])

  // Progress bar animation
  useEffect(() => {
    const start = performance.now()
    startTimeRef.current = start

    function tick(now: number) {
      const elapsed = now - start
      const pct = Math.min(elapsed / ANIM_DURATION_MS, 1)
      setProgress(pct * 100)

      if (elapsed >= ANIM_DURATION_MS + 200) {
        setAnimDone(true)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Reveal scan results at staggered times
  useEffect(() => {
    const timers = SCAN_RESULTS.map((s, i) =>
      setTimeout(() => setVisibleScans((prev) => [...prev, i]), s.time)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // After animation: route based on result + poll for API completion
  useEffect(() => {
    if (!animDone || routedRef.current) return
    routedRef.current = true

    const result = godModeActive ? biometricForce : 'lying'

    if (result === 'truth') {
      router.push('/committed?result=honest')
      return
    }

    // Poll for API completion — check every 200ms up to 10s
    let elapsed = 0
    const interval = setInterval(() => {
      elapsed += 200
      const state = useAppStore.getState()

      if (state.audioObjectUrl !== null || !state.apiPending) {
        clearInterval(interval)
        router.push('/roast')
        return
      }

      if (elapsed >= 10_000) {
        clearInterval(interval)
        router.push('/roast')
      }
    }, 200)

    return () => clearInterval(interval)
  }, [animDone, godModeActive, biometricForce, router])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">ANALYZING BIOMETRICS</h1>
        <p className="text-zinc-400 text-sm">Neural pattern matching in progress...</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-none rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-xs text-zinc-500 font-mono mt-1">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Scan results */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {SCAN_RESULTS.map((scan, i) => (
          <div
            key={scan.label}
            className={`flex justify-between items-center bg-zinc-900 rounded-lg p-3 border border-zinc-800 transition-opacity duration-500 ${
              visibleScans.includes(i) ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="text-zinc-400 text-sm font-mono">{scan.label}</span>
            <span className={`font-bold font-mono ${scan.color}`}>{scan.value}</span>
          </div>
        ))}
      </div>

      {animDone && (
        <p className="text-zinc-500 text-xs animate-pulse font-mono">
          CROSS-REFERENCING DECEPTION MARKERS...
        </p>
      )}
    </main>
  )
}
