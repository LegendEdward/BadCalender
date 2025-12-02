
import React from 'react';
import { Task, ThemeMode, TimePartition, Category } from '../types';
import { parseTime } from '../utils';
import { ChevronDown, ChevronRight, Plus, GitCommit, Play, Circle, CheckCircle2, Square, CheckSquare, GripVertical } from 'lucide-react';

interface TimelineProps {
  tasks: Task[];
  theme: ThemeMode;
  partitions: TimePartition[];
  categories: Category[];
  onToggleExpand: (taskId: string) => void;
  onAddSubtask: (parent: Task) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onStartTask: (id: string, e: React.MouseEvent) => void;
  isSelectionMode: boolean;
  selectedTaskIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

const TimelineNode: React.FC<{
  task: Task;
  childrenTasks: Task[];
  depth: number;
  theme: ThemeMode;
  categories: Category[];
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onAddSubtask: (t: Task) => void;
  onEditTask: (t: Task) => void;
  onToggleComplete: (id: string) => void;
  onStartTask: (id: string, e: React.MouseEvent) => void;
  allTasks: Task[]; // Need full list for recursion
  isSelectionMode: boolean;
  selectedTaskIds: Set<string>;
  onToggleSelect: (id: string) => void;
}> = ({ task, childrenTasks, depth, theme, categories, isExpanded, onToggleExpand, onAddSubtask, onEditTask, onToggleComplete, onStartTask, allTasks, isSelectionMode, selectedTaskIds, onToggleSelect }) => {
  
  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  const category = categories.find(c => c.id === task.categoryId);
  const isSelected = selectedTaskIds.has(task.id);
  
  // Styles
  let cardClass = '';
  let lineClass = '';
  let nodeClass = '';
  let btnClass = '';

  if (isArk) {
    cardClass = `bg-ark-surface border-l-2 ${task.isPriority ? 'border-ark-accent' : 'border-ark-primary'} hover:bg-ark-surface/80`;
    lineClass = 'border-l-2 border-ark-muted border-dashed';
    nodeClass = 'bg-ark-bg border-ark-primary text-ark-primary';
    btnClass = 'text-ark-text hover:text-white';
  } else if (isCyber) {
    cardClass = `bg-[#111] border border-[#333] border-l-4 ${task.isPriority ? 'border-[#f0f]' : 'border-[#0ff]'} hover:bg-[#050505]`;
    lineClass = 'border-l-2 border-[#333] border-dashed';
    nodeClass = 'bg-black border-[#0ff] text-[#0ff] shadow-[0_0_5px_#0ff]';
    btnClass = 'text-[#0ff] hover:text-white';
  } else if (isNature) {
    cardClass = `bg-[#e9edc9] border-l-4 ${task.isPriority ? 'border-[#d4a373]' : 'border-[#606c38]'} shadow-sm rounded-xl hover:bg-[#d4e09b]`;
    lineClass = 'border-l-2 border-[#ccd5ae]';
    nodeClass = 'bg-[#fefae0] border-[#606c38] text-[#606c38]';
    btnClass = 'text-[#354f52] hover:text-black';
  } else {
    cardClass = `bg-white border-l-4 ${task.isPriority ? 'border-toon-primary' : 'border-toon-accent'} shadow-md rounded-xl hover:bg-gray-50`;
    lineClass = 'border-l-2 border-gray-200';
    nodeClass = 'bg-white border-toon-accent text-toon-accent';
    btnClass = 'text-gray-500 hover:text-gray-800';
  }

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = "copy";
    // Create a ghost element if needed, but default usually works
  };

  // Override click for selection mode
  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelect(task.id);
    } else {
      onEditTask(task);
    }
  };

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex items-start gap-2 relative">
         {/* Tree Structure Line */}
         <div className="flex flex-col items-center mr-1">
             {/* The Node/Dot */}
            <div 
              onClick={() => onToggleExpand(task.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 cursor-pointer transition-transform hover:scale-110 ${nodeClass}`}
            >
              {childrenTasks.length > 0 ? (
                 isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
              ) : (
                 <GitCommit size={12} />
              )}
            </div>
            
            {/* The Vertical Line for children */}
            {isExpanded && childrenTasks.length > 0 && (
               <div className={`h-full absolute top-6 left-[11px] ${lineClass}`} style={{ minHeight: '100%' }}></div>
            )}
         </div>

         {/* Task Card */}
         <div 
            draggable={!isSelectionMode}
            onDragStart={handleDragStart}
            className={`flex-1 mb-4 p-3 transition-all cursor-pointer group ${cardClass} ${task.completed ? 'opacity-50 grayscale' : ''} ${isSelectionMode && isSelected ? 'ring-2 ring-offset-1 ring-current' : ''}`} 
            onClick={handleCardClick}
         >
            <div className="flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-2">
                     <span className="font-mono text-xs opacity-60 font-bold">{task.startTime}</span>
                     {category && (
                       <span className={`text-[10px] px-1.5 rounded border border-current opacity-70`}>{category.name}</span>
                     )}
                     {!isSelectionMode && (
                        <GripVertical size={12} className="opacity-0 group-hover:opacity-30 cursor-grab" />
                     )}
                  </div>
                  <h4 className={`font-bold leading-tight mt-1 ${isCyber && task.isPriority ? 'text-[#f0f]' : ''}`}>{task.title}</h4>
               </div>
               
               <div className="flex items-center gap-2">
                  {isSelectionMode ? (
                     <div className={isSelected ? 'text-green-500' : 'opacity-30'}>
                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                     </div>
                  ) : (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); onAddSubtask(task); }} className={`p-1 rounded hover:bg-black/10 ${btnClass}`}>
                        <Plus size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }} className={`p-1 rounded hover:bg-black/10 ${btnClass}`}>
                        {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>
                    </>
                  )}
               </div>
            </div>

            {!isSelectionMode && (
              <div className="flex items-center gap-2 mt-2 text-xs opacity-60">
                <span>{task.durationMinutes} min</span>
                {!task.isStarted && !task.completed && (
                  <button 
                    onClick={(e) => onStartTask(task.id, e)}
                    className="flex items-center gap-1 hover:text-green-500 hover:underline"
                  >
                    <Play size={10} /> Start
                  </button>
                )}
              </div>
            )}
         </div>
      </div>

      {/* Render Children Recursively */}
      {isExpanded && childrenTasks.length > 0 && (
         <div className="pl-6">
            {childrenTasks.sort((a,b) => parseTime(a.startTime) - parseTime(b.startTime)).map(child => (
              <TimelineNode 
                key={child.id}
                task={child}
                childrenTasks={allTasks.filter(t => t.parentId === child.id)}
                depth={depth + 1}
                theme={theme}
                categories={categories}
                isExpanded={child.isExpanded ?? true}
                onToggleExpand={onToggleExpand}
                onAddSubtask={onAddSubtask}
                onEditTask={onEditTask}
                onToggleComplete={onToggleComplete}
                onStartTask={onStartTask}
                allTasks={allTasks}
                isSelectionMode={isSelectionMode}
                selectedTaskIds={selectedTaskIds}
                onToggleSelect={onToggleSelect}
              />
            ))}
         </div>
      )}
    </div>
  );
}

const Timeline: React.FC<TimelineProps> = ({ 
  tasks, theme, partitions, categories, onToggleExpand, onAddSubtask, onEditTask, onToggleComplete, onStartTask, isSelectionMode, selectedTaskIds, onToggleSelect 
}) => {
  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  // Group root tasks by partition
  const rootTasks = tasks.filter(t => !t.parentId).sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

  // Helper to determine partition for a task
  const getPartition = (task: Task) => {
     const t = parseTime(task.startTime);
     return partitions.find(p => t >= parseTime(p.startTime) && t < parseTime(p.endTime));
  };

  // Grouping logic
  const groupedTasks: Record<string, Task[]> = {};
  const unsortedTasks: Task[] = [];

  rootTasks.forEach(task => {
    const part = getPartition(task);
    if (part) {
      if (!groupedTasks[part.id]) groupedTasks[part.id] = [];
      groupedTasks[part.id].push(task);
    } else {
      unsortedTasks.push(task);
    }
  });

  const sortedPartitions = [...partitions].sort((a,b) => parseTime(a.startTime) - parseTime(b.startTime));

  let containerClass = '';
  let partitionHeaderClass = '';

  if (isArk) {
    containerClass = 'bg-ark-bg';
    partitionHeaderClass = 'bg-ark-surface/50 text-ark-primary border-l-4 border-ark-accent px-4 py-2 font-mono uppercase tracking-widest text-sm mb-4';
  } else if (isCyber) {
    containerClass = 'bg-black';
    partitionHeaderClass = 'bg-[#111] text-[#0ff] border-b border-[#0ff] px-4 py-2 font-mono glitch-text mb-4 text-lg';
  } else if (isNature) {
    containerClass = 'bg-[#fefae0]';
    partitionHeaderClass = 'bg-[#ccd5ae] text-[#354f52] px-4 py-2 rounded-lg font-serif italic mb-4';
  } else {
    containerClass = 'bg-gray-50';
    partitionHeaderClass = 'bg-white text-toon-primary px-4 py-2 rounded-lg shadow-sm font-bold text-lg mb-4';
  }

  return (
    <div className={`mt-6 pb-20 ${containerClass}`}>
      
      {/* Render Partitions */}
      {sortedPartitions.map(part => {
         const tasksInPart = groupedTasks[part.id];
         if (!tasksInPart || tasksInPart.length === 0) return null;

         return (
           <div key={part.id} className="mb-8">
              <div className={partitionHeaderClass}>
                 {part.name} <span className="text-xs opacity-60 ml-2">{part.startTime} - {part.endTime}</span>
              </div>
              <div className="pl-2">
                 {tasksInPart.map(task => (
                   <TimelineNode 
                     key={task.id} 
                     task={task} 
                     childrenTasks={tasks.filter(t => t.parentId === task.id)}
                     depth={0}
                     theme={theme}
                     categories={categories}
                     isExpanded={task.isExpanded ?? true}
                     onToggleExpand={onToggleExpand}
                     onAddSubtask={onAddSubtask}
                     onEditTask={onEditTask}
                     onToggleComplete={onToggleComplete}
                     onStartTask={onStartTask}
                     allTasks={tasks}
                     isSelectionMode={isSelectionMode}
                     selectedTaskIds={selectedTaskIds}
                     onToggleSelect={onToggleSelect}
                   />
                 ))}
              </div>
           </div>
         )
      })}

      {/* Unsorted / Others */}
      {unsortedTasks.length > 0 && (
         <div className="mb-8">
            <div className={`${partitionHeaderClass} opacity-70`}>Other</div>
            <div className="pl-2">
                {unsortedTasks.map(task => (
                   <TimelineNode 
                     key={task.id} 
                     task={task} 
                     childrenTasks={tasks.filter(t => t.parentId === task.id)}
                     depth={0}
                     theme={theme}
                     categories={categories}
                     isExpanded={task.isExpanded ?? true}
                     onToggleExpand={onToggleExpand}
                     onAddSubtask={onAddSubtask}
                     onEditTask={onEditTask}
                     onToggleComplete={onToggleComplete}
                     onStartTask={onStartTask}
                     allTasks={tasks}
                     isSelectionMode={isSelectionMode}
                     selectedTaskIds={selectedTaskIds}
                     onToggleSelect={onToggleSelect}
                   />
                 ))}
            </div>
         </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center opacity-50 p-10 italic">
          No tasks. Click + to add one.
        </div>
      )}

    </div>
  );
};

export default Timeline;
