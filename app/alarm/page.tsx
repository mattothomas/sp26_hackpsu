'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

export default function AlarmPage() {
  const router = useRouter()
  const walletAddress = useAppStore((s) => s.walletAddress)

  useEffect(() => {
    if (!walletAddress) router.replace('/')
  }, [walletAddress, router])

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/excuse')
    }, 2500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-6">
      <div className="text-9xl animate-bounce">⏰</div>
      <h1 className="text-6xl font-black text-red-500 tracking-tight">
        IT&apos;S 6 AM
      </h1>
      <p className="text-2xl font-bold text-white">TIME TO GO TO THE GYM</p>
      <p className="text-zinc-500 text-sm">Preparing your excuse booth...</p>
    </main>
  )
}
