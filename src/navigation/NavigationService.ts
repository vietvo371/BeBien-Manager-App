/**
 * Global Navigation Service
 * 
 * Enables type-safe navigation from anywhere in the app:
 * - Services (AuthService, API interceptors)
 * - Contexts (SocketContext)
 * - Utility functions
 * - Non-React components
 * 
 * Usage:
 * import { navigate, resetTo } from '@/navigation/NavigationService';
 * 
 * navigate('OrderDetail', { orderId: 123 });
 * resetTo('Login');
 */

import { 
  createNavigationContainerRef, 
  StackActions,
  CommonActions,
} from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen with params
 * Type-safe navigation guaranteed by TypeScript
 */
export function navigate<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name]
) {
  if (navigationRef.isReady()) {
    // @ts-ignore - React Navigation types are complex, this is the recommended pattern
    navigationRef.navigate(name, params);
  } else {
    console.warn('[NavigationService] Navigation not ready, skipping:', name);
  }
}

/**
 * Replace current screen with a new one (no back button)
 */
export function replace<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name]
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      StackActions.replace(name as string, params)
    );
  }
}

/**
 * Reset navigation stack to a single screen
 * Useful for logout flow: resetTo('Login')
 */
export function resetTo<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name]
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: name as string, params }],
      })
    );
  }
}

/**
 * Go back to previous screen
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Pop N screens from stack
 */
export function pop(count: number = 1) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.pop(count));
  }
}

/**
 * Check if navigation is ready
 */
export function isReady(): boolean {
  return navigationRef.isReady();
}

/**
 * Get current route name
 */
export function getCurrentRoute(): string | undefined {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return undefined;
}

// ============================================
// Custom Navigation Helpers for BeBienManager
// ============================================

/**
 * Navigate to Orders screen (main tab)
 */
export function navigateToOrders(params?: { reload?: boolean }) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: 'Order',
          params,
        },
      })
    );
  }
}

/**
 * Navigate to Order Detail screen
 */
export function navigateToOrderDetail(orderId: number) {
  navigate('OrderDetail', { orderId });
}

/**
 * Navigate to Home tab
 */
export function navigateToHome() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: { screen: 'Home' },
      })
    );
  }
}

/**
 * Navigate to Profile tab
 */
export function navigateToProfile() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: { screen: 'Profile' },
      })
    );
  }
}

export default {
  navigate,
  replace,
  resetTo,
  goBack,
  pop,
  isReady,
  getCurrentRoute,
  navigateToOrders,
  navigateToOrderDetail,
  navigateToHome,
  navigateToProfile,
};
