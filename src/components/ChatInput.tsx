import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string, attachedDoc?: { name: string; content?: string; size?: string }) => void;
  isLoading: boolean;
  isSidebarCollapsed?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  isSidebarCollapsed,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content?: string; size?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Setup Web Speech Recognition for Portuguese if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-PT';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoice = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch {
          setIsRecording(false);
        }
      } else {
        setIsRecording(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      setAttachedFile({
        name: file.name,
        size: sizeStr,
        content: content.slice(0, 10000), // excerpt for API prompt
      });
    };

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      // Fallback read as data or summary
      reader.readAsText(file);
    }
    // Reset file input
    e.target.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || isLoading) return;

    onSendMessage(inputText.trim(), attachedFile || undefined);
    setInputText('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#fafafa] via-[#fafafa]/95 to-transparent pt-6 pb-4 px-4 sm:px-6 pointer-events-none z-10 transition-all duration-300 ease-in-out">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        {/* Attached file chip */}
        {attachedFile && (
          <div className="mb-2 flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl shadow-xs text-xs text-slate-700 animate-fadeIn">
            <div className="flex items-center gap-2 truncate">
              <span className="material-symbols-outlined text-[16px] text-amber-700">description</span>
              <span className="font-medium truncate">{attachedFile.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({attachedFile.size})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Remover anexo"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 p-2 sm:p-2.5 flex items-center gap-2 transition-all focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Anexar contrato, notificação ou documento"
          >
            <span className="material-symbols-outlined text-[20px]">attach_file</span>
          </button>

          {/* Input field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              isRecording
                ? 'A escutar... fale agora em português...'
                : 'Consulte sobre leis, direitos ou proceda com o caso...'
            }
            className="flex-1 bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 px-1 py-1.5 min-w-0"
          />

          {/* Voice PT-AO Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title="Falar por voz (PT-AO)"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isRecording ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              mic
            </span>
          </button>

          {/* Sleek Send Button */}
          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !attachedFile)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform active:scale-95 shrink-0 cursor-pointer ${
              isLoading || (!inputText.trim() && !attachedFile)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
            }`}
            title="Enviar mensagem"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            )}
          </button>
        </form>

        {/* Subtle Legal Disclaimer */}
        <p className="text-center text-[11px] text-slate-400 mt-2 font-normal select-none">
          DirIA Angola — Carácter informativo e pedagógico. Não substitui consulta jurídica formal com advogado da OAA.
        </p>
      </div>
    </div>
  );
};
