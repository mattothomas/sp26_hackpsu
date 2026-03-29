'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useAppStore } from '@/lib/store'
import { STAKE_SOL_DISPLAY } from '@/constants'

export default function LandingPage() {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const { setWalletAddress, reset } = useAppStore()

  // Clear any stale flow state from previous demo run
  useEffect(() => {
    reset()
  }, [reset])

  // Redirect once wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toBase58())
      router.push('/committed')
    }
  }, [connected, publicKey, setWalletAddress, router])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black tracking-tight">
          Call<span className="text-red-500">My</span>Bluff
          <span className="text-zinc-400">.tech</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Stop flaking. We will find out.
        </p>
      </div>

      {/* Value props */}
      <div className="flex flex-col gap-3 text-left max-w-sm w-full">
        <div className="flex items-start gap-3 bg-zinc-900 rounded-lg p-3">
          <span className="text-2xl">💰</span>
          <div>
            <div className="font-bold text-sm">Stake {STAKE_SOL_DISPLAY} SOL</div>
            <div className="text-zinc-400 text-xs">Put your money where your mouth is</div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-zinc-900 rounded-lg p-3">
          <span className="text-2xl">🎙</span>
          <div>
            <div className="font-bold text-sm">State your excuse on camera</div>
            <div className="text-zinc-400 text-xs">We're watching. And listening.</div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-zinc-900 rounded-lg p-3">
          <span className="text-2xl">💓</span>
          <div>
            <div className="font-bold text-sm">Biometrics don't lie</div>
            <div className="text-zinc-400 text-xs">AI reads your stress, heart rate, and tells</div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-zinc-900 rounded-lg p-3">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="font-bold text-sm">Get roasted. Lose your SOL.</div>
            <div className="text-zinc-400 text-xs">Your friend gets paid. You get called out.</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <WalletMultiButton />
        <p className="text-zinc-600 text-xs">Solana devnet — no real money</p>
        <button
          onClick={() => {
            setWalletAddress('TEST_MODE_NO_WALLET')
            router.push('/committed')
          }}
          className="text-zinc-600 text-xs underline hover:text-zinc-400 transition-colors"
        >
          Skip wallet (test mode)
        </button>
      </div>
    </main>
  )
}
