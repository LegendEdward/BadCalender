
import React from 'react';
import { Task, ThemeMode } from '../types';
import { parseTime, getTaskColor } from '../utils';

interface TimelineProps {
  tasks: Task[];
  theme: ThemeMode;
}

const Timeline: React.FC<TimelineProps> = ({ tasks, theme }) => {
  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';
  
  // Sort tasks by start time
  const sortedTasks = [...tasks].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  
  // Dynamic styles
  let containerClass = '';
  let headerClass = '';
  let borderClass = '';
  let dotClass = '';
  let timeTextClass = '';

  if (isArk) {
    containerClass = 'border-t border-ark-muted py-6';
    headerClass = 'text-ark-muted uppercase tracking-widest';
    borderClass = '#64748b';
    dotClass = 'bg-ark-bg border-ark-primary';
    timeTextClass = 'text-ark-primary';
  } else if (isCyber) {
    containerClass = 'border-t-2 border-[#0ff] border-dashed py-6';
    headerClass = 'text-[#0ff] glitch-text font-mono';
    borderClass = '#0ff';
    dotClass = 'bg-black border-[#f0f]';
    timeTextClass = 'text-[#f0f]';
  } else if (isNature) {
     containerClass = 'bg-[#faedcd] rounded-3xl p-6 shadow-md';
     headerClass = 'text-[#52796f] font-serif italic';
     borderClass = '#ccd5ae';
     dotClass = 'bg-[#fefae0] border-[#606c38]';
     timeTextClass = 'text-[#606c38]';
  } else {
    containerClass = 'bg-white rounded-3xl p-6 shadow-sm';
    headerClass = 'text-gray-400';
    borderClass = '#cbd5e1';
    dotClass = 'bg-white border-toon-primary';
    timeTextClass = 'text-toon-primary';
  }

  return (
    <div className={`mt-6 ${containerClass}`}>
      <h3 className={`text-sm font-bold mb-6 ${headerClass}`}>
        Visual Timeline
      </h3>

      <div className="relative pl-4 border-l-2 border-dashed border-opacity-30 border-current" style={{ borderColor: borderClass }}>
        {sortedTasks.length === 0 && (
          <div className="text-xs opacity-50 italic">No tasks scheduled yet.</div>
        )}

        {sortedTasks.map((task, index) => {
           const isCompleted = task.completed;
           
           let cardClass = '';
           if (isArk) cardClass = `bg-ark-surface border-l-2 ${task.isPriority ? 'border-ark-accent' : 'border-ark-primary'}`;
           else if (isCyber) cardClass = `bg-[#111] border border-[#333] border-l-4 ${task.isPriority ? 'border-[#f0f]' : 'border-[#0ff]'}`;
           else if (isNature) cardClass = `bg-[#e9edc9] rounded-lg border-l-4 ${task.isPriority ? 'border-[#d4a373]' : 'border-[#ccd5ae]'}`;
           else cardClass = `bg-gray-50 rounded-lg border-l-4 ${task.isPriority ? 'border-toon-primary' : 'border-toon-accent'}`;

           return (
             <div key={task.id} className="relative mb-6 last:mb-0 group">
               {/* Time Dot */}
               <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 ${dotClass}`} />
               
               {/* Time Label */}
               <span className={`absolute -left-[70px] top-[-3px] text-xs font-mono font-bold ${timeTextClass}`}>
                 {task.startTime}
               </span>

               {/* Task Block */}
               <div 
                 className={`
                   relative p-3 ml-2 transition-all duration-300
                   ${isCompleted ? 'opacity-50 grayscale' : 'opacity-100'}
                   ${cardClass}
                 `}
               >
                  <div className={`
                    absolute inset-0 opacity-5 pointer-events-none
                    ${getTaskColor(index, theme)}
                  `} />
                  
                  <div className="font-bold text-sm truncate pr-2">{task.title}</div>
                  <div className="text-xs opacity-60 mt-1 flex justify-between">
                    <span>{task.durationMinutes} min</span>
                    {task.description && <span className="truncate max-w-[100px]">{task.description}</span>}
                  </div>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default Timeline;
