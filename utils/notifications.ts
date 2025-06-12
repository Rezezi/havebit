import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { format, parseISO, addDays } from 'date-fns';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }
}

// Schedule a notification for a habit
export async function scheduleHabitReminder(
  habitId: string,
  title: string,
  time: string // Format: "HH:mm"
) {
  if (Platform.OS === 'web') {
    return null;
  }

  const [hours, minutes] = time.split(':').map(Number);
  const tomorrow = addDays(new Date(), 1);
  tomorrow.setHours(hours, minutes, 0);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Habit Reminder',
      body: `Time to complete your habit: ${title}`,
      data: { habitId },
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });

  return identifier;
}

// Cancel a scheduled notification
export async function cancelHabitReminder(identifier: string) {
  if (Platform.OS === 'web') {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(identifier);
}