import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
    confidence: number;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

// Extend Window interface for SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// Minimal types for SpeechRecognition API
type SpeechRecognition = any;
type SpeechRecognitionEvent = any;
type SpeechRecognitionErrorEvent = any;

export function useSpeechRecognition(lang: string = 'en-US'): UseSpeechRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Check if browser supports Speech Recognition
    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    useEffect(() => {
        if (!isSupported) return;

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();

        recognition.continuous = false; // Stop after first result
        recognition.interimResults = true; // Show interim results
        recognition.lang = lang;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';
            let finalConfidence = 0;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                    finalConfidence = result[0].confidence;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(finalTranscript.trim());
                setConfidence(finalConfidence);
            } else if (interimTranscript) {
                setTranscript(interimTranscript.trim());
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            const errorDetails = {
                error: event.error,
                message: (event as any).message || 'No additional message',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                language: lang
            };
            console.error('[SpeechRecognition] Error detected:', errorDetails);
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, [isSupported, lang]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported) {
            console.error('[SpeechRecognition] Cannot start: Not supported or not initialized');
            return;
        }

        if (isListening) {
            console.warn('[SpeechRecognition] Already listening, ignoring start request');
            return;
        }

        setError(null);
        setTranscript('');
        setConfidence(0);

        try {
            recognitionRef.current.start();
        } catch (err: any) {
            if (err.name === 'InvalidStateError') {
                // Recognition is already running or in a transitional state
                console.warn('[SpeechRecognition] InvalidStateError on start, attempting to abort and restart...');
                recognitionRef.current.abort();
                setTimeout(() => {
                    try {
                        recognitionRef.current?.start();
                    } catch (retryErr) {
                        console.error('[SpeechRecognition] Retry start failed:', retryErr);
                    }
                }, 200);
            } else {
                console.error('[SpeechRecognition] Unexpected start error:', err);
                setError('start-failed');
            }
        }
    }, [isListening, isSupported]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.stop();
        } catch (err) {
            console.warn('[SpeechRecognition] Stop error (likely already stopped):', err);
            recognitionRef.current.abort();
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setConfidence(0);
        setError(null);
    }, []);

    return {
        isListening,
        isSupported,
        transcript,
        confidence,
        error,
        startListening,
        stopListening,
        resetTranscript,
    };
}

export default useSpeechRecognition;
