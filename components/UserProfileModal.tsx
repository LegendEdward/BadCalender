
import React, { useRef } from 'react';
import { X, User, Camera, Calendar, CheckCircle2 } from 'lucide-react';
import { UserProfile, ThemeMode, Language } from '../types';
import { translations } from '../translations';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  totalCompleted: number;
  theme: ThemeMode;
  language: Language;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen, onClose, profile, setProfile, totalCompleted, theme, language
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  if (!isOpen) return null;

  const daysActive = Math.floor((Date.now() - profile.joinDate) / (1000 * 60 * 60 * 24)) + 1;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  let modalClass = '';
  let inputClass = '';
  let btnClass = '';
  let labelClass = '';

  if (isArk) {
    modalClass = 'bg-ark-surface border-2 border-ark-primary text-ark-text';
    inputClass = 'bg-ark-bg border border-ark-muted text-white';
    btnClass = 'bg-ark-primary text-black';
    labelClass = 'text-ark-primary opacity-80';
  } else if (isCyber) {
    modalClass = 'bg-black border-2 border-[#0ff] text-[#0ff] shadow-[0_0_20px_#0ff]';
    inputClass = 'bg-[#111] border border-[#333] text-[#0ff]';
    btnClass = 'bg-[#f0f] text-black';
    labelClass = 'text-[#f0f]';
  } else if (isNature) {
    modalClass = 'bg-[#faedcd] border-2 border-[#ccd5ae] text-[#354f52]';
    inputClass = 'bg-[#fefae0] border border-[#d4a373]';
    btnClass = 'bg-[#606c38] text-[#fefae0]';
    labelClass = 'text-[#606c38] font-bold';
  } else {
    modalClass = 'bg-white rounded-3xl shadow-2xl text-gray-800';
    inputClass = 'bg-gray-50 border border-gray-200';
    btnClass = 'bg-toon-primary text-white';
    labelClass = 'text-gray-500 font-bold';
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-sm animate-in zoom-in duration-200 ${modalClass} overflow-hidden flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-500/20">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User size={20} /> {t.profile}
          </h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
             <div 
               className="relative w-24 h-24 rounded-full border-4 border-current overflow-hidden cursor-pointer group"
               onClick={() => fileInputRef.current?.click()}
             >
               {profile.avatar ? (
                 <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gray-500/20">
                    <User size={40} />
                 </div>
               )}
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
               </div>
             </div>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
             <p className="text-xs mt-2 opacity-60">{t.uploadAvatar}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded border border-dashed border-gray-500/30 text-center ${isArk ? 'bg-black/20' : ''}`}>
               <div className="text-xs opacity-70 mb-1 flex items-center justify-center gap-1"><Calendar size={12}/> {t.daysUsed}</div>
               <div className="text-2xl font-bold">{daysActive}</div>
            </div>
            <div className={`p-3 rounded border border-dashed border-gray-500/30 text-center ${isArk ? 'bg-black/20' : ''}`}>
               <div className="text-xs opacity-70 mb-1 flex items-center justify-center gap-1"><CheckCircle2 size={12}/> {t.totalTasks}</div>
               <div className="text-2xl font-bold">{totalCompleted}</div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
             <div>
               <label className={`block text-xs mb-1 ${labelClass}`}>{t.nickname}</label>
               <input 
                 value={profile.nickname}
                 onChange={(e) => setProfile({...profile, nickname: e.target.value})}
                 className={`w-full p-2 outline-none rounded ${inputClass}`}
               />
             </div>
             
             <div>
               <label className={`block text-xs mb-1 ${labelClass}`}>{t.gender}</label>
               <div className="flex gap-2">
                  {['male', 'female', 'other', 'secret'].map((g) => (
                    <button 
                      key={g}
                      onClick={() => setProfile({...profile, gender: g as any})}
                      className={`flex-1 py-1 text-xs border rounded transition-all ${profile.gender === g ? 'bg-opacity-20 bg-current border-current font-bold' : 'border-gray-500/30 opacity-60'}`}
                    >
                      {t[g] || g}
                    </button>
                  ))}
               </div>
             </div>

             <div>
               <label className={`block text-xs mb-1 ${labelClass}`}>{t.bio}</label>
               <textarea 
                 rows={3}
                 value={profile.bio}
                 onChange={(e) => setProfile({...profile, bio: e.target.value})}
                 className={`w-full p-2 outline-none rounded resize-none ${inputClass}`}
               />
             </div>
          </div>

          <button onClick={onClose} className={`w-full py-3 font-bold rounded-lg shadow-lg ${btnClass}`}>
            {t.saveProfile}
          </button>

        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
