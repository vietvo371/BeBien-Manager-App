import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  theme,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  ICON_SIZE,
  wp,
  AVATAR_SIZE
} from '../theme';
import ModalCustom from './ModalCustom';
import { Child } from '../types/parent-api.types';
import { StudentClass } from '../types/student-api.types';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showNotification?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;
  variant?: 'gradient' | 'simple';
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightIconColor?: string;
  childSelector?: {
    visible: boolean;
    children: Child[];
    selectedChild: Child | null;
    onSelect: (child: Child) => void;
  };
  classSelector?: {
    visible: boolean;
    classes: StudentClass[];
    selectedClass: StudentClass | null;
    onSelect: (item: StudentClass) => void;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showNotification = true,
  notificationCount = 0,
  onNotificationPress,
  variant = 'simple',
  showBack = false,
  onBackPress,
  rightIcon,
  onRightPress,
  rightIconColor,
  childSelector,
  classSelector,
}) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      navigation.navigate('ThongBao');
    }
  };

  const renderRightAction = () => {
    if (rightIcon && onRightPress) {
      return (
        <TouchableOpacity
          style={variant === 'gradient' ? styles.gradientIconButton : styles.simpleNotificationButton}
          onPress={onRightPress}
        >
          <Icon
            name={rightIcon}
            size={variant === 'gradient' ? ICON_SIZE.sm : ICON_SIZE.md}
            color={rightIconColor || (variant === 'gradient' ? theme.colors.primary : theme.colors.text)}
          />
        </TouchableOpacity>
      );
    }

    if (showNotification) {
      return (
        <TouchableOpacity
          style={variant === 'gradient' ? styles.gradientIconButton : styles.simpleNotificationButton}
          onPress={handleNotificationPress}
        >
          <Icon
            name={variant === 'gradient' ? "bell-ring" : "bell-outline"}
            size={variant === 'gradient' ? ICON_SIZE.sm : ICON_SIZE.md}
            color={variant === 'gradient' ? theme.colors.primary : theme.colors.text}
          />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderChildSelector = () => {
    if (!childSelector || !childSelector.visible) return null;

    return (
      <>
        <TouchableOpacity
          style={styles.childSelectorTrigger}
          onPress={() => setIsSelectorVisible(true)}
        >
          <View style={styles.childInfoContainer}>
            <Text style={styles.gradientSubtitle}>{subtitle}</Text>
            <View style={styles.childNameRow}>
              <Text style={styles.gradientTitle}>
                {childSelector.selectedChild?.full_name || 'Chọn con'}
              </Text>
              <Icon name="chevron-down" size={20} color={theme.colors.white} style={{ marginLeft: 4 }} />
            </View>
          </View>
        </TouchableOpacity>

        <ModalCustom
          isModalVisible={isSelectorVisible}
          setIsModalVisible={setIsSelectorVisible}
          title="Chọn con"
          isClose={true}
        >
          <ScrollView contentContainerStyle={styles.childListContainer}>
            {childSelector.children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childItem,
                  childSelector.selectedChild?.id === child.id && styles.childItemActive
                ]}
                onPress={() => {
                  childSelector.onSelect(child);
                  setIsSelectorVisible(false);
                }}
              >
                <Image
                  source={child.avatar ? { uri: child.avatar } : require('../assets/images/avt.png')}
                  style={styles.childItemAvatar}
                />
                <View style={styles.childItemInfo}>
                  <Text style={[
                    styles.childItemName,
                    childSelector.selectedChild?.id === child.id && styles.childItemNameActive
                  ]}>
                    {child.full_name}
                  </Text>
                  <Text style={styles.childItemClass}>{child.class_code || 'Chưa xếp lớp'}</Text>
                </View>
                {childSelector.selectedChild?.id === child.id && (
                  <Icon name="check-circle" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ModalCustom>
      </>
    );
  };

  const renderClassSelector = () => {
    if (!classSelector || !classSelector.visible) return null;

    return (
      <>
        <TouchableOpacity
          style={styles.childSelectorTrigger}
          onPress={() => setIsSelectorVisible(true)}
        >
          <View style={styles.childInfoContainer}>
            <Text style={styles.gradientSubtitle}>{subtitle}</Text>
            <View style={styles.childNameRow}>
              <Text style={styles.gradientTitle}>
                {classSelector.selectedClass?.class_name || 'Chọn lớp học'}
              </Text>
              <Icon name="chevron-down" size={20} color={theme.colors.white} style={{ marginLeft: 4 }} />
            </View>
          </View>
        </TouchableOpacity>

        <ModalCustom
          isModalVisible={isSelectorVisible}
          setIsModalVisible={setIsSelectorVisible}
          title="Chọn lớp học"
          isClose={true}
        >
          <ScrollView contentContainerStyle={styles.childListContainer}>
            {classSelector.classes.map((item) => {
              const isSelected = classSelector.selectedClass?.id_class === item.id_class;
              return (
                <TouchableOpacity
                  key={item.id_class}
                  style={[
                    styles.childItem,
                    isSelected && styles.childItemActive
                  ]}
                  onPress={() => {
                    classSelector.onSelect(item);
                    setIsSelectorVisible(false);
                  }}
                >
                  <View style={[styles.childItemAvatar, { backgroundColor: theme.colors.primary + '20', alignItems: 'center', justifyContent: 'center' }]}>
                    <Icon name="google-classroom" size={20} color={theme.colors.primary} />
                  </View>

                  <View style={styles.childItemInfo}>
                    <Text style={[
                      styles.childItemName,
                      isSelected && styles.childItemNameActive
                    ]}>
                      {item.class_name}
                    </Text>
                    <Text style={styles.childItemClass}>{item.course_name}</Text>
                  </View>
                  {isSelected && (
                    <Icon name="check-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </ModalCustom>
      </>
    );
  };

  if (variant === 'gradient') {
    return (
      <View style={styles.gradientWrapper}>
        <View style={styles.gradientContent}>
          {showBack && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Icon name="arrow-left" size={ICON_SIZE.md} color={theme.colors.white} />
            </TouchableOpacity>
          )}

          <View style={styles.textWrapper}>
            {childSelector?.visible ? renderChildSelector() :
              classSelector?.visible ? renderClassSelector() : (
                <>
                  <Text style={styles.gradientTitle}>{title}</Text>
                  {subtitle && <Text style={styles.gradientSubtitle}>{subtitle}</Text>}
                </>
              )}
          </View>

          {renderRightAction()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.simpleHeader}>
      <View style={styles.simpleLeft}>
        <Text style={styles.simpleGreeting}>{subtitle || 'Xin chào'}</Text>
        <Text style={styles.simpleTitle}>{title}</Text>
      </View>
      {renderRightAction()}
    </View>
  );
};

const styles = StyleSheet.create({
  gradientWrapper: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  gradientContent: {
    backgroundColor: theme.colors.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING['2xl'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  textWrapper: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  gradientTitle: {
    color: theme.colors.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  gradientSubtitle: {
    color: theme.colors.white,
    opacity: 0.9,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
  gradientIconButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  simpleLeft: {
    flex: 1,
  },
  simpleGreeting: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'none',
  },
  simpleTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  simpleNotificationButton: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('5.5%'),
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: FONT_SIZE['2xs'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  childSelectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childInfoContainer: {
    justifyContent: 'center',
  },
  childNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  childListContainer: {
    paddingVertical: SPACING.sm,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    borderRadius: BORDER_RADIUS.md,
  },
  childItemActive: {
    backgroundColor: theme.colors.primary + '10',
  },
  childItemAvatar: {
    width: AVATAR_SIZE.sm,
    height: AVATAR_SIZE.sm,
    borderRadius: AVATAR_SIZE.sm / 2,
    marginRight: SPACING.md,
  },
  childItemInfo: {
    flex: 1,
  },
  childItemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  childItemNameActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  childItemClass: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

export default PageHeader;
