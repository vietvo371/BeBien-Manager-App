import React, { createContext, useContext, useState, ReactNode } from 'react';
import ErrorModal from '../component/ErrorModal.tsx';
import { resetTo } from '../navigation/NavigationService';
import { removeToken } from './TokenManager';

interface ErrorModalState {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
}

interface ErrorModalContextType {
  showError: (title: string, message: string, onConfirm?: () => void) => void;
  hideError: () => void;
}

const ErrorModalContext = createContext<ErrorModalContextType | undefined>(undefined);

export const useErrorModal = () => {
  const context = useContext(ErrorModalContext);
  if (!context) {
    throw new Error('useErrorModal must be used within ErrorModalProvider');
  }
  return context;
};

export const ErrorModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errorState, setErrorState] = useState<ErrorModalState>({
    visible: false,
    title: '',
    message: '',
  });

  const showError = (title: string, message: string, onConfirm?: () => void) => {
    setErrorState({
      visible: true,
      title,
      message,
      onConfirm,
    });
  };

  const hideError = () => {
    setErrorState({
      visible: false,
      title: '',
      message: '',
    });
  };

  const handleConfirm = () => {
    if (errorState.onConfirm) {
      errorState.onConfirm();
    }
    hideError();
  };

  return (
    <ErrorModalContext.Provider value={{ showError, hideError }}>
      {children}
      <ErrorModal
        visible={errorState.visible}
        onClose={hideError}
        onConfirm={handleConfirm}
        title={errorState.title}
        message={errorState.message}
        buttonText="Đã hiểu"
      />
    </ErrorModalContext.Provider>
  );
};

// Global error modal manager for use outside of React components
let globalShowError: ((title: string, message: string, onConfirm?: () => void) => void) | null = null;

/**
 * ErrorModalManager - Global error modal handler
 * 
 * ERRORS THAT REQUIRE LOGOUT + RESET TO LOGIN:
 * - 401 Unauthorized: Session expired
 * - 403 Forbidden: Access denied
 * - Timeout: After max retries
 */
export const ErrorModalManager = {
  init: (showErrorFn: (title: string, message: string, onConfirm?: () => void) => void) => {
    globalShowError = showErrorFn;
  },
  
  showError: (title: string, message: string, onConfirm?: () => void) => {
    if (globalShowError) {
      globalShowError(title, message, onConfirm);
    } else {
      console.warn('ErrorModalManager not initialized. Falling back to console.error');
      console.error(title, message);
    }
  },
  
  /**
   * ⚠️ REQUIRES LOGOUT + RESET TO LOGIN
   * Timeout error after max retries
   */
  showTimeoutError: (onConfirm?: () => void) => {
    ErrorModalManager.showError(
      'Yêu cầu quá thời gian chờ',
      'Không thể kết nối đến máy chủ. Vui lòng đăng nhập lại.',
      onConfirm || (() => {
        removeToken();
        resetTo('Login');
      })
    );
  },
  
  /**
   * ⚠️ REQUIRES LOGOUT + RESET TO LOGIN
   * 401 Unauthorized - Session expired
   */
  showSessionExpired: (onConfirm?: () => void) => {
    ErrorModalManager.showError(
      'Phiên đăng nhập hết hạn',
      'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.',
      onConfirm || (() => {
        removeToken();
        resetTo('Login');
      })
    );
  },
  
  /**
   * ⚠️ REQUIRES LOGOUT + RESET TO LOGIN
   * 403 Forbidden - Access denied
   */
  showAccessDenied: (onConfirm?: () => void) => {
    ErrorModalManager.showError(
      'Không có quyền truy cập',
      'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.',
      onConfirm || (() => {
        removeToken();
        resetTo('Login');
      })
    );
  },

  /**
   * Network error - NO LOGOUT
   */
  showNetworkError: (onConfirm?: () => void) => {
    ErrorModalManager.showError(
      'Lỗi kết nối',
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
      onConfirm
    );
  },

  /**
   * Server error (500+) - NO LOGOUT
   */
  showServerError: (onConfirm?: () => void) => {
    ErrorModalManager.showError(
      'Lỗi máy chủ',
      'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.',
      onConfirm
    );
  },

  /**
   * 404 Not found - NO LOGOUT
   */
  showNotFoundError: (onConfirm?: () => void) => {
    ErrorModalManager.showError(
      'Không tìm thấy',
      'Dữ liệu không tồn tại hoặc đã bị xóa.',
      onConfirm
    );
  },

  /**
   * 422 Validation error - NO LOGOUT
   */
  showValidationError: (message: string, onConfirm?: () => void) => {
    ErrorModalManager.showError(
      'Dữ liệu không hợp lệ',
      message,
      onConfirm
    );
  },
};

