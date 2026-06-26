import { useEffect, useRef, useCallback } from 'react';

export type VoiceState = 'idle' | 'speaking' | 'listening' | 'thinking';

interface UseVoiceInterviewOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onStateChange?: (state: VoiceState) => void;
}

export function useVoiceInterview({ onTranscript, onStateChange }: UseVoiceInterviewOptions = {}) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const stateRef = useRef<VoiceState>('idle');

  const setState = useCallback(
    (state: VoiceState) => {
      stateRef.current = state;
      onStateChange?.(state);
    },
    [onStateChange]
  );

  const isSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();
        setState('speaking');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) => v.name.includes('Google') || v.name.includes('Microsoft') || v.lang.startsWith('en')
        );
        if (preferred) utterance.voice = preferred;

        utterance.onend = () => {
          setState('idle');
          resolve();
        };
        utterance.onerror = () => {
          setState('idle');
          resolve();
        };

        synthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      });
    },
    [setState]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setState('idle');
  }, [setState]);

  const startListening = useCallback(() => {
    if (!isSupported) return false;

    stopSpeaking();

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => setState('listening');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      const combined = (finalTranscript + interim).trim();
      onTranscript?.(combined, !!finalTranscript.trim());
    };

    recognition.onerror = (e: Event & { error?: string }) => {
      if (e.error !== 'aborted') setState('idle');
    };

    recognition.onend = () => {
      if (stateRef.current === 'listening') setState('idle');
    };

    recognition.start();
    recognitionRef.current = recognition;
    return true;
  }, [isSupported, onTranscript, setState, stopSpeaking]);

  const stopListening = useCallback((): string => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setState('idle');
    return '';
  }, [setState]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      stopSpeaking();
      recognitionRef.current?.stop();
    };
  }, [stopSpeaking]);

  return {
    isSupported,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    setState,
  };
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
