import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, BUTTON_HEIGHT } from '../../theme';
import { HoaDonChiTietItem, parse422Error } from '../../types/order.types';
import { orderService } from '../../services/orderService';

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number): string => v.toLocaleString('vi-VN') + 'đ';

const fmtM = (v: number): string => {
  // Chia 1000, dùng vi-VN locale để có dấu chấm ngăn cách hàng nghìn
  return (v / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' K';
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface BillPreviewModalProps {
  visible: boolean;
  idHoaDon: number;
  idBan: number;
  tenBan: string;
  tongTien: string;
  items: HoaDonChiTietItem[];
  onClose: () => void;
  onSuccess?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const BillPreviewModal: React.FC<BillPreviewModalProps> = ({
  visible,
  idHoaDon,
  idBan,
  tenBan,
  tongTien,
  items,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const baseTong = Number(tongTien);

  const [phanTramStr, setPhanTramStr] = useState('0');
  const [tienGiamStr, setTienGiamStr] = useState('0');

  // linked inputs: pct ↔ amount
  const handlePhanTramChange = useCallback(
    (val: string) => {
      const pct = parseFloat(val) || 0;
      setPhanTramStr(val);
      setTienGiamStr(String(Math.round((baseTong * pct) / 100)));
    },
    [baseTong]
  );

  const handleTienGiamChange = useCallback(
    (val: string) => {
      const tien = parseFloat(val) || 0;
      setTienGiamStr(val);
      if (baseTong > 0) {
        setPhanTramStr(((tien / baseTong) * 100).toFixed(1));
      }
    },
    [baseTong]
  );

  const tienGiam = parseFloat(tienGiamStr) || 0;
  const tongCong = Math.max(0, baseTong - tienGiam);

  // Filter only printed items (is_print = 1) — phải trước mutation để dùng trong mutationFn
  const billItems = useMemo(
    () => items.filter((i) => i.is_print === 1),
    [items]
  );

  const mutation = useMutation({
    mutationFn: async () => {
      // 1. Lưu giảm giá
      await orderService.capNhatGiamGia({
        id: idHoaDon,
        phan_tram_giam_gia: parseFloat(phanTramStr) || 0,
        tien_giam_gia: tienGiam,
      });
      // 2. Kích hoạt in dò — server tự bắn lệnh in qua WebSocket/Event
      await orderService.changeInDo({ id: idBan });
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'In bill dò thành công' });
      queryClient.invalidateQueries({ queryKey: ['hoaDonOpen'] });
      queryClient.invalidateQueries({ queryKey: ['hoaDonChiTiet', idHoaDon] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      const msg = parse422Error(error) || error?.message || 'Không thể in bill dò';
      Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
    },
  });

  const handlePrint = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Xác Nhận In Dò {tenBan}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="close" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Table header */}
            <View style={[styles.row, styles.tableHead]}>
              <Text style={[styles.colName, styles.headText]}>Tên món</Text>
              <Text style={[styles.colSL, styles.headText]}>SL</Text>
              <Text style={[styles.colPrice, styles.headText]}>Thành Tiền</Text>
            </View>

            {/* Item rows */}
            {billItems.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.row,
                  styles.itemRow,
                  idx % 2 === 1 && styles.rowAlt,
                ]}
              >
                <Text style={[styles.colName, styles.itemText]}>{item.ten_mat_hang}</Text>
                <Text style={[styles.colSL, styles.itemText]}>
                  {parseFloat(item.so_luong)}
                </Text>
                <Text style={[styles.colPrice, styles.itemText, styles.textRight]}>
                  {fmtM(Number(item.thanh_tien))}
                </Text>
              </View>
            ))}

            {/* Tổng tiền */}
            <View style={[styles.row, styles.totalRow]}>
              <Text style={[styles.colName, styles.totalLabel]}>Tổng Tiền</Text>
              <Text style={[styles.colSLPrice, styles.totalValue]}>
                {fmtM(baseTong)}
              </Text>
            </View>

            {/* Giảm giá */}
            <View style={[styles.row, styles.discountRow]}>
              <Text style={[styles.colName, styles.totalLabel]}>Giảm Giá</Text>
              <View style={styles.discountInputs}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phần Trăm</Text>
                  <TextInput
                    style={styles.input}
                    value={phanTramStr}
                    onChangeText={handlePhanTramChange}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Thành Tiền</Text>
                  <TextInput
                    style={styles.input}
                    value={tienGiamStr}
                    onChangeText={handleTienGiamChange}
                    keyboardType="numeric"
                    selectTextOnFocus
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>
              </View>
            </View>

            {/* Tổng cộng */}
            <View style={[styles.row, styles.grandTotalRow]}>
              <Text style={[styles.colName, styles.grandLabel]}>Tổng Cộng</Text>
              <Text style={[styles.colSLPrice, styles.grandValue]}>
                {fmtM(tongCong)}
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.btnClose}
              onPress={onClose}
              activeOpacity={0.8}
              disabled={mutation.isPending}
            >
              <Text style={styles.btnCloseText}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrint, mutation.isPending && styles.btnDisabled]}
              onPress={handlePrint}
              activeOpacity={0.8}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Icon name="printer-outline" size={18} color={theme.colors.white} />
              )}
              <Text style={styles.btnPrintText}>
                {mutation.isPending ? 'Đang lưu...' : 'In Bill Dò'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const BORDER = theme.colors.border;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.white,
  },
  closeBtn: {
    marginLeft: SPACING.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Body
  body: {
    maxHeight: 460,
  },

  // Table
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableHead: {
    backgroundColor: theme.colors.borderLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  headText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: theme.colors.text,
  },
  itemRow: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  rowAlt: {
    backgroundColor: theme.colors.background,
  },
  itemText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.text,
  },
  textRight: {
    textAlign: 'right',
  },
  colName: {
    flex: 1,
  },
  colSL: {
    width: 44,
    textAlign: 'center',
  },
  colPrice: {
    width: 80,
    textAlign: 'right',
  },
  colSLPrice: {
    width: 120,
    textAlign: 'right',
  },

  // Totals
  totalRow: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: theme.colors.card,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.text,
  },

  // Discount
  discountRow: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  discountInputs: {
    flex: 1,
    gap: SPACING.sm,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },

  // Grand total
  grandTotalRow: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: theme.colors.card,
  },
  grandLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: theme.colors.text,
  },
  grandValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: theme.colors.error,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: theme.colors.white,
  },
  btnClose: {
    flex: 1,
    height: BUTTON_HEIGHT.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#6B7280',
  },
  btnCloseText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.white,
  },
  btnPrint: {
    flex: 2,
    flexDirection: 'row',
    height: BUTTON_HEIGHT.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: theme.colors.error,
    gap: SPACING.sm,
  },
  btnPrintText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.white,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
