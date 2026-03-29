'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  onSubmit: (transcript: string) => void
}

export default function WebcamRecorder({ onSubmit }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef('')

  const [transcript, setTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null) // null = unknown yet
  const [micError, setMicError] = useState<string | null>(null)
  const [camError, setCamError] = useState(false)

  useEffect(() => {
    // Start webcam (video only)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => setCamError(true))

    // Check for Web Speech API
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false)
      return
    }

    setSpeechSupported(true)

    function startRecognition() {
      const recognition = new SpeechRecognitionAPI!()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsRecording(true)
        setMicError(null)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let full = ''
        for (let i = 0; i < event.results.length; i++) {
          full += event.results[i][0].transcript
        }
        transcriptRef.current = full
        setTranscript(full)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'not-allowed') {
          setMicError('Microphone permission denied. Allow mic access in your browser and refresh.')
          setSpeechSupported(false)
        } else if (event.error === 'no-speech') {
          // Normal — just no speech detected, will restart via onend
        } else {
          setMicError(`Speech error: ${event.error}`)
        }
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
        // Auto-restart so it doesn't stop after a pause
        if (recognitionRef.current === recognition) {
          try { recognition.start() } catch { /* already started */ }
        }
      }

      recognition.start()
      recognitionRef.current = recognition
    }

    startRecognition()

    return () => {
      const r = recognitionRef.current
      recognitionRef.current = null // prevents onend restart
      r?.stop()
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  function handleSubmit() {
    const r = recognitionRef.current
    recognitionRef.current = null // prevents onend from restarting
    r?.stop()
    onSubmit(transcriptRef.current.trim() || 'I have no excuse')
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Webcam */}
      <div className="relative w-full max-w-md aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700">
        {camError ? (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
            Camera unavailable
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}

        {/* Recording indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 rounded-full px-2 py-1">
          <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse-fast' : 'bg-zinc-600'}`} />
          <span className="text-xs text-white font-mono">
            {isRecording ? 'REC' : speechSupported === null ? '...' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Speech transcript or fallback */}
      {micError ? (
        <div className="w-full max-w-md bg-red-950 border border-red-700 rounded-lg p-3 text-red-300 text-sm font-mono">
          {micError}
        </div>
      ) : speechSupported === false ? (
        <textarea
          className="w-full max-w-md h-24 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white text-sm font-mono resize-none focus:outline-none focus:border-red-500"
          placeholder="Speech recognition unavailable (use Chrome). Type your excuse..."
          value={transcript}
          onChange={(e) => {
            transcriptRef.current = e.target.value
            setTranscript(e.target.value)
          }}
        />
      ) : (
        <div className="w-full max-w-md min-h-[80px] bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white text-sm font-mono leading-relaxed">
          {transcript || (
            <span className="text-zinc-500">
              {speechSupported === null
                ? 'Requesting microphone access...'
                : 'Start talking — your excuse will appear here...'}
            </span>
          )}
        </div>
      )}

      <button onClick={handleSubmit} className="btn-danger w-full max-w-md">
        THAT&apos;S MY EXCUSE — ANALYZE ME
      </button>
    </div>
  )
}
