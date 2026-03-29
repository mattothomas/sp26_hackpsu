'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * Hidden God Mode overlay.
 * Activated by typing G → O → D (case-insensitive) anywhere on the page.
 * Once active, shows a floating panel to force biometric result for demos.
 */
export default function GodMode() {
  const godModeActive = useAppStore((s) => s.godModeActive)
  const biometricForce = useAppStore((s) => s.biometricForce)
  const activateGodMode = useAppStore((s) => s.activateGodMode)
  const setBiometricForce = useAppStore((s) => s.setBiometricForce)

  // Use refs so the keydown handler never captures stale closure values
  const bufferRef = useRef('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(-3)
      if (bufferRef.current === 'god') {
        activateGodMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activateGodMode])

  if (!godModeActive) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-yellow-400 text-black rounded-lg p-3 shadow-2xl border-2 border-yellow-600 text-sm font-mono">
      <div className="font-bold mb-2 text-xs uppercase tracking-wider">
        ⚡ GOD MODE
      </div>
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="biometricForce"
            value="lying"
            checked={biometricForce === 'lying'}
            onChange={() => setBiometricForce('lying')}
          />
          LYING (roast fires)
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="biometricForce"
            value="truth"
            checked={biometricForce === 'truth'}
            onChange={() => setBiometricForce('truth')}
          />
          TRUTH (pass through)
        </label>
      </div>
    </div>
  )
}
