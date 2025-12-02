
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Settings,
  List,
  User,
  Filter,
  Network,
  Grid,
  CheckSquare,
  X as XIcon,
  Save
} from 'lucide-react';

import { ThemeMode, Task, Language, TimePartition, Category, UserProfile, ChatMessage, TaskBundle } from './types';
import { formatDateKey, getTodayKey, generateId } from './utils';
import { translations } from './translations';
import SettingsModal from './components/SettingsModal';
import TaskModal from './components/TaskModal';
import DelayedList from './components/DelayedList';
import Timeline from './components/Timeline';
import MindMapTimeline from './components/MindMapTimeline';
import PetWidget from './components/PetWidget';
import ZoneManager from './components/ZoneManager';
import UserProfileModal from './components/UserProfileModal';
import PetChatModal from './components/PetChatModal';
import TaskNetModal from './components/TaskNetModal';

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<ThemeMode>('arknights');
  const [language, setLanguage] = useState<Language>('zh-CN');
  const [apiKey, setApiKey] = useState('');
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalCompletedHistory, setTotalCompletedHistory] = useState(0);

  // New Feature States
  const [userProfile, setUserProfile] = useState<UserProfile>({
    nickname: 'User', bio: '', gender: 'secret', joinDate: Date.now()
  });
  const [petName, setPetName] = useState('Pet');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);

  // Task Nets & Selection
  const [taskBundles, setTaskBundles] = useState<TaskBundle[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Configuration State
  const [partitions, setPartitions] = useState<TimePartition[]>([
    { id: 'p1', name: 'Morning', startTime: '06:00', endTime: '12:00' },
    { id: 'p2', name: 'Afternoon', startTime: '12:00', endTime: '18:00' },
    { id: 'p3', name: 'Evening', startTime: '18:00', endTime: '23:59' }
  ]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'c1', name: 'Study' }, 
    { id: 'c2', name: 'Life' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZoneManagerOpen, setIsZoneManagerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTaskNetOpen, setIsTaskNetOpen] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentForSubtask, setParentForSubtask] = useState<Task | null>(null);
  
  const [view, setView] = useState<'calendar' | 'day' | 'mindmap'>('day');

  // To prevent repeated notifications
  const notificationLog = useRef<Set<string>>(new Set());
  const t = translations[language];

  // --- Initialization & Storage ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('chrono_theme') as ThemeMode;
    if (savedTheme) setTheme(savedTheme);

    const savedLang = localStorage.getItem('chrono_lang') as Language;
    if (savedLang) setLanguage(savedLang);

    const savedKey = localStorage.getItem('chrono_apikey');
    if (savedKey) setApiKey(savedKey);

    const savedTasks = localStorage.getItem('chrono_tasks');
    if (savedTasks) try { setTasks(JSON.parse(savedTasks)); } catch (e) { console.error(e); }

    const savedHistory = localStorage.getItem('chrono_history');
    if (savedHistory) setTotalCompletedHistory(Number(savedHistory));

    const savedParts = localStorage.getItem('chrono_partitions');
    if (savedParts) try { setPartitions(JSON.parse(savedParts)); } catch (e) {}

    const savedCats = localStorage.getItem('chrono_categories');
    if (savedCats) try { setCategories(JSON.parse(savedCats)); } catch (e) {}

    const savedProfile = localStorage.getItem('chrono_profile');
    if (savedProfile) try { setUserProfile(JSON.parse(savedProfile)); } catch (e) {}

    const savedPetName = localStorage.getItem('chrono_petname');
    if (savedPetName) setPetName(savedPetName);

    const savedBundles = localStorage.getItem('chrono_bundles');
    if (savedBundles) try { setTaskBundles(JSON.parse(savedBundles)); } catch (e) {}
  }, []);

  // Save changes
  useEffect(() => { localStorage.setItem('chrono_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('chrono_lang', language); }, [language]);
  useEffect(() => { localStorage.setItem('chrono_apikey', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('chrono_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('chrono_history', String(totalCompletedHistory)); }, [totalCompletedHistory]);
  useEffect(() => { localStorage.setItem('chrono_partitions', JSON.stringify(partitions)); }, [partitions]);
  useEffect(() => { localStorage.setItem('chrono_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('chrono_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('chrono_petname', petName); }, [petName]);
  useEffect(() => { localStorage.setItem('chrono_bundles', JSON.stringify(taskBundles)); }, [taskBundles]);

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

  // --- Logic: Notifications ---
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

        if (currentTotal >= startTotal + 5 && currentTotal < startTotal + 6 && !task.isStarted) {
           const logKey = `${task.id}-start-${todayKey}`;
           if (!notificationLog.current.has(logKey)) {
             new Notification(t.notifyStartTitle, { body: t.notifyStartBody.replace('{0}', task.title) });
             notificationLog.current.add(logKey);
           }
        }
        if (currentTotal >= endTotal + 5 && currentTotal < endTotal + 6 && !task.completed) {
           const logKey = `${task.id}-end-${todayKey}`;
           if (!notificationLog.current.has(logKey)) {
             new Notification(t.notifyEndTitle, { body: t.notifyEndBody.replace('{0}', task.title) });
             notificationLog.current.add(logKey);
           }
        }
      });
    };
    const interval = setInterval(checkSchedule, 10000); 
    return () => clearInterval(interval);
  }, [tasks, language]);

  // --- Computed ---
  const selectedDateStr = formatDateKey(selectedDate);
  const todayStr = getTodayKey();

  const currentTasks = useMemo(() => {
    let t = tasks.filter(task => task.dateStr === selectedDateStr);
    if (filterCategoryId) {
      t = t.filter(task => task.categoryId === filterCategoryId);
    }
    return t;
  }, [tasks, selectedDateStr, filterCategoryId]);

  const delayedTasks = useMemo(() => {
    return tasks.filter(t => t.dateStr < todayStr && !t.completed);
  }, [tasks, todayStr]);

  const completedTasks = currentTasks.filter(t => t.completed);

  // --- Handlers ---
  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } else {
      setTasks(prev => [...prev, task]);
    }
    setEditingTask(null);
    setParentForSubtask(null);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isNowComplete = !t.completed;
        // Update history stats
        setTotalCompletedHistory(c => isNowComplete ? c + 1 : Math.max(0, c - 1));
        return { ...t, completed: isNowComplete };
      }
      return t;
    }));
  };

  const handleStartTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isStarted: true } : t));
  };

  const handleToggleExpand = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isExpanded: !t.isExpanded } : t));
  };

  const handleAddSubtask = (parent: Task) => {
    setParentForSubtask(parent);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const changeDate = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + delta);
    setSelectedDate(newDate);
  };

  // --- Task Nets (Bundles) Logic ---
  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedTaskIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTaskIds(newSet);
  };

  const saveSelectedToBundle = () => {
    if (selectedTaskIds.size === 0) return;
    const name = prompt(t.enterNetName);
    if (!name) return;

    // Capture tasks
    const tasksToSave = tasks.filter(t => selectedTaskIds.has(t.id));
    const newBundle: TaskBundle = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      tasks: tasksToSave.map(t => ({...t})) // Clone
    };

    setTaskBundles(prev => [...prev, newBundle]);
    alert(t.netCreated);
    setIsSelectionMode(false);
    setSelectedTaskIds(new Set());
  };

  const loadBundle = (bundle: TaskBundle) => {
    if (!window.confirm(t.loadNetConfirm.replace('{0}', String(bundle.tasks.length)))) return;

    // Clone tasks and update dates to current selected date
    // Also regenerate IDs to avoid collisions if loaded multiple times
    const idMap = new Map<string, string>();
    bundle.tasks.forEach(t => idMap.set(t.id, generateId()));

    const newTasks = bundle.tasks.map(t => ({
      ...t,
      id: idMap.get(t.id)!,
      parentId: t.parentId ? idMap.get(t.parentId) : undefined,
      dateStr: selectedDateStr,
      completed: false,
      isStarted: false
    }));

    setTasks(prev => [...prev, ...newTasks]);
    setIsTaskNetOpen(false);
  };

  const deleteBundle = (id: string) => {
    setTaskBundles(prev => prev.filter(b => b.id !== id));
  };

  // --- Dynamic Styling ---
  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

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
  let fabSecondaryClass = '';
  if (isArk) {
    fabClass = 'bg-ark-primary text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] clip-angled';
    fabSecondaryClass = 'bg-ark-surface border border-ark-primary text-ark-primary';
  } else if (isCyber) {
    fabClass = 'bg-[#f0f] text-black shadow-[0_0_20px_#f0f] rounded-none border-2 border-white hover:bg-white hover:text-[#f0f]';
    fabSecondaryClass = 'bg-black border border-[#0ff] text-[#0ff] shadow-[0_0_10px_#0ff]';
  } else if (isNature) {
    fabClass = 'bg-[#606c38] text-[#fefae0] rounded-full shadow-lg';
    fabSecondaryClass = 'bg-[#e9edc9] text-[#606c38] border border-[#606c38] rounded-full';
  } else {
    fabClass = 'bg-toon-primary text-white hover:bg-rose-500 rounded-full shadow-xl';
    fabSecondaryClass = 'bg-white text-toon-primary border border-toon-primary rounded-full shadow-md';
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-24 ${bgClass}`}>
      
      {/* Top Bar */}
      <header className={`sticky top-0 z-30 px-4 py-4 flex items-center justify-between backdrop-blur-md ${headerClass}`}>
        <div className="flex items-center gap-2" onClick={() => !isSelectionMode && setView(view === 'calendar' ? 'day' : 'calendar')}>
           <div className={`p-2 rounded-lg cursor-pointer transition-colors ${isArk ? 'bg-ark-primary/20 text-ark-primary' : (isCyber ? 'bg-[#111] border border-[#0ff] text-[#0ff]' : 'bg-white text-toon-primary shadow-sm')}`}>
              <CalendarIcon size={20} />
           </div>
           <div>
             <h1 className={`text-lg font-bold leading-none ${isArk || isCyber ? 'uppercase' : ''}`}>
               {isSelectionMode ? t.selectionMode : (view === 'calendar' ? t.calendar : (view === 'mindmap' ? t.mindMapView : t.dailyPlan))}
             </h1>
             <p className="text-xs opacity-60">
               {selectedDate.toLocaleDateString(language, { weekday: 'long', month: 'short', day: 'numeric' })}
             </p>
           </div>
        </div>
        
        <div className="flex gap-2">
           {isSelectionMode ? (
             <>
                <button 
                  onClick={() => { setIsSelectionMode(false); setSelectedTaskIds(new Set()); }}
                  className={`p-2 rounded-full border border-current opacity-60 hover:opacity-100`}
                >
                  <XIcon size={20} />
                </button>
                <button 
                  onClick={saveSelectedToBundle}
                  className={`p-2 rounded-full border border-current font-bold text-green-500 hover:bg-green-500 hover:text-white`}
                  disabled={selectedTaskIds.size === 0}
                >
                  <Save size={20} />
                </button>
             </>
           ) : (
             <>
               {/* Selection Mode Toggle */}
               {view === 'day' && (
                 <button 
                   onClick={() => setIsSelectionMode(true)}
                   className={`p-2 rounded-full transition-all ${isArk ? 'bg-ark-surface border border-ark-muted' : (isCyber ? 'bg-black border border-[#f0f] text-[#f0f]' : 'bg-white shadow-sm')}`}
                 >
                    <CheckSquare size={20} />
                 </button>
               )}
               {/* Profile Button */}
               <button 
                 onClick={() => setIsProfileOpen(true)}
                 className={`p-2 rounded-full transition-all ${isArk ? 'bg-ark-surface border border-ark-muted' : (isCyber ? 'bg-black border border-[#f0f] text-[#f0f]' : 'bg-white shadow-sm')}`}
               >
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} className="w-5 h-5 rounded-full object-cover" alt="Me" />
                  ) : (
                    <User size={20} />
                  )}
               </button>
               {/* Settings Button */}
               <button 
                 onClick={() => setIsSettingsOpen(true)}
                 className={`p-2 rounded-full transition-transform hover:rotate-90 ${isArk ? 'bg-ark-surface border border-ark-muted' : (isCyber ? 'bg-black border border-[#f0f] text-[#f0f]' : 'bg-white shadow-sm')}`}
               >
                 <Settings size={20} />
               </button>
             </>
           )}
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        
        {/* PET WIDGET */}
        {(view === 'day' || view === 'mindmap') && !isSelectionMode && (
          <PetWidget 
            totalCompleted={totalCompletedHistory} 
            theme={theme} 
            language={language} 
            petName={petName}
            onChatClick={() => setIsChatOpen(true)}
          />
        )}

        {/* CALENDAR VIEW */}
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
                   let dayBtnClass = isSelected 
                      ? (isArk ? 'bg-ark-primary text-black' : isCyber ? 'bg-[#0ff] text-black shadow-[0_0_10px_#0ff]' : isNature ? 'bg-[#606c38] text-[#fefae0]' : 'bg-toon-primary text-white shadow-lg') 
                      : (isArk ? 'bg-ark-surface' : isCyber ? 'bg-[#111] border border-[#333]' : isNature ? 'bg-[#e9edc9]' : 'bg-white');
                   
                   return (
                     <button 
                       key={i}
                       onClick={() => { setSelectedDate(d); setView('mindmap'); }}
                       className={`aspect-square flex flex-col items-center justify-center text-xs rounded-lg transition-all ${dayBtnClass} ${isToday && !isSelected ? 'border-2 border-current' : ''}`}
                     >
                       <span className="opacity-60">{d.toLocaleDateString('en-US', {weekday: 'narrow'})}</span>
                       <span className="font-bold text-lg">{d.getDate()}</span>
                     </button>
                   )
                })}
              </div>
              <button 
                onClick={() => setView('mindmap')}
                className={`mt-6 px-6 py-2 w-full font-bold ${isArk ? 'bg-ark-accent text-black' : (isCyber ? 'bg-[#f0f] text-white' : 'bg-toon-accent text-white rounded-xl')}`}
              >
                {t.goToSelected}
              </button>
            </div>
          </div>
        )}

        {/* DAY / MINDMAP VIEW */}
        {(view === 'day' || view === 'mindmap') && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {/* Nav & Filter */}
            {!isSelectionMode && (
              <div className="flex flex-col gap-4 mb-6">
                 <div className="flex items-center justify-between">
                    <button onClick={() => changeDate(-1)} className={`p-2 hover:opacity-70`}><ChevronLeft /></button>
                    <div className={`text-sm font-bold px-4 py-1 ${isArk ? 'bg-ark-surface border border-ark-muted' : (isCyber ? 'border border-[#0ff] text-[#0ff]' : 'bg-white rounded-full shadow-sm text-gray-500')}`}>
                      {selectedDateStr === todayStr ? t.today : selectedDateStr}
                    </div>
                    <button onClick={() => changeDate(1)} className={`p-2 hover:opacity-70`}><ChevronRight /></button>
                 </div>

                 {/* Category Filter Pills */}
                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                      onClick={() => setFilterCategoryId(null)}
                      className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold border transition-all 
                         ${!filterCategoryId ? 'bg-current text-black dark:text-white bg-opacity-20 border-current' : 'opacity-50 border-gray-500'}
                      `}
                    >
                       {t.all}
                    </button>
                    {categories.map(cat => (
                       <button
                          key={cat.id}
                          onClick={() => setFilterCategoryId(filterCategoryId === cat.id ? null : cat.id)}
                          className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold border transition-all 
                            ${filterCategoryId === cat.id 
                              ? (isArk ? 'bg-ark-primary text-black border-ark-primary' : (isCyber ? 'bg-[#f0f] text-black border-[#f0f]' : 'bg-toon-primary text-white border-toon-primary')) 
                              : 'opacity-50 border-gray-500'}
                          `}
                       >
                          {cat.name}
                       </button>
                    ))}
                 </div>
              </div>
            )}

            {/* View Switcher Button */}
            {!isSelectionMode && (
              <div className="flex justify-end mb-2">
                  <button onClick={() => setView(view === 'day' ? 'mindmap' : 'day')} className="text-xs flex items-center gap-1 opacity-70 hover:opacity-100">
                     {view === 'day' ? <Network size={14} /> : <List size={14} />} {view === 'day' ? t.mindMapView : t.listView}
                  </button>
              </div>
            )}

            {/* Delayed Tasks */}
            {selectedDateStr === todayStr && delayedTasks.length > 0 && view === 'day' && !isSelectionMode && (
              <DelayedList theme={theme} tasks={delayedTasks} language={language} onComplete={handleToggleComplete} />
            )}

            {/* MAIN CONTENT SWITCH */}
            {view === 'mindmap' && !isSelectionMode ? (
                <MindMapTimeline 
                  tasks={currentTasks} // Pass ONLY current date tasks
                  theme={theme}
                  partitions={partitions}
                  categories={categories}
                  filterCategoryId={filterCategoryId}
                  dateStr={selectedDateStr}
                />
            ) : (
                <Timeline 
                  tasks={currentTasks} 
                  theme={theme}
                  partitions={partitions}
                  categories={categories}
                  onToggleExpand={handleToggleExpand}
                  onAddSubtask={handleAddSubtask}
                  onEditTask={(task) => { setEditingTask(task); setIsModalOpen(true); }}
                  onToggleComplete={handleToggleComplete}
                  onStartTask={handleStartTask}
                  isSelectionMode={isSelectionMode}
                  selectedTaskIds={selectedTaskIds}
                  onToggleSelect={handleToggleSelect}
                />
            )}
          </div>
        )}
      </main>

      {/* FABs */}
      {!isSelectionMode && (
        <>
          <button
            onClick={() => setIsTaskNetOpen(true)}
            className={`fixed bottom-40 right-6 p-3 transition-all hover:scale-110 active:scale-90 z-40 ${fabSecondaryClass} border-none bg-opacity-90`}
            title={t.taskNets}
          >
            <Grid size={24} />
          </button>

          <button
            onClick={() => setIsZoneManagerOpen(true)}
            className={`fixed bottom-24 right-6 p-3 transition-all hover:scale-110 active:scale-90 z-40 ${fabSecondaryClass}`}
            title={t.manageConfig}
          >
            <List size={24} />
          </button>

          <button
            onClick={() => { setEditingTask(null); setParentForSubtask(null); setIsModalOpen(true); }}
            className={`fixed bottom-6 right-6 p-4 transition-all hover:scale-110 active:scale-90 z-40 ${fabClass}`}
          >
            <Plus size={28} />
          </button>
        </>
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={theme}
        setTheme={setTheme}
        currentLang={language}
        setLang={setLanguage}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      <TaskModal 
        isOpen={isModalOpen || !!editingTask}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); setParentForSubtask(null); }}
        onSave={handleSaveTask}
        selectedDateStr={selectedDateStr}
        theme={theme}
        language={language}
        initialData={editingTask}
        categories={categories}
        parentTask={parentForSubtask}
        existingTasks={currentTasks} // Pass current tasks for conflict checking
      />

      <ZoneManager 
        isOpen={isZoneManagerOpen}
        onClose={() => setIsZoneManagerOpen(false)}
        theme={theme}
        language={language}
        partitions={partitions}
        setPartitions={setPartitions}
        categories={categories}
        setCategories={setCategories}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        setProfile={setUserProfile}
        totalCompleted={totalCompletedHistory}
        theme={theme}
        language={language}
      />

      <PetChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        theme={theme}
        language={language}
        petName={petName}
        setPetName={setPetName}
        history={chatHistory}
        setHistory={setChatHistory}
        apiKey={apiKey}
      />

      <TaskNetModal
        isOpen={isTaskNetOpen}
        onClose={() => setIsTaskNetOpen(false)}
        bundles={taskBundles}
        onLoadBundle={loadBundle}
        onDeleteBundle={deleteBundle}
        theme={theme}
        language={language}
      />
    </div>
  );
};

export default App;
