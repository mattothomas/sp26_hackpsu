'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { FRIEND_WALLET_ADDRESS, STAKE_SOL_DISPLAY } from '@/constants'

export default function CommittedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const walletAddress = useAppStore((s) => s.walletAddress)

  // Redirect to landing if no wallet connected
  useEffect(() => {
    if (!walletAddress) router.replace('/')
  }, [walletAddress, router])

  const isHonest = searchParams.get('result') === 'honest'

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-8">
      {isHonest && (
        <div className="bg-green-900 border border-green-500 rounded-lg px-6 py-3 text-green-300 font-bold text-sm">
          ✅ BIOMETRICS CLEAR — You told the truth. SOL stays in your wallet.
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="text-6xl">🏋️</div>
        <h1 className="text-3xl font-black">YOU&apos;RE COMMITTED</h1>
        <p className="text-zinc-400">The alarm is set. The stake is locked.</p>
      </div>

      {/* Stake details */}
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-sm flex flex-col gap-4 text-left border border-zinc-700">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Commitment</span>
          <span className="font-bold">6:00 AM Gym</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Stake</span>
          <span className="font-bold text-yellow-400">{STAKE_SOL_DISPLAY} SOL</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Alarm</span>
          <span className="font-bold">6:00 AM</span>
        </div>
        <div className="border-t border-zinc-700 pt-3">
          <div className="text-zinc-400 text-xs mb-1">If you flake, your SOL goes to:</div>
          <div className="font-mono text-xs text-zinc-300 break-all">
            {FRIEND_WALLET_ADDRESS.slice(0, 8)}...{FRIEND_WALLET_ADDRESS.slice(-8)}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 w-full max-w-sm">
        <p className="text-zinc-500 text-xs uppercase tracking-wide">
          Demo: simulate the 6 AM alarm
        </p>
        <button
          onClick={() => router.push('/alarm')}
          className="btn-danger w-full text-lg py-4"
        >
          ⏰ SIMULATE ALARM TRIGGER
        </button>
      </div>
    </main>
  )
}
