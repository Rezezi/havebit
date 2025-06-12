export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  targetDays?: number[]; // For weekly habits, days of week (0-6)
  createdAt: string;
  userId: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // ISO string of the date (YYYY-MM-DD)
  completed: boolean;
}

export interface HabitWithStats extends Habit {
  streak: number;
  completedToday: boolean;
  completionRate: number;
}