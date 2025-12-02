
export type ThemeMode = 'arknights' | 'cartoon' | 'cyberpunk' | 'nature';
export type Language = 'en' | 'zh-CN' | 'zh-TW';

export interface TimePartition {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface Category {
  id: string;
  name: string;
  color?: string; // Hex or tailwind class reference
}

export interface Task {
  id: string;
  parentId?: string; // If present, this is a subtask
  dateStr: string; // ISO Date string YYYY-MM-DD
  title: string;
  description?: string;
  categoryId?: string;
  startTime: string; // HH:mm
  durationMinutes: number;
  completed: boolean;
  isStarted: boolean;
  isPriority: boolean;
  isExpanded?: boolean; // For UI state in timeline
}

export interface DateMetrics {
  total: number;
  completed: number;
  progress: number;
}

export interface UserProfile {
  nickname: string;
  bio: string;
  gender: 'male' | 'female' | 'other' | 'secret';
  avatar?: string; // Base64 data URL
  joinDate: number; // Timestamp
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}
