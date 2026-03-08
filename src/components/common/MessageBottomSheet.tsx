import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableOpacity,
    Keyboard,
    Dimensions,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, BUTTON_HEIGHT } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 400; // Expected max height of the sheet

interface MessageBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSend: (message: string) => void;
}

export const MessageBottomSheet: React.FC<MessageBottomSheetProps> = ({
    visible,
    onClose,
    onSend,
}) => {
    const [message, setMessage] = useState('');
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const backdropOpacity = useSharedValue(0);

    const scrollTo = useCallback((destination: number, duration = 300) => {
        'worklet';
        translateY.value = withTiming(destination, { duration });
    }, [translateY]);

    const handleClose = useCallback(() => {
        Keyboard.dismiss();
        scrollTo(SCREEN_HEIGHT, 250);
        backdropOpacity.value = withTiming(0, { duration: 250 }, (isFinished) => {
            if (isFinished) {
                runOnJS(onClose)();
            }
        });
    }, [scrollTo, backdropOpacity, onClose]);

    useEffect(() => {
        if (visible) {
            setMessage('');
            backdropOpacity.value = withTiming(1, { duration: 300 });
            scrollTo(0, 300);
        } else {
            scrollTo(SCREEN_HEIGHT, 250);
            backdropOpacity.value = withTiming(0, { duration: 250 });
        }
    }, [visible, backdropOpacity, scrollTo]);

    const contextY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onStart(() => {
            contextY.value = translateY.value;
        })
        .onUpdate((event) => {
            const newY = contextY.value + event.translationY;
            translateY.value = Math.max(newY, 0); // clamp to top
        })
        .onEnd((event) => {
            if (translateY.value > SHEET_HEIGHT / 3 || event.velocityY > 500) {
                runOnJS(handleClose)();
            } else {
                translateY.value = withSpring(0, { damping: 15 });
            }
        });

    const animatedBackdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const animatedSheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const handleSendPress = () => {
        if (message.trim()) {
            onSend(message.trim());
            handleClose();
        }
    };

    if (!visible && translateY.value === SCREEN_HEIGHT) return null;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
                </TouchableWithoutFeedback>

                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.sheet, animatedSheetStyle]}>
                        <View style={styles.dragHandleContainer}>
                            <View style={styles.dragHandle} />
                        </View>

                        <View style={styles.header}>
                            <Text style={styles.title}>Gửi thông báo</Text>
                            <Text style={styles.subtitle}>Gửi tin nhắn trực tiếp tới Thu Ngân</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập nội dung tin nhắn..."
                                placeholderTextColor={theme.colors.textTertiary}
                                multiline
                                maxLength={200}
                                value={message}
                                onChangeText={setMessage}
                                textAlignVertical="top"
                                autoFocus={false}
                            />
                            <Text style={styles.charCount}>{message.length}/200</Text>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                                onPress={handleSendPress}
                                disabled={!message.trim()}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.sendButtonText}>Gửi ngay</Text>
                                <Icon name="send" size={20} color={theme.colors.white} />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </GestureDetector>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
        minHeight: SHEET_HEIGHT,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.borderLight,
    },
    header: {
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: FONT_SIZE.sm,
        color: theme.colors.textSecondary,
    },
    inputContainer: {
        backgroundColor: theme.colors.background,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },
    input: {
        fontSize: FONT_SIZE.md,
        color: theme.colors.text,
        minHeight: 120,
        padding: 0,
    },
    charCount: {
        alignSelf: 'flex-end',
        fontSize: FONT_SIZE.xs,
        color: theme.colors.textTertiary,
        marginTop: SPACING.xs,
    },
    actions: {
        flexDirection: 'row',
    },
    sendButton: {
        flex: 1,
        height: BUTTON_HEIGHT.lg,
        backgroundColor: theme.colors.primary,
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    sendButtonDisabled: {
        backgroundColor: theme.colors.border,
    },
    sendButtonText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: theme.colors.white,
    },
});
