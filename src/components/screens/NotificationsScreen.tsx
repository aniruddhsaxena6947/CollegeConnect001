import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCollegeConnect } from '../../context/CollegeConnectContext';
import { FONTS, RADII, SPACING } from '../../theme/tokens';
import { NotificationType } from '../../types/collegeConnect';
import {
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  MegaphoneIcon,
  UsersIcon,
} from '../icons/NavIcons';
import {
  EmptyStateCard,
  ErrorStateCard,
  LoadingSkeletonList,
  ScreenHeader,
  TactilePressable,
} from '../ui/RNPrimitives';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    uiStateMode,
    setUIStateMode,
    markNotificationRead,
    markAllNotificationsRead,
    navigate,
    theme,
  } = useCollegeConnect();

  const renderIcon = (type: NotificationType, color: string) => {
    switch (type) {
      case 'reminder':
        return <CalendarIcon size={17} color={color} />;
      case 'announcement':
        return <MegaphoneIcon size={17} color={color} />;
      case 'club':
        return <UsersIcon size={17} color={color} />;
      case 'approved':
        return <CheckCircleIcon size={17} color={color} />;
      default:
        return <BellIcon size={17} color={color} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScreenHeader
        title="Notifications"
        subtitle="Stay updated, always."
        showBack
        handwrittenTitle
        rightSlot={
          <TactilePressable
            onPress={unreadNotificationsCount > 0 ? markAllNotificationsRead : undefined}
            disabled={unreadNotificationsCount === 0}
            scaleTo={0.92}
            accessibilityLabel={
              unreadNotificationsCount > 0 ? 'Mark all notifications read' : 'Notifications'
            }
            style={[
              styles.bellStatusBtn,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <BellIcon size={18} color={theme.text} />
            {unreadNotificationsCount > 0 ? (
              <View style={[styles.bellCountPill, { backgroundColor: theme.primary }]}>
                <Text style={[styles.bellCountText, { color: theme.primaryFg }]}>
                  {unreadNotificationsCount}
                </Text>
              </View>
            ) : null}
          </TactilePressable>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {unreadNotificationsCount > 0 ? (
          <View style={styles.markRow}>
            <TactilePressable
              onPress={markAllNotificationsRead}
              scaleTo={0.95}
              hitSlop={6}
              accessibilityLabel={`Mark all ${unreadNotificationsCount} read`}
            >
              <Text
                style={[
                  styles.markAllLink,
                  { color: theme.isDark ? theme.primaryBright : theme.primary },
                ]}
              >
                Mark all {unreadNotificationsCount} read
              </Text>
            </TactilePressable>
          </View>
        ) : null}

        {uiStateMode === 'loading' ? (
          <LoadingSkeletonList count={4} />
        ) : uiStateMode === 'error' ? (
          <ErrorStateCard onRetry={() => setUIStateMode('default')} />
        ) : uiStateMode === 'empty' || notifications.length === 0 ? (
          <EmptyStateCard
            title="You are all caught up"
            description="Reminders for registered events, official announcements, and club updates will appear here."
            actionLabel="Explore Events"
            onAction={() => {
              setUIStateMode('default');
              navigate('explore');
            }}
          />
        ) : (
          <View
            style={[
              styles.listCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {notifications.map((item, idx) => {
              const iconColor = theme.isDark ? theme.primaryBright : theme.primary;
              const isLast = idx === notifications.length - 1;
              return (
                <TactilePressable
                  key={item.id}
                  onPress={() => {
                    markNotificationRead(item.id);
                    navigate(
                      item.targetScreen,
                      item.targetScreen === 'event_detail' && item.targetId
                        ? { eventId: item.targetId }
                        : undefined
                    );
                  }}
                  scaleTo={0.985}
                  pressedOpacity={0.8}
                  accessibilityLabel={item.title}
                  style={[
                    styles.row,
                    {
                      backgroundColor: !item.isRead
                        ? theme.isDark
                          ? 'rgba(120,184,148,0.06)'
                          : 'rgba(232,223,206,0.32)'
                        : 'transparent',
                      borderBottomColor: theme.border,
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <View style={[styles.rowIconCircle, { backgroundColor: theme.surfaceTag }]}>
                    {renderIcon(item.type, iconColor)}
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.rowTop}>
                      <View style={styles.rowTitleWrap}>
                        {!item.isRead ? (
                          <View
                            style={[
                              styles.unreadDot,
                              { backgroundColor: theme.isDark ? theme.primaryBright : theme.primary },
                            ]}
                          />
                        ) : null}
                        <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.text }]}>
                          {item.title}
                        </Text>
                      </View>
                      <Text style={[styles.timeText, styles.tabular, { color: theme.textMuted }]}>
                        {item.timeAgo}
                      </Text>
                    </View>
                    <Text style={[styles.rowMsg, { color: theme.textMuted }]}>
                      {item.message}
                    </Text>
                  </View>
                </TactilePressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: 92,
    gap: 8,
  },
  bellStatusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellCountPill: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellCountText: {
    fontFamily: FONTS.ui,
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  markRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  markAllLink: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  listCard: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 66,
    gap: 12,
  },
  rowIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  rowTitle: {
    flex: 1,
    fontFamily: FONTS.ui,
    fontSize: 14,
    fontWeight: '700',
  },
  timeText: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '500',
  },
  rowMsg: {
    fontFamily: FONTS.ui,
    fontSize: 12.5,
    lineHeight: 18,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
