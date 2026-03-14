import { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../Typography';
import { businessDetailColors } from './styles';
import { FROSTED_CARD_BORDER_COLOR } from '../../styles/cardSurface';
import { CARD_CTA_RADIUS } from '../../styles/radii';
import { homeTokens } from '../../screens/tabs/home/HomeTokens';

export type BusinessHeaderMenuItem = {
  key: string;
  label: string;
  icon?: string;
  onPress: () => void;
};

type Props = {
  onPressBack: () => void;
  onPressNotifications: () => void;
  onPressMessages: () => void;
  menuItems?: BusinessHeaderMenuItem[];
  collapsed?: boolean;
  showBackButton?: boolean;
};

type MenuAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const MENU_WIDTH = 222;
const MENU_EDGE_PADDING = 12;

export function BusinessPageHeader({
  onPressBack,
  onPressNotifications,
  onPressMessages,
  menuItems = [],
  collapsed = false,
  showBackButton = true,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const logoTriggerRef = useRef<View | null>(null);
  const foregroundColor = collapsed ? businessDetailColors.white : businessDetailColors.textMuted;
  const backButtonBg = collapsed ? businessDetailColors.borderSoft : businessDetailColors.white;
  const backButtonBorder = collapsed ? FROSTED_CARD_BORDER_COLOR : homeTokens.borderSoft;
  const actionButtonBg = collapsed ? businessDetailColors.borderSoft : businessDetailColors.white;
  const actionButtonBorder = collapsed ? FROSTED_CARD_BORDER_COLOR : homeTokens.borderSoft;

  const handleSelectMenuItem = (item: BusinessHeaderMenuItem) => {
    setMenuVisible(false);
    item.onPress();
  };

  const toggleMenu = useCallback(() => {
    if (menuVisible) {
      setMenuVisible(false);
      return;
    }

    const node = logoTriggerRef.current;
    if (!node || typeof node.measureInWindow !== 'function') {
      setMenuVisible(true);
      return;
    }

    node.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ x, y, width, height });
      setMenuVisible(true);
    });
  }, [menuVisible]);

  const menuPositionStyle = useMemo(() => {
    if (!menuAnchor) {
      return styles.menuCardFallback;
    }

    const windowWidth = Dimensions.get('window').width;
    const centeredLeft = menuAnchor.x + menuAnchor.width / 2 - MENU_WIDTH / 2;
    const left = Math.min(
      Math.max(MENU_EDGE_PADDING, centeredLeft),
      windowWidth - MENU_WIDTH - MENU_EDGE_PADDING
    );

    return {
      left,
      top: menuAnchor.y + menuAnchor.height + 8,
    };
  }, [menuAnchor]);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.leftSlot}>
          {showBackButton ? (
            <Pressable
              style={[styles.backButton, { backgroundColor: backButtonBg, borderColor: backButtonBorder }]}
              onPress={onPressBack}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back-outline" size={20} color={foregroundColor} />
            </Pressable>
          ) : (
            <View style={styles.backButtonSpacer} />
          )}
        </View>

        <View style={styles.centerSlot}>
          {menuItems.length > 0 ? (
            <Pressable
              ref={logoTriggerRef}
              style={styles.logoTrigger}
              onPress={toggleMenu}
              accessibilityLabel="Open business navigation menu"
            >
              <Text style={[styles.logoText, { color: foregroundColor }]}>Sayso</Text>
              <Ionicons
                name={menuVisible ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={foregroundColor}
              />
            </Pressable>
          ) : (
            <Text style={[styles.logoText, { color: foregroundColor }]}>Sayso</Text>
          )}
        </View>

        <View style={styles.rightSlot}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: actionButtonBg, borderColor: actionButtonBorder }]}
            onPress={onPressMessages}
            accessibilityLabel="Messages"
          >
            <Ionicons name="chatbubble-outline" size={20} color={foregroundColor} />
          </Pressable>
          <Pressable
            style={[styles.iconButton, { backgroundColor: actionButtonBg, borderColor: actionButtonBorder }]}
            onPress={onPressNotifications}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={20} color={foregroundColor} />
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setMenuVisible(false)} />
          <View style={[styles.menuCard, menuPositionStyle]}>
            {menuItems.map((item, index) => (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.menuItem,
                  index !== menuItems.length - 1 ? styles.menuItemBorder : null,
                  pressed ? styles.menuItemPressed : null,
                ]}
                onPress={() => handleSelectMenuItem(item)}
              >
                {item.icon ? (
                  <Ionicons name={item.icon as never} size={18} color="rgba(255,255,255,0.6)" />
                ) : null}
                <Text style={styles.menuItemText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSlot: {
    width: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSlot: {
    width: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  logoTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoText: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: 'MonarchParadox',
    letterSpacing: 3,
    textTransform: 'none',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: CARD_CTA_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: businessDetailColors.white,
    borderWidth: 1,
    borderColor: homeTokens.borderSoft,
  },
  backButtonSpacer: {
    width: 40,
    height: 40,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: CARD_CTA_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: homeTokens.borderSoft,
    backgroundColor: businessDetailColors.white,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.36)',
    zIndex: 9999,
  },
  menuCard: {
    position: 'absolute',
    width: 222,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: homeTokens.coralDark,
    zIndex: 9999,
    elevation: 24,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
  },
  menuCardFallback: {
    top: 92,
    left: '50%',
    marginLeft: -(MENU_WIDTH / 2),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuItemText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
