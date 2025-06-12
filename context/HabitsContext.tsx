import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';
import { Habit, HabitLog, HabitWithStats } from '@/types';

interface HabitsContextType {
  habits: HabitWithStats[];
  logs: HabitLog[];
  isLoading: boolean;
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateHabit: (id: string, habit: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date?: string) => Promise<void>;
  getHabit: (id: string) => HabitWithStats | undefined;
}

const HabitsContext = createContext<HabitsContextType>({
  habits: [],
  logs: [],
  isLoading: true,
  createHabit: async () => {},
  updateHabit: async () => {},
  deleteHabit: async () => {},
  toggleHabitCompletion: async () => {},
  getHabit: () => undefined,
});

export const HabitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load habits and logs when the user changes
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setHabits([]);
        setLogs([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const habitsData = await SecureStore.getItemAsync(`habits_${user.id}`);
        const logsData = await SecureStore.getItemAsync(`logs_${user.id}`);
        
        if (habitsData) {
          setHabits(JSON.parse(habitsData));
        }
        
        if (logsData) {
          setLogs(JSON.parse(logsData));
        }
      } catch (error) {
        console.error('Failed to load habits data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Save habits whenever they change
  useEffect(() => {
    const saveHabits = async () => {
      if (!user) return;
      try {
        await SecureStore.setItemAsync(`habits_${user.id}`, JSON.stringify(habits));
      } catch (error) {
        console.error('Failed to save habits', error);
      }
    };

    if (!isLoading) {
      saveHabits();
    }
  }, [habits, user, isLoading]);

  // Save logs whenever they change
  useEffect(() => {
    const saveLogs = async () => {
      if (!user) return;
      try {
        await SecureStore.setItemAsync(`logs_${user.id}`, JSON.stringify(logs));
      } catch (error) {
        console.error('Failed to save logs', error);
      }
    };

    if (!isLoading) {
      saveLogs();
    }
  }, [logs, user, isLoading]);

  // Get the current date in YYYY-MM-DD format
  const getToday = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
  };

  // Calculate streak for a habit
  const calculateStreak = (habitId: string) => {
    const habitLogs = logs.filter((log) => log.habitId === habitId && log.completed);
    if (!habitLogs.length) return 0;

    // Sort logs by date (most recent first)
    habitLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    const today = getToday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if completed today or yesterday to continue the streak
    const mostRecentDate = habitLogs[0]?.date;
    if (mostRecentDate !== today && mostRecentDate !== yesterdayStr) {
      return 0; // Streak broken
    }

    // Calculate consecutive days
    const dates = habitLogs.map((log) => new Date(log.date).getTime());
    dates.sort((a, b) => b - a); // Sort in descending order

    streak = 1; // Count the most recent day
    for (let i = 0; i < dates.length - 1; i++) {
      const currentDate = new Date(dates[i]);
      const nextDate = new Date(dates[i + 1]);
      
      // Check if dates are consecutive
      const diffDays = Math.round((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  };

  // Compute completion rate for a habit
  const calculateCompletionRate = (habitId: string) => {
    const habitLogs = logs.filter((log) => log.habitId === habitId);
    if (!habitLogs.length) return 0;
    
    const completedLogs = habitLogs.filter((log) => log.completed);
    return (completedLogs.length / habitLogs.length) * 100;
  };

  // Check if a habit is completed today
  const isCompletedToday = (habitId: string) => {
    const today = getToday();
    return logs.some((log) => log.habitId === habitId && log.date === today && log.completed);
  };

  // Enhance habits with statistics
  const habitsWithStats: HabitWithStats[] = habits.map((habit) => ({
    ...habit,
    streak: calculateStreak(habit.id),
    completedToday: isCompletedToday(habit.id),
    completionRate: calculateCompletionRate(habit.id),
  }));

  const createHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');

    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      userId: user.id,
    };

    setHabits((prevHabits) => [...prevHabits, newHabit]);
  };

  const updateHabit = async (id: string, habitData: Partial<Habit>) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => (habit.id === id ? { ...habit, ...habitData } : habit))
    );
  };

  const deleteHabit = async (id: string) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id));
    // Also remove associated logs
    setLogs((prevLogs) => prevLogs.filter((log) => log.habitId !== id));
  };

  const toggleHabitCompletion = async (habitId: string, date: string = getToday()) => {
    // Check if a log already exists for this date
    const existingLogIndex = logs.findIndex(
      (log) => log.habitId === habitId && log.date === date
    );

    if (existingLogIndex >= 0) {
      // Toggle existing log
      setLogs((prevLogs) =>
        prevLogs.map((log, index) =>
          index === existingLogIndex ? { ...log, completed: !log.completed } : log
        )
      );
    } else {
      // Create new log
      const newLog: HabitLog = {
        habitId,
        date,
        completed: true,
      };
      setLogs((prevLogs) => [...prevLogs, newLog]);
    }
  };

  const getHabit = (id: string) => {
    return habitsWithStats.find((habit) => habit.id === id);
  };

  return (
    <HabitsContext.Provider
      value={{
        habits: habitsWithStats,
        logs,
        isLoading,
        createHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        getHabit,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => useContext(HabitsContext);