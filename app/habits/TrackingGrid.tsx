import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useHabits } from '@/context/HabitsContext';

interface TrackingGridProps {
  habitId: string;
  months?: number; // Number of months to display
}

export default function TrackingGrid({ habitId, months = 3 }: TrackingGridProps) {
  const { logs } = useHabits();

  // Generate dates for the last X months
  const generateDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - months, today.getDate());

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d)); // Clone to avoid mutation
    }

    return dates;
  };

  const dates = generateDates();

  // Group dates by week for grid layout
  const weeks: Date[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  // Check if a date has a completed log
  const isDateCompleted = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return logs.some(log => log.habitId === habitId && log.date === dateStr && log.completed);
  };

  // Get status color for a date
  const getDateColor = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(date); // clone to avoid mutation
    d.setHours(0, 0, 0, 0);

    if (d > today) {
      return styles.futureBox;
    }

    return isDateCompleted(d) ? styles.completedBox : styles.missedBox;
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Extract first date of each month to show label
  const uniqueMonthLabels = Array.from(
    new Map(dates.map(date => [`${date.getFullYear()}-${date.getMonth()}`, date])).values()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity History</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Month labels */}
          <View style={styles.monthLabels}>
            {uniqueMonthLabels.map((date, index) => (
              <Text key={index} style={styles.monthLabel}>
                {monthNames[date.getMonth()]}
              </Text>
            ))}
          </View>

          {/* Day labels and grid */}
          <View style={styles.dayLabelsContainer}>
            <View style={styles.dayLabels}>
              <Text style={styles.dayLabel}>Mon</Text>
              <Text style={styles.dayLabel}>Wed</Text>
              <Text style={styles.dayLabel}>Fri</Text>
            </View>

            <View style={styles.grid}>
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.week}>
                  {week.map((date, dateIndex) => (
                    <View
                      key={dateIndex}
                      style={[styles.box, getDateColor(date)]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.box, styles.missedBox]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.box, styles.completedBox]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.box, styles.futureBox]} />
          <Text style={styles.legendText}>Future</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  gridContainer: {
    marginBottom: 16,
  },
  monthLabels: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 32,
  },
  monthLabel: {
    fontSize: 12,
    color: '#6B7280',
    width: 64,
  },
  dayLabelsContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: 8,
    justifyContent: 'space-around',
  },
  dayLabel: {
    fontSize: 12,
    color: '#6B7280',
    height: 24,
  },
  grid: {
    flexDirection: 'row',
  },
  week: {
    marginRight: 4,
  },
  box: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginBottom: 4,
  },
  completedBox: {
    backgroundColor: '#10B981',
  },
  missedBox: {
    backgroundColor: '#F3F4F6',
  },
  futureBox: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
});
