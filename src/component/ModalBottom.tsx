import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, ICON_SIZE } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModalBottomProps {
    isVisible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    height?: number;
    contentStyle?: any;
}

const ModalBottom: React.FC<ModalBottomProps> = ({
    isVisible,
    onClose,
    title,
    children,
    height = SCREEN_HEIGHT * 0.5,
    contentStyle,
}) => {
    const slideAnim = React.useRef(new Animated.Value(height)).current;

    React.useEffect(() => {
        if (isVisible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible, height, slideAnim]);

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.container,
                                {
                                    height: height,
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            {/* Header */}
                            {title && (
                                <View style={styles.header}>
                                    <View style={styles.dragIndicator} />
                                    <Text style={styles.title}>{title}</Text>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={onClose}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Icon name="close" size={ICON_SIZE.md} color={theme.colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Content */}
                            <View style={[styles.content, contentStyle]}>{children}</View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: BORDER_RADIUS['2xl'],
        borderTopRightRadius: BORDER_RADIUS['2xl'],
        ...theme.shadows.lg,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        alignItems: 'center',
    },
    dragIndicator: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.borderLight,
        borderRadius: 2,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZE.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: SPACING.lg,
        top: SPACING.md,
        padding: SPACING.xs,
    },
    content: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        flex: 1,
    },
});

export default ModalBottom;
