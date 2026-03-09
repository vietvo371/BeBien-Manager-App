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
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.orderCode}>#{item.ma_hoa_don}</Text>
                    <View style={styles.tableTag}>
                        <Icon name="table-chair" size={13} color={theme.colors.primary} />
                        <Text style={styles.tableText}>{item.ten_ban}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                    <Icon name={statusConfig.iconName} size={14} color={statusConfig.color} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                    </Text>
                </View>
            </View>

            {/* Item info */}
            <View style={styles.content}>
                <View style={styles.infoRow}>
                    <Icon name="food" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.itemName} numberOfLines={1}>{item.ten_mat_hang}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Icon name="counter" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText}>
                        SL: {item.so_luong} × {formatCurrency(item.don_gia)}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Icon name="account-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText} numberOfLines={1}>
                        {item.ten_nhan_vien_order}
                    </Text>
                </View>
            </View>

            {/* Note */}
            {item.ghi_chu ? (
                <View style={styles.noteContainer}>
                    <Text style={styles.noteLabel}>Ghi chú:</Text>
                    <Text style={styles.noteText}>{item.ghi_chu}</Text>
                </View>
            ) : null}

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.totalLabel}>Thành tiền</Text>
                <Text style={[styles.totalAmount, { color: statusConfig.accentColor }]}>
                    {formatCurrency(item.thanh_tien)}
                </Text>
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
        borderLeftWidth: 4,
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
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: theme.colors.text,
    },
    tableTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
        gap: 3,
    },
    tableText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        gap: 4,
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
    },
    content: {
        gap: SPACING.xs,
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
        fontWeight: '500',
        marginBottom: 2,
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
    },
    totalLabel: {
        fontSize: FONT_SIZE.sm,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
    },
});
