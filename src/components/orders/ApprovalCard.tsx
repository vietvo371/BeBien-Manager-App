import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, BUTTON_HEIGHT } from '../../theme';
import { PendingCancelItem } from '../../types/order.types';

interface ApprovalCardProps {
    item: PendingCancelItem;
    onApprove: () => void;
    onReject: () => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
    item,
    onApprove,
    onReject,
}) => {
    const formatCurrency = (value: string | number): string => {
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.tableTag}>
                        <Icon name="table-chair" size={14} color={theme.colors.primary} />
                        <Text style={styles.tableText}>{item.ten_ban}</Text>
                    </View>
                    <Text style={styles.orderCode}>#{item.ma_hoa_don}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Icon name="alert-circle" size={16} color={theme.colors.warning} />
                    <Text style={styles.statusText}>Chờ duyệt hủy</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.infoRow}>
                    <Icon name="food" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.itemName}>{item.ten_mat_hang}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="counter" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText}>
                        SL: {item.so_luong} × {formatCurrency(item.don_gia)}
                    </Text>
                </View>

                {/* <View style={styles.infoRow}>
                    <Icon name="account-tie" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText}>{item.ten_nhan_vien_order}</Text>
                </View> */}
            </View>

            {item.ghi_chu ? (
                <View style={styles.noteContainer}>
                    <Text style={styles.noteLabel}>Ghi chú:</Text>
                    <Text style={styles.noteText}>{item.ghi_chu}</Text>
                </View>
            ) : null}

            <View style={styles.footer}>
                <Text style={styles.totalLabel}>Thành tiền:</Text>
                <Text style={styles.totalAmount}>{formatCurrency(item.thanh_tien)}</Text>
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
        </View>
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
        gap: SPACING.sm,
    },
    orderCode: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '500',
        color: theme.colors.textSecondary,
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
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
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
    itemName: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,
    },
    infoText: {
        fontSize: FONT_SIZE.sm,
        color: theme.colors.textSecondary,
        flex: 1,
    },
    noteContainer: {
        backgroundColor: theme.colors.background,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.warning,
    },
    noteLabel: {
        fontSize: FONT_SIZE.xs,
        color: theme.colors.textSecondary,
        marginBottom: 2,
        fontWeight: '500',
    },
    noteText: {
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
