import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING } from '../../theme';
import { MessageBottomSheet } from './MessageBottomSheet';

export const GlobalFAB: React.FC = () => {
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    // Shared value for animation if needed later
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const onPressIn = useCallback(() => {
        scale.value = withSpring(0.9);
    }, [scale]);

    const onPressOut = useCallback(() => {
        scale.value = withSpring(1);
    }, [scale]);

    const handlePress = useCallback(() => {
        setIsSheetVisible(true);
    }, []);

    const handleSend = useCallback((message: string) => {
        // Here you would hook this up to the real API/Socket event
        Alert.alert('Thành công', `Đã gửi hộp thư tới Thu ngân: ${message}`);
    }, []);

    return (
        <React.Fragment>
            <Animated.View style={[styles.container, animatedStyle]}>
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.8}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    onPress={handlePress}
                >
                    <Icon name="message-alert-outline" size={28} color={theme.colors.white} />
                </TouchableOpacity>
            </Animated.View>

            <MessageBottomSheet
                visible={isSheetVisible}
                onClose={() => setIsSheetVisible(false)}
                onSend={handleSend}
            />
        </React.Fragment>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: SPACING['3xl'] + 50, // Above bottom tab nav
        right: SPACING.lg,
        zIndex: 9999, // Ensure it sits on top of all Tab screens
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.lg,
    },
});
