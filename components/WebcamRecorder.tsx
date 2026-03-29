'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  onSubmit: (transcript: string) => void
}

/**
 * Shows live webcam feed (video only — no audio track, avoids mic permission noise).
 * Uses Web Speech API for live transcript. Falls back to a textarea if unsupported.
 * onSubmit fires with the final transcript when user clicks "THAT'S MY EXCUSE".
 */
export default function WebcamRecorder({ onSubmit }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [transcript, setTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)
  const [camError, setCamError] = useState(false)

  useEffect(() => {
    // Start webcam
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch(() => setCamError(true))

    // Start speech recognition
    const SpeechRecognitionAPI =
      (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let full = ''
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript
      }
      setTranscript(full)
    }

    recognition.onstart = () => setIsRecording(true)
    recognition.onend = () => setIsRecording(false)

    recognition.start()
    recognitionRef.current = recognition

    return () => {
      recognition.stop()
      // Stop webcam tracks on unmount
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  function handleSubmit() {
    recognitionRef.current?.stop()
    const finalText = transcript.trim() || 'I have no excuse'
    onSubmit(finalText)
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
        {isRecording && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 rounded-full px-2 py-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-fast" />
            <span className="text-xs text-white font-mono">REC</span>
          </div>
        )}
      </div>

      {/* Transcript */}
      {speechSupported ? (
        <div className="w-full max-w-md min-h-[80px] bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white text-sm font-mono leading-relaxed">
          {transcript || (
            <span className="text-zinc-500">Start talking — your excuse will appear here...</span>
          )}
        </div>
      ) : (
        <textarea
          className="w-full max-w-md h-24 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white text-sm font-mono resize-none focus:outline-none focus:border-red-500"
          placeholder="Speech recognition not available. Type your excuse..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
      )}

      <button
        onClick={handleSubmit}
        className="btn-danger w-full max-w-md"
      >
        THAT&apos;S MY EXCUSE — ANALYZE ME
      </button>
    </div>
  )
}
