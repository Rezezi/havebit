import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CirclePlus as PlusCircle } from 'lucide-react-native';
import { useHabits } from '@/context/HabitsContext';
import { useAuth } from '@/context/AuthContext';
import HabitCard from '@/components/habits/HabitCard';
import Card from '@/components/ui/Card';
import ProgressCircle from '@/components/habits/ProgressCircle';

export default function HomeScreen() {
  const { habits, isLoading } = useHabits();
  const { user } = useAuth();
  const router = useRouter();

  // Calculate today's progress
  const habitsToday = habits.length;
  const habitsCompletedToday = habits.filter((habit) => habit.completedToday).length;
  const progressPercentage = habitsToday > 0 ? (habitsCompletedToday / habitsToday) * 100 : 0;

  // Get habits with best streaks
  const habitsWithStreaks = [...habits].sort((a, b) => b.streak - a.streak);
  const topHabits = habitsWithStreaks.slice(0, 3);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || 'Friend'}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <Card style={styles.progressCard}>
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressStats}>
                {habitsCompletedToday} of {habitsToday} habits completed
              </Text>
            </View>
            <ProgressCircle progress={progressPercentage} size={80} strokeWidth={8} />
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Streaks</Text>
          {topHabits.length > 0 ? (
            topHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))
          ) : (
            <Card variant="filled" style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                You don't have any habits yet. Let's create your first habit!
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/habits/create')}
              >
                <PlusCircle size={20} color="#3B82F6" />
                <Text style={styles.createButtonText}>Create a Habit</Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips & Motivation</Text>
          <Card style={styles.tipCard}>
            <Text style={styles.tipTitle}>Consistency is Key</Text>
            <Text style={styles.tipText}>
              Research shows it takes about 66 days to form a new habit. Keep going even when it feels hard!
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  progressCard: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 8,
  },
  progressStats: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
  },
  tipCard: {
    padding: 16,
    marginBottom: 30,
  },
  tipTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});