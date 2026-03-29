'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAppStore } from '@/lib/store'
import { FAKE_TX_HASH, FAKE_VITALS, STAKE_SOL_DISPLAY } from '@/constants'
import { slashStake } from '@/lib/solana'

export default function RoastPage() {
  const router = useRouter()
  const wallet = useWallet()
  const store = useAppStore()

  const [displayText, setDisplayText] = useState('')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txLoading, setTxLoading] = useState(true)

  const txFiredRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!store.walletAddress) router.replace('/')
  }, [store.walletAddress, router])

  // Play audio on mount
  useEffect(() => {
    const url = store.audioObjectUrl
    if (!url || url === 'NONE') return

    const audio = new Audio(url)
    audioRef.current = audio
    audio.play().catch(() => {
      // Autoplay blocked — silently fail, text still shows
    })

    return () => {
      audio.pause()
      URL.revokeObjectURL(url)
    }
  }, [store.audioObjectUrl])

  // Typewriter animation
  useEffect(() => {
    const text = store.roastText
    if (!text) return

    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayText(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, 40)

    return () => clearInterval(interval)
  }, [store.roastText])

  // Slash the stake — fires once, guarded by ref
  useEffect(() => {
    if (txFiredRef.current) return
    txFiredRef.current = true

    async function doSlash() {
      try {
        const sig = await slashStake(wallet)
        setTxHash(sig)
        store.setTxHash(sig)
      } catch {
        // Fall back to fake hash after 3s so demo never stalls
        setTimeout(() => {
          setTxHash(FAKE_TX_HASH)
          store.setTxHash(FAKE_TX_HASH)
        }, 3000)
      } finally {
        setTxLoading(false)
      }
    }

    doSlash()
  }, [wallet, store])

  const finalTxHash = txHash || store.txHash

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-8 gap-6">
      {/* LYING DETECTED banner */}
      <div className="w-full max-w-md bg-red-600 rounded-xl p-4 text-center">
        <div className="text-2xl font-black tracking-widest">LYING DETECTED</div>
        <div className="text-red-200 text-sm mt-1">
          {STAKE_SOL_DISPLAY} SOL has been transferred to your friend
        </div>
      </div>

      {/* Vitals summary */}
      <div className="w-full max-w-md grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 rounded-lg p-3 text-center border border-zinc-800">
          <div className="text-red-400 font-bold text-lg font-mono">{FAKE_VITALS.heartRate}</div>
          <div className="text-zinc-500 text-xs">BPM</div>
        </div>
        <div className="bg-zinc-900 rounded-lg p-3 text-center border border-zinc-800">
          <div className="text-blue-400 font-bold text-lg font-mono">{FAKE_VITALS.respiratoryRate}</div>
          <div className="text-zinc-500 text-xs">BREATHS/MIN</div>
        </div>
        <div className="bg-zinc-900 rounded-lg p-3 text-center border border-zinc-800">
          <div className="text-yellow-400 font-bold text-lg font-mono">{FAKE_VITALS.stressScore}</div>
          <div className="text-zinc-500 text-xs">STRESS/10</div>
        </div>
      </div>

      {/* Roast text */}
      <div className="w-full max-w-md bg-zinc-900 border border-red-900 rounded-xl p-5">
        <div className="text-xs text-zinc-500 uppercase tracking-wide font-mono mb-3">
          BroBot3000 says:
        </div>
        <p className="text-white font-medium leading-relaxed min-h-[80px]">
          {displayText}
          {displayText.length < store.roastText.length && (
            <span className="inline-block w-0.5 h-4 bg-white ml-0.5 animate-pulse" />
          )}
        </p>
      </div>

      {/* Transaction hash */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-lg p-4">
        <div className="text-xs text-zinc-500 uppercase tracking-wide font-mono mb-2">
          Solana Transaction
        </div>
        {txLoading && !finalTxHash ? (
          <div className="text-zinc-500 text-sm font-mono animate-pulse">
            Broadcasting to devnet...
          </div>
        ) : (
          <div className="font-mono text-xs text-green-400 break-all">{finalTxHash}</div>
        )}
      </div>

      <button
        onClick={() => {
          store.reset()
          router.push('/committed')
        }}
        className="btn-ghost w-full max-w-md"
      >
        TRY AGAIN
      </button>
    </main>
  )
}
