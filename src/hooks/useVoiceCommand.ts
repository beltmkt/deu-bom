import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type SpeechRecognitionEventResult = {
  transcript: string;
};

type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionEventResult> & {
  isFinal: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface VoiceCommandOptions {
  onTranscript: (transcript: string) => void;
}

export const useVoiceCommand = ({ onTranscript }: VoiceCommandOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const lastTranscriptRef = useRef('');
  const dispatchedRef = useRef(false);

  const Recognition = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
  }, []);

  const isSupported = Boolean(Recognition);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!Recognition) {
      toast.error('Reconhecimento de voz nao esta disponivel neste navegador.');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    setLastTranscript('');
    lastTranscriptRef.current = '';
    dispatchedRef.current = false;
    recognition.onstart = () => undefined;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript?.trim() || '';
        if (!transcript) continue;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const transcript = (finalTranscript || interimTranscript).trim();
      if (transcript) {
        lastTranscriptRef.current = transcript;
        setLastTranscript(transcript);
      }

      if (finalTranscript.trim()) {
        dispatchedRef.current = true;
        onTranscript(finalTranscript.trim());
      } else if (!transcript) {
        toast.error('Nao consegui entender o comando.');
      }
    };

    recognition.onerror = (event) => {
      const messageByError: Record<string, string> = {
        'audio-capture': 'Nao encontrei um microfone ativo neste aparelho.',
        'not-allowed': 'Permissao do microfone bloqueada. Libere o microfone no navegador.',
        'no-speech': 'Nao detectei fala. Tente tocar no microfone e falar mais perto.',
        network: 'O reconhecimento de voz precisa de conexao com a internet neste navegador.',
        aborted: 'Escuta cancelada.',
      };

      const message =
        messageByError[event.error] || 'Nao consegui ouvir agora. Tente novamente.';

      if (event.error !== 'aborted') {
        toast.error(message);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (!dispatchedRef.current && lastTranscriptRef.current) {
        dispatchedRef.current = true;
        onTranscript(lastTranscriptRef.current);
      }

      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [Recognition, onTranscript]);

  return {
    isListening,
    isSupported,
    lastTranscript,
    startListening,
    stopListening,
  };
};
