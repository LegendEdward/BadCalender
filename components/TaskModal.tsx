
import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, FileText } from 'lucide-react';
import { ThemeMode, Task, Language } from '../types';
import { generateId } from '../utils';
import { translations } from '../translations';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  selectedDateStr: string;
  theme: ThemeMode;
  language: Language;
  initialData?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, onClose, onSave, selectedDateStr, theme, language, initialData 
}) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState('');
  const [isPriority, setIsPriority] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setStartTime(initialData.startTime);
        setDuration(initialData.durationMinutes);
        setDescription(initialData.description || '');
        setIsPriority(initialData.isPriority);
      } else {
        setTitle('');
        setStartTime('09:00');
        setDuration(60);
        setDescription('');
        setIsPriority(false);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: initialData ? initialData.id : generateId(),
      dateStr: selectedDateStr,
      title,
      startTime,
      durationMinutes: Number(duration),
      completed: initialData ? initialData.completed : false,
      isStarted: initialData ? initialData.isStarted : false,
      description,
      isPriority,
    };
    onSave(newTask);
    onClose();
  };

  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  let modalClass = '';
  let inputClass = '';
  let btnClass = '';
  let cancelBtnClass = '';

  if (isArk) {
    modalClass = 'bg-ark-surface border-2 border-ark-muted text-ark-text shadow-[0_0_20px_rgba(6,182,212,0.2)]';
    inputClass = 'bg-ark-bg border border-ark-muted focus:border-ark-primary text-white';
    btnClass = 'bg-ark-primary text-black hover:bg-cyan-300';
    cancelBtnClass = 'border border-ark-muted text-ark-muted hover:text-white';
  } else if (isCyber) {
    modalClass = 'bg-black border-2 border-[#f0f] text-[#0ff] shadow-[0_0_20px_#f0f]';
    inputClass = 'bg-[#111] border border-[#333] focus:border-[#0ff] text-[#0ff]';
    btnClass = 'bg-[#f0f] text-black hover:bg-[#ff55ff]';
    cancelBtnClass = 'border border-[#333] text-gray-500 hover:text-[#0ff]';
  } else if (isNature) {
    modalClass = 'bg-[#fefae0] border-2 border-[#ccd5ae] text-[#354f52] shadow-xl';
    inputClass = 'bg-[#faedcd] border border-[#d4a373] focus:border-[#606c38] text-[#354f52]';
    btnClass = 'bg-[#606c38] text-[#fefae0] hover:bg-[#283618]';
    cancelBtnClass = 'bg-[#e9edc9] text-[#52796f]';
  } else {
    modalClass = 'bg-white rounded-3xl shadow-2xl text-toon-text';
    inputClass = 'bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-toon-accent';
    btnClass = 'bg-toon-primary text-white rounded-xl shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-1';
    cancelBtnClass = 'bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md transition-all animate-in fade-in zoom-in duration-200 ${modalClass}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-500/10`}>
          <h2 className={`text-lg font-bold ${isArk || isCyber ? 'uppercase tracking-widest' : 'font-sans'}`}>
            {initialData ? t.editTask : t.newTask}
          </h2>
          <button onClick={onClose} className="p-2 hover:opacity-70">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70">{t.taskName}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-3 outline-none transition-colors ${inputClass}`}
              placeholder={t.enterTaskName}
            />
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 opacity-70 flex items-center gap-1">
                <Clock size={12} /> {t.start}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full p-3 outline-none ${inputClass}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 opacity-70">{t.duration}</label>
              <input
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={`w-full p-3 outline-none ${inputClass}`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70 flex items-center gap-1">
              <FileText size={12} /> {t.details}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-3 outline-none resize-none ${inputClass}`}
              placeholder={t.notes}
            />
          </div>

          {/* Priority Toggle */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsPriority(!isPriority)}>
            <div className={`
              w-5 h-5 flex items-center justify-center transition-colors border
              ${isPriority 
                ? (isArk ? 'bg-ark-accent border-ark-accent' : isCyber ? 'bg-[#f0f] border-[#f0f]' : 'bg-toon-primary border-toon-primary') 
                : 'border-gray-400'}
            `}>
               {isPriority && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <span className="text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} className={isPriority ? (isArk ? 'text-ark-accent' : isCyber ? 'text-[#f0f]' : 'text-toon-primary') : 'text-gray-400'} />
              {t.highPriority}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 font-bold text-sm ${cancelBtnClass}`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 font-bold text-sm transition-all ${btnClass}`}
            >
              {t.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
