import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  type?: AlertType;
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

const { width } = Dimensions.get('window');

type AlertConfig = {
  color: string;
  lightColor: string;
  iconName: string;
  defaultTitle: string;
};

const ALERT_CONFIGS: Record<AlertType, AlertConfig> = {
  success: {
    color: theme.colors.success,
    lightColor: theme.colors.successLight,
    iconName: 'check-circle',
    defaultTitle: 'Thành công',
  },
  error: {
    color: theme.colors.error,
    lightColor: theme.colors.errorLight,
    iconName: 'close-circle',
    defaultTitle: 'Lỗi',
  },
  warning: {
    color: theme.colors.warning,
    lightColor: theme.colors.warningLight,
    iconName: 'alert-circle',
    defaultTitle: 'Cảnh báo',
  },
  confirm: {
    color: theme.colors.primary,
    lightColor: theme.colors.primaryLight,
    iconName: 'help-circle',
    defaultTitle: 'Xác nhận',
  },
  info: {
    color: theme.colors.info,
    lightColor: theme.colors.infoLight,
    iconName: 'information',
    defaultTitle: 'Thông báo',
  },
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type = 'info',
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  onDismiss,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, fadeAnim]);

  const config = ALERT_CONFIGS[type];
  const displayTitle = title || config.defaultTitle;

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onDismiss?.();
  };

  const getButtonVariant = (btn: AlertButton, index: number, total: number) => {
    if (btn.style === 'cancel') return 'ghost';
    if (btn.style === 'destructive') return 'destructive';
    if (total === 2 && index === 0) return 'ghost';
    return 'primary';
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
        >
          {/* Icon header */}
          {/* <View style={[styles.iconWrap, { backgroundColor: config.lightColor }]}>
            <Icon name={config.iconName} size={44} color={config.color} />
          </View> */}

          {/* Text body */}
          <View style={styles.body}>
            <Text style={styles.title}>{displayTitle}</Text>
            {message ? (
              <Text style={styles.message}>{message}</Text>
            ) : null}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Buttons */}
          <View style={[
            styles.buttonRow,
            buttons.length > 2 && styles.buttonColumn,
          ]}>
            {buttons.map((btn, idx) => {
              const variant = getButtonVariant(btn, idx, buttons.length);
              const isLast = idx === buttons.length - 1;

              return (
                <React.Fragment key={idx}>
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      buttons.length === 1 && styles.btnFull,
                      variant === 'ghost' && styles.btnGhost,
                      variant === 'primary' && [styles.btnFilled, { backgroundColor: config.color }],
                      variant === 'destructive' && [styles.btnFilled, { backgroundColor: theme.colors.error }],
                    ]}
                    onPress={() => handleButtonPress(btn)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        variant === 'ghost' && styles.btnTextGhost,
                        variant === 'primary' && styles.btnTextFilled,
                        variant === 'destructive' && styles.btnTextFilled,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>

                  {/* Vertical separator between 2 buttons */}
                  {buttons.length === 2 && !isLast && (
                    <View style={styles.btnSeparator} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: Math.min(width - 64, 320),
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  body: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    minHeight: 50,
  },
  buttonColumn: {
    flexDirection: 'column',
    padding: 12,
    gap: 8,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnFull: {
    flex: 1,
  },
  btnGhost: {
    backgroundColor: theme.colors.white,
  },
  btnFilled: {
    margin: 12,
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  btnSeparator: {
    width: 1,
    backgroundColor: theme.colors.border,
    alignSelf: 'stretch',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  btnTextGhost: {
    color: theme.colors.textSecondary,
  },
  btnTextFilled: {
    color: theme.colors.white,
  },
});

export default CustomAlert;
