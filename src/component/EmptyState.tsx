import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS } from '../theme';

export type EmptyStateType = 'no-data' | 'search' | 'error' | 'network' | 'notifications' | 'classes' | 'feed';

interface EmptyStateProps {
    type?: EmptyStateType;
    title?: string;
    description?: string;
    icon?: string;
    iconColor?: string;
    illustration?: any; // require() image
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

/**
 * Reusable EmptyState component with Rafiki-style illustrations
 * 
 * @example
 * // Simple usage
 * <EmptyState type="no-data" />
 * 
 * @example
 * // With custom message and action
 * <EmptyState
 *   type="search"
 *   title="Không tìm thấy kết quả"
 *   description="Hãy thử tìm kiếm với từ khóa khác"
 *   actionLabel="Xóa bộ lọc"
 *   onAction={handleClearFilters}
 * />
 */
const EmptyState: React.FC<EmptyStateProps> = ({
    type = 'no-data',
    title,
    description,
    icon,
    iconColor,
    illustration,
    actionLabel,
    onAction,
    style,
}) => {
    // Default configurations for each type
    const configs = {
        'no-data': {
            title: 'Chưa có dữ liệu',
            description: 'Hiện tại chưa có dữ liệu để hiển thị',
            icon: 'inbox',
            iconColor: theme.colors.textTertiary,
            illustration: require('../assets/images/no_data.png'),
        },
        search: {
            title: 'Không tìm thấy kết quả',
            description: 'Hãy thử tìm kiếm với từ khóa khác',
            icon: 'magnify',
            iconColor: theme.colors.info,
            illustration: require('../assets/images/no_data.png'),
        },
        error: {
            title: 'Có lỗi xảy ra',
            description: 'Vui lòng thử lại sau',
            icon: 'alert-circle',
            iconColor: theme.colors.error,
            illustration: require('../assets/images/no_data.png'),
        },
        network: {
            title: 'Không có kết nối',
            description: 'Vui lòng kiểm tra kết nối mạng',
            icon: 'wifi-off',
            iconColor: theme.colors.warning,
            illustration: require('../assets/images/no_data.png'),
        },
        notifications: {
            title: 'Không có thông báo',
            description: 'Bạn chưa có thông báo mới nào',
            icon: 'bell-off-outline',
            iconColor: theme.colors.textTertiary,
            illustration: require('../assets/images/no_data.png'),
        },
        classes: {
            title: 'Chưa có lớp học',
            description: 'Bạn chưa được thêm vào lớp học nào',
            icon: 'school-outline',
            iconColor: theme.colors.textTertiary,
            illustration: require('../assets/images/no_data.png'),
        },
        feed: {
            title: 'Chưa có hoạt động',
            description: 'Lớp học này chưa có hoạt động nào được đăng',
            icon: 'post-outline',
            iconColor: theme.colors.textTertiary,
            illustration: require('../assets/images/no_data.png'),
        },
    };

    const config = configs[type];
    const finalTitle = title || config.title;
    const finalDescription = description || config.description;
    const finalIcon = icon || config.icon;
    const finalIconColor = iconColor || config.iconColor;
    const finalIllustration = illustration || config.illustration;

    return (
        <View style={[styles.container, style]}>
            {/* Illustration */}
            {finalIllustration && (
                <Image source={finalIllustration} style={styles.illustration} resizeMode="contain" />
            )}

            {/* Icon (fallback if no illustration) */}
            {!finalIllustration && (
                <View style={[styles.iconContainer, { backgroundColor: finalIconColor + '15' }]}>
                    <Icon name={finalIcon} size={64} color={finalIconColor} />
                </View>
            )}

            {/* Title */}
            <Text style={styles.title}>{finalTitle}</Text>

            {/* Description */}
            {finalDescription && (
                <Text style={styles.description}>{finalDescription}</Text>
            )}

            {/* Action Button */}
            {actionLabel && onAction && (
                <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.7}>
                    <Text style={styles.actionButtonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING['2xl'],
    },
    illustration: {
        width: 200,
        height: 200,
        marginBottom: SPACING.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: FONT_SIZE.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.xl,
        maxWidth: 280,
    },
    actionButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        ...theme.shadows.sm,
    },
    actionButtonText: {
        fontSize: FONT_SIZE.md,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.white,
    },
});

export default EmptyState;
