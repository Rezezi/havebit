import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import HabitForm from '@/components/habits/HabitForm';

export default function CreateHabitScreen() {
  const router = useRouter();

  const handleSuccess = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Create Habit',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          ),
          presentation: 'modal',
        }}
      />

      <SafeAreaView edges={['bottom']} style={styles.container}>
        <HabitForm onSuccess={handleSuccess} />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});