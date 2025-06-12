import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard as Edit2, Calendar, Trash2 } from 'lucide-react-native';
import { useHabits } from '@/context/HabitsContext';
import Card from '@/components/ui/Card';
import ProgressCircle from '@/components/habits/ProgressCircle';
import HabitForm from '@/components/habits/HabitForm';
import TrackingGrid from './TrackingGrid';

export default function HabitDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getHabit, toggleHabitCompletion, deleteHabit } = useHabits();
  const [isEditing, setIsEditing] = useState(false);

  const habit = getHabit(id as string);

  if (!habit) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Habit not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteHabit(habit.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleToggleComplete = () => {
    toggleHabitCompletion(habit.id, new Date().toISOString().split('T')[0]);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  // Get dates for the last 7 days
  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(d);
    }
    return result;
  };

  const last7Days = getLast7Days();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: isEditing ? 'Edit Habit' : habit.title,
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
          headerRight: isEditing
            ? undefined
            : () => (
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={{ padding: 8, marginRight: 8 }}
                  >
                    <Edit2 size={20} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ),
        }}
      />

      <SafeAreaView edges={['bottom']} style={styles.container}>
        {isEditing ? (
          <HabitForm habitId={habit.id} onSuccess={handleEditSuccess} />
        ) : (
          <ScrollView style={styles.scrollView}>
            <Card style={styles.headerCard}>
              <View style={styles.headerContent}>
                <View style={styles.headerInfo}>
                  <Text style={styles.title}>{habit.title}</Text>
                  <Text style={styles.description}>{habit.description}</Text>
                  <Text style={styles.frequency}>
                    Frequency: {habit.frequency === 'daily' ? 'Daily' : 'Weekly'}
                  </Text>
                </View>

                <View style={styles.progressSection}>
                  <ProgressCircle progress={habit.completionRate} size={80} strokeWidth={8} />
                  <Text style={styles.completionText}>
                    {habit.completionRate.toFixed(0)}% Complete
                  </Text>
                </View>
              </View>

              <View style={styles.streakContainer}>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakValue}>{habit.streak}</Text>
                  <Text style={styles.streakLabel}>
                    day{habit.streak !== 1 ? 's' : ''} streak
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    habit.completedToday && styles.completeButtonActive,
                  ]}
                  onPress={handleToggleComplete}
                >
                  <Text style={[
                    styles.completeButtonText,
                    habit.completedToday && styles.completeButtonTextActive
                  ]}>
                    {habit.completedToday ? 'Completed Today' : 'Mark as Complete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Last 7 Days</Text>
              <Card style={styles.calendarCard}>
                <View style={styles.calendarContainer}>
                  {last7Days.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isToday = index === 6;
                    
                    return (
                      <View key={dateStr} style={styles.calendarDay}>
                        <Text style={[
                          styles.calendarDayName,
                          isToday && styles.calendarDayNameActive,
                        ]}>
                          {date.toLocaleString('en-US', { weekday: 'short' })}
                        </Text>
                        <View style={[
                          styles.calendarDayCircle,
                          isToday && styles.calendarDayCircleToday,
                        ]}>
                          <Text style={[
                            styles.calendarDayNumber,
                            isToday && styles.calendarDayNumberActive,
                          ]}>
                            {date.getDate()}
                          </Text>
                        </View>
                        <View style={[
                          styles.calendarDayStatus,
                          (index === 6 && habit.completedToday) && styles.calendarDayStatusComplete,
                          (index < 6 && index > 3) && styles.calendarDayStatusComplete, // Mock data
                        ]} />
                      </View>
                    );
                  })}
                </View>
              </Card>
            </View>

            <Card style={styles.statsCard}>
              <Text style={styles.statsTitle}>Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{habit.streak}</Text>
                  <Text style={styles.statLabel}>Current Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>30</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {new Date(habit.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.statLabel}>Started</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {habit.completionRate.toFixed(0)}%
                  </Text>
                  <Text style={styles.statLabel}>Completion Rate</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.trackingCard}>
              <TrackingGrid habitId={habit.id} />
            </Card>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
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
  headerCard: {
    margin: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  frequency: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  progressSection: {
    alignItems: 'center',
  },
  completionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#10B981',
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#8B5CF6',
    marginRight: 4,
  },
  streakLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  completeButton: {
    backgroundColor: '#EBF5FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  completeButtonActive: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3B82F6',
  },
  completeButtonTextActive: {
    color: 'white',
  },
  section: {
    marginTop: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 12,
  },
  calendarCard: {
    padding: 12,
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    alignItems: 'center',
  },
  calendarDayName: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  calendarDayNameActive: {
    color: '#3B82F6',
  },
  calendarDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  calendarDayCircleToday: {
    backgroundColor: '#3B82F6',
  },
  calendarDayNumber: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#111827',
  },
  calendarDayNumberActive: {
    color: 'white',
  },
  calendarDayStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  calendarDayStatusComplete: {
    backgroundColor: '#10B981',
  },
  statsCard: {
    margin: 16,
  },
  statsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  trackingCard: {
    margin: 16,
    marginBottom: 32,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'white',
  },
});