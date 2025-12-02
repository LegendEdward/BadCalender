
import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, FileText, Tag, GitMerge, AlertTriangle } from 'lucide-react';
import { ThemeMode, Task, Language, Category } from '../types';
import { generateId, parseTime, formatDuration } from '../utils';
import { translations } from '../translations';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  selectedDateStr: string;
  theme: ThemeMode;
  language: Language;
  initialData?: Task | null;
  categories: Category[];
  parentTask?: Task | null;
  existingTasks: Task[]; // For conflict checking
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, onClose, onSave, selectedDateStr, theme, language, initialData, categories, parentTask, existingTasks
}) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [conflictWarning, setConflictWarning] = useState<{taskName: string, time: string} | null>(null);

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setStartTime(initialData.startTime);
        setDuration(initialData.durationMinutes);
        setDescription(initialData.description || '');
        setIsPriority(initialData.isPriority);
        setCategoryId(initialData.categoryId || '');
      } else {
        setTitle('');
        setStartTime(parentTask ? parentTask.startTime : '09:00');
        setDuration(parentTask ? 30 : 60);
        setDescription('');
        setIsPriority(false);
        setCategoryId('');
      }
      setErrorMsg('');
      setConflictWarning(null);
    }
  }, [isOpen, initialData, parentTask]);

  if (!isOpen) return null;

  const checkForConflicts = () => {
     // Convert current to minutes
     const currentStart = parseTime(startTime);
     const currentEnd = currentStart + duration;

     // Check against existing tasks on this day (excluding self if editing)
     const conflict = existingTasks.find(t => {
       if (initialData && t.id === initialData.id) return false;
       // Skip subtasks if we are validating a root task? No, subtasks also consume time?
       // Let's assume root tasks block time. Subtasks usually inside parent time.
       // If this is a subtask, we only check if it fits in parent (done below).
       if (parentTask) return false; 
       if (t.parentId) return false; // Ignore existing subtasks for main timeline check

       const tStart = parseTime(t.startTime);
       const tEnd = tStart + t.durationMinutes;

       // Overlap logic: (StartA < EndB) and (EndA > StartB)
       return (currentStart < tEnd) && (currentEnd > tStart);
     });

     return conflict;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Subtask Validation
    if (parentTask) {
       const pStart = parseTime(parentTask.startTime);
       const pEnd = pStart + parentTask.durationMinutes;
       const cStart = parseTime(startTime);
       const cEnd = cStart + duration;

       if (cStart < pStart || cEnd > pEnd) {
         setErrorMsg(t.subtaskConstraint.replace('{0}', parentTask.startTime).replace('{1}', formatDuration(parentTask.durationMinutes)));
         return;
       }
    }

    // 2. Conflict Validation (Only if no warning currently shown)
    if (!conflictWarning && !parentTask) {
      const conflict = checkForConflicts();
      if (conflict) {
        setConflictWarning({ taskName: conflict.title, time: conflict.startTime });
        return; // Stop here and show warning UI
      }
    }

    const newTask: Task = {
      id: initialData ? initialData.id : generateId(),
      parentId: parentTask ? parentTask.id : (initialData?.parentId),
      dateStr: selectedDateStr,
      title,
      startTime,
      durationMinutes: Number(duration),
      completed: initialData ? initialData.completed : false,
      isStarted: initialData ? initialData.isStarted : false,
      description,
      isPriority,
      categoryId: categoryId || undefined,
      isExpanded: true
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
  let errorClass = '';
  let warningClass = '';

  if (isArk) {
    modalClass = 'bg-ark-surface border-2 border-ark-muted text-ark-text shadow-[0_0_20px_rgba(6,182,212,0.2)]';
    inputClass = 'bg-ark-bg border border-ark-muted focus:border-ark-primary text-white';
    btnClass = 'bg-ark-primary text-black hover:bg-cyan-300';
    cancelBtnClass = 'border border-ark-muted text-ark-muted hover:text-white';
    errorClass = 'text-red-400 bg-red-900/20 border border-red-500';
    warningClass = 'bg-yellow-900/20 border border-yellow-500 text-yellow-500';
  } else if (isCyber) {
    modalClass = 'bg-black border-2 border-[#f0f] text-[#0ff] shadow-[0_0_20px_#f0f]';
    inputClass = 'bg-[#111] border border-[#333] focus:border-[#0ff] text-[#0ff]';
    btnClass = 'bg-[#f0f] text-black hover:bg-[#ff55ff]';
    cancelBtnClass = 'border border-[#333] text-gray-500 hover:text-[#0ff]';
    errorClass = 'text-[#f00] bg-[#f00]/10 border border-[#f00] glitch-text';
    warningClass = 'bg-yellow-900/20 border border-yellow-500 text-yellow-400';
  } else if (isNature) {
    modalClass = 'bg-[#fefae0] border-2 border-[#ccd5ae] text-[#354f52] shadow-xl';
    inputClass = 'bg-[#faedcd] border border-[#d4a373] focus:border-[#606c38] text-[#354f52]';
    btnClass = 'bg-[#606c38] text-[#fefae0] hover:bg-[#283618]';
    cancelBtnClass = 'bg-[#e9edc9] text-[#52796f]';
    errorClass = 'text-[#bc4749] bg-[#ffddd2] border border-[#bc4749]';
    warningClass = 'bg-yellow-100 border border-yellow-400 text-yellow-700';
  } else {
    modalClass = 'bg-white rounded-3xl shadow-2xl text-toon-text';
    inputClass = 'bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-toon-accent';
    btnClass = 'bg-toon-primary text-white rounded-xl shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-1';
    cancelBtnClass = 'bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200';
    errorClass = 'text-red-500 bg-red-50 border border-red-200';
    warningClass = 'bg-orange-50 border border-orange-200 text-orange-600';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md transition-all animate-in fade-in zoom-in duration-200 ${modalClass}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-500/10`}>
          <div className="flex items-center gap-2">
             <h2 className={`text-lg font-bold ${isArk || isCyber ? 'uppercase tracking-widest' : 'font-sans'}`}>
              {initialData ? t.editTask : (parentTask ? t.newSubtask : t.newTask)}
             </h2>
             {parentTask && (
               <span className={`text-xs px-2 py-0.5 rounded border opacity-70 flex items-center gap-1`}>
                 <GitMerge size={10} /> {parentTask.title}
               </span>
             )}
          </div>
          <button onClick={onClose} className="p-2 hover:opacity-70">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className={`text-xs p-2 rounded ${errorClass}`}>
               {errorMsg}
            </div>
          )}

          {conflictWarning && (
            <div className={`text-xs p-3 rounded flex items-start gap-2 ${warningClass}`}>
               <AlertTriangle size={16} className="shrink-0 mt-0.5" />
               <div>
                 <div className="font-bold mb-1">{t.conflictTitle}</div>
                 <p>{t.conflictMsg.replace('{0}', conflictWarning.taskName).replace('{1}', conflictWarning.time)}</p>
               </div>
            </div>
          )}

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
                onChange={(e) => { setStartTime(e.target.value); setConflictWarning(null); }}
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
                onChange={(e) => { setDuration(Number(e.target.value)); setConflictWarning(null); }}
                className={`w-full p-3 outline-none ${inputClass}`}
              />
            </div>
          </div>
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70 flex items-center gap-1">
              <Tag size={12} /> {t.categories}
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => setCategoryId('')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!categoryId ? 'bg-opacity-20 border-current bg-current font-bold' : 'opacity-50 border-gray-500'}`}
              >
                {t.none}
              </button>
              {categories.map(cat => (
                <button
                   key={cat.id}
                   type="button"
                   onClick={() => setCategoryId(cat.id)}
                   className={`text-xs px-3 py-1.5 rounded-full border transition-all 
                     ${categoryId === cat.id 
                       ? (isArk ? 'bg-ark-primary text-black border-ark-primary' : (isCyber ? 'bg-[#f0f] text-black border-[#f0f]' : 'bg-toon-primary text-white border-toon-primary')) 
                       : (isArk ? 'bg-ark-surface border-ark-muted' : 'border-gray-500 opacity-60 hover:opacity-100')}`}
                >
                   {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70 flex items-center gap-1">
              <FileText size={12} /> {t.details}
            </label>
            <textarea
              rows={2}
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
              {conflictWarning ? t.confirm : t.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
