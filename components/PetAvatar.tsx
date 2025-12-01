
import React, { useEffect, useState } from 'react';
import { ThemeMode } from '../types';

export type PetAction = 'idle' | 'walking' | 'running' | 'sitting' | 'sleeping' | 'eating' | 'pounce';
export type PetMood = 'happy' | 'neutral' | 'alert' | 'relaxed';

interface PetAvatarProps {
  action?: PetAction;
  mood?: PetMood;
  theme?: ThemeMode;
  className?: string;
  flipped?: boolean;
  onClick?: () => void;
}

const PetAvatar: React.FC<PetAvatarProps> = ({ 
  action = 'idle', 
  mood = 'neutral', 
  theme = 'cartoon',
  className, 
  flipped = false,
  onClick 
}) => {
  const [tick, setTick] = useState(0);

  // Global animation tick
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(interval);
  }, []);

  const isMoving = action === 'walking' || action === 'running';
  const isSleeping = action === 'sleeping';

  // --- 1. ARKNIGHTS: TACTICAL DRONE ---
  if (theme === 'arknights') {
    return (
      <div 
        className={`relative select-none ${className}`} 
        onClick={onClick}
        style={{ 
          transform: flipped ? 'scaleX(-1)' : 'scaleX(1)',
          transition: 'transform 0.5s ease-out'
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
          <defs>
            <linearGradient id="droneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Hover Animation */}
            <style>{`
              @keyframes hover { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
              @keyframes scan { 0%, 100% { opacity: 0.5; r: 6px; } 50% { opacity: 1; r: 8px; } }
              @keyframes wingFlap { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(5deg); } }
              @keyframes land { 0% { transform: translateY(0); } 100% { transform: translateY(40px); } }
              
              .drone-body { animation: hover 3s ease-in-out infinite; }
              .drone-eye { animation: scan 2s infinite; }
              .drone-wing-l { transform-origin: 60px 100px; animation: wingFlap 1s ease-in-out infinite alternate; }
              .drone-wing-r { transform-origin: 140px 100px; animation: wingFlap 1s ease-in-out infinite alternate-reverse; }
              
              .sleeping .drone-body { animation: none; transform: translateY(50px); }
              .sleeping .drone-wing-l { transform: rotate(-20deg); animation: none; }
              .sleeping .drone-wing-r { transform: rotate(20deg); animation: none; }
              .sleeping .drone-eye { fill: #ef4444; animation: none; opacity: 0.3; }
              
              .moving .drone-body { transform: rotate(10deg); animation: hover 1s ease-in-out infinite; }
            `}</style>
          </defs>

          <g className={`${isSleeping ? 'sleeping' : ''} ${isMoving ? 'moving' : ''}`}>
             {/* Shadow (Projected far below) */}
             <ellipse cx="100" cy="170" rx={isSleeping ? "40" : "30"} ry="5" fill="black" opacity="0.3" className="transition-all duration-500" />

             <g className="drone-body">
                {/* Left Wing */}
                <path d="M60,100 L 20,90 L 10,120 L 50,130 Z" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" className="drone-wing-l" />
                {/* Right Wing */}
                <path d="M140,100 L 180,90 L 190,120 L 150,130 Z" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" className="drone-wing-r" />

                {/* Main Hull */}
                <path d="M70,80 L 130,80 L 150,110 L 100,140 L 50,110 Z" fill="url(#droneGrad)" stroke="#06b6d4" strokeWidth="2" />
                
                {/* Eye / Sensor */}
                <circle cx="100" cy="110" r="8" fill="#06b6d4" filter="url(#glow)" className="drone-eye" />
                
                {/* Status Lights */}
                <circle cx="60" cy="110" r="2" fill={isSleeping ? "#ef4444" : "#22c55e"} />
                <circle cx="140" cy="110" r="2" fill={isSleeping ? "#ef4444" : "#22c55e"} />
             </g>
          </g>
        </svg>
      </div>
    );
  }

  // --- 2. CYBERPUNK: HOLO-GHOST ---
  if (theme === 'cyberpunk') {
    return (
      <div 
        className={`relative select-none ${className}`} 
        onClick={onClick}
        style={{ 
          transform: flipped ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          <defs>
             <filter id="glitch-glow">
                <feDropShadow dx="2" dy="0" stdDeviation="0" floodColor="#ff00ff" />
                <feDropShadow dx="-2" dy="0" stdDeviation="0" floodColor="#00ffff" />
             </filter>
             <style>{`
               @keyframes float-ghost { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
               @keyframes glitch-anim { 
                 0% { clip-path: inset(0 0 0 0); transform: translate(0); }
                 5% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 2px); }
                 10% { clip-path: inset(0 0 0 0); transform: translate(0); }
                 95% { clip-path: inset(80% 0 10% 0); transform: translate(2px, -2px); }
                 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
               }
               @keyframes fade-pulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 0.4; } }

               .ghost-body { animation: float-ghost 3s ease-in-out infinite; fill: black; stroke: #00ffff; stroke-width: 2px; filter: url(#glitch-glow); }
               .glitch-layer { animation: glitch-anim 2s infinite linear alternate-reverse; opacity: 0.7; fill: none; stroke: #ff00ff; stroke-width: 2px; }
               
               .sleeping .ghost-body { animation: fade-pulse 2s infinite; transform: scale(0.8) translateY(20px); stroke: #555; filter: none; }
               .sleeping .eyes { fill: #333; }
             `}</style>
          </defs>

          <g className={`${isSleeping ? 'sleeping' : ''}`}>
             {/* No shadow for ghosts, just a digital ripple? */}
             {!isSleeping && <ellipse cx="100" cy="160" rx="30" ry="2" fill="#00ffff" opacity="0.5" className="animate-pulse" />}

             <g className="ghost-body">
                {/* Pacman Ghost Shape */}
                <path d="M50,150 L 50,80 Q 50,30 100,30 Q 150,30 150,80 L 150,150 L 125,130 L 100,150 L 75,130 Z" />
                
                {/* Eyes (Pixelated) */}
                <rect x="70" y="70" width="15" height="15" fill="#00ffff" className="eyes" />
                <rect x="115" y="70" width="15" height="15" fill="#00ffff" className="eyes" />
                
                <rect x="78" y="74" width="6" height="6" fill="black" className="pupil" />
                <rect x="123" y="74" width="6" height="6" fill="black" className="pupil" />
             </g>
             
             {/* Glitch Overlay */}
             {!isSleeping && (
               <g className="glitch-layer">
                 <path d="M52,150 L 52,80 Q 52,30 102,30 Q 152,30 152,80 L 152,150 L 127,130 L 102,150 L 77,130 Z" />
               </g>
             )}
          </g>
        </svg>
      </div>
    );
  }

  // --- 3. NATURE: SLIME SPIRIT ---
  if (theme === 'nature') {
    return (
      <div 
        className={`relative select-none ${className}`} 
        onClick={onClick}
        style={{ 
          transform: flipped ? 'scaleX(-1)' : 'scaleX(1)',
          transition: 'transform 0.2s'
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          <defs>
             <style>{`
               @keyframes bounce { 
                 0%, 100% { transform: translateY(0) scale(1.1, 0.9); } 
                 40% { transform: translateY(-30px) scale(0.9, 1.1); } 
                 80% { transform: translateY(0) scale(1.15, 0.85); }
               }
               @keyframes jiggle { 
                 0%, 100% { transform: scale(1, 1); } 
                 50% { transform: scale(1.05, 0.95); } 
               }
               @keyframes melt {
                  0% { d: path("M50,150 Q 50,70 100,70 Q 150,70 150,150 L 150,150 Q 100,150 50,150"); }
                  100% { d: path("M30,150 Q 50,120 100,120 Q 150,120 170,150 L 170,150 Q 100,150 30,150"); }
               }
               @keyframes leaf-sway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } }

               .slime-body { fill: #a3b18a; stroke: #588157; stroke-width: 3px; transform-origin: bottom center; }
               .leaf { fill: #588157; stroke: #3a5a40; stroke-width: 2px; transform-origin: 100px 70px; animation: leaf-sway 3s ease-in-out infinite; }
               
               .moving .slime-wrapper { animation: bounce 0.6s infinite ease-in-out; }
               .idle .slime-wrapper { animation: jiggle 3s infinite ease-in-out; }
               
               .sleeping .slime-body { transition: d 1s; d: path("M30,150 Q 50,120 100,120 Q 150,120 170,150 L 170,150 Q 100,150 30,150"); }
               .sleeping .leaf { transform: rotate(90deg) translate(20px, 10px); }
             `}</style>
          </defs>

          <g className={`slime-wrapper ${isMoving ? 'moving' : isSleeping ? 'sleeping' : 'idle'}`} style={{ transformOrigin: '100px 150px' }}>
             {/* Shadow */}
             <ellipse cx="100" cy="155" rx="40" ry="8" fill="#dad7cd" />

             {/* Body */}
             <path d="M50,150 Q 50,70 100,70 Q 150,70 150,150 L 150,150 Q 100,150 50,150" className="slime-body" />
             
             {/* Face */}
             <g transform={isSleeping ? "translate(0, 30)" : ""}>
                <circle cx="85" cy="110" r="4" fill="#3a5a40" />
                <circle cx="115" cy="110" r="4" fill="#3a5a40" />
                {!isSleeping && <path d="M95,115 Q 100,120 105,115" fill="none" stroke="#3a5a40" strokeWidth="2" strokeLinecap="round" />}
             </g>

             {/* Leaf on head */}
             <path d="M100,70 Q 80,40 100,20 Q 120,40 100,70 L 100,70" className="leaf" />
          </g>
        </svg>
      </div>
    );
  }

  // --- 4. DEFAULT: CARTOON CAT (Refined) ---
  const c = { stroke: '#4a3b32', fill: '#fefdf5', marking: '#fbbf24' };
  const strokeWidth = 3.5;

  return (
    <div 
      className={`relative select-none ${className}`} 
      style={{ 
        transform: flipped ? 'scaleX(-1)' : 'scaleX(1)',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
      onClick={onClick}
    >
      <svg viewBox="0 0 240 240" className="w-full h-full overflow-visible drop-shadow-md">
        <defs>
          <style>{`
            .cat-line { fill: none; stroke: ${c.stroke}; stroke-width: ${strokeWidth}; stroke-linecap: round; stroke-linejoin: round; }
            .cat-fill { fill: ${c.fill}; stroke: ${c.stroke}; stroke-width: ${strokeWidth}; stroke-linecap: round; stroke-linejoin: round; }
            .cat-marking { fill: ${c.marking}; stroke: none; opacity: 0.5; }
            
            @keyframes cat-walk-body { 0% { transform: translateY(0); } 50% { transform: translateY(-2px); } 100% { transform: translateY(0); } }
            @keyframes tail-wag { 0% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } 100% { transform: rotate(0deg); } }
            @keyframes sleep-breathe { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
            
            .anim-walk .body { animation: cat-walk-body 0.6s infinite; }
            .tail-anim { animation: tail-wag 2s infinite ease-in-out; transform-origin: 200px 130px; }
            .sleeping-anim { animation: sleep-breathe 3s infinite ease-in-out; transform-origin: center; }
          `}</style>
        </defs>

        {/* Shadow inside component */}
        <ellipse cx="120" cy="200" rx="60" ry="10" fill="black" opacity="0.1" />

        {isSleeping ? (
           // Sleeping Croissant Mode
           <g transform="translate(30, 50)" className="sleeping-anim">
              <path d="M180,140 Q 170,180 120,180 Q 70,180 60,140" className="cat-fill" />
              <path d="M60,140 Q 50,80 120,80 Q 190,80 180,140" className="cat-fill" />
              {/* Face tucked */}
              <g transform="translate(100, 120)">
                 <path d="M-15,0 L -5,0" className="cat-line" />
                 <path d="M5,0 L 15,0" className="cat-line" />
                 <text x="50" y="-30" fontSize="24" fill={c.stroke}>Zzz</text>
              </g>
           </g>
        ) : isMoving ? (
           // Walking Side View
           <g className="anim-walk">
              <path d="M200,130 Q 230,130 240,100" className="cat-line tail-anim" />
              <g className="body">
                 <path d="M70,100 Q 70,70 110,70 L 180,70 Q 210,70 210,120 Q 210,160 180,160 L 100,160 Q 70,160 70,100 Z" className="cat-fill" />
                 {/* Legs (Simplified for CSS anim in parent usually, but static here for simplicity unless complex) */}
                 <path d="M90,160 L 90,190" className="cat-line" />
                 <path d="M110,160 L 120,185" className="cat-line" />
                 <path d="M170,160 L 170,190" className="cat-line" />
                 <path d="M190,160 L 180,185" className="cat-line" />
                 {/* Head Side */}
                 <g transform="translate(70, 90)">
                    <circle cx="0" cy="0" r="35" className="cat-fill" />
                    <path d="M-15,-40 L -30,-60 L 0,-50" className="cat-fill" />
                    <path d="M15,-40 L 30,-60 L 0,-50" className="cat-fill" />
                    <circle cx="-10" cy="0" r="3" fill="#333" />
                 </g>
              </g>
           </g>
        ) : (
           // Sitting Front View
           <g>
              <path d="M160,160 Q 200,160 210,130" className="cat-line tail-anim" />
              <path d="M60,200 L 140,200 L 140,120 Q 140,80 100,80 Q 60,80 60,120 Z" className="cat-fill" />
              <g transform="translate(100, 80)">
                 <circle cx="0" cy="0" r="45" className="cat-fill" />
                 {/* Ears */}
                 <path d="M-30,-30 L -45,-55 L -10,-40" className="cat-fill" />
                 <path d="M30,-30 L 45,-55 L 10,-40" className="cat-fill" />
                 {/* Face */}
                 <circle cx="-15" cy="0" r="4" fill="#333" />
                 <circle cx="15" cy="0" r="4" fill="#333" />
                 <path d="M-5,10 Q 0,15 5,10" className="cat-line" strokeWidth="2" />
              </g>
              <path d="M80,200 L 80,180" className="cat-line" />
              <path d="M120,200 L 120,180" className="cat-line" />
           </g>
        )}
      </svg>
    </div>
  );
};

export default PetAvatar;
