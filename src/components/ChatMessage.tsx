import React, { useState, useRef } from 'react';
import { Message, Lawyer } from '../types';

interface ChatMessageProps {
  message: Message;
  onSuggestionClick?: (suggestion: string) => void;
  onLawyerSchedule?: (lawyer: Lawyer) => void;
  onLawyerContact?: (lawyer: Lawyer) => void;
  onPlayTTS?: (text: string) => Promise<string | null>;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSuggestionClick,
  onLawyerSchedule,
  onLawyerContact,
  onPlayTTS,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayVoice = async () => {
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      setAudioLoading(true);

      // If we already have audio or get it from server
      let audioSource = message.audioUrl;
      if (!audioSource && onPlayTTS) {
        audioSource = await onPlayTTS(message.content) || undefined;
      }

      if (audioSource) {
        if (!audioRef.current) {
          audioRef.current = new Audio(audioSource);
          audioRef.current.onended = () => setIsPlayingAudio(false);
          audioRef.current.onerror = () => {
            fallbackSpeech(message.content);
          };
        } else {
          audioRef.current.src = audioSource;
        }
        await audioRef.current.play();
        setIsPlayingAudio(true);
      } else {
        fallbackSpeech(message.content);
      }
    } catch {
      fallbackSpeech(message.content);
    } finally {
      setAudioLoading(false);
    }
  };

  const fallbackSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`>]/g, '').slice(0, 450);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-PT'; // Closest standard Portuguese voice available on browser engines
    utterance.rate = 1.0;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  // User Message
  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-1">
        {message.attachedDoc && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-200/70 border border-slate-300/80 rounded-lg text-xs text-slate-700 max-w-xl">
            <span className="material-symbols-outlined text-[16px]">attach_file</span>
            <span className="font-medium truncate">{message.attachedDoc.name}</span>
            {message.attachedDoc.size && (
              <span className="text-[10px] text-slate-500 font-mono">({message.attachedDoc.size})</span>
            )}
          </div>
        )}
        <div className="bg-slate-100 border border-slate-200/70 text-slate-900 px-4 py-3 rounded-2xl rounded-tr-xs max-w-xl text-sm leading-relaxed shadow-2xs">
          {message.content}
        </div>
        <span className="text-[11px] text-slate-400 mr-1">{message.timestamp}</span>
      </div>
    );
  }

  // DirIA Assistant Message
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      {/* DirIA Avatar */}
      <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white p-1 shadow-2xs shrink-0 mt-0.5 overflow-hidden">
        <img
          alt="DirIA"
          className="w-full h-full object-contain"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG5DfPJmd2GGvB2GytkJPcDKrgEU4_Lwb_2_DcfxfvS50quXXng8d_L7_6PuC_8X9U-7osykQvNWw2yYNxN_craMokqB2qhkzn7euot8pY-yB17AQa-bBCiOo9_3Wyxpr2Z5WtUX3j9sZ9fmqj0xrQ0BYXEdmj1yoU8hDlSkNHxHbJIGsTeiD_1G8Jt3uP1h33RJ7cPo3Hn8pIq2Px4NeJZpql28khefknnza2cKUrtKd8I1aHOOwB"
        />
      </div>

      <div className="flex-1 space-y-3.5 max-w-3xl min-w-0">
        {/* DirIA Name and Tag */}
        <div className="flex items-center gap-2">
          <span className="font-headline font-semibold text-slate-900 text-sm">DirIA</span>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full">
            {message.complexity ? `Parecer • Complexidade ${message.complexity}` : 'IA Jurídica • Base OAA'}
          </span>
          <span className="text-[11px] text-slate-400 ml-auto hidden sm:inline">{message.timestamp}</span>
        </div>

        {/* Message Body */}
        <div className="text-sm text-slate-800 leading-relaxed space-y-2 whitespace-pre-line">
          {message.content}
        </div>

        {/* Legal Citation Callout */}
        {message.citation && (
          <div className="border-l-2 border-slate-900 bg-white rounded-r-lg p-3.5 text-xs text-slate-700 shadow-2xs border border-y-slate-100 border-r-slate-100 space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>{message.citation.law}</span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                {message.citation.article}
              </span>
            </div>
            <p className="text-slate-800 italic leading-relaxed">
              “{message.citation.text}”
            </p>
          </div>
        )}

        {/* Inline Audio Player (PT-AO Voice) */}
        <div className="pt-0.5">
          <button
            onClick={handlePlayVoice}
            disabled={audioLoading}
            className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs shadow-2xs transition-all cursor-pointer group ${
              isPlayingAudio
                ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                isPlayingAudio ? 'bg-amber-700 text-white' : 'bg-slate-900 text-white'
              }`}
            >
              {audioLoading ? (
                <span className="inline-block w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span
                  className="material-symbols-outlined text-[13px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isPlayingAudio ? 'pause' : 'play_arrow'}
                </span>
              )}
            </span>
            <span className="font-medium">
              {isPlayingAudio ? 'A reproduzir resposta' : 'Ouvir resposta (Voz PT-AO)'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {message.audioDuration || '0:24'}
            </span>
          </button>
        </div>

        {/* Lawyer Advisory Recommendation Card */}
        {message.lawyers && message.lawyers.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-semibold text-slate-900 text-sm">
                    Recomendação de Patrocínio Forense
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      message.complexity === 'Elevada'
                        ? 'text-amber-800 bg-amber-50 border-amber-200'
                        : 'text-slate-700 bg-slate-100 border-slate-200'
                    }`}
                  >
                    {message.complexity === 'Elevada' ? 'Complexidade Elevada' : 'Especialistas Recomendados'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Havendo retenção documental e litígio iminente, é recomendável consulta com advogado credenciado na Ordem dos Advogados de Angola (OAA) para instauração de providência ou reclamação na Sala de Trabalho.
                </p>
              </div>
            </div>

            {/* Streamlined Lawyer Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {message.lawyers.map((lawyer) => (
                <div
                  key={lawyer.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                      <img
                        className="w-full h-full object-cover"
                        alt={lawyer.name}
                        src={lawyer.photoUrl}
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {lawyer.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        Cédula OAA n.º {lawyer.oaaNumber} • {lawyer.location}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium truncate">
                        {lawyer.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onLawyerSchedule?.(lawyer)}
                      className="flex-1 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                      <span>Agendar Consulta</span>
                    </button>
                    <button
                      onClick={() => onLawyerContact?.(lawyer)}
                      className="px-2.5 h-8 rounded-lg border border-slate-300 hover:bg-white text-slate-800 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Contacto directo"
                    >
                      <span className="material-symbols-outlined text-[15px]">call</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contextual Suggestion Chips */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Sugestões:</span>
            {message.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs transition-colors cursor-pointer shadow-2xs"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
