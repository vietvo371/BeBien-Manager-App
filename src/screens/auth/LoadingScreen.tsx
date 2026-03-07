import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { theme } from '../../theme/colors';
import { authApi } from '../../utils/authApi';

interface LoadingScreenProps {
  navigation: any;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        await new Promise((resolve: any) => setTimeout(resolve, 1500));

        // Check stored token
        const studentToken = await authApi.getToken();
        if (studentToken) {
          const check = await authApi.checkLogin(studentToken);
          if (check) {
            navigation.replace('MainTabs');
            return;
          }
        }

        // No valid session found
        navigation.replace('Login');
      } catch (error) {
        console.error('Error checking login:', error);
        navigation.replace('Login');
      }
    };
    checkLogin();
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
    width: 100,
    height: 100,
    marginBottom: theme.spacing.xl,
  },
  spinner: {
    marginTop: theme.spacing.lg,
  },
});

export default LoadingScreen;