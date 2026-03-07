import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

/**
 * ComponentName - Brief description of what this component does
 * 
 * @example
 * ```tsx
 * <ComponentName
 *   title="Example"
 *   onPress={() => console.log('pressed')}
 * />
 * ```
 */

interface ComponentNameProps {
  /** Title to display */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Callback when component is pressed */
  onPress?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom style */
  style?: any;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  subtitle,
  onPress,
  isLoading = false,
  disabled = false,
  style,
}) => {
  // ========== Hooks ==========
  const { t } = useTranslation();
  const [internalState, setInternalState] = useState<string>('');

  // ========== Effects ==========
  useEffect(() => {
    // Setup logic here
    
    return () => {
      // Cleanup logic here
    };
  }, []);

  // ========== Callbacks ==========
  const handlePress = useCallback(() => {
    if (disabled || isLoading) return;
    onPress?.();
  }, [disabled, isLoading, onPress]);

  // ========== Derived Values ==========
  const buttonOpacity = disabled ? 0.5 : 1;

  // ========== Render ==========
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loading, style]}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.container, style]}
      entering={FadeInDown.duration(300).springify()}
      exiting={FadeOutUp.duration(200)}
    >
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[styles.touchable, { opacity: buttonOpacity }]}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ========== Styles ==========
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  touchable: {
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

// ========== Default Export ==========
export default ComponentName;
