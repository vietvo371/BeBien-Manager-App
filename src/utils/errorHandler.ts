import { ErrorModalManager } from './ErrorModalManager';

/**
 * Error Handler Utility
 * Centralized error handling for API calls
 */

export interface ApiError {
  status?: number;
  message?: string;
  validationErrors?: Record<string, string[]>;
  code?: string;
}

/**
 * Handle API errors with appropriate user feedback
 * Errors that require logout: 401, 403, Timeout
 */
export const handleApiError = (error: any, showModal: boolean = true): void => {
  console.error('API Error:', error);

  // Network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
      if (showModal) {
        ErrorModalManager.showTimeoutError();
      }
      return;
    }

    if (showModal) {
      ErrorModalManager.showNetworkError();
    }
    return;
  }

  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;

  // Handle specific status codes
  switch (status) {
    case 401:
      // Handled by Api.tsx interceptor - session expired + auto logout
      break;

    case 403:
      // Handled by Api.tsx interceptor - access denied + auto logout
      break;

    case 404:
      if (showModal) {
        ErrorModalManager.showError(
          'Không tìm thấy',
          message || 'Dữ liệu không tồn tại hoặc đã bị xóa'
        );
      }
      break;

    case 422:
      // Validation errors - let the form handle it
      if (showModal && message) {
        ErrorModalManager.showError(
          'Dữ liệu không hợp lệ',
          message
        );
      }
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      if (showModal) {
        ErrorModalManager.showServerError();
      }
      break;

    default:
      if (showModal) {
        ErrorModalManager.showError(
          'Đã xảy ra lỗi',
          message || 'Vui lòng thử lại sau'
        );
      }
  }
};

/**
 * Safe API call wrapper
 * Wraps async API calls with error handling
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  options: {
    showErrorModal?: boolean;
    defaultValue?: T;
    onError?: (error: any) => void;
  } = {}
): Promise<T | undefined> => {
  const { showErrorModal = true, defaultValue, onError } = options;

  try {
    return await apiCall();
  } catch (error) {
    handleApiError(error, showErrorModal);
    
    if (onError) {
      onError(error);
    }

    return defaultValue;
  }
};

/**
 * Extract validation errors from API response
 */
export const extractValidationErrors = (error: any): Record<string, string> => {
  const validationErrors: Record<string, string> = {};

  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    
    Object.keys(errors).forEach(key => {
      const messages = errors[key];
      validationErrors[key] = Array.isArray(messages) ? messages[0] : messages;
    });
  }

  return validationErrors;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  return error.response?.status === 422;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return !error.response || error.code === 'ECONNABORTED' || /timeout/i.test(error.message);
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định';
};

