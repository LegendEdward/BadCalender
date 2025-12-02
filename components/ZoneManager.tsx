
import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ThemeMode, Language, TimePartition, Category } from '../types';
import { translations } from '../translations';
import { generateId } from '../utils';

interface ZoneManagerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  language: Language;
  partitions: TimePartition[];
  setPartitions: (p: TimePartition[]) => void;
  categories: Category[];
  setCategories: (c: Category[]) => void;
}

const ZoneManager: React.FC<ZoneManagerProps> = ({
  isOpen, onClose, theme, language, partitions, setPartitions, categories, setCategories
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'zones' | 'categories'>('zones');
  
  // New item states
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneStart, setNewZoneStart] = useState('08:00');
  const [newZoneEnd, setNewZoneEnd] = useState('12:00');
  const [newCatName, setNewCatName] = useState('');

  const isArk = theme === 'arknights';
  const isCyber = theme === 'cyberpunk';
  const isNature = theme === 'nature';

  let modalClass = '';
  let inputClass = '';
  let btnClass = '';
  let tabClass = '';
  let activeTabClass = '';

  if (isArk) {
    modalClass = 'bg-ark-surface border-2 border-ark-primary text-ark-text';
    inputClass = 'bg-ark-bg border border-ark-muted text-white';
    btnClass = 'bg-ark-primary text-black';
    tabClass = 'text-ark-muted hover:text-white';
    activeTabClass = 'border-b-2 border-ark-primary text-ark-primary';
  } else if (isCyber) {
    modalClass = 'bg-black border-2 border-[#0ff] text-[#0ff] shadow-[0_0_20px_#0ff]';
    inputClass = 'bg-[#111] border border-[#333] text-[#0ff]';
    btnClass = 'bg-[#f0f] text-black';
    tabClass = 'text-gray-500 hover:text-[#0ff]';
    activeTabClass = 'border-b-2 border-[#f0f] text-[#f0f]';
  } else if (isNature) {
    modalClass = 'bg-[#faedcd] border-2 border-[#ccd5ae] text-[#354f52]';
    inputClass = 'bg-[#fefae0] border border-[#d4a373]';
    btnClass = 'bg-[#606c38] text-[#fefae0]';
    tabClass = 'text-[#ccd5ae]';
    activeTabClass = 'border-b-2 border-[#606c38] text-[#606c38] font-bold';
  } else {
    modalClass = 'bg-white rounded-3xl shadow-2xl text-gray-800';
    inputClass = 'bg-gray-50 border border-gray-200';
    btnClass = 'bg-toon-primary text-white';
    tabClass = 'text-gray-400';
    activeTabClass = 'border-b-2 border-toon-primary text-toon-primary font-bold';
  }

  const handleAddZone = () => {
    if (newZoneName) {
      setPartitions([...partitions, { 
        id: generateId(), 
        name: newZoneName, 
        startTime: newZoneStart, 
        endTime: newZoneEnd 
      }].sort((a,b) => a.startTime.localeCompare(b.startTime)));
      setNewZoneName('');
    }
  };

  const handleAddCat = () => {
    if (newCatName) {
      setCategories([...categories, { id: generateId(), name: newCatName }]);
      setNewCatName('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md h-[500px] flex flex-col animate-in zoom-in duration-200 ${modalClass}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-500/20">
          <h2 className="text-lg font-bold">{t.manageConfig}</h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-500/20">
          <button 
            onClick={() => setActiveTab('zones')}
            className={`flex-1 py-3 text-sm transition-all ${activeTab === 'zones' ? activeTabClass : tabClass}`}
          >
            {t.timeZones}
          </button>
          <button 
             onClick={() => setActiveTab('categories')}
             className={`flex-1 py-3 text-sm transition-all ${activeTab === 'categories' ? activeTabClass : tabClass}`}
          >
            {t.categories}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* ZONES TAB */}
          {activeTab === 'zones' && (
            <div className="space-y-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <input 
                    placeholder={t.zoneName} 
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className={`w-full p-2 text-sm outline-none ${inputClass}`} 
                  />
                  <div className="flex gap-2">
                    <input 
                      type="time" 
                      value={newZoneStart}
                      onChange={(e) => setNewZoneStart(e.target.value)}
                      className={`flex-1 p-2 text-sm outline-none ${inputClass}`} 
                    />
                    <input 
                      type="time" 
                      value={newZoneEnd}
                      onChange={(e) => setNewZoneEnd(e.target.value)}
                      className={`flex-1 p-2 text-sm outline-none ${inputClass}`} 
                    />
                  </div>
                </div>
                <button onClick={handleAddZone} className={`p-3 rounded-lg ${btnClass}`}>
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-2 mt-4">
                {partitions.map(p => (
                  <div key={p.id} className={`flex justify-between items-center p-3 border border-dashed border-gray-500/30 rounded ${isArk ? 'bg-black/20' : ''}`}>
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs opacity-60">{p.startTime} - {p.endTime}</div>
                    </div>
                    <button onClick={() => setPartitions(partitions.filter(x => x.id !== p.id))} className="text-red-500 p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  placeholder={t.categoryName} 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className={`flex-1 p-2 text-sm outline-none ${inputClass}`} 
                />
                <button onClick={handleAddCat} className={`p-3 rounded-lg ${btnClass}`}>
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-2 mt-4">
                {categories.map(c => (
                   <div key={c.id} className={`flex justify-between items-center p-3 border border-dashed border-gray-500/30 rounded ${isArk ? 'bg-black/20' : ''}`}>
                    <div className="font-bold">{c.name}</div>
                    <button onClick={() => setCategories(categories.filter(x => x.id !== c.id))} className="text-red-500 p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ZoneManager;
