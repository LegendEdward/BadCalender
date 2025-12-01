import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, FileText } from 'lucide-react';
import { ThemeMode, Task } from '../types';
import { generateId } from '../utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  selectedDateStr: string;
  theme: ThemeMode;
  initialData?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, selectedDateStr, theme, initialData }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState('');
  const [isPriority, setIsPriority] = useState(false);

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
      description,
      isPriority,
    };
    onSave(newTask);
    onClose();
  };

  const isArk = theme === 'arknights';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`
          w-full max-w-md transition-all animate-in fade-in zoom-in duration-200
          ${isArk 
            ? 'bg-ark-surface border-2 border-ark-muted text-ark-text shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
            : 'bg-white rounded-3xl shadow-2xl text-toon-text'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 ${isArk ? 'border-b border-ark-muted' : 'border-b border-gray-100'}`}>
          <h2 className={`text-lg font-bold ${isArk ? 'uppercase tracking-widest' : 'font-sans'}`}>
            {initialData ? 'Edit Task' : 'New Mission'}
          </h2>
          <button onClick={onClose} className="p-2 hover:opacity-70">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70">TASK NAME</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-3 outline-none transition-colors
                ${isArk 
                  ? 'bg-ark-bg border border-ark-muted focus:border-ark-primary text-white' 
                  : 'bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-toon-accent'}
              `}
              placeholder="Enter task name..."
            />
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 opacity-70 flex items-center gap-1">
                <Clock size={12} /> START
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full p-3 outline-none
                  ${isArk 
                    ? 'bg-ark-bg border border-ark-muted focus:border-ark-primary text-white' 
                    : 'bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-toon-accent'}
                `}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 opacity-70">DURATION (MIN)</label>
              <input
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={`w-full p-3 outline-none
                  ${isArk 
                    ? 'bg-ark-bg border border-ark-muted focus:border-ark-primary text-white' 
                    : 'bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-toon-accent'}
                `}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70 flex items-center gap-1">
              <FileText size={12} /> DETAILS
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-3 outline-none resize-none
                ${isArk 
                  ? 'bg-ark-bg border border-ark-muted focus:border-ark-primary text-white' 
                  : 'bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-toon-accent'}
              `}
              placeholder="Additional notes..."
            />
          </div>

          {/* Priority Toggle */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsPriority(!isPriority)}>
            <div className={`w-5 h-5 flex items-center justify-center transition-colors border ${isPriority ? (isArk ? 'bg-ark-accent border-ark-accent' : 'bg-toon-primary border-toon-primary') : 'border-gray-400'}`}>
               {isPriority && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <span className="text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} className={isPriority ? (isArk ? 'text-ark-accent' : 'text-toon-primary') : 'text-gray-400'} />
              High Priority
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 font-bold text-sm
                ${isArk 
                  ? 'border border-ark-muted text-ark-muted hover:text-white' 
                  : 'bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200'}
              `}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 font-bold text-sm transition-all
                ${isArk 
                  ? 'bg-ark-primary text-black hover:bg-cyan-300' 
                  : 'bg-toon-primary text-white rounded-xl shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-1'}
              `}
            >
              CONFIRM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;