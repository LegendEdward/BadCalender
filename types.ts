export type ThemeMode = 'arknights' | 'cartoon';

export interface Task {
  id: string;
  dateStr: string; // ISO Date string YYYY-MM-DD
  title: string;
  description?: string;
  startTime: string; // HH:mm
  durationMinutes: number;
  completed: boolean;
  isPriority: boolean;
}

export interface DateMetrics {
  total: number;
  completed: number;
  progress: number;
}