
import React from 'react';
import { X, Grid, Trash2, ArrowRightCircle } from 'lucide-react';
import { ThemeMode, Language, TaskBundle } from '../types';
import { translations } from '../translations';

interface TaskNetModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundles: TaskBundle[];
  onLoadBundle: (bundle: TaskBundle) => void;
  onDeleteBundle: (id: string) => void;
  theme: ThemeMode;
  language: Language;
}

const TaskNetModal: React.FC<TaskNetModalProps> = ({
  isOpen, onClose, bundles, onLoadBundle, onDeleteBundle, theme, language
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  let modalClass = '';
  let itemClass = '';
  let btnClass = '';

  if (isArk) {
    modalClass = 'bg-ark-surface border-2 border-ark-primary text-ark-text';
    itemClass = 'bg-ark-bg border border-ark-muted/50 hover:border-ark-primary';
    btnClass = 'text-ark-primary hover:text-white';
  } else if (isCyber) {
    modalClass = 'bg-black border-2 border-[#0ff] text-[#0ff] shadow-[0_0_20px_#0ff]';
    itemClass = 'bg-[#111] border border-[#333] hover:border-[#f0f]';
    btnClass = 'text-[#0ff] hover:text-[#f0f]';
  } else if (isNature) {
    modalClass = 'bg-[#faedcd] border-2 border-[#ccd5ae] text-[#354f52]';
    itemClass = 'bg-[#fefae0] border border-[#ccd5ae] hover:border-[#606c38]';
    btnClass = 'text-[#606c38] hover:text-[#283618]';
  } else {
    modalClass = 'bg-white rounded-3xl shadow-2xl text-gray-800';
    itemClass = 'bg-gray-50 border border-gray-200 hover:border-toon-primary';
    btnClass = 'text-toon-primary hover:text-rose-600';
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-sm animate-in zoom-in duration-200 ${modalClass} flex flex-col max-h-[80vh]`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-500/20">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Grid size={20} /> {t.taskNets}
          </h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bundles.length === 0 && (
             <div className="text-center opacity-50 py-10 italic">
               {t.noNets}
             </div>
          )}

          {bundles.map(bundle => (
            <div key={bundle.id} className={`p-4 rounded-xl flex items-center justify-between transition-all ${itemClass}`}>
               <div>
                  <div className="font-bold">{bundle.name}</div>
                  <div className="text-xs opacity-60">
                     {bundle.tasks.length} tasks • {new Date(bundle.createdAt).toLocaleDateString()}
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onLoadBundle(bundle)}
                    className="p-2 hover:scale-110 transition-transform"
                    title={t.loadNet}
                  >
                     <ArrowRightCircle size={24} className={isArk ? 'text-ark-accent' : (isCyber ? 'text-[#f0f]' : 'text-green-500')} />
                  </button>
                  <button 
                    onClick={() => onDeleteBundle(bundle.id)}
                    className="p-2 hover:scale-110 transition-transform opacity-60 hover:opacity-100 text-red-500"
                  >
                     <Trash2 size={18} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskNetModal;
