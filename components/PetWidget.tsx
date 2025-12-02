
import React, { useState } from 'react';
import { Trophy, Crown, Sparkles, MessageCircle } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { translations } from '../translations';
import PetAvatar, { PetMood } from './PetAvatar';

interface PetWidgetProps {
  totalCompleted: number;
  theme: ThemeMode;
  language: Language;
  onChatClick?: () => void;
  petName?: string;
}

const PetWidget: React.FC<PetWidgetProps> = ({ totalCompleted, theme, language, onChatClick, petName = 'Pet' }) => {
  const level = Math.floor(totalCompleted / 5) + 1;
  const progress = totalCompleted % 5;
  const t = translations[language];
  const [clickCount, setClickCount] = useState(0);

  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  // Styling
  let containerClass = '';
  let barBg = '';
  let barFill = '';
  let textColor = '';

  if (isArk) {
    containerClass = 'bg-ark-surface border-l-4 border-ark-primary relative overflow-hidden';
    barBg = 'bg-gray-700';
    barFill = 'bg-ark-primary';
    textColor = 'text-ark-text';
  } else if (isCyber) {
    containerClass = 'bg-black border border-[#0ff] relative overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.2)]';
    barBg = 'bg-[#111] border border-[#333]';
    barFill = 'bg-[#f0f] shadow-[0_0_10px_#f0f]';
    textColor = 'text-[#0ff]';
  } else if (isNature) {
    containerClass = 'bg-[#e9edc9] rounded-3xl border-2 border-[#ccd5ae]';
    barBg = 'bg-[#faedcd]';
    barFill = 'bg-[#606c38]';
    textColor = 'text-[#354f52]';
  } else {
    // Cartoon
    containerClass = 'bg-white rounded-3xl border-2 border-orange-100 shadow-xl';
    barBg = 'bg-gray-100';
    barFill = 'bg-orange-400';
    textColor = 'text-gray-600';
  }

  return (
    <div className={`p-4 mb-6 transition-all duration-300 ${containerClass}`}>
      {/* Background Decor */}
      {isArk && <div className="absolute top-0 right-0 p-2 text-[100px] leading-none opacity-5 font-bold select-none">ARK</div>}
      
      <div className="flex items-center gap-4 relative z-10">
        
        {/* Avatar Container */}
        <div 
           className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center cursor-pointer group"
           onClick={() => { setClickCount(c => c + 1); if(onChatClick) onChatClick(); }}
        >
          <div className={`transition-opacity duration-500 opacity-100 scale-100`}>
            <PetAvatar 
              action="idle"
              mood={clickCount > 3 ? 'excited' : 'neutral'}
              theme={theme}
              className="w-32 h-32" 
            />
          </div>

          <div className="absolute bottom-0 right-0 bg-white text-black p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
             <MessageCircle size={16} />
          </div>

          {level >= 5 && (
            <div className="absolute top-0 right-0 animate-bounce">
              <Crown size={20} className="text-yellow-500 fill-yellow-500" />
            </div>
          )}
        </div>
        
        {/* Stats Area */}
        <div className={`flex-1 ${textColor}`}>
          <div className="flex justify-between items-center mb-1">
             <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {petName} <span className="text-xs opacity-60 font-normal">(Lv.{level})</span>
                </h3>
                <p className="text-xs opacity-60 font-mono">
                  {theme === 'arknights' ? 'Drone Standby' : (theme === 'cyberpunk' ? 'Ghost Online' : 'Status: Happy')}
                </p>
             </div>
          </div>
          
          {/* Experience Bar */}
          <div className="relative pt-2">
            <div className={`h-4 w-full rounded-full overflow-hidden ${barBg}`}>
              <div 
                className={`h-full transition-all duration-700 ease-out ${barFill}`}
                style={{ width: `${(progress / 5) * 100}%` }}
              />
            </div>
            
            {/* Markers */}
            <div className="flex justify-between mt-1 text-[10px] opacity-60 font-bold">
              <span>EXP</span>
              <span className="flex items-center gap-1">
                {progress} / 5 <Sparkles size={10} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetWidget;
