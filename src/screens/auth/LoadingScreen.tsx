import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { theme } from '../../theme/colors';
import { authApi } from '../../utils/authApi';
import { unregisterCurrentDevice } from '../../component/NotificationService';

interface LoadingScreenProps {
  navigation: any;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await authApi.getToken();

        if (!token) {
          navigation.replace('Login');
          return;
        }

        const isValid = await authApi.verifyToken(token);

        if (isValid) {
          navigation.replace('MainTabs');
        } else {
          console.log('[LoadingScreen] ⚠️ Token hết hạn — huỷ FCM và xoá local data');
          await unregisterCurrentDevice().catch((e) =>
            console.warn('[LoadingScreen] ⚠️ Bỏ qua lỗi unregister FCM:', e?.message)
          );
          await authApi.signOut();
          navigation.replace('Login');
        }
      } catch (e: any) {
        console.warn('[LoadingScreen] ⚠️ Lỗi kiểm tra session:', e?.message);
        await unregisterCurrentDevice().catch(() => {});
        await authApi.signOut().catch(() => {});
        navigation.replace('Login');
      }
    };

    checkSession();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.spinner}
      />
      {/* <Text style={styles.hint}>Đang xác thực phiên đăng nhập...</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.xl,
  },
  spinner: {
    marginTop: theme.spacing.lg,
  },
  hint: {
    marginTop: theme.spacing.md,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});

export default LoadingScreen;
