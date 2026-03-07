import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Text, TouchableWithoutFeedback } from "react-native";
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS } from "../theme";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ModalCustomProps {
    isModalVisible: boolean;
    setIsModalVisible: (isModalVisible: boolean) => void;
    title: string;
    children: React.ReactNode;
    isAction?: boolean;
    isClose?: boolean;
    onPressAction?: () => void;
    actionText?: string;
    closeText?: string;
    alertType?: 'success' | 'error' | 'info';
    alertMessage?: string;
}

const ModalCustom = ({
    isModalVisible,
    setIsModalVisible,
    title,
    children,
    isAction = true,
    isClose = true,
    onPressAction,
    actionText = "Thực Hiện",
    closeText = "Đóng",
    alertType,
    alertMessage,
}: ModalCustomProps) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
            statusBarTranslucent
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={() => setIsModalVisible(false)}
                />
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity
                            onPress={() => setIsModalVisible(false)}
                            style={styles.closeIcon}
                        >
                            <Icon name="close" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        {alertType ? (
                            <View style={styles.alertContent}>
                                {alertType === 'success' && (
                                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                                        <Icon name="check-circle" size={48} color={theme.colors.success} />
                                    </View>
                                )}
                                {alertType === 'error' && (
                                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
                                        <Icon name="alert-circle" size={48} color={theme.colors.error} />
                                    </View>
                                )}
                                {alertType === 'info' && (
                                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                                        <Icon name="information" size={48} color={theme.colors.primary} />
                                    </View>
                                )}
                                <Text style={styles.alertTitle}>
                                    {alertType === 'success' ? 'Thành công' : alertType === 'error' ? 'Thất bại' : title || 'Thông báo'}
                                </Text>
                                <Text style={styles.alertMessage}>{alertMessage}</Text>
                            </View>
                        ) : (
                            children
                        )}
                    </View>

                    {(isClose || isAction) && (
                        <View style={styles.modalFooter}>
                            {isClose && (
                                <TouchableOpacity
                                    onPress={() => setIsModalVisible(false)}
                                    style={[styles.button, styles.buttonClose, !isAction && styles.buttonFull]}
                                >
                                    <Text style={styles.buttonCloseText}>{closeText}</Text>
                                </TouchableOpacity>
                            )}
                            {isAction && (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (onPressAction) onPressAction();
                                    }}
                                    style={[styles.button, styles.buttonAction, !isClose && styles.buttonFull]}
                                >
                                    <Text style={styles.buttonActionText}>{actionText}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: theme.colors.white,
        borderRadius: BORDER_RADIUS.xl,
        ...theme.shadows.lg,
        overflow: 'hidden',
        maxHeight: '85%', // Constraint total modal height
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        position: 'relative',
    },
    modalTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        textAlign: 'center',
    },
    closeIcon: {
        position: 'absolute',
        right: SPACING.sm,
        top: SPACING.sm,
        padding: SPACING.xs,
    },
    modalBody: {
        padding: SPACING.lg,
        // Removed maxHeight here
    },
    modalFooter: {
        flexDirection: 'row',
        padding: SPACING.lg,
        paddingTop: 0,
        gap: SPACING.md,
    },
    button: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonFull: {
        flex: 1,
    },
    buttonClose: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buttonAction: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.sm,
    },
    buttonCloseText: {
        color: theme.colors.textSecondary,
        fontSize: FONT_SIZE.md,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    buttonActionText: {
        color: theme.colors.white,
        fontSize: FONT_SIZE.md,
        fontWeight: theme.typography.fontWeight.bold,
    },
    alertContent: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    alertTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: SPACING.sm,
    },
    alertMessage: {
        fontSize: FONT_SIZE.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default ModalCustom;
