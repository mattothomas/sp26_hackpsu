// =============================================================================
// CallMyBluff.tech — Constants
// TODO: Fill in FRIEND_WALLET_ADDRESS and ELEVENLABS_VOICE_ID before the demo
// =============================================================================

// Devnet wallet that receives the slashed SOL (friend's wallet)
// Replace with the actual friend's devnet public key
export const FRIEND_WALLET_ADDRESS = '11111111111111111111111111111112'

// 0.01 SOL in lamports (1 SOL = 1,000,000,000 lamports)
export const STAKE_LAMPORTS = 10_000_000

// Display string for the stake amount
export const STAKE_SOL_DISPLAY = '0.01'

// ElevenLabs voice ID — set via env, falls back to this default
// Browse voices at: https://elevenlabs.io/voice-library
export const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'ErXwobaYiN019PkySvjV'

// Fake biometric vitals shown during the analysis animation
// These look "normal" (calm = lying) to justify the detection
export const FAKE_VITALS = {
  heartRate: 62,
  respiratoryRate: 16,
  stressScore: 2.1,
} as const

// Shown if Solana devnet RPC times out (so demo never stalls)
export const FAKE_TX_HASH = '4xHk9mBr2K8pQjNvWs3mX7aLcYdFg5tR1nEeZuCwPq1'

// Used when Gemini API fails — roast still fires
export function getFallbackRoast(excuse: string): string {
  return (
    `BRO. You literally said "${excuse}" and your heart rate is 62 BPM — ` +
    `that is LOWER than your gym attendance this month. ` +
    `Your stress score is 2.1 out of 10. You know what else has a stress score of 2.1? A ROCK. ` +
    `Your $${STAKE_SOL_DISPLAY} SOL just left your wallet. WAKE UP.`
  )
}
