
import React, { useState } from 'react';
import { ThemeMode, Language, User } from '../types';
import { translations } from '../translations';
import { generateId } from '../utils';
import { User as UserIcon, Lock, LogIn, UserPlus, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, language, setLanguage, theme, setTheme }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const t = translations[language];

  // Helper to get users from storage
  const getUsers = (): User[] => {
    try {
      return JSON.parse(localStorage.getItem('chrono_users') || '[]');
    } catch {
      return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) return;

    const users = getUsers();

    if (isRegister) {
      // Register Logic
      if (users.find(u => u.username === username)) {
        setError(t.registerError);
        return;
      }
      const newUser: User = {
        id: generateId(),
        username,
        password, // In real app, hash this!
        themePreference: theme
      };
      localStorage.setItem('chrono_users', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    } else {
      // Login Logic
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError(t.loginError);
      }
    }
  };

  const handleGuest = () => {
    onLogin({ id: 'guest', username: 'Guest', password: '' });
  };

  // Styles based on theme (using the passed theme or default)
  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  let bgClass = '';
  let cardClass = '';
  let inputClass = '';
  let btnClass = '';
  let linkClass = '';

  if (isArk) {
    bgClass = 'bg-ark-bg text-ark-text';
    cardClass = 'bg-ark-surface border-2 border-ark-primary shadow-[0_0_30px_rgba(6,182,212,0.2)]';
    inputClass = 'bg-ark-bg border border-ark-muted text-white focus:border-ark-primary';
    btnClass = 'bg-ark-primary text-black hover:bg-cyan-300';
    linkClass = 'text-ark-primary';
  } else if (isCyber) {
    bgClass = 'bg-black text-[#0ff]';
    cardClass = 'bg-black border-2 border-[#f0f] shadow-[0_0_20px_#f0f]';
    inputClass = 'bg-[#111] border border-[#333] text-[#0ff] focus:border-[#f0f]';
    btnClass = 'bg-[#f0f] text-black hover:bg-white hover:text-[#f0f]';
    linkClass = 'text-[#0ff]';
  } else if (isNature) {
    bgClass = 'bg-[#fefae0] text-[#354f52]';
    cardClass = 'bg-[#faedcd] border-2 border-[#ccd5ae] shadow-xl';
    inputClass = 'bg-[#fefae0] border border-[#d4a373] text-[#354f52] focus:border-[#606c38]';
    btnClass = 'bg-[#606c38] text-[#fefae0] hover:bg-[#283618]';
    linkClass = 'text-[#bc4749] font-bold';
  } else {
    bgClass = 'bg-toon-bg text-gray-700';
    cardClass = 'bg-white rounded-3xl shadow-2xl border-2 border-orange-100';
    inputClass = 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-toon-primary';
    btnClass = 'bg-toon-primary text-white hover:bg-rose-500 shadow-lg';
    linkClass = 'text-toon-primary font-bold';
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${bgClass} transition-colors duration-500`}>
      <div className={`w-full max-w-sm p-8 animate-in zoom-in duration-300 ${cardClass} relative overflow-hidden`}>
        
        {/* Decor */}
        {isArk && <div className="absolute top-0 right-0 p-4 text-6xl opacity-5 font-bold select-none">LOGIN</div>}
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-center">{t.appTitle}</h1>
          <p className="text-center text-xs opacity-60 mb-8 uppercase tracking-widest">{isRegister ? t.register : t.login}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-xs text-red-500 bg-red-500/10 p-2 border border-red-500/50 text-center">
                {error}
              </div>
            )}

            <div className="relative">
              <UserIcon size={18} className="absolute left-3 top-3.5 opacity-50" />
              <input 
                type="text"
                placeholder={t.username}
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-sm outline-none transition-all ${inputClass}`}
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 opacity-50" />
              <input 
                type="password"
                placeholder={t.password}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-sm outline-none transition-all ${inputClass}`}
              />
            </div>

            <button type="submit" className={`w-full py-3 font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 ${btnClass}`}>
              {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isRegister ? t.register : t.login}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4 text-sm">
             <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className={`hover:underline ${linkClass}`}>
               {isRegister ? t.login : t.register}
             </button>
             
             <div className="w-full h-px bg-current opacity-10"></div>
             
             <button onClick={handleGuest} className="opacity-60 hover:opacity-100 flex items-center gap-1 text-xs">
               {t.guestMode} <ArrowRight size={12} />
             </button>
          </div>
          
          {/* Quick Theme Switcher for Login Screen */}
          <div className="mt-8 flex justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            {(['arknights', 'cartoon', 'cyberpunk', 'nature'] as ThemeMode[]).map(th => (
               <button 
                 key={th} 
                 onClick={() => setTheme(th)}
                 className={`w-4 h-4 rounded-full border border-gray-500 ${th === theme ? 'bg-current scale-125' : 'bg-transparent'}`}
                 title={th}
               />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
