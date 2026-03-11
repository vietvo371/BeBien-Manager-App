import axios from "axios";
import { Alert } from 'react-native';
import { getToken, removeToken } from "./TokenManager";
import { resetTo } from "../navigation/NavigationService";
import i18n from '../i18n';
import env from '../config/env.ts';

// Types
export interface DashboardStats {
  batches: {
    total: number;
    trend: { value: number; isPositive: boolean; }
  };
  qr_scans: {
    total: number;
    trend: { value: number; isPositive: boolean; }
  };
  products: {
    total: number;
    trend: { value: number; isPositive: boolean; }
  };
}

export interface Batch {
  id: string;
  product_name: string;
  category: string;
  weight: number;
  harvest_date: string;
  cultivation_method: string;
  status: 'active' | 'completed' | 'cancelled';
  image: string;
}

export interface UserProfile {
  full_name: string;
  role: string;
  farm_name: string;
  profile_image: string;
}

// Location interface
interface LocationData {
  lat: number;
  long: number;
}

// Vì đã bỏ native module geolocation khỏi project,
// ta chỉ dùng một location mặc định (ví dụ trụ sở trung tâm) và cache lại.
const DEFAULT_LOCATION: LocationData = {
  lat: 16.068882,
  long: 108.245350,
};

let cachedLocation: LocationData | null = null;
let locationCacheTime = 0;
const LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let isShowingAuthAlert = false;

const getCurrentLocation = async (): Promise<LocationData | null> => {
  const now = Date.now();

  if (cachedLocation && (now - locationCacheTime) < LOCATION_CACHE_DURATION) {
    return cachedLocation;
  }
  cachedLocation = DEFAULT_LOCATION;
  locationCacheTime = now;

  return cachedLocation;
};


const baseUrl = env.API_URL + '/api';

const api = axios.create({
  baseURL: baseUrl,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  maxRedirects: 0,
  validateStatus: function (status) {
    return status >= 200 && status < 400;
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  console.log('language', i18n.language);
  config.headers['x-Language'] = i18n.language || 'vi';
  console.log('config', config);
  console.log('config.headers', config.headers);
  if (token) {
    console.log('token', token);
    config.headers.Authorization = `Bearer ${token}`;
  }

  getCurrentLocation().then((location) => {
    if (location) {
      config.headers['x-location'] = JSON.stringify(location);
    }
  }).catch((error) => {
  });

  return config;
});

const MAX_RETRY_ATTEMPTS = 2;

const shouldRetry = (error: any, retryCount: number) => {
  if (retryCount >= MAX_RETRY_ATTEMPTS) return false;
  if (error.response?.status === 401) return false; // token hết hạn, retry vô nghĩa
  if (error.response?.status === 403) return false;
  if (error.response?.status === 422) return false;
  return (
    !error.response ||
    error.code === 'ECONNABORTED' ||
    /timeout/i.test(error.message) ||
    (error.response.status >= 500 && error.response.status <= 599)
  );
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: any) => {
    const config = error.config;

    config.retryCount = config.retryCount || 0;

    if (shouldRetry(error, config.retryCount)) {
      config.retryCount += 1;
      const delayMs = Math.min(1000 * (2 ** config.retryCount), 10000);
      await new Promise<void>(resolve => setTimeout(resolve, delayMs));

      return api(config);
    }

    // Timeout error
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
      console.warn('⏱️ Timeout after retries:', error);
      if (!isShowingAuthAlert) {
        isShowingAuthAlert = true;
        Alert.alert(
          'Yêu cầu quá thời gian chờ',
          'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
          [{ text: 'OK', style: 'default', onPress: () => { isShowingAuthAlert = false; } }]
        );
      }
      return Promise.reject(error);
    }

    // Validation error: Let form handle it
    if (error.response?.status === 422) {
      return Promise.reject(error);
    }

    // Auth errors: Logout + Reset to Login
    if (error.response?.status === 401 || error.response?.status === 403) {
      const status = error.response.status;
      console.log('error', error.response?.data);
      console.warn(status === 401 ? '🔒 Session expired (401)' : '🚫 Access denied (403)');
      if (!isShowingAuthAlert) {
        isShowingAuthAlert = true;
        // Alert native — độc lập với React tree, không phụ thuộc context
        // delay 300ms để modal/bottom-sheet đang mở kịp đóng
        setTimeout(() => {
          Alert.alert(
            status === 401 ? 'Phiên đăng nhập hết hạn hoặc không có quyền truy cập' : 'Không có quyền truy cập',
            error.response?.data?.message || error.response?.data?.errors?.message?.[0] || 'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.'
            ,status === 401 ? [{
              text: 'OK',
              style: 'default',
              onPress: () => {
                isShowingAuthAlert = false;
              },
            }] : [{
              text: 'Đăng nhập lại',
              style: 'default',
              onPress: () => {
                isShowingAuthAlert = false;
                removeToken();
                resetTo('Login');
              },
            }]
          );
        }, 300);
      }
      return Promise.reject(error);
    }

    console.log('API error after retries:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      retryCount: config.retryCount,
    });
    return Promise.reject(error);
  }
);

export default api;