import * as React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, TAB_BAR } from '../theme';
import { RootStackParamList, MainTabParamList } from './types';

// Auth screens
import LoadingScreen from '../screens/auth/LoadingScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// Main tab screens
import HomeScreen from '../screens/main/HomeScreen';
import OrderScreen from '../screens/main/OrderScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import OrderDetailScreen from '../screens/main/OrderDetailScreen';

// Common components
import { GlobalFAB } from '../components/common/GlobalFAB';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const insets = useSafeAreaInsets();

  const tabScreenOptions = {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textSecondary,
    tabBarStyle: {
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
      paddingBottom: Math.max(insets.bottom, TAB_BAR.paddingBottom || 8),
      paddingTop: 8,
      height:
        (TAB_BAR.height || 64) +
        Math.max(insets.bottom - (TAB_BAR.paddingBottom || 8), 0),
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    tabBarLabelStyle: {
      fontSize: TAB_BAR.fontSize,
      fontWeight: theme.typography.fontWeight.semibold,
      marginTop: 4,
    },
    tabBarIconStyle: {
      marginTop: 4,
    },
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color }) => (
              <Icon name="home-variant" size={TAB_BAR.iconSize} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Order"
          component={OrderScreen}
          options={{
            title: 'Đơn hàng',
            tabBarIcon: ({ color }) => (
              <Icon
                name="clipboard-list"
                size={TAB_BAR.iconSize}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Cá nhân',
            tabBarIcon: ({ color }) => (
              <Icon
                name="account-circle"
                size={TAB_BAR.iconSize}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
      <GlobalFAB />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Loading"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        animationTypeForReplace: 'push',
        presentation: 'card',
        contentStyle: {
          backgroundColor: theme.colors.white,
        },
      }}
    >
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
