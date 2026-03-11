import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, BUTTON_HEIGHT } from '../../theme';
import { orderService } from '../../services/orderService';
import { MatHangOrder, parse422Error } from '../../types/order.types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.88;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectedItem {
  so_luong: number;
  ghi_chu: string;
}

interface AddItemBottomSheetProps {
  visible: boolean;
  idHoaDon: number;
  tenBan: string;
  onClose: () => void;
  onSuccess?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: string | number): string =>
  Number(value).toLocaleString('vi-VN') + 'đ';

// ─── Item row ─────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: MatHangOrder;
  soLuong: number;
  ghiChu: string;
  onQtyChange: (delta: number) => void;
  onNoteChange: (text: string) => void;
}

const ItemRow = React.memo<ItemRowProps>(
  ({ item, soLuong, ghiChu, onQtyChange, onNoteChange }) => {
    const isSelected = soLuong > 0;

    return (
      <View style={[styles.itemRow, isSelected && styles.itemRowSelected]}>
        <View style={styles.itemTop}>
          {/* Info */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.ten_mat_hang}
            </Text>
            <Text style={styles.itemPrice}>
              {formatCurrency(item.don_gia_ban)}/{item.ten_don_vi}
            </Text>
          </View>

          {/* Qty control */}
          <View style={styles.qtyControl}>
            <TouchableOpacity
              style={[styles.qtyBtn, soLuong === 0 && styles.qtyBtnDisabled]}
              onPress={() => onQtyChange(-1)}
              disabled={soLuong === 0}
              activeOpacity={0.7}
            >
              <Icon
                name="minus"
                size={16}
                color={soLuong === 0 ? theme.colors.textTertiary : theme.colors.error}
              />
            </TouchableOpacity>
            <Text style={[styles.qtyValue, isSelected && styles.qtyValueActive]}>
              {soLuong}
            </Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onQtyChange(1)}
              activeOpacity={0.7}
            >
              <Icon name="plus" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Note field (only when selected) */}
        {isSelected && (
          <TextInput
            style={styles.noteInput}
            placeholder="Ghi chú (vd: Ít cay, không hành...)"
            placeholderTextColor={theme.colors.textTertiary}
            value={ghiChu}
            onChangeText={onNoteChange}
            maxLength={200}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        )}
      </View>
    );
  }
);

// ─── Main component ───────────────────────────────────────────────────────────

export const AddItemBottomSheet: React.FC<AddItemBottomSheetProps> = ({
  visible,
  idHoaDon,
  tenBan,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Map<number, SelectedItem>>(new Map());

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  // ── Animation ───────────────────────────────────────────────────────────────

  const open = useCallback(() => {
    backdropOpacity.value = withTiming(1, { duration: 280 });
    translateY.value = withTiming(SCREEN_HEIGHT - SHEET_HEIGHT, { duration: 320 });
  }, [backdropOpacity, translateY]);

  const close = useCallback(
    (cb?: () => void) => {
      backdropOpacity.value = withTiming(0, { duration: 260 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
        if (cb) runOnJS(cb)();
      });
    },
    [backdropOpacity, translateY]
  );

  useEffect(() => {
    if (visible) {
      setSearch('');
      setSelected(new Map());
      open();
    } else {
      close();
    }
  }, [visible, open, close]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    close(onClose);
  }, [close, onClose]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Swipe-down to close
  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = SCREEN_HEIGHT - SHEET_HEIGHT + e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 80) {
        close(() => runOnJS(onClose)());
      } else {
        translateY.value = withTiming(SCREEN_HEIGHT - SHEET_HEIGHT, { duration: 260 });
      }
    });

  // ── Data ────────────────────────────────────────────────────────────────────

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['matHangOrder'],
    queryFn: () => orderService.getMatHangOrder(),
    staleTime: 5 * 60_000,
    enabled: visible,
  });

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.ten_mat_hang.toLowerCase().includes(q));
  }, [items, search]);

  // ── Selection helpers ────────────────────────────────────────────────────────

  const handleQtyChange = useCallback((item: MatHangOrder, delta: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const cur = next.get(item.id) ?? { so_luong: 0, ghi_chu: '' };
      const newQty = Math.max(0, cur.so_luong + delta);
      if (newQty === 0) {
        next.delete(item.id);
      } else {
        next.set(item.id, { ...cur, so_luong: newQty });
      }
      return next;
    });
  }, []);

  const handleNoteChange = useCallback((itemId: number, text: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const cur = next.get(itemId);
      if (cur) next.set(itemId, { ...cur, ghi_chu: text });
      return next;
    });
  }, []);

  // ── Summary ─────────────────────────────────────────────────────────────────

  const { totalQty, totalPrice } = useMemo(() => {
    let qty = 0;
    let price = 0;
    selected.forEach((sel, id) => {
      qty += sel.so_luong;
      const item = items.find((i) => i.id === id);
      if (item) price += sel.so_luong * Number(item.don_gia_ban);
    });
    return { totalQty: qty, totalPrice: price };
  }, [selected, items]);

  // ── Mutation ─────────────────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: () =>
      orderService.createOrderItems({
        id_hoa_don: idHoaDon,
        data: Array.from(selected.entries()).map(([id, sel]) => ({
          id,
          so_luong: sel.so_luong,
          ghi_chu: sel.ghi_chu || undefined,
        })),
      }),
    onSuccess: (res) => {
      Toast.show({ type: 'success', text1: res.message ?? 'Thêm món thành công' });
      queryClient.invalidateQueries({ queryKey: ['hoaDonChiTiet', idHoaDon] });
      queryClient.invalidateQueries({ queryKey: ['hoaDonOpen'] });
      close(() => {
        onSuccess?.();
        onClose();
      });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) { close(() => onClose()); return; }
      const msg = parse422Error(error) || error?.message || 'Không thể thêm món';
      Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
    },
  });

  const handleSubmit = useCallback(() => {
    if (totalQty === 0) {
      Toast.show({ type: 'info', text1: 'Chưa chọn món nào' });
      return;
    }
    Keyboard.dismiss();
    mutation.mutate();
  }, [totalQty, mutation]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Handle */}
          <GestureDetector gesture={gesture}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Thêm món</Text>
              <Text style={styles.headerSub}>{tenBan}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Icon name="close" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm tên món..."
              placeholderTextColor={theme.colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Icon name="close-circle" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Items list */}
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Đang tải danh sách món...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ItemRow
                  item={item}
                  soLuong={selected.get(item.id)?.so_luong ?? 0}
                  ghiChu={selected.get(item.id)?.ghi_chu ?? ''}
                  onQtyChange={(d) => handleQtyChange(item, d)}
                  onNoteChange={(t) => handleNoteChange(item.id, t)}
                />
              )}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.centered}>
                  <Icon name="silverware-clean" size={48} color={theme.colors.textTertiary} />
                  <Text style={styles.emptyText}>Không tìm thấy món</Text>
                </View>
              }
            />
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                totalQty === 0 && styles.submitBtnDisabled,
                mutation.isPending && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Icon name="cart-plus" size={20} color={theme.colors.white} />
                  <Text style={styles.submitBtnText}>
                    {totalQty > 0
                      ? `Đặt ${totalQty} món · ${formatCurrency(totalPrice)}`
                      : 'Chọn món để đặt'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 16 },
    }),
  },

  // Handle
  handleArea: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  headerSub: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: theme.colors.card,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    padding: 0,
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },

  // Item row
  itemRow: {
    backgroundColor: theme.colors.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  itemRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '40',
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
  },

  // Qty control
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qtyBtnDisabled: {
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.borderLight,
  },
  qtyValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    minWidth: 28,
    textAlign: 'center',
  },
  qtyValueActive: {
    color: theme.colors.primary,
  },

  // Note
  noteInput: {
    backgroundColor: theme.colors.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: BUTTON_HEIGHT.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  submitBtnDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  submitBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.white,
  },

  // States
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
  },
});
