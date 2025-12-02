
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ThemeMode, Language, ChatMessage } from '../types';
import { translations } from '../translations';
import PetAvatar from './PetAvatar';
import { generateId } from '../utils';

interface PetChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  language: Language;
  petName: string;
  setPetName: (name: string) => void;
  history: ChatMessage[];
  setHistory: (h: ChatMessage[]) => void;
  apiKey: string;
}

const PetChatModal: React.FC<PetChatModalProps> = ({
  isOpen, onClose, theme, language, petName, setPetName, history, setHistory, apiKey
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  if (!isOpen) return null;

  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  let modalClass = '';
  let bubbleUser = '';
  let bubbleAi = '';
  let inputClass = '';
  let btnClass = '';

  if (isArk) {
    modalClass = 'bg-ark-bg text-ark-text';
    bubbleUser = 'bg-ark-primary text-black rounded-tr-none';
    bubbleAi = 'bg-ark-surface border border-ark-primary/50 rounded-tl-none';
    inputClass = 'bg-ark-surface border-ark-muted text-white';
    btnClass = 'bg-ark-primary text-black';
  } else if (isCyber) {
    modalClass = 'bg-black text-[#0ff]';
    bubbleUser = 'bg-[#f0f] text-black rounded-none shadow-[2px_2px_0_white]';
    bubbleAi = 'bg-[#111] border border-[#0ff] rounded-none shadow-[-2px_2px_0_#0ff]';
    inputClass = 'bg-[#111] border-[#333] text-[#0ff]';
    btnClass = 'bg-[#0ff] text-black';
  } else if (isNature) {
    modalClass = 'bg-[#fefae0] text-[#354f52]';
    bubbleUser = 'bg-[#606c38] text-[#fefae0] rounded-2xl rounded-br-none';
    bubbleAi = 'bg-[#faedcd] border border-[#ccd5ae] rounded-2xl rounded-bl-none';
    inputClass = 'bg-[#faedcd] border-[#d4a373]';
    btnClass = 'bg-[#606c38] text-[#fefae0]';
  } else {
    modalClass = 'bg-white text-gray-800';
    bubbleUser = 'bg-toon-primary text-white rounded-2xl rounded-br-none';
    bubbleAi = 'bg-gray-100 text-gray-600 rounded-2xl rounded-bl-none';
    inputClass = 'bg-gray-50 border-gray-200';
    btnClass = 'bg-toon-primary text-white';
  }

  const getSystemPrompt = () => {
    const base = `You are a virtual pet named ${petName} in a daily planner app. The user speaks ${language}. Keep responses short (under 40 words).`;
    if (isArk) return `${base} Persona: Tactical Drone 'PRTS'. Robotic, precise, military style. Calls user 'Doctor'.`;
    if (isCyber) return `${base} Persona: Glitchy Ghost. Stutters slightly (l-like t-this), nervous, talks about data and cyberspace.`;
    if (isNature) return `${base} Persona: Slime Spirit. Cheerful, bouncy, loves nature/sunlight/water. Uses onomatopoeia like 'Bloop!'.`;
    return `${base} Persona: Lazy Cat. Arrogant but cute. Meows occasionally. Wants food or sleep.`;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      sender: 'user',
      text: inputText,
      timestamp: Date.now()
    };
    
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const activeKey = apiKey || process.env.API_KEY;
      if (activeKey) {
        const ai = new GoogleGenAI({ apiKey: activeKey });
        
        // Construct chat history text
        const context = newHistory.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');
        
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
              role: 'user',
              parts: [{ text: context }]
            },
            config: { systemInstruction: getSystemPrompt() }
        });

        const aiMsg: ChatMessage = {
            id: generateId(),
            sender: 'ai',
            text: result.text || "...",
            timestamp: Date.now()
        };
        setHistory([...newHistory, aiMsg]);
      } else {
        // Fallback simulation if no API key
        setTimeout(() => {
            const aiMsg: ChatMessage = {
                id: generateId(),
                sender: 'ai',
                text: isArk ? "ERROR: API Key Missing. Please set in Settings." : "Meow? (Please set API Key in Settings!)",
                timestamp: Date.now()
            };
            setHistory([...newHistory, aiMsg]);
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = { id: generateId(), sender: 'ai', text: 'Error connecting to neural net...', timestamp: Date.now() };
      setHistory([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[70] flex flex-col ${modalClass} animate-slide-in-bottom duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-500/10">
        <div className="flex items-center gap-2">
            <input 
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className={`bg-transparent font-bold text-lg outline-none border-b border-dashed border-current w-32`}
              placeholder={t.petName}
            />
            <span className="text-xs opacity-50">({t.petName})</span>
        </div>
        <button onClick={onClose} className="p-2"><X /></button>
      </div>

      {/* Pet Visual Area */}
      <div className="h-48 flex items-center justify-center relative border-b border-gray-500/10 shrink-0">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-current"></div>
          <PetAvatar theme={theme} action="idle" className="w-40 h-40" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {history.length === 0 && (
           <div className="text-center opacity-50 mt-10 text-sm italic">
             {t.chatWithPet}
           </div>
        )}
        {history.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[80%] px-4 py-2 text-sm ${msg.sender === 'user' ? bubbleUser : bubbleAi}`}>
               {msg.text}
             </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className={`px-4 py-2 text-sm ${bubbleAi} flex gap-1 items-center`}>
                <Sparkles size={12} className="animate-spin" /> ...
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-500/10 pb-8">
         <div className="flex gap-2">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.typeMessage}
              className={`flex-1 p-3 rounded outline-none border ${inputClass}`}
            />
            <button 
              onClick={handleSend}
              className={`p-3 rounded transition-transform active:scale-95 ${btnClass}`}
            >
              <Send size={20} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default PetChatModal;
