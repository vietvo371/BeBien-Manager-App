/**
 * Notification Tester Component
 * 
 * Component để test notification features
 * Thêm vào Settings screen hoặc Debug screen
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { displayLocalNotification, getFCMToken, reregisterFCMToken } from '../config/firebase';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS } from '../theme';

const NotificationTester = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  /**
   * Test 1: Display local notification
   */
  const testLocalNotification = async () => {
    setLoading(true);
    try {
      await displayLocalNotification(
        '🎉 Test Notification',
        'Đây là test notification từ Notifee! Bạn có thể thấy app logo và brand color.',
        { type: 'test', id: '12345' }
      );
      Alert.alert('Success', 'Notification đã được gửi! Check notification banner phía trên.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Không thể hiển thị notification');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test 2: Get FCM Token
   */
  const testGetToken = async () => {
    setLoading(true);
    try {
      const fcmToken = await getFCMToken(false);
      if (fcmToken) {
        setToken(fcmToken);
        Alert.alert(
          'FCM Token',
          `Token (first 50 chars):\n${fcmToken.substring(0, 50)}...`,
          [
            { text: 'Copy Full Token', onPress: () => {
              // TODO: Copy to clipboard
              console.log('Full FCM Token:', fcmToken);
            }},
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Error', 'Không thể lấy FCM token');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Lỗi khi lấy token');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test 3: Re-register token (delete old + get new)
   */
  const testReregisterToken = async () => {
    setLoading(true);
    try {
      const newToken = await reregisterFCMToken();
      if (newToken) {
        setToken(newToken);
        Alert.alert(
          'Success',
          'Token đã được re-register!\n' +
          `New token (first 50 chars):\n${newToken.substring(0, 50)}...`
        );
      } else {
        Alert.alert('Error', 'Không thể re-register token');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Lỗi khi re-register');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test 4: Display multiple notifications
   */
  const testMultipleNotifications = async () => {
    setLoading(true);
    try {
      // Notification 1
      await displayLocalNotification(
        '📚 Lịch học hôm nay',
        'Bạn có 3 buổi học: 8:00 AM, 10:00 AM, 2:00 PM',
        { type: 'schedule', id: '1' }
      );

      setTimeout(async () => {
        // Notification 2
        await displayLocalNotification(
          '✅ Điểm danh thành công',
          'Bạn đã điểm danh lớp English Basic - Room 101',
          { type: 'attendance', id: '2' }
        );
      }, 2000);

      setTimeout(async () => {
        // Notification 3
        await displayLocalNotification(
          '💰 Học phí sắp đến hạn',
          'Hạn đóng học phí: 31/12/2024. Số tiền: 2,500,000 VNĐ',
          { type: 'tuition', id: '3' }
        );
      }, 4000);

      Alert.alert('Success', 'Đã gửi 3 notifications (mỗi notification cách nhau 2s)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Lỗi khi gửi notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Notification Tester</Text>
      <Text style={styles.subtitle}>Test notification features</Text>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={testLocalNotification}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Local Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={testGetToken}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Get FCM Token</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={testReregisterToken}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Re-register Token</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={testMultipleNotifications}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Multiple Notifications</Text>
      </TouchableOpacity>

      {token && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>Current Token:</Text>
          <Text style={styles.tokenText} numberOfLines={2}>
            {token}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.infoText}>
          💡 Tips:{'\n'}
          • Notification sẽ hiển thị với app logo{'\n'}
          • Brand color: Purple (#7f2d84){'\n'}
          • Tap notification để test navigation{'\n'}
          • Check console log để xem chi tiết
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: FONT_SIZE.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  tokenContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  tokenLabel: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    marginBottom: SPACING.xs,
  },
  tokenText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  info: {
    backgroundColor: theme.colors.info + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.info,
  },
  infoText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

export default NotificationTester;

