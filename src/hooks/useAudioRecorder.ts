import { useState, useCallback, useRef } from 'react';

export interface UseAudioRecorderReturn {
    isRecording: boolean;
    recordingTime: number;
    audioBlob: Blob | null;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    resetRecording: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Prefer webm/opus or webm/codecs=opus for best compatibility with Gemini
            let mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/webm';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    // Fallback for Safari (often mp4 or wav depending on version, but mp4 is safer for MediaRecorder)
                    mimeType = 'audio/mp4';
                }
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setAudioBlob(blob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setError(null);
            setAudioBlob(null);

            // Start timer
            const startTime = Date.now();
            timerRef.current = setInterval(() => {
                setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);

        } catch (err: any) {
            console.error('Error starting recording:', err);
            setError(err.name || 'NotAllowedError');
            setIsRecording(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, []);

    const resetRecording = useCallback(() => {
        setAudioBlob(null);
        setRecordingTime(0);
        setError(null);
    }, []);

    return {
        isRecording,
        recordingTime,
        audioBlob,
        error,
        startRecording,
        stopRecording,
        resetRecording
    };
}

export default useAudioRecorder;
