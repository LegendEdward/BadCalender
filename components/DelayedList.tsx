
import React from 'react';
import { AlertTriangle, Calendar, Clock, CheckSquare } from 'lucide-react';
import { Task, ThemeMode, Language } from '../types';
import { formatDuration } from '../utils';
import { translations } from '../translations';

interface DelayedListProps {
  tasks: Task[];
  theme: ThemeMode;
  language: Language;
  onComplete: (taskId: string) => void;
}

const DelayedList: React.FC<DelayedListProps> = ({ tasks, theme, language, onComplete }) => {
  const t = translations[language];
  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  if (tasks.length === 0) return null;

  let containerClass = '';
  let headerClass = '';
  let iconClass = '';
  let itemClass = '';
  let textClass = '';

  if (isArk) {
    containerClass = 'border-l-4 border-ark-accent bg-ark-surface/50';
    headerClass = 'text-ark-accent tracking-widest uppercase';
    iconClass = 'text-ark-accent';
    itemClass = 'bg-ark-bg border border-ark-muted/50';
    textClass = 'text-white';
  } else if (isCyber) {
    containerClass = 'border-l-4 border-[#ff0055] bg-black/50';
    headerClass = 'text-[#ff0055] font-mono tracking-tighter';
    iconClass = 'text-[#ff0055] animate-pulse';
    itemClass = 'bg-[#111] border border-[#ff0055]';
    textClass = 'text-[#ff0055]';
  } else if (isNature) {
    containerClass = 'bg-[#fec5bb]/20 border border-[#fec5bb] rounded-2xl';
    headerClass = 'text-[#e07a5f]';
    iconClass = 'text-[#e07a5f]';
    itemClass = 'bg-white/50 border border-[#fcd5ce]';
    textClass = 'text-[#6d597a]';
  } else {
    containerClass = 'bg-red-50 rounded-2xl border border-red-100';
    headerClass = 'text-red-500';
    iconClass = 'text-red-400';
    itemClass = 'bg-white rounded-xl shadow-sm';
    textClass = 'text-gray-800';
  }

  return (
    <div className={`mb-6 p-4 ${containerClass}`}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className={iconClass} />
        <h3 className={`font-bold ${headerClass}`}>
          {t.delayedOps} ({tasks.length})
        </h3>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <div 
            key={task.id}
            className={`flex items-center justify-between p-3 ${itemClass}`}
          >
            <div className="flex-1">
              <div className={`font-medium ${textClass}`}>{task.title}</div>
              <div className="flex items-center gap-3 mt-1 text-xs opacity-60">
                <span className="flex items-center gap-1">
                  <Calendar size={10} /> {task.dateStr}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={10} /> {formatDuration(task.durationMinutes)}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => onComplete(task.id)}
              className="p-2 transition-colors opacity-70 hover:opacity-100"
            >
              <CheckSquare size={24} className={iconClass} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DelayedList;
