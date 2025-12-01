
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  Clock,
  Settings,
  Play
} from 'lucide-react';

import { ThemeMode, Task, Language } from './types';
import { formatDateKey, getTodayKey, parseTime } from './utils';
import { translations } from './translations';
import SettingsModal from './components/SettingsModal';
import TaskModal from './components/TaskModal';
import DelayedList from './components/DelayedList';
import Timeline from './components/Timeline';
import PetWidget from './components/PetWidget';
import RoamingPet from './components/RoamingPet';

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<ThemeMode>('arknights');
  const [language, setLanguage] = useState<Language>('zh-CN');
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalCompletedHistory, setTotalCompletedHistory] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [view, setView] = useState<'calendar' | 'day'>('day');

  // Pet Roaming State - The "One Cat" Rule
  const [isPetRoaming, setIsPetRoaming] = useState(false);

  // To prevent repeated notifications for the same event in the same minute
  const notificationLog = useRef<Set<string>>(new Set());

  // --- Localization Shortener ---
  const t = translations[language];

  // --- Initialization & Storage ---
  useEffect(() => {
    // Load persisted data
    const savedTheme = localStorage.getItem('chrono_theme') as ThemeMode;
    if (savedTheme) setTheme(savedTheme);

    const savedLang = localStorage.getItem('chrono_lang') as Language;
    if (savedLang) setLanguage(savedLang);

    const savedTasks = localStorage.getItem('chrono_tasks');
    if (savedTasks) {
      try { setTasks(JSON.parse(savedTasks)); } catch (e) { console.error(e); }
    }

    const savedHistory = localStorage.getItem('chrono_history');
    if (savedHistory) setTotalCompletedHistory(Number(savedHistory));
    
    // Request notification permission silently on load
    if ("Notification" in window && Notification.permission === 'default') {
      // Browsers often require gesture, so this might be blocked, but we try.
      // Real request happens in Settings.
    }
  }, []);

  // Save changes
  useEffect(() => { localStorage.setItem('chrono_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('chrono_lang', language); }, [language]);
  useEffect(() => { localStorage.setItem('chrono_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('chrono_history', String(totalCompletedHistory)); }, [totalCompletedHistory]);

  // Sync Android Status Bar Color
  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      let color = '#0f172a'; // Ark
      if (theme === 'cartoon') color = '#fff7ed';
      if (theme === 'cyberpunk') color = '#000000';
      if (theme === 'nature') color = '#fefae0';
      metaThemeColor.setAttribute('content', color);
    }
  }, [theme]);

  // --- Logic: Notifications (Every 10 seconds check) ---
  useEffect(() => {
    const checkSchedule = () => {
      if (Notification.permission !== 'granted') return;
      
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const todayKey = getTodayKey();

      tasks.forEach(task => {
        if (task.dateStr !== todayKey || task.completed) return;

        const [startH, startM] = task.startTime.split(':').map(Number);
        const startTotal = startH * 60 + startM;
        const currentTotal = currentHours * 60 + currentMinutes;
        const endTotal = startTotal + task.durationMinutes;

        // 1. Check Start Time (If not started within 5 mins)
        // Condition: Time is between start+5 and start+6, and NOT started
        if (currentTotal >= startTotal + 5 && currentTotal < startTotal + 6 && !task.isStarted) {
           const logKey = `${task.id}-start-${todayKey}`;
           if (!notificationLog.current.has(logKey)) {
             new Notification(t.notifyStartTitle, { body: t.notifyStartBody.replace('{0}', task.title) });
             notificationLog.current.add(logKey);
           }
        }

        // 2. Check End Time (If not completed within 5 mins after duration)
        // Condition: Time is between end+5 and end+6, and NOT completed
        if (currentTotal >= endTotal + 5 && currentTotal < endTotal + 6 && !task.completed) {
           const logKey = `${task.id}-end-${todayKey}`;
           if (!notificationLog.current.has(logKey)) {
             new Notification(t.notifyEndTitle, { body: t.notifyEndBody.replace('{0}', task.title) });
             notificationLog.current.add(logKey);
           }
        }
      });
    };

    const interval = setInterval(checkSchedule, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [tasks, language]);

  // --- Computed ---
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

  // --- Handlers ---
  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } else {
      setTasks(prev => [...prev, task]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isNowComplete = !t.completed;
        if (isNowComplete) {
            setTotalCompletedHistory(c => c + 1);
        } else {
            setTotalCompletedHistory(c => Math.max(0, c - 1));
        }
        return { ...t, completed: isNowComplete };
      }
      return t;
    }));
  };

  const handleStartTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isStarted: true } : t));
  };

  const changeDate = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + delta);
    setSelectedDate(newDate);
  };

  // --- Dynamic Styling ---
  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';
  const isToon = theme === 'cartoon';

  let bgClass = '';
  if (isArk) bgClass = 'bg-ark-bg text-ark-text font-mono';
  else if (isCyber) bgClass = 'bg-black text-[#0ff] font-mono selection:bg-[#f0f] selection:text-white';
  else if (isNature) bgClass = 'bg-[#fefae0] text-[#354f52] font-sans';
  else bgClass = 'bg-toon-bg text-toon-text font-sans';

  let headerClass = '';
  if (isArk) headerClass = 'bg-ark-bg/90 border-b border-ark-muted';
  else if (isCyber) headerClass = 'bg-black/90 border-b border-[#0ff] shadow-[0_0_15px_rgba(0,255,255,0.3)]';
  else if (isNature) headerClass = 'bg-[#faedcd] shadow-sm text-[#354f52]';
  else headerClass = 'bg-toon-bg/90';

  let fabClass = '';
  if (isArk) fabClass = 'bg-ark-primary text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] clip-angled';
  else if (isCyber) fabClass = 'bg-[#f0f] text-black shadow-[0_0_20px_#f0f] rounded-none border-2 border-white hover:bg-white hover:text-[#f0f]';
  else if (isNature) fabClass = 'bg-[#606c38] text-[#fefae0] rounded-full shadow-lg';
  else fabClass = 'bg-toon-primary text-white hover:bg-rose-500 rounded-full shadow-xl';

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-24 ${bgClass}`}>
      {/* Roaming Pet Overlay - Handles the cat when it's exploring */}
      <RoamingPet 
        tasks={tasks} 
        completedCount={totalCompletedHistory} 
        theme={theme}
        isRoaming={isPetRoaming}
        onStartRoaming={() => setIsPetRoaming(true)}
      />

      {/* Top Bar */}
      <header className={`sticky top-0 z-30 px-4 py-4 flex items-center justify-between backdrop-blur-md ${headerClass}`}>
        <div className="flex items-center gap-2" onClick={() => setView(view === 'day' ? 'calendar' : 'day')}>
           <div className={`p-2 rounded-lg cursor-pointer transition-colors ${isArk ? 'bg-ark-primary/20 text-ark-primary' : (isCyber ? 'bg-[#111] border border-[#0ff] text-[#0ff]' : 'bg-white text-toon-primary shadow-sm')}`}>
              <CalendarIcon size={20} />
           </div>
           <div>
             <h1 className={`text-lg font-bold leading-none ${isArk || isCyber ? 'uppercase' : ''}`}>
               {view === 'day' ? t.dailyPlan : t.calendar}
             </h1>
             <p className="text-xs opacity-60">
               {selectedDate.toLocaleDateString(language, { weekday: 'long', month: 'short', day: 'numeric' })}
             </p>
           </div>
        </div>
        
        {/* Settings Button */}
        <button 
           onClick={() => setIsSettingsOpen(true)}
           className={`p-2 rounded-full transition-transform hover:rotate-90 ${isArk ? 'bg-ark-surface border border-ark-muted' : (isCyber ? 'bg-black border border-[#f0f] text-[#f0f]' : 'bg-white shadow-sm')}`}
        >
          <Settings size={20} />
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        
        {/* PET WIDGET (Always visible in Day view, but cat might be missing if roaming) */}
        {view === 'day' && (
          <PetWidget 
            totalCompleted={totalCompletedHistory} 
            theme={theme} 
            language={language} 
            isRoaming={isPetRoaming} 
          />
        )}

        {/* VIEW: CALENDAR */}
        {view === 'calendar' && (
          <div className={`animate-in fade-in slide-in-from-top-4 duration-300`}>
            <div className={`p-4 mb-4 text-center ${isArk ? 'bg-ark-surface' : (isCyber ? 'bg-black border border-[#333]' : 'bg-white rounded-3xl shadow-sm')}`}>
              <h2 className="mb-4 font-bold">{t.selectDate}</h2>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({length: 14}).map((_, i) => {
                   const d = new Date();
                   d.setDate(d.getDate() - 3 + i);
                   const isSelected = formatDateKey(d) === selectedDateStr;
                   const isToday = formatDateKey(d) === todayStr;
                   
                   let dayBtnClass = '';
                   if (isSelected) {
                     if (isArk) dayBtnClass = 'bg-ark-primary text-black';
                     else if (isCyber) dayBtnClass = 'bg-[#0ff] text-black shadow-[0_0_10px_#0ff]';
                     else if (isNature) dayBtnClass = 'bg-[#606c38] text-[#fefae0]';
                     else dayBtnClass = 'bg-toon-primary text-white shadow-lg scale-110';
                   } else {
                     if (isArk) dayBtnClass = 'bg-ark-surface hover:bg-ark-surface/80';
                     else if (isCyber) dayBtnClass = 'bg-[#111] border border-[#333] hover:border-[#0ff]';
                     else if (isNature) dayBtnClass = 'bg-[#e9edc9] hover:bg-[#ccd5ae]';
                     else dayBtnClass = 'bg-white hover:bg-gray-50';
                   }

                   return (
                     <button 
                       key={i}
                       onClick={() => { setSelectedDate(d); setView('day'); }}
                       className={`aspect-square flex flex-col items-center justify-center text-xs rounded-lg transition-all ${dayBtnClass} ${isToday && !isSelected ? 'border-2 border-current' : ''}`}
                     >
                       <span className="opacity-60">{d.toLocaleDateString('en-US', {weekday: 'narrow'})}</span>
                       <span className="font-bold text-lg">{d.getDate()}</span>
                     </button>
                   )
                })}
              </div>
              <button 
                onClick={() => setView('day')}
                className={`mt-6 px-6 py-2 w-full font-bold ${isArk ? 'bg-ark-accent text-black' : (isCyber ? 'bg-[#f0f] text-white hover:bg-[#d0d]' : 'bg-toon-accent text-white rounded-xl')}`}
              >
                {t.goToSelected}
              </button>
            </div>
          </div>
        )}

        {/* VIEW: DAY PLANNER */}
        {view === 'day' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => changeDate(-1)} className={`p-2 hover:opacity-70`}>
                <ChevronLeft />
              </button>
              <div className={`text-sm font-bold px-4 py-1 ${isArk ? 'bg-ark-surface border border-ark-muted' : (isCyber ? 'border border-[#0ff] text-[#0ff]' : 'bg-white rounded-full shadow-sm text-gray-500')}`}>
                {selectedDateStr === todayStr ? t.today : selectedDateStr}
              </div>
              <button onClick={() => changeDate(1)} className={`p-2 hover:opacity-70`}>
                <ChevronRight />
              </button>
            </div>

            {/* Delayed Tasks */}
            {selectedDateStr === todayStr && delayedTasks.length > 0 && (
              <DelayedList theme={theme} tasks={delayedTasks} language={language} onComplete={handleToggleComplete} />
            )}

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-1 font-bold opacity-70">
                <span>{t.dailyProgress}</span>
                <span>{Math.round((completedTasks.length / (currentTasks.length || 1)) * 100)}%</span>
              </div>
              <div className={`h-2 w-full overflow-hidden ${isArk ? 'bg-ark-surface' : (isCyber ? 'bg-[#333]' : 'bg-gray-200 rounded-full')}`}>
                <div 
                  className={`h-full transition-all duration-500 ${isArk ? 'bg-ark-primary' : (isCyber ? 'bg-[#0ff] shadow-[0_0_10px_#0ff]' : (isNature ? 'bg-[#606c38]' : 'bg-toon-primary'))}`}
                  style={{ width: `${(completedTasks.length / (currentTasks.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Task List: Pending */}
            <div className="space-y-4 mb-8">
              <h3 className={`text-sm font-bold ${isArk || isCyber ? 'uppercase tracking-widest opacity-80' : 'text-gray-400 pl-2'}`}>
                {t.pendingMissions}
              </h3>
              
              {pendingTasks.length === 0 && (
                <div className={`p-8 text-center border-2 border-dashed opacity-50 ${isCyber ? 'border-[#333]' : 'border-current'}`}>
                  {t.noPending}
                </div>
              )}

              {pendingTasks.map(task => {
                let cardClass = '';
                if (isArk) cardClass = 'bg-ark-surface border-l-2 hover:bg-ark-surface/80';
                else if (isCyber) cardClass = 'bg-[#050505] border border-[#333] border-l-4 hover:border-[#0ff] hover:bg-[#111]';
                else if (isNature) cardClass = 'bg-[#e9edc9] hover:bg-[#d4e09b] rounded-2xl shadow-sm border-l-4';
                else cardClass = 'bg-white rounded-2xl shadow-sm hover:shadow-md border-l-4';

                let priorityBorder = '';
                if (task.isPriority) {
                   if (isArk) priorityBorder = 'border-ark-accent';
                   else if (isCyber) priorityBorder = 'border-[#f0f]';
                   else if (isNature) priorityBorder = 'border-[#bc4749]';
                   else priorityBorder = 'border-toon-primary';
                } else {
                   if (isArk) priorityBorder = 'border-ark-primary';
                   else if (isCyber) priorityBorder = 'border-[#0ff]';
                   else if (isNature) priorityBorder = 'border-[#606c38]';
                   else priorityBorder = 'border-toon-accent';
                }

                return (
                  <div 
                    key={task.id}
                    onClick={() => setEditingTask(task)}
                    className={`group relative p-4 transition-all active:scale-95 cursor-pointer ${cardClass} ${priorityBorder}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Check Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleComplete(task.id); }}
                        className={`mt-1 transition-colors ${isArk ? 'text-ark-muted hover:text-ark-primary' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <Circle size={24} />
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-bold text-lg leading-tight ${task.isPriority ? (isArk ? 'text-ark-accent' : (isCyber ? 'text-[#f0f]' : '')) : ''}`}>
                            {task.title}
                          </h4>
                          <span className="text-xs font-mono opacity-50 bg-black/5 px-1 rounded">{task.startTime}</span>
                        </div>
                        <div className="text-xs opacity-60 mt-1 flex items-center gap-2">
                          <Clock size={12} /> {task.durationMinutes} min
                        </div>
                        
                        {/* Start Task Button / Status Indicator */}
                        <div className="mt-3 flex items-center gap-2">
                          {!task.isStarted ? (
                             <button
                                onClick={(e) => handleStartTask(task.id, e)}
                                className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-colors 
                                  ${isArk ? 'bg-ark-primary/20 text-ark-primary hover:bg-ark-primary hover:text-black' : (isCyber ? 'bg-[#0ff]/10 text-[#0ff] border border-[#0ff] hover:bg-[#0ff] hover:text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                                `}
                             >
                                <Play size={10} fill="currentColor" /> {t.clickToStart}
                             </button>
                          ) : (
                             <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isCyber ? 'text-[#0f0] border-[#0f0]' : 'text-green-500 border-green-500'}`}>
                               {t.started}
                             </span>
                          )}
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
                );
              })}
            </div>

            {/* Task List: Completed */}
            {completedTasks.length > 0 && (
              <div className="space-y-4">
                 <h3 className={`text-sm font-bold ${isArk || isCyber ? 'uppercase tracking-widest opacity-80' : 'text-gray-400 pl-2'}`}>
                  {t.completed}
                </h3>
                {completedTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`flex items-center gap-3 p-3 opacity-60 ${isArk ? 'bg-ark-surface/30' : (isCyber ? 'bg-[#111]' : 'bg-gray-50 rounded-xl')}`}
                  >
                     <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`${isArk ? 'text-ark-primary' : (isCyber ? 'text-[#0f0]' : 'text-toon-primary')}`}
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
            
            <div className="h-24"></div>
          </div>
        )}
      </main>

      {/* FAB: Add Task */}
      <button
        onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
        className={`fixed bottom-6 right-6 p-4 transition-all hover:scale-110 active:scale-90 z-40 ${fabClass}`}
      >
        <Plus size={28} />
      </button>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={theme}
        setTheme={setTheme}
        currentLang={language}
        setLang={setLanguage}
      />

      {/* Task Modal */}
      <TaskModal 
        isOpen={isModalOpen || !!editingTask}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        selectedDateStr={selectedDateStr}
        theme={theme}
        language={language}
        initialData={editingTask}
      />
    </div>
  );
};

export default App;
