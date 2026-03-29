import { create } from 'zustand'

type BiometricResult = 'lying' | 'truth'

interface AppState {
  // Wallet
  walletAddress: string | null

  // Flow data
  excuseText: string
  roastText: string
  txHash: string | null

  // API state
  // null = not started, 'NONE' = done but no audio, otherwise ObjectURL
  audioObjectUrl: string | null
  apiPending: boolean

  // God Mode
  godModeActive: boolean
  biometricForce: BiometricResult

  // Actions
  setWalletAddress: (addr: string | null) => void
  setExcuseText: (text: string) => void
  setRoastText: (text: string) => void
  setTxHash: (hash: string) => void
  setAudioObjectUrl: (url: string) => void
  setApiPending: (pending: boolean) => void
  activateGodMode: () => void
  setBiometricForce: (result: BiometricResult) => void

  // Resets flow state — keeps godModeActive + biometricForce
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  walletAddress: null,
  excuseText: '',
  roastText: '',
  txHash: null,
  audioObjectUrl: null,
  apiPending: false,
  godModeActive: false,
  biometricForce: 'lying',

  setWalletAddress: (addr) => set({ walletAddress: addr }),
  setExcuseText: (text) => set({ excuseText: text }),
  setRoastText: (text) => set({ roastText: text }),
  setTxHash: (hash) => set({ txHash: hash }),
  setAudioObjectUrl: (url) => set({ audioObjectUrl: url }),
  setApiPending: (pending) => set({ apiPending: pending }),
  activateGodMode: () => set({ godModeActive: true }),
  setBiometricForce: (result) => set({ biometricForce: result }),

  reset: () =>
    set((state) => ({
      excuseText: '',
      roastText: '',
      txHash: null,
      audioObjectUrl: null,
      apiPending: false,
      // Preserve god mode state across resets
      godModeActive: state.godModeActive,
      biometricForce: state.biometricForce,
    })),
}))
