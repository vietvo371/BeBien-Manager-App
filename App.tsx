/**
 * BeBien Manager Mobile App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import MainNavigator from './src/navigation/MainTabNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { theme } from './src/theme/colors';
import './src/i18n'; // Initialize i18n
import { navigationRef } from './src/navigation/NavigationService';
import { AlertProvider } from './src/services/AlertService';
import AlertServiceConnector from './src/component/AlertServiceConnector';
import NotificationService from './src/component/NotificationService';
import { queryClient } from './src/config/queryClient';
import env from './src/config/env';
import { ErrorModalProvider, useErrorModal } from './src/utils/ErrorModalManager';

const AppContent = () => {
  const { showError } = useErrorModal();

  useEffect(() => {
    // Initialize ErrorModalManager with the showError function
    const { ErrorModalManager } = require('./src/utils/ErrorModalManager');
    ErrorModalManager.init(showError);
  }, [showError]);

  // Handle notifications
  const handleNotification = React.useCallback((notification: any) => {
    console.log('📱 Notification received:', notification);
    // Custom logic here if needed
  }, []);

  const handleNotificationOpened = React.useCallback((notification: any) => {
    console.log('🔔 Notification opened:', notification);
    // Navigate to appropriate screen based on notification data
  }, []);

  return (
    <>
      {env.FEATURE_FLAGS.ENABLE_NOTIFICATIONS && (
        <NotificationService
          onNotification={handleNotification}
          onNotificationOpened={handleNotificationOpened}
        />
      )}
    </>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const navigationTheme: Theme = {
    dark: isDarkMode,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.white,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.error,
    },
    fonts: {
      regular: {
        fontFamily: Platform.select({
          ios: 'SF Pro Display',
          android: 'Roboto',
        }) as string,
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: Platform.select({
          ios: 'SF Pro Display',
          android: 'Roboto',
        }) as string,
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: Platform.select({
          ios: 'SF Pro Display',
          android: 'Roboto',
        }) as string,
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: Platform.select({
          ios: 'SF Pro Display',
          android: 'Roboto',
        }) as string,
        fontWeight: '900' as const,
      },
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={isDarkMode ? theme.colors.backgroundDark : theme.colors.background}
          />
          <ErrorModalProvider>
            <AlertProvider>
              <AlertServiceConnector />
              <AuthProvider>
                <NavigationContainer theme={navigationTheme} ref={navigationRef}>
                  <MainNavigator />
                </NavigationContainer>
                <AppContent />
              </AuthProvider>
            </AlertProvider>
          </ErrorModalProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

export default App;
