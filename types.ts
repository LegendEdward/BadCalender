
export type ThemeMode = 'arknights' | 'cartoon' | 'cyberpunk' | 'nature';
export type Language = 'en' | 'zh-CN' | 'zh-TW';

export interface Task {
  id: string;
  dateStr: string; // ISO Date string YYYY-MM-DD
  title: string;
  description?: string;
  startTime: string; // HH:mm
  durationMinutes: number;
  completed: boolean;
  isStarted: boolean; // New: Track if user clicked start
  isPriority: boolean;
}

export interface DateMetrics {
  total: number;
  completed: number;
  progress: number;
}
