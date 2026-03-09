/**
 * BeBien Manager - Production Environment Configuration
 * 
 * Cấu hình cho môi trường Production (Live/Real Users)
 */

export const ENV_NAME = 'production';
export const IS_PRODUCTION = true;
export const IS_STAGING = false;
export const IS_DEVELOPMENT = false;

// API Configuration
export const API_URL = 'https://bebien.dzfullstackmid.io.vn'; // Production API

// Firebase Configuration (Production)
export const FIREBASE = {
  API_KEY: 'AIzaSyCEkXCRwro2wFWj7ssseZvZt7zR-cTOrPw',
  AUTH_DOMAIN: 'bebien-manager.firebaseapp.com',
  PROJECT_ID: 'bebien-manager',
  STORAGE_BUCKET: 'bebien-manager.firebasestorage.app',
  MESSAGING_SENDER_ID: '301053868302',
  APP_ID: '1:301053868302:ios:498b3be546e0f4aa473f5f',
};

// App Configuration
export const TIMEOUT = 15000; // 15 seconds
export const DEBUG = false; // Disable debug logs in production
export const ENABLE_REDUX_DEVTOOLS = false;
export const ENABLE_CRASH_REPORTING = true; // Enable crash reporting
export const ENABLE_ANALYTICS = true; // Enable analytics

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_CHAT: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_QR_ATTENDANCE: true,
  ENABLE_OFFLINE_MODE: true,
};

// Version
export const APP_VERSION = '1.0.2';
export const MIN_APP_VERSION = '1.0.0';

const env = {
  ENV_NAME,
  IS_PRODUCTION,
  IS_STAGING,
  IS_DEVELOPMENT,
  API_URL,
  FIREBASE,
  TIMEOUT,
  DEBUG,
  ENABLE_REDUX_DEVTOOLS,
  ENABLE_CRASH_REPORTING,
  ENABLE_ANALYTICS,
  FEATURE_FLAGS,
  APP_VERSION,
  MIN_APP_VERSION,
};

export default env;
