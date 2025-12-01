
import { ThemeMode } from './types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayKey = (): string => formatDateKey(new Date());

export const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// Colors for visual timeline blocks
export const getTaskColor = (index: number, theme: ThemeMode): string => {
  if (theme === 'arknights') {
    const colors = ['bg-ark-primary', 'bg-ark-accent', 'bg-cyan-600', 'bg-blue-600'];
    return colors[index % colors.length];
  } else if (theme === 'cyberpunk') {
    const colors = ['bg-[#f0f]', 'bg-[#0ff]', 'bg-[#ff0]', 'bg-[#0f0]'];
    return colors[index % colors.length];
  } else if (theme === 'nature') {
    const colors = ['bg-[#84a98c]', 'bg-[#52796f]', 'bg-[#354f52]', 'bg-[#cad2c5]'];
    return colors[index % colors.length];
  } else {
    // Cartoon
    const colors = ['bg-toon-primary', 'bg-toon-accent', 'bg-purple-300', 'bg-yellow-300'];
    return colors[index % colors.length];
  }
};
