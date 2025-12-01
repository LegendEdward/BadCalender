import React from 'react';
import { AlertTriangle, Calendar, Clock, CheckSquare } from 'lucide-react';
import { Task, ThemeMode } from '../types';
import { formatDuration } from '../utils';

interface DelayedListProps {
  tasks: Task[];
  theme: ThemeMode;
  onComplete: (taskId: string) => void;
}

const DelayedList: React.FC<DelayedListProps> = ({ tasks, theme, onComplete }) => {
  const isArk = theme === 'arknights';

  if (tasks.length === 0) return null;

  return (
    <div className={`mb-6 p-4 ${isArk ? 'border-l-4 border-ark-accent bg-ark-surface/50' : 'bg-red-50 rounded-2xl border border-red-100'}`}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className={isArk ? 'text-ark-accent' : 'text-red-400'} />
        <h3 className={`font-bold ${isArk ? 'text-ark-accent tracking-widest uppercase' : 'text-red-500'}`}>
          Delayed Operations ({tasks.length})
        </h3>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <div 
            key={task.id}
            className={`
              flex items-center justify-between p-3 
              ${isArk 
                ? 'bg-ark-bg border border-ark-muted/50' 
                : 'bg-white rounded-xl shadow-sm'}
            `}
          >
            <div className="flex-1">
              <div className={`font-medium ${isArk ? 'text-white' : 'text-gray-800'}`}>{task.title}</div>
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
              className={`
                p-2 transition-colors
                ${isArk 
                  ? 'text-ark-muted hover:text-ark-primary' 
                  : 'text-gray-300 hover:text-toon-primary'}
              `}
            >
              <CheckSquare size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DelayedList;