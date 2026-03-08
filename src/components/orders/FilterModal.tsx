import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, BUTTON_HEIGHT } from '../../theme';
import { OrderFilters, OrderStatus } from '../../types/order.types';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface FilterModalProps {
  visible: boolean;
  currentFilters: OrderFilters;
  onClose: () => void;
  onApply: (filters: OrderFilters) => void;
  onReset: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  currentFilters,
  onClose,
  onApply,
  onReset,
}) => {
  const [filters, setFilters] = useState<OrderFilters>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, visible]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: OrderFilters = {
      status: 'all',
      searchQuery: '',
      tableNumber: '',
      dateFrom: '',
      dateTo: '',
      minTotal: undefined,
      maxTotal: undefined,
    };
    setFilters(resetFilters);
    onReset();
  };

  const statusOptions = [
    { value: 'all', label: 'Tất cả', icon: 'view-grid' },
    { value: OrderStatus.PENDING, label: 'Chờ xác nhận', icon: 'clock-outline' },
    { value: OrderStatus.CONFIRMED, label: 'Đã xác nhận', icon: 'check-circle-outline' },
    { value: OrderStatus.PREPARING, label: 'Đang chuẩn bị', icon: 'chef-hat' },
    { value: OrderStatus.READY, label: 'Sẵn sàng', icon: 'bell-ring-outline' },
    { value: OrderStatus.COMPLETED, label: 'Hoàn thành', icon: 'checkbox-marked-circle' },
    { value: OrderStatus.CANCELLED, label: 'Đã hủy', icon: 'close-circle' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <AnimatedTouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        />
        <Animated.View
          style={styles.modalContainer}
          entering={SlideInDown.duration(300).springify()}
          exiting={SlideOutDown.duration(250)}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Bộ lọc</Text>
              <Text style={styles.subtitle}>Tùy chỉnh hiển thị đơn hàng</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trạng thái</Text>
              <View style={styles.statusGrid}>
                {statusOptions.map((option) => {
                  const isSelected = filters.status === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusOption,
                        isSelected && styles.statusOptionSelected,
                      ]}
                      onPress={() => setFilters({ ...filters, status: option.value as any })}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={option.icon}
                        size={20}
                        color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.statusOptionText,
                          isSelected && styles.statusOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Số bàn</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số bàn..."
                placeholderTextColor={theme.colors.textTertiary}
                value={filters.tableNumber}
                onChangeText={(text) => setFilters({ ...filters, tableNumber: text })}
                keyboardType="default"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khoảng giá</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Từ</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={filters.minTotal?.toString()}
                    onChangeText={(text) =>
                      setFilters({ ...filters, minTotal: text ? parseInt(text) : undefined })
                    }
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.priceSeparator}>—</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Đến</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="∞"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={filters.maxTotal?.toString()}
                    onChangeText={(text) =>
                      setFilters({ ...filters, maxTotal: text ? parseInt(text) : undefined })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Icon name="refresh" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.resetButtonText}>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
              <Icon name="check" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    ...theme.shadows.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    maxHeight: 400,
  },
  section: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: SPACING.md,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  statusOptionSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  statusOptionText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  input: {
    height: BUTTON_HEIGHT.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  priceInput: {
    height: BUTTON_HEIGHT.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  priceSeparator: {
    fontSize: FONT_SIZE.lg,
    color: theme.colors.textTertiary,
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.xl,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? SPACING['2xl'] : SPACING.xl,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: BUTTON_HEIGHT.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    gap: SPACING.xs,
  },
  resetButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: BUTTON_HEIGHT.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: theme.colors.primary,
    gap: SPACING.xs,
    ...theme.shadows.md,
  },
  applyButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.white,
  },
});
