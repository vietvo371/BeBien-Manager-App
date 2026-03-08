import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, BUTTON_HEIGHT } from '../../theme';
import { Order, OrderStatus } from '../../types/order.types';

interface ApprovalCardProps {
    order: Order;
    onPress: () => void;
    onApprove: () => void;
    onReject: () => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
    order,
    onPress,
    onApprove,
    onReject,
}) => {
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.orderCode}>#{order.order_code}</Text>
                    {order.table_number && (
                        <View style={styles.tableTag}>
                            <Icon name="table-chair" size={14} color={theme.colors.primary} />
                            <Text style={styles.tableText}>Bàn {order.table_number}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.statusBadge}>
                    <Icon name="alert-circle" size={16} color={theme.colors.warning} />
                    <Text style={styles.statusText}>Chờ duyệt hủy</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.infoRow}>
                    <Icon name="package-variant" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText}>
                        {order.items.length} món • {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                    </Text>
                </View>

                {order.customer_name && (
                    <View style={styles.infoRow}>
                        <Icon name="account" size={18} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{order.customer_name}</Text>
                    </View>
                )}

                <View style={styles.infoRow}>
                    <Icon name="clock-outline" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText}>{formatDate(order.created_at)}</Text>
                </View>
            </View>

            <View style={styles.reasonContainer}>
                <Text style={styles.reasonLabel}>Lý do hủy:</Text>
                <Text style={styles.reasonText}>{order.cancellation_reason || 'Không có lý do'}</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.totalAmount}>{formatCurrency(order.total)}</Text>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={onReject}
                    activeOpacity={0.8}
                >
                    <Icon name="close" size={20} color={theme.colors.error} />
                    <Text style={styles.rejectText}>Từ chối</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={onApprove}
                    activeOpacity={0.8}
                >
                    <Icon name="check" size={20} color={theme.colors.white} />
                    <Text style={styles.approveText}>Duyệt hủy</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginHorizontal: SPACING.lg,
        marginVertical: SPACING.sm,
        ...theme.shadows.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    orderCode: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: theme.colors.text,
        marginRight: SPACING.sm,
    },
    tableTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        gap: 4,
    },
    tableText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.warningLight + '30',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        gap: 4,
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: theme.colors.warning,
    },
    content: {
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    infoText: {
        fontSize: FONT_SIZE.sm,
        color: theme.colors.textSecondary,
        flex: 1,
    },
    reasonContainer: {
        backgroundColor: theme.colors.background,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.warning,
    },
    reasonLabel: {
        fontSize: FONT_SIZE.xs,
        color: theme.colors.textSecondary,
        marginBottom: 2,
        fontWeight: '500',
    },
    reasonText: {
        fontSize: FONT_SIZE.sm,
        color: theme.colors.text,
        fontStyle: 'italic',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        marginBottom: SPACING.md,
    },
    totalLabel: {
        fontSize: FONT_SIZE.md,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    actionContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: BUTTON_HEIGHT.md,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.sm,
    },
    rejectButton: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    approveButton: {
        backgroundColor: theme.colors.success,
    },
    rejectText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: theme.colors.error,
    },
    approveText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: theme.colors.white,
    },
});
