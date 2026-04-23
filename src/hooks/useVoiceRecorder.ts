import { useState, useRef, useCallback } from 'react';

// Language code mapping for Whisper API (uses ISO 639-1 codes)
const WHISPER_LANGUAGE_MAP: Record<string, string> = {
  'en': 'en',
  'hi': 'hi',
  'ta': 'ta',
  'te': 'te',
  'bn': 'bn',
  'mr': 'mr',
  'gu': 'gu',
  'kn': 'kn',
  'ml': 'ml',
  'pa': 'pa',
};

interface UseVoiceRecorderOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

export function useVoiceRecorder({ onTranscription, onError, language = 'en' }: UseVoiceRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const languageRef = useRef(language);

  // Keep language ref updated
  languageRef.current = language;

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        if (chunksRef.current.length === 0) {
          onError?.('No audio recorded');
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          
          setIsTranscribing(true);
          try {
            // Get the Whisper language code
            const whisperLang = WHISPER_LANGUAGE_MAP[languageRef.current] || 'en';
            
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-to-text`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({ 
                  audio: base64,
                  language: whisperLang 
                }),
              }
            );

            const data = await response.json();
            
            if (data.error) {
              throw new Error(data.error);
            }

            if (data.text) {
              onTranscription?.(data.text);
            }
          } catch (err) {
            console.error('Transcription error:', err);
            onError?.(err instanceof Error ? err.message : 'Failed to transcribe audio');
          } finally {
            setIsTranscribing(false);
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      onError?.('Failed to access microphone. Please allow microphone permissions.');
    }
  }, [onTranscription, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
