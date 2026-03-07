/**
 * WISEENGLISH ERP - Environment Configuration Template
 * 
 * Hướng dẫn sử dụng:
 * 1. File này được tự động sinh bằng script set-env.sh
 * 2. Không chỉnh sửa trực tiếp file này
 * 3. Thay vào đó, chỉnh sửa file tương ứng:
 *    - src/config/env.development.ts (cho môi trường development)
 *    - src/config/env.staging.ts (cho môi trường staging)
 *    - src/config/env.production.ts (cho môi trường production)
 * 4. Chạy script để switch environment:
 *    yarn env:dev      # Switch to development
 *    yarn env:staging  # Switch to staging
 *    yarn env:prod     # Switch to production
 */

export const ENV_NAME = 'YOUR_ENV_NAME';
export const IS_PRODUCTION = false;
export const IS_STAGING = false;
export const IS_DEVELOPMENT = true;

// API Configuration
export const API_URL = 'YOUR_API_URL';

// Firebase Configuration
export const FIREBASE = {
  API_KEY: 'YOUR_FIREBASE_API_KEY',
  AUTH_DOMAIN: 'YOUR_PROJECT.firebaseapp.com',
  PROJECT_ID: 'YOUR_PROJECT_ID',
  STORAGE_BUCKET: 'YOUR_PROJECT.appspot.com',
  MESSAGING_SENDER_ID: 'YOUR_SENDER_ID',
  APP_ID: 'YOUR_APP_ID',
};

// App Configuration
export const TIMEOUT = 15000;
export const DEBUG = true;
export const ENABLE_REDUX_DEVTOOLS = false;
export const ENABLE_CRASH_REPORTING = false;
export const ENABLE_ANALYTICS = false;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_CHAT: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_QR_ATTENDANCE: true,
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
