'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { primeAudio } from '@/lib/audio'
import { FAKE_VITALS, getFallbackRoast } from '@/constants'
import WebcamRecorder from '@/components/WebcamRecorder'

export default function ExcusePage() {
  const router = useRouter()
  const store = useAppStore()

  useEffect(() => {
    if (!store.walletAddress) router.replace('/')
  }, [store.walletAddress, router])

  function handleSubmit(text: string) {
    store.setExcuseText(text)
    store.setApiPending(true)

    // MUST call primeAudio synchronously in this gesture frame
    // This keeps the AudioContext alive through the 8s API latency
    primeAudio()

    fetch('/api/roast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ excuse: text, vitals: FAKE_VITALS }),
    })
      .then(async (res) => {
        const roastText = decodeURIComponent(
          res.headers.get('X-Roast-Text') ?? ''
        )
        const audioFailed = res.headers.get('X-Audio-Failed') === '1'
        const blob = await res.blob()

        store.setRoastText(roastText || getFallbackRoast(text))
        store.setAudioObjectUrl(
          !audioFailed && blob.size > 0
            ? URL.createObjectURL(blob)
            : 'NONE'
        )
        store.setApiPending(false)
      })
      .catch(() => {
        store.setRoastText(getFallbackRoast(text))
        store.setAudioObjectUrl('NONE')
        store.setApiPending(false)
      })

    // Navigate immediately — /analyze animation covers the API latency
    router.push('/analyze')
  }

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-8 gap-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-1">
          STATE YOUR EXCUSE
        </h1>
        <p className="text-zinc-400 text-sm text-center">
          Biometric analysis is running in the background.
          <br />
          <span className="text-red-400">Choose your words carefully.</span>
        </p>
      </div>

      {/* Fake biometric status bar */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-lg p-3">
        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2 font-mono">
          Live Biometrics
        </div>
        <div className="flex justify-between text-sm font-mono">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-red-400 font-bold animate-pulse">
              {FAKE_VITALS.heartRate} BPM
            </span>
            <span className="text-zinc-600 text-xs">Heart Rate</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-blue-400 font-bold">
              {FAKE_VITALS.respiratoryRate}/min
            </span>
            <span className="text-zinc-600 text-xs">Breathing</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-green-400 font-bold">
              {FAKE_VITALS.stressScore}/10
            </span>
            <span className="text-zinc-600 text-xs">Stress</span>
          </div>
        </div>
      </div>

      <WebcamRecorder onSubmit={handleSubmit} />
    </main>
  )
}
