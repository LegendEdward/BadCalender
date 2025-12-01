import React from 'react';
import { Task, ThemeMode } from '../types';
import { parseTime, getTaskColor } from '../utils';

interface TimelineProps {
  tasks: Task[];
  theme: ThemeMode;
}

const Timeline: React.FC<TimelineProps> = ({ tasks, theme }) => {
  const isArk = theme === 'arknights';
  
  // Sort tasks by start time
  const sortedTasks = [...tasks].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

  // Determine container height based on time range (roughly 06:00 to 22:00 or dynamic)
  // For mobile simplicity, we will use a relative stack approach but visualized as a timeline
  
  return (
    <div className={`mt-6 ${isArk ? 'border-t border-ark-muted py-6' : 'bg-white rounded-3xl p-6 shadow-sm'}`}>
      <h3 className={`text-sm font-bold mb-6 ${isArk ? 'text-ark-muted uppercase tracking-widest' : 'text-gray-400'}`}>
        Visual Timeline
      </h3>

      <div className="relative pl-4 border-l-2 border-dashed border-opacity-30 border-current" style={{ borderColor: isArk ? '#64748b' : '#cbd5e1' }}>
        {sortedTasks.length === 0 && (
          <div className="text-xs opacity-50 italic">No tasks scheduled yet.</div>
        )}

        {sortedTasks.map((task, index) => {
           // Skip completed tasks in visualization if desired, but user wants to see the schedule
           const isCompleted = task.completed;
           
           return (
             <div key={task.id} className="relative mb-6 last:mb-0 group">
               {/* Time Dot */}
               <div 
                 className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 
                 ${isArk ? 'bg-ark-bg border-ark-primary' : 'bg-white border-toon-primary'}`} 
               />
               
               {/* Time Label */}
               <span className={`absolute -left-[70px] top-[-3px] text-xs font-mono font-bold ${isArk ? 'text-ark-primary' : 'text-toon-primary'}`}>
                 {task.startTime}
               </span>

               {/* Task Block */}
               <div 
                 className={`
                   relative p-3 ml-2 transition-all duration-300
                   ${isCompleted ? 'opacity-50 grayscale' : 'opacity-100'}
                   ${isArk 
                     ? `bg-ark-surface border-l-2 ${task.isPriority ? 'border-ark-accent' : 'border-ark-primary'}` 
                     : `bg-gray-50 rounded-lg border-l-4 ${task.isPriority ? 'border-toon-primary' : 'border-toon-accent'}`}
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