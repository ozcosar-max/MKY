import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface VoiceAssistantProps {
  onExecuteCommand?: (command: string) => void;
  onVoiceNoteCaptured?: (text: string) => void;
  mode: 'command' | 'note';
  placeholder?: string;
}

export function VoiceAssistant({
  onExecuteCommand,
  onVoiceNoteCaptured,
  mode,
  placeholder = "Sesinizi kaydetmek için mikrofona tıklayın..."
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimResult, setInterimResult] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setErrorMsg("Tarayıcınız veya cihazınız Türkçe ses tanıma özelliğini desteklemiyor.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Önceki tanıma durdurulurken hata:", err);
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'tr-TR'; // Türkçe desteği
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setInterimResult('');
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript(final);
        }
        setInterimResult(interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg("Mikrofon izni reddedildi. Lütfen cihaz ayarlarından mikrofon erişimine izin verin.");
        } else if (event.error === 'no-speech') {
          setErrorMsg("Konuşma algılanamadı. Lütfen tekrar deneyin.");
        } else {
          setErrorMsg(`Mikrofon hatası: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setErrorMsg("Ses tanıma sistemi başlatılamadı.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
      setIsListening(false);
    }
  };

  // Ses tam metin haline gelince tetikleme
  useEffect(() => {
    if (!isListening && transcript.trim() !== '') {
      if (mode === 'command' && onExecuteCommand) {
        onExecuteCommand(transcript.toLowerCase().trim());
      } else if (mode === 'note' && onVoiceNoteCaptured) {
        onVoiceNoteCaptured(transcript.trim());
      }
    }
  }, [isListening, transcript]);

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-zinc-950/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider font-display text-slate-700 dark:text-zinc-300">
            {mode === 'command' ? 'Türkçe Sesli Komut Asistanı' : 'Sesli Toplantı Notu Diktesi'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20'
              : mode === 'command'
              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg'
          }`}
          title={isListening ? "Kaydı Durdur" : "Ses kaydına başla"}
        >
          {isListening ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
              <MicOff className="w-5.5 h-5.5 relative z-10" />
            </div>
          ) : (
            <Mic className="w-5.5 h-5.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isListening ? (
            <div className="space-y-1">
              <p className="text-xs font-bold text-red-500 dark:text-red-400 animate-pulse flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                Dinleniyor... (Türkçe)
              </p>
              <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium italic truncate">
                {interimResult || transcript || 'Konuşun...'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                {placeholder}
              </p>
              {transcript && (
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1 line-clamp-1">
                  Algılanan: <span className="italic">"{transcript}"</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="text-[11px] font-semibold text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
          {errorMsg}
        </div>
      )}

      {mode === 'command' && (
        <div className="text-[10px] text-slate-500 dark:text-zinc-500 space-y-1 pt-1">
          <div className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold uppercase">Desteklenen Komut Örnekleri:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pl-4 font-mono font-medium">
            <div className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-teal-600" />
              <span>ziyaret oluştur</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-teal-600" />
              <span>müşterileri göster</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-teal-600" />
              <span>bugün / özet göster</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
