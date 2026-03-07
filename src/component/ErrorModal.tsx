import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  ZoomIn 
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';

interface ErrorModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  animationSize?: number;
  showConfirmButton?: boolean;
}

const { width } = Dimensions.get('window');

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = 'Lỗi',
  message = 'Đã xảy ra lỗi',
  buttonText = 'Đã hiểu',
  animationSize = 80,
  showConfirmButton = true,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay Container */}
      <View style={styles.overlay}>
        {/* Blur Background for iOS only */}
        {Platform.OS === 'ios' && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.7)"
          />
        )}
        
        {/* Modal Content Container */}
        <View style={styles.modalContainer}>
          {/* Error Icon Circle */}
          <View style={styles.iconCircle}>
            <View style={styles.iconGradient}>
              <Icon name="alert-circle" size={animationSize} color="#FFFFFF" />
            </View>
          </View>

          {/* Content Card */}
          <View style={styles.content}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>
              {title}
            </Text>
            
            {/* Message */}
            <Text style={styles.message}>
              {message}
            </Text>
            
            {/* Action Buttons */}
            {showConfirmButton && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>{buttonText}</Text>
                  <Icon name="check-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  // Error Icon Circle with Gradient Effect
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -40, // Overlap with content card
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    // Gradient-like effect with multiple shadows
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
    }),
  },
  // Content Card
  content: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    paddingTop: 60, // Space for overlapping icon
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  // Title
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily,
    letterSpacing: -0.5,
  },
  // Message
  message: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
    fontFamily: theme.typography.fontFamily,
    paddingHorizontal: theme.spacing.sm,
  },
  // Button Container
  buttonContainer: {
    width: '100%',
  },
  // Confirm Button with Gradient Effect
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: theme.spacing.sm,
  },
});

export default ErrorModal;

