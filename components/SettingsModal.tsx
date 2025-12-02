
import React from 'react';
import { X, Globe, Palette, Bell, Key } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { translations } from '../translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  currentLang: Language;
  setLang: (l: Language) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, currentTheme, setTheme, currentLang, setLang, apiKey, setApiKey
}) => {
  if (!isOpen) return null;

  const t = translations[currentLang];

  const themes: {id: ThemeMode, label: string, color: string}[] = [
    { id: 'arknights', label: t.styleArk, color: 'bg-[#0f172a]' },
    { id: 'cartoon', label: t.styleToon, color: 'bg-[#fff7ed]' },
    { id: 'cyberpunk', label: t.styleCyber, color: 'bg-[#000000]' },
    { id: 'nature', label: t.styleNature, color: 'bg-[#fefae0]' },
  ];

  const langs: {id: Language, label: string}[] = [
    { id: 'zh-CN', label: '简体中文' },
    { id: 'zh-TW', label: '繁體中文' },
    { id: 'en', label: 'English' },
  ];

  const requestNotification = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if(permission === 'granted') {
          alert("Notification Granted! / 通知权限已获取");
        }
      });
    }
  };

  const isArk = currentTheme === 'arknights';
  const isCyber = currentTheme === 'cyberpunk';
  
  let modalClass = '';
  let inputClass = '';
  
  if (currentTheme === 'arknights') {
    modalClass = 'bg-ark-surface border-2 border-ark-primary text-white';
    inputClass = 'bg-ark-bg border border-ark-muted text-white';
  } else if (currentTheme === 'cyberpunk') {
    modalClass = 'bg-black border-2 border-[#f0f] text-[#0ff] shadow-[0_0_20px_#f0f]';
    inputClass = 'bg-[#111] border border-[#333] text-[#0ff]';
  } else if (currentTheme === 'nature') {
    modalClass = 'bg-[#faedcd] border-2 border-[#ccd5ae] text-[#354f52]';
    inputClass = 'bg-[#fefae0] border border-[#d4a373]';
  } else {
    modalClass = 'bg-white rounded-3xl text-gray-800';
    inputClass = 'bg-gray-50 border border-gray-200';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-sm p-6 animate-in zoom-in duration-200 ${modalClass} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {t.settings}
          </h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Theme Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold opacity-70 mb-3 flex items-center gap-2">
            <Palette size={16} /> {t.theme}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {themes.map(th => (
              <button
                key={th.id}
                onClick={() => setTheme(th.id)}
                className={`
                  p-3 rounded-lg flex items-center gap-2 border transition-all
                  ${currentTheme === th.id ? 'border-current ring-2 ring-opacity-50' : 'border-transparent opacity-60 hover:opacity-100'}
                `}
              >
                <div className={`w-4 h-4 rounded-full border border-gray-500 ${th.color}`}></div>
                <span className="text-sm font-bold">{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold opacity-70 mb-3 flex items-center gap-2">
            <Globe size={16} /> {t.language}
          </h3>
          <div className="flex flex-wrap gap-2">
            {langs.map(l => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`
                  px-4 py-2 text-xs font-bold rounded-full border transition-all
                  ${currentLang === l.id 
                    ? (isArk || isCyber ? 'bg-white text-black' : 'bg-black text-white') 
                    : 'border-current opacity-50'}
                `}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* API Key Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold opacity-70 mb-3 flex items-center gap-2">
            <Key size={16} /> {t.aiConfig}
          </h3>
          <input 
            type="password" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t.apiKeyPlaceholder}
            className={`w-full p-3 rounded text-sm outline-none transition-all ${inputClass}`}
          />
          <p className="text-[10px] mt-2 opacity-60">{t.apiKeyHelp}</p>
        </div>

        {/* Notification Permission */}
        <button 
          onClick={requestNotification}
          className="w-full py-3 mt-2 flex items-center justify-center gap-2 font-bold opacity-70 hover:opacity-100 border border-dashed border-current rounded-xl"
        >
          <Bell size={16} /> {t.enableNotify}
        </button>

      </div>
    </div>
  );
};

export default SettingsModal;
