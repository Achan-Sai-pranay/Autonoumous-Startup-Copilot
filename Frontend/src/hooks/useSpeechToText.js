// hooks/useSpeechToText.js
// ---------------------------------------------------------------------------
// Thin wrapper around the browser's native Web Speech API (SpeechRecognition)
// for voice-to-text input. No dependencies, no API key — runs entirely in
// the browser. Only Chrome/Edge (and partially Safari) support this;
// unsupported browsers get `isSupported: false` so callers can hide the
// mic button instead of showing something broken.
// ---------------------------------------------------------------------------
import { useState, useRef, useCallback, useEffect } from "react";

export function useSpeechToText({ onResult } = {}) {
  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const isSupported = Boolean(SpeechRecognition);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript.trim()) {
        onResult?.(transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Microphone access was denied."
          : "Voice input hit an error. Try again."
      );
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setError("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // start() throws if called while already running — safe to ignore.
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  return { isSupported, isListening, error, toggleListening };
}