import { NextRequest, NextResponse } from 'next/server'
import { ELEVENLABS_VOICE_ID, getFallbackRoast, STAKE_SOL_DISPLAY } from '@/constants'

interface Vitals {
  heartRate: number
  respiratoryRate: number
  stressScore: number
}

function buildRoastPrompt(excuse: string, vitals: Vitals): string {
  return `You are BroBot3000, a savage AI gym accountability coach. Your job is to call out people who skip the gym with fake excuses.

The user committed to going to the gym at 6 AM and staked ${STAKE_SOL_DISPLAY} SOL. They just said: "${excuse}"

Their biometrics during this statement:
- Heart rate: ${vitals.heartRate} BPM (calm — suspiciously calm)
- Respiratory rate: ${vitals.respiratoryRate} breaths/min (normal — NOT stressed)
- Stress score: ${vitals.stressScore}/10 (extremely low — dead giveaway)

Write EXACTLY 3 sentences. Quote their excuse verbatim. Reference the biometrics specifically. Announce their SOL is gone. Use ALL CAPS for emphasis on key words. Be brutal, specific, and funny. No emojis. Do NOT start with "Okay" or "Alright".`
}

export async function POST(req: NextRequest) {
  let excuse: string
  let vitals: Vitals

  try {
    const body = await req.json()
    excuse = typeof body.excuse === 'string' && body.excuse.trim() ? body.excuse.trim() : 'I was too tired'
    vitals = body.vitals ?? { heartRate: 62, respiratoryRate: 16, stressScore: 2.1 }
  } catch {
    excuse = 'I was too tired'
    vitals = { heartRate: 62, respiratoryRate: 16, stressScore: 2.1 }
  }

  // === Step 1: Generate roast text via Gemini ===
  let roastText = getFallbackRoast(excuse)

  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildRoastPrompt(excuse, vitals) }] }],
            generationConfig: { maxOutputTokens: 200, temperature: 0.9 },
          }),
          signal: AbortSignal.timeout(8000),
        }
      )

      if (geminiRes.ok) {
        const data = await geminiRes.json()
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (candidate && typeof candidate === 'string' && candidate.trim()) {
          roastText = candidate.trim()
        }
      }
    } catch {
      // Gemini failed — fallback roast already set
    }
  }

  // === Step 2: Generate audio via ElevenLabs ===
  const elevenKey = process.env.ELEVENLABS_API_KEY
  if (!elevenKey) {
    // No audio key — return text-only response
    return new NextResponse(new Uint8Array(0), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Roast-Text': encodeURIComponent(roastText),
        'X-Audio-Failed': '1',
      },
    })
  }

  try {
    const audioRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: roastText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.35, similarity_boost: 0.75 },
        }),
        signal: AbortSignal.timeout(12000),
      }
    )

    if (!audioRes.ok) {
      throw new Error(`ElevenLabs ${audioRes.status}`)
    }

    const audioBuffer = await audioRes.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Roast-Text': encodeURIComponent(roastText),
        'Content-Length': String(audioBuffer.byteLength),
      },
    })
  } catch {
    // Audio failed — still return the roast text
    return new NextResponse(new Uint8Array(0), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Roast-Text': encodeURIComponent(roastText),
        'X-Audio-Failed': '1',
      },
    })
  }
}
