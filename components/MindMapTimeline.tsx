
import React from 'react';
import { Task, ThemeMode, TimePartition, Category } from '../types';
import { parseTime } from '../utils';

interface MindMapTimelineProps {
  tasks: Task[];
  theme: ThemeMode;
  partitions: TimePartition[];
  categories: Category[];
  filterCategoryId: string | null;
  dateStr: string;
}

const MindMapTimeline: React.FC<MindMapTimelineProps> = ({
  tasks, theme, partitions, categories, filterCategoryId, dateStr
}) => {
  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  // Filter tasks - tasks passed here should already be date-filtered by parent, but we double check
  // or at least ensure we are working with what we are given
  const filteredTasks = filterCategoryId 
    ? tasks.filter(t => t.categoryId === filterCategoryId)
    : tasks;

  const rootTasks = filteredTasks.filter(t => !t.parentId).sort((a,b) => parseTime(a.startTime) - parseTime(b.startTime));

  // Styles
  let lineClass = '';
  let nodeBg = '';
  let nodeBorder = '';
  let nodeText = '';
  let containerText = '';
  
  if (isArk) {
    lineClass = 'bg-ark-primary/30';
    nodeBg = 'bg-ark-surface';
    nodeBorder = 'border-ark-primary';
    nodeText = 'text-white';
    containerText = 'text-ark-text';
  } else if (isCyber) {
    lineClass = 'bg-[#0ff]/30';
    nodeBg = 'bg-black';
    nodeBorder = 'border-[#0ff]';
    nodeText = 'text-[#0ff]';
    containerText = 'text-[#0ff]';
  } else if (isNature) {
    lineClass = 'bg-[#606c38]/30';
    nodeBg = 'bg-[#faedcd]';
    nodeBorder = 'border-[#606c38]';
    nodeText = 'text-[#354f52]';
    containerText = 'text-[#354f52]';
  } else {
    lineClass = 'bg-gray-300';
    nodeBg = 'bg-white';
    nodeBorder = 'border-toon-primary';
    nodeText = 'text-gray-700';
    containerText = 'text-gray-600';
  }

  // Animation delay calculation helper
  const getDelay = (depth: number, index: number) => {
    return `${depth * 0.2 + index * 0.1}s`;
  };

  const renderTaskNode = (task: Task, depth: number, index: number) => {
    const subs = tasks.filter(t => t.parentId === task.id);
    const cat = categories.find(c => c.id === task.categoryId);

    return (
      <div key={task.id} className="flex flex-col items-start relative pl-8 py-2">
         {/* Connector Line Horizontal */}
         <div 
            className={`absolute top-6 left-0 w-8 h-0.5 ${lineClass} origin-left opacity-0 animate-slide-in-left`}
            style={{ animationDelay: getDelay(depth, index) }}
         ></div>

         <div className="flex flex-row items-start w-full">
            <div 
               className={`p-3 rounded-xl border min-w-[140px] relative z-10 ${nodeBg} ${nodeBorder} ${nodeText} opacity-0 animate-zoom-in shadow-sm`}
               style={{ animationDelay: getDelay(depth, index) }}
            >
               <div className="flex justify-between items-center mb-1">
                 <span className="text-xs font-bold opacity-70">{task.startTime}</span>
                 {task.completed && <span className="text-[10px] font-bold">✓</span>}
               </div>
               <div className="font-bold text-sm leading-tight">{task.title}</div>
               {cat && <span className="text-[10px] px-1.5 py-0.5 rounded border border-current opacity-60 mt-2 inline-block">{cat.name}</span>}
            </div>
            
            {/* Children container */}
            {subs.length > 0 && (
               <div className="flex flex-col border-l-2 ml-4 border-gray-500/10">
                  {subs.map((sub, idx) => renderTaskNode(sub, depth + 1, idx))}
               </div>
            )}
         </div>
      </div>
    );
  };

  return (
    <div className={`w-full overflow-x-auto p-4 min-h-[500px] ${containerText}`}>
       <div className="flex flex-col gap-8 pb-20">
          
          {/* Root Node: Date */}
          <div className="flex flex-col items-center">
             <div className={`px-8 py-3 rounded-full border-2 font-bold text-lg z-20 shadow-lg ${nodeBg} ${nodeBorder} ${nodeText} animate-zoom-in`}>
                {dateStr}
             </div>
             {/* Vertical Line from Root */}
             <div className={`w-0.5 h-10 ${lineClass} opacity-0 animate-fade-in`} style={{ animationDelay: '0.3s' }}></div>
          </div>

          {/* Zones Logic */}
          <div className="flex flex-col gap-6 relative">
             {/* Main vertical line connecting zones */}
             <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${lineClass} opacity-30`}></div>

             {/* If no tasks at all */}
             {rootTasks.length === 0 && (
                <div className="pl-12 pt-4 opacity-50 italic animate-fade-in" style={{ animationDelay: '0.5s'}}>
                   No tasks planned for today.
                </div>
             )}

             {partitions.map((part, pIdx) => {
                const zoneTasks = rootTasks.filter(t => {
                   const time = parseTime(t.startTime);
                   return time >= parseTime(part.startTime) && time < parseTime(part.endTime);
                });
                
                // Show zone header even if empty to show structure
                return (
                   <div key={part.id} className="pl-4 relative">
                      {/* Zone Header */}
                      <div 
                        className={`mb-2 font-bold uppercase tracking-widest text-sm flex items-center gap-2 opacity-0 animate-slide-in-left`}
                        style={{ animationDelay: getDelay(1, pIdx) }}
                      >
                         <div className={`w-3 h-3 rounded-full border-2 ${nodeBorder} ${nodeBg}`}></div> 
                         {part.name}
                      </div>
                      
                      {/* Tasks in Zone */}
                      <div className="pl-4 border-l-2 border-dashed border-gray-500/10 min-h-[20px]">
                         {zoneTasks.length > 0 ? (
                            zoneTasks.map((t, tIdx) => renderTaskNode(t, 2, tIdx))
                         ) : (
                            <div className="text-xs opacity-30 pl-8 py-2">- Empty -</div>
                         )}
                      </div>
                   </div>
                )
             })}
             
             {/* Unsorted / Others */}
             {rootTasks.some(t => !partitions.some(p => parseTime(t.startTime) >= parseTime(p.startTime) && parseTime(t.startTime) < parseTime(p.endTime))) && (
                <div className="pl-4 relative">
                    <div className="mb-2 font-bold text-sm opacity-60 flex items-center gap-2">
                       <div className={`w-3 h-3 rounded-full border-2 border-gray-400 bg-gray-500`}></div>
                       Others
                    </div>
                    <div className="pl-4">
                       {rootTasks.filter(t => !partitions.some(p => parseTime(t.startTime) >= parseTime(p.startTime) && parseTime(t.startTime) < parseTime(p.endTime)))
                       .map((t, idx) => renderTaskNode(t, 2, idx))}
                    </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default MindMapTimeline;
