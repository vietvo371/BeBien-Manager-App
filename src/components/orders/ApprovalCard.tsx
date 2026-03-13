import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../theme';
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
            {/* Row 1: bàn + mã | trạng thái */}
            <View style={styles.row}>
                <View style={styles.tableTag}>
                    <Icon name="table-chair" size={14} color={theme.colors.primary} />
                    <Text style={styles.tableText} numberOfLines={1}>{item.ten_ban}</Text>
                </View>
                <Text style={styles.orderCode} numberOfLines={1}>#{item.ma_hoa_don}</Text>
                <View style={styles.flex} />
                <View style={styles.statusBadge}>
                    <Icon name="alert-circle" size={14} color={theme.colors.warning} />
                    <Text style={styles.statusText} numberOfLines={1}>Chờ duyệt hủy</Text>
                </View>
            </View>

            {/* Row 2: tên món | SL×giá | thành tiền */}
            <View style={styles.row}>
                <Text style={styles.itemName} numberOfLines={1}>{item.ten_mat_hang}</Text>
                <Text style={styles.qtyText} numberOfLines={1}>{item.so_luong} × {formatCurrency(item.don_gia)}</Text>
                <Text style={styles.totalAmount} numberOfLines={1}>{formatCurrency(item.thanh_tien)}</Text>
            </View>

            {/* Row 3 (optional): ghi chú */}
            {item.ghi_chu ? (
                <Text style={styles.note} numberOfLines={1}>
                    <Text style={styles.noteLabel}>Ghi chú: </Text>{item.ghi_chu}
                </Text>
            ) : null}

            {/* Row 4: action buttons */}
            <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={onReject} activeOpacity={0.8}>
                    <Icon name="close" size={16} color={theme.colors.error} />
                    <Text style={styles.rejectText}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={onApprove} activeOpacity={0.8}>
                    <Icon name="check" size={16} color={theme.colors.white} />
                    <Text style={styles.approveText}>Duyệt hủy</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        marginHorizontal: SPACING.lg,
        marginVertical: 5,
        gap: SPACING.sm,
        ...theme.shadows.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    flex: {
        flex: 1,
    },
    tableTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.sm,
        gap: 3,
        maxWidth: '40%',
        flexShrink: 1,
    },
    tableText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
        color: theme.colors.primary,
        flexShrink: 1,
    },
    orderCode: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '500',
        color: theme.colors.textSecondary,
        flexShrink: 1,
        maxWidth: '25%',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.warningLight + '40',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.sm,
        gap: 3,
        flexShrink: 0,
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: theme.colors.warning,
    },
    itemName: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,
        minWidth: 0,
    },
    qtyText: {
        fontSize: FONT_SIZE.xs,
        color: theme.colors.textSecondary,
        flexShrink: 1,
        maxWidth: '40%',
    },
    totalAmount: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: theme.colors.primary,
        flexShrink: 0,
    },
    note: {
        fontSize: FONT_SIZE.xs,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        paddingLeft: SPACING.sm,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.warning,
    },
    noteLabel: {
        fontWeight: '600',
        fontStyle: 'normal',
        color: theme.colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: 3,
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
        borderRadius: BORDER_RADIUS.sm,
        gap: 4,
    },
    rejectBtn: {
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    approveBtn: {
        backgroundColor: theme.colors.success,
    },
    rejectText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: theme.colors.error,
    },
    approveText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: theme.colors.white,
    },
});
