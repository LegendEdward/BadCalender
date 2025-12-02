
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

  // Filter tasks
  const filteredTasks = filterCategoryId 
    ? tasks.filter(t => t.categoryId === filterCategoryId)
    : tasks;

  const rootTasks = filteredTasks.filter(t => !t.parentId).sort((a,b) => parseTime(a.startTime) - parseTime(b.startTime));

  // Styles
  let lineClass = '';
  let nodeBg = '';
  let nodeBorder = '';
  let nodeText = '';
  
  if (isArk) {
    lineClass = 'bg-ark-primary/30';
    nodeBg = 'bg-ark-surface';
    nodeBorder = 'border-ark-primary';
    nodeText = 'text-white';
  } else if (isCyber) {
    lineClass = 'bg-[#0ff]/30';
    nodeBg = 'bg-black';
    nodeBorder = 'border-[#0ff]';
    nodeText = 'text-[#0ff]';
  } else if (isNature) {
    lineClass = 'bg-[#606c38]/30';
    nodeBg = 'bg-[#faedcd]';
    nodeBorder = 'border-[#606c38]';
    nodeText = 'text-[#354f52]';
  } else {
    lineClass = 'bg-gray-300';
    nodeBg = 'bg-white';
    nodeBorder = 'border-toon-primary';
    nodeText = 'text-gray-700';
  }

  // Animation delay calculation helper
  const getDelay = (depth: number, index: number) => {
    // Stagger based on depth and index. Total spread ~5s
    // Initial root: 0s
    // Partitions/Zones: 0.5s + index * 0.2s
    // Tasks: 1.5s + index * 0.3s
    return `${depth * 0.3 + index * 0.1}s`;
  };

  const renderTaskNode = (task: Task, depth: number, index: number) => {
    const subs = tasks.filter(t => t.parentId === task.id);
    const cat = categories.find(c => c.id === task.categoryId);

    return (
      <div key={task.id} className="flex flex-col items-center relative pl-8 py-2">
         {/* Connector Line Horizontal */}
         <div 
            className={`absolute top-6 left-0 w-8 h-0.5 ${lineClass} origin-left opacity-0 animate-slide-in-left`}
            style={{ animationDelay: getDelay(depth, index) }}
         ></div>

         <div className="flex flex-row items-start w-full">
            <div 
               className={`p-3 rounded-xl border min-w-[120px] relative z-10 ${nodeBg} ${nodeBorder} ${nodeText} opacity-0 animate-zoom-in`}
               style={{ animationDelay: getDelay(depth, index) }}
            >
               <div className="text-xs font-bold opacity-70 mb-1">{task.startTime}</div>
               <div className="font-bold text-sm">{task.title}</div>
               {cat && <span className="text-[10px] px-1 rounded border border-current opacity-60 mt-1 inline-block">{cat.name}</span>}
            </div>
            
            {/* Children container */}
            {subs.length > 0 && (
               <div className="flex flex-col border-l-2 ml-4 border-gray-500/20">
                  {subs.map((sub, idx) => renderTaskNode(sub, depth + 1, idx))}
               </div>
            )}
         </div>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto p-4 min-h-[500px]">
       <div className="flex flex-col gap-8">
          
          {/* Root Node: Date */}
          <div className="flex flex-col items-center">
             <div className={`px-6 py-3 rounded-full border-2 font-bold text-lg z-20 ${nodeBg} ${nodeBorder} ${nodeText} animate-zoom-in`}>
                {dateStr}
             </div>
             {/* Vertical Line from Root */}
             <div className={`w-0.5 h-8 ${lineClass} opacity-0 animate-fade-in`} style={{ animationDelay: '0.3s' }}></div>
          </div>

          {/* Zones Logic */}
          <div className="flex flex-col gap-6 relative">
             {/* Main vertical line connecting zones */}
             <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${lineClass} opacity-30`}></div>

             {partitions.map((part, pIdx) => {
                const zoneTasks = rootTasks.filter(t => {
                   const time = parseTime(t.startTime);
                   return time >= parseTime(part.startTime) && time < parseTime(part.endTime);
                });
                
                if (zoneTasks.length === 0) return null;

                return (
                   <div key={part.id} className="pl-4 relative">
                      {/* Zone Header */}
                      <div 
                        className={`mb-2 font-bold uppercase tracking-widest text-sm opacity-0 animate-slide-in-left ${nodeText}`}
                        style={{ animationDelay: getDelay(1, pIdx) }}
                      >
                         <span className="mr-2">●</span> {part.name}
                      </div>
                      
                      {/* Tasks in Zone */}
                      <div className="pl-4 border-l-2 border-dashed border-gray-500/10">
                         {zoneTasks.map((t, tIdx) => renderTaskNode(t, 2, tIdx))}
                      </div>
                   </div>
                )
             })}
             
             {/* Unsorted */}
             {rootTasks.some(t => !partitions.some(p => parseTime(t.startTime) >= parseTime(p.startTime) && parseTime(t.startTime) < parseTime(p.endTime))) && (
                <div className="pl-4 relative">
                    <div className={`mb-2 font-bold text-sm opacity-60 ${nodeText}`}>Others</div>
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
