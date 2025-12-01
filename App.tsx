import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  Menu,
  Clock
} from 'lucide-react';

import { ThemeMode, Task } from './types';
import { formatDateKey, getTodayKey } from './utils';
import ThemeToggle from './components/ThemeToggle';
import TaskModal from './components/TaskModal';
import DelayedList from './components/DelayedList';
import Timeline from './components/Timeline';

const App: React.FC = () => {
  // State
  const [theme, setTheme] = useState<ThemeMode>('arknights');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [view, setView] = useState<'calendar' | 'day'>('day');

  // Load data
  useEffect(() => {
    const savedTheme = localStorage.getItem('chrono_theme') as ThemeMode;
    if (savedTheme) setTheme(savedTheme);

    const savedTasks = localStorage.getItem('chrono_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('chrono_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('chrono_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Computed
  const selectedDateStr = formatDateKey(selectedDate);
  const todayStr = getTodayKey();

  const currentTasks = useMemo(() => {
    return tasks.filter(t => t.dateStr === selectedDateStr);
  }, [tasks, selectedDateStr]);

  const delayedTasks = useMemo(() => {
    return tasks.filter(t => t.dateStr < todayStr && !t.completed);
  }, [tasks, todayStr]);

  const completedTasks = currentTasks.filter(t => t.completed);
  const pendingTasks = currentTasks.filter(t => !t.completed);

  // Handlers
  const handleToggleTheme = () => {
    setTheme(prev => prev === 'arknights' ? 'cartoon' : 'arknights');
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } else {
      setTasks(prev => [...prev, task]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const changeDate = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + delta);
    setSelectedDate(newDate);
  };

  // Styles based on theme
  const isArk = theme === 'arknights';
  const bgClass = isArk ? 'bg-ark-bg text-ark-text font-mono' : 'bg-toon-bg text-toon-text font-sans';

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${bgClass}`}>
      {/* Top Bar */}
      <header className={`sticky top-0 z-30 px-4 py-4 flex items-center justify-between backdrop-blur-md 
        ${isArk ? 'bg-ark-bg/90 border-b border-ark-muted' : 'bg-toon-bg/90'}`}>
        <div className="flex items-center gap-2" onClick={() => setView(view === 'day' ? 'calendar' : 'day')}>
           <div className={`p-2 rounded-lg cursor-pointer transition-colors ${isArk ? 'bg-ark-primary/20 text-ark-primary' : 'bg-white text-toon-primary shadow-sm'}`}>
              <CalendarIcon size={20} />
           </div>
           <div>
             <h1 className={`text-lg font-bold leading-none ${isArk ? 'uppercase' : ''}`}>
               {view === 'day' ? 'Daily Plan' : 'Calendar'}
             </h1>
             <p className="text-xs opacity-60">
               {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
             </p>
           </div>
        </div>
        <ThemeToggle currentTheme={theme} onToggle={handleToggleTheme} />
      </header>

      <main className="p-4 max-w-lg mx-auto">
        
        {/* VIEW: CALENDAR (Simplified for this snippet) */}
        {view === 'calendar' && (
          <div className={`animate-in fade-in slide-in-from-top-4 duration-300`}>
            <div className={`p-4 mb-4 text-center ${isArk ? 'bg-ark-surface' : 'bg-white rounded-3xl shadow-sm'}`}>
              <h2 className="mb-4 font-bold">Select Date</h2>
              {/* Simple Day Navigation for simplicity in this artifact, could be a full grid */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({length: 14}).map((_, i) => {
                   const d = new Date();
                   d.setDate(d.getDate() - 3 + i);
                   const isSelected = formatDateKey(d) === selectedDateStr;
                   const isToday = formatDateKey(d) === todayStr;
                   
                   return (
                     <button 
                       key={i}
                       onClick={() => { setSelectedDate(d); setView('day'); }}
                       className={`
                         aspect-square flex flex-col items-center justify-center text-xs rounded-lg transition-all
                         ${isSelected 
                           ? (isArk ? 'bg-ark-primary text-black' : 'bg-toon-primary text-white shadow-lg scale-110')
                           : (isArk ? 'bg-ark-surface hover:bg-ark-surface/80' : 'bg-white hover:bg-gray-50')
                         }
                         ${isToday && !isSelected ? 'border-2 border-current' : ''}
                       `}
                     >
                       <span className="opacity-60">{d.toLocaleDateString('en-US', {weekday: 'narrow'})}</span>
                       <span className="font-bold text-lg">{d.getDate()}</span>
                     </button>
                   )
                })}
              </div>
              <button 
                onClick={() => setView('day')}
                className={`mt-6 px-6 py-2 w-full font-bold ${isArk ? 'bg-ark-accent text-black' : 'bg-toon-accent text-white rounded-xl'}`}
              >
                Go to Selected
              </button>
            </div>
          </div>
        )}

        {/* VIEW: DAY PLANNER */}
        {view === 'day' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => changeDate(-1)} className={`p-2 ${isArk ? 'hover:text-ark-primary' : 'bg-white rounded-full shadow-sm text-toon-muted hover:text-toon-primary'}`}>
                <ChevronLeft />
              </button>
              <div className={`text-sm font-bold px-4 py-1 ${isArk ? 'bg-ark-surface border border-ark-muted' : 'bg-white rounded-full shadow-sm text-gray-500'}`}>
                {selectedDateStr === todayStr ? 'TODAY' : selectedDateStr}
              </div>
              <button onClick={() => changeDate(1)} className={`p-2 ${isArk ? 'hover:text-ark-primary' : 'bg-white rounded-full shadow-sm text-toon-muted hover:text-toon-primary'}`}>
                <ChevronRight />
              </button>
            </div>

            {/* Delayed Tasks (Only show if we are on today) */}
            {selectedDateStr === todayStr && delayedTasks.length > 0 && (
              <DelayedList theme={theme} tasks={delayedTasks} onComplete={handleToggleComplete} />
            )}

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-1 font-bold opacity-70">
                <span>DAILY PROGRESS</span>
                <span>{Math.round((completedTasks.length / (currentTasks.length || 1)) * 100)}%</span>
              </div>
              <div className={`h-2 w-full overflow-hidden ${isArk ? 'bg-ark-surface' : 'bg-gray-200 rounded-full'}`}>
                <div 
                  className={`h-full transition-all duration-500 ${isArk ? 'bg-ark-primary' : 'bg-toon-primary'}`}
                  style={{ width: `${(completedTasks.length / (currentTasks.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Task List: Pending */}
            <div className="space-y-4 mb-8">
              <h3 className={`text-sm font-bold ${isArk ? 'text-ark-muted uppercase tracking-widest' : 'text-gray-400 pl-2'}`}>
                Pending Missions
              </h3>
              
              {pendingTasks.length === 0 && (
                <div className={`p-8 text-center border-2 border-dashed ${isArk ? 'border-ark-surface text-ark-muted' : 'border-gray-200 text-gray-300'}`}>
                  No pending tasks
                </div>
              )}

              {pendingTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => setEditingTask(task)} // Edit on click
                  className={`
                    group relative p-4 transition-all active:scale-95 cursor-pointer
                    ${isArk 
                      ? 'bg-ark-surface border-l-2 hover:bg-ark-surface/80' 
                      : 'bg-white rounded-2xl shadow-sm hover:shadow-md border-l-4'}
                    ${task.isPriority 
                      ? (isArk ? 'border-ark-accent' : 'border-toon-primary') 
                      : (isArk ? 'border-ark-primary' : 'border-toon-accent')}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleComplete(task.id); }}
                      className={`mt-1 transition-colors ${isArk ? 'text-ark-muted hover:text-ark-primary' : 'text-gray-300 hover:text-toon-primary'}`}
                    >
                      <Circle size={24} />
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-bold text-lg leading-tight ${task.isPriority ? (isArk ? 'text-ark-accent' : 'text-toon-primary') : ''}`}>
                          {task.title}
                        </h4>
                        <span className="text-xs font-mono opacity-50 bg-black/5 px-1 rounded">{task.startTime}</span>
                      </div>
                      <div className="text-xs opacity-60 mt-1 flex items-center gap-2">
                        <Clock size={12} /> {task.durationMinutes} min
                      </div>
                      {task.description && (
                        <p className="text-sm opacity-70 mt-2 line-clamp-2">{task.description}</p>
                      )}
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Task List: Completed */}
            {completedTasks.length > 0 && (
              <div className="space-y-4">
                 <h3 className={`text-sm font-bold ${isArk ? 'text-ark-muted uppercase tracking-widest' : 'text-gray-400 pl-2'}`}>
                  Completed
                </h3>
                {completedTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`
                      flex items-center gap-3 p-3 opacity-60
                      ${isArk ? 'bg-ark-surface/30' : 'bg-gray-50 rounded-xl'}
                    `}
                  >
                     <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`${isArk ? 'text-ark-primary' : 'text-toon-primary'}`}
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <span className="line-through decoration-2 decoration-current">{task.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline Visualizer */}
            {currentTasks.length > 0 && <Timeline tasks={currentTasks} theme={theme} />}
            
            {/* Bottom Spacer for FAB */}
            <div className="h-24"></div>
          </div>
        )}
      </main>

      {/* FAB: Add Task */}
      <button
        onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
        className={`
          fixed bottom-6 right-6 p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-90 z-40
          ${isArk 
            ? 'bg-ark-primary text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] clip-angled' 
            : 'bg-toon-primary text-white hover:bg-rose-500'}
        `}
      >
        <Plus size={28} />
      </button>

      {/* Task Modal */}
      <TaskModal 
        isOpen={isModalOpen || !!editingTask}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        selectedDateStr={selectedDateStr}
        theme={theme}
        initialData={editingTask}
      />
    </div>
  );
};

export default App;