import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../theme';
import { PendingCancelItem } from '../../types/order.types';

interface ResolvedCardProps {
    item: PendingCancelItem;
}

export const ResolvedCard: React.FC<ResolvedCardProps> = ({ item }) => {
    const isApproved = item.is_duyet_huy === 2;

    const statusConfig = isApproved
        ? {
              label: 'Đã duyệt xóa',
              color: theme.colors.success,
              bgColor: theme.colors.successLight,
              iconName: 'check-circle-outline',
              accentColor: theme.colors.success,
          }
        : {
              label: 'Đã từ chối',
              color: theme.colors.error,
              bgColor: theme.colors.errorLight,
              iconName: 'close-circle-outline',
              accentColor: theme.colors.error,
          };

    const formatCurrency = (value: string | number): string => {
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <View style={[styles.card, { borderLeftColor: statusConfig.accentColor }]}>
            {/* Row 1: bàn + mã | trạng thái */}
            <View style={styles.row}>
                <View style={styles.tableTag}>
                    <Icon name="table-chair" size={11} color={theme.colors.primary} />
                    <Text style={styles.tableText} numberOfLines={1}>{item.ten_ban}</Text>
                </View>
                <Text style={styles.orderCode} numberOfLines={1}>#{item.ma_hoa_don}</Text>
                <View style={styles.flex} />
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                    <Icon name={statusConfig.iconName} size={11} color={statusConfig.color} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]} numberOfLines={1}>
                        {statusConfig.label}
                    </Text>
                </View>
            </View>

            {/* Row 2: tên món | SL×giá | thành tiền */}
            <View style={styles.row}>
                <Text style={styles.itemName} numberOfLines={1}>{item.ten_mat_hang}</Text>
                <Text style={styles.qtyText} numberOfLines={1}>{item.so_luong} × {formatCurrency(item.don_gia)}</Text>
                <Text style={[styles.totalAmount, { color: statusConfig.accentColor }]} numberOfLines={1}>
                    {formatCurrency(item.thanh_tien)}
                </Text>
            </View>

            {/* Row 3 (optional): ghi chú */}
            {item.ghi_chu ? (
                <Text style={styles.note} numberOfLines={1}>
                    <Text style={styles.noteLabel}>Ghi chú: </Text>{item.ghi_chu}
                </Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: BORDER_RADIUS.sm,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        marginHorizontal: SPACING.lg,
        marginVertical: 3,
        borderLeftWidth: 3,
        gap: SPACING.xs,
        ...theme.shadows.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    flex: {
        flex: 1,
    },
    tableTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.xs,
        gap: 2,
        maxWidth: '40%',        // không vượt 40% chiều rộng card
        flexShrink: 1,
    },
    tableText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
        color: theme.colors.primary,
        flexShrink: 1,
    },
    orderCode: {
        fontSize: FONT_SIZE['2xs'],
        fontWeight: '500',
        color: theme.colors.textSecondary,
        flexShrink: 1,
        maxWidth: '25%',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.xs,
        gap: 2,
        flexShrink: 0,          // badge không bao giờ bị nén
    },
    statusText: {
        fontSize: FONT_SIZE['2xs'],
        fontWeight: '700',
    },
    itemName: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,                // chiếm không gian còn lại
        minWidth: 0,            // cho phép shrink xuống 0 nếu cần
    },
    qtyText: {
        fontSize: FONT_SIZE['2xs'],
        color: theme.colors.textSecondary,
        flexShrink: 1,          // nhường chỗ cho itemName nếu quá dài
        maxWidth: '40%',
    },
    totalAmount: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
        flexShrink: 0,          // tiền không bao giờ bị cắt
    },
    note: {
        fontSize: FONT_SIZE['2xs'],
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        paddingLeft: SPACING.xs,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.warning,
    },
    noteLabel: {
        fontWeight: '600',
        fontStyle: 'normal',
        color: theme.colors.textSecondary,
    },
});
