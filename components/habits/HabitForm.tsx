import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useHabits } from '@/context/HabitsContext';
import { scheduleHabitReminder } from '@/utils/notifications';
import { Bell } from 'lucide-react-native';

interface HabitFormProps {
  habitId?: string;
  onSuccess?: () => void;
}

export default function HabitForm({ habitId, onSuccess }: HabitFormProps) {
  const { createHabit, updateHabit, getHabit } = useHabits();
  const router = useRouter();
  
  const existingHabit = habitId ? getHabit(habitId) : undefined;

  const [title, setTitle] = useState(existingHabit?.title || '');
  const [description, setDescription] = useState(existingHabit?.description || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(
    existingHabit?.frequency || 'daily'
  );
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [errors, setErrors] = useState({
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {
      title: '',
      description: '',
    };

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return !newErrors.title && !newErrors.description;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const habitData = {
        title,
        description,
        frequency,
      };

      let notificationId = null;
      if (reminderEnabled && Platform.OS !== 'web') {
        notificationId = await scheduleHabitReminder(
          existingHabit?.id || 'new',
          title,
          reminderTime
        );
      }

      if (existingHabit) {
        await updateHabit(existingHabit.id, {
          ...habitData,
          notificationId,
        });
      } else {
        await createHabit({
          ...habitData,
          notificationId,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error saving habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Habit Title"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Morning Meditation"
        error={errors.title}
        autoCapitalize="sentences"
      />

      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your habit..."
        error={errors.description}
        multiline
        numberOfLines={3}
        autoCapitalize="sentences"
      />

      <View style={styles.frequencyContainer}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Daily</Text>
          <Switch
            value={frequency === 'weekly'}
            onValueChange={(value) => setFrequency(value ? 'weekly' : 'daily')}
            trackColor={{ false: '#3B82F6', true: '#8B5CF6' }}
            thumbColor="white"
          />
          <Text style={styles.switchLabel}>Weekly</Text>
        </View>
      </View>

      {Platform.OS !== 'web' && (
        <View style={styles.reminderContainer}>
          <View style={styles.reminderHeader}>
            <Bell size={20} color="#4B5563" />
            <Text style={styles.reminderTitle}>Daily Reminder</Text>
          </View>
          <View style={styles.reminderControls}>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor="white"
            />
            {reminderEnabled && (
              <Input
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="09:00"
                keyboardType="numbers-and-punctuation"
                style={styles.timeInput}
              />
            )}
          </View>
          <Text style={styles.reminderHint}>
            Set a daily reminder to help you stay on track
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title={existingHabit ? 'Update Habit' : 'Create Habit'}
          onPress={handleSubmit}
          isLoading={isSubmitting}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  frequencyContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 14,
    marginHorizontal: 8,
    color: '#4B5563',
  },
  reminderContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  reminderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInput: {
    marginLeft: 16,
    width: 100,
  },
  reminderHint: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
});