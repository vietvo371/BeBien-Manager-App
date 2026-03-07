/**
 * WISEENGLISH ERP - Development Environment Configuration
 * 
 * Cấu hình cho môi trường Development (Local/Dev Server)
 */

export const ENV_NAME = 'development';
export const IS_PRODUCTION = false;
export const IS_STAGING = false;
export const IS_DEVELOPMENT = true;

// API Configuration
export const API_URL = 'https://lmswise.dzfullstack.com'; // Development API

// Firebase Configuration (Development)
export const FIREBASE = {
  API_KEY: 'AIzaSyDSYbflon0akCd4_hqM_lyAcR8Xi79J0a4',
  AUTH_DOMAIN: 'wiseenglish-erp.firebaseapp.com',
  PROJECT_ID: 'wiseenglish-erp',
  STORAGE_BUCKET: 'wiseenglish-erp.firebasestorage.app',
  MESSAGING_SENDER_ID: '1074103384268',
  APP_ID: '1:1074103384268:android:f4a9c8df41ec40d39eaa69', // Dev App ID
};

// App Configuration
export const TIMEOUT = 30000; // 30 seconds for dev (longer timeout for debugging)
export const DEBUG = false; // Enable debug logs
export const ENABLE_REDUX_DEVTOOLS = false;
export const ENABLE_CRASH_REPORTING = false; // Disable crash reporting in dev
export const ENABLE_ANALYTICS = false; // Disable analytics in dev

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_CHAT: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_QR_ATTENDANCE: false,
  ENABLE_OFFLINE_MODE: false,
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
