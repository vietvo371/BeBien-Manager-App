import { Alert, Platform } from 'react-native';

/**
 * Cross-platform Alert.prompt polyfill
 * iOS supports Alert.prompt natively
 * Android requires a workaround or custom modal
 */

type AlertButton = {
  text?: string;
  onPress?: (value?: string) => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export const alertPrompt = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  type?: 'default' | 'plain-text' | 'secure-text' | 'login-password',
  defaultValue?: string,
  keyboardType?: string
): void => {
  if (Platform.OS === 'ios') {
    Alert.prompt(title, message, buttons, type, defaultValue, keyboardType);
  } else {
    Alert.alert(
      title,
      message,
      buttons?.map((button) => ({
        text: button.text,
        onPress: () => {
          if (button.onPress) {
            button.onPress(defaultValue || '');
          }
        },
        style: button.style,
      }))
    );
  }
};
