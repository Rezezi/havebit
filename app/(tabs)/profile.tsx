import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useHabits } from '@/context/HabitsContext';
import Card from '@/components/ui/Card';
import { LogOut, Medal, Award, Star, Menu, X } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { habits } = useHabits();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          onPress: () => {
            signOut();
            setMenuVisible(false);
          }
        },
      ]
    );
  };

  // Calculate user statistics
  const totalHabits = habits.length;
  const activeStreaks = habits.filter(habit => habit.streak > 0).length;
  const longestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
  const completionRate = habits.reduce((sum, habit) => sum + habit.completionRate, 0) / (totalHabits || 1);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Menu size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Medal size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{totalHabits}</Text>
              <Text style={styles.statLabel}>Total Habits</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Award size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{activeStreaks}</Text>
              <Text style={styles.statLabel}>Active Streaks</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Star size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Medal size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{completionRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.accountCard}>
          <Text style={styles.accountTitle}>Account</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email</Text>
            <Text style={styles.settingValue}>{user?.email}</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Member Since</Text>
            <Text style={styles.settingValue}>
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </Card>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <X size={24} color="#111827" />
            </TouchableOpacity>
            
            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.menuItem, styles.signOutItem]}
                onPress={handleSignOut}
              >
                <LogOut size={18} color="#EF4444" style={styles.menuItemIcon} />
                <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    paddingVertical: 24,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  menuButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  accountCard: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  accountTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#374151',
  },
  settingValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    height: '40%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  menuItems: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  menuItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#111827',
  },
  signOutItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  signOutText: {
    color: '#EF4444',
  },
  menuItemIcon: {
    marginRight: 12,
  },
});