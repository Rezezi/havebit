import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Trash2 } from 'lucide-react-native';
import Card from '@/components/ui/Card';
import ProgressCircle from '@/components/habits/ProgressCircle';
import { HabitWithStats } from '@/types';
import { useHabits } from '@/context/HabitsContext';

interface HabitCardProps {
  habit: HabitWithStats;
  onDelete?: () => void;
}

export default function HabitCard({ habit, onDelete }: HabitCardProps) {
  const router = useRouter();
  const { toggleHabitCompletion } = useHabits();
  
  const handlePress = () => {
    router.push(`/habits/${habit.id}`);
  };

  const handleComplete = () => {
    toggleHabitCompletion(habit.id);
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={[
              styles.checkButton,
              habit.completedToday && styles.checkButtonActive,
            ]}
            onPress={handleComplete}
          >
            {habit.completedToday && <Check color="white" size={16} />}
          </TouchableOpacity>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{habit.title}</Text>
            <Text style={styles.description} numberOfLines={1}>
              {habit.description}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <ProgressCircle progress={habit.completionRate} size={40} />
          <View style={styles.streakContainer}>
            <Text style={styles.streakValue}>{habit.streak}</Text>
            <Text style={styles.streakLabel}>streak</Text>
          </View>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 0,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  streakLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});