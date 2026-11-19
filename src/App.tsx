import React, { memo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { HandoffInspector } from './components/modals/HandoffInspector';
import { PublishModal } from './components/modals/PublishModal';
import {
  BookmarkIcon,
  CodeIcon,
  CompassIcon,
  HomeIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  UserIcon,
} from './components/icons/NavIcons';
import { AnnouncementsScreen } from './components/screens/AnnouncementsScreen';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { EventDetailScreen } from './components/screens/EventDetailScreen';
import { ExploreScreen } from './components/screens/ExploreScreen';
import { ForgotPasswordScreen } from './components/screens/ForgotPasswordScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { HubsScreen } from './components/screens/HubsScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SavedScreen } from './components/screens/SavedScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { SignUpScreen } from './components/screens/SignUpScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { AnimatedScreen, FeedbackBannerView, TactilePressable } from './components/ui/RNPrimitives';
import { CollegeConnectProvider, useCollegeConnect } from './context/CollegeConnectContext';
import { FONTS, RADII, TOUCH_TARGET } from './theme/tokens';

const BottomTabButton: React.FC<{
  label: string;
  active: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  renderIcon: (color: string, filled: boolean) => React.ReactNode;
}> = memo(({ label, active, activeColor, inactiveColor, onPress, renderIcon }) => {
  const color = active ? activeColor : inactiveColor;
  return (
    <TactilePressable
      onPress={onPress}
      scaleTo={0.92}
      pressedOpacity={0.8}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={styles.tabBtnWrap}
    >
      <View
        style={[
          styles.tabActivePill,
          { backgroundColor: active ? activeColor : 'transparent' },
        ]}
      />
      {renderIcon(color, active)}
      <Text numberOfLines={1} style={[styles.tabLabel, { color, fontWeight: active ? '700' : '600' }]}>
        {label}
      </Text>
    </TactilePressable>
  );
});

const AppShell: React.FC = () => {
  const {
    activeScreen,
    navDirection,
    navigate,
    roleMeta,
    openPublishSheet,
    inspectorOpen,
    toggleInspector,
    resolvedDark,
    setThemeMode,
    platformOS,
    showFeedback,
    theme,
  } = useCollegeConnect();

  const { width, height } = useWindowDimensions();
  const isWideHost = width >= 520;
  const isFullScreenRoute =
    activeScreen === 'welcome' ||
    activeScreen === 'login' ||
    activeScreen === 'signup' ||
    activeScreen === 'forgot_password' ||
    activeScreen === 'event_detail';
  const canPublish = roleMeta.canPublishEvents || roleMeta.canPublishAnnouncements;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'login':
        return <LoginScreen />;
      case 'signup':
        return <SignUpScreen />;
      case 'forgot_password':
        return <ForgotPasswordScreen />;
      case 'home':
        return <HomeScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'event_detail':
        return <EventDetailScreen />;
      case 'hubs':
        return <HubsScreen />;
      case 'announcements':
        return <AnnouncementsScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'saved':
        return <SavedScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const handleCenterButton = () => {
    if (canPublish) {
      openPublishSheet();
    } else {
      showFeedback(
        'info',
        'Student Quick Jump',
        'Official publishing is restricted to Faculty, Hub In-charge & Super Admin. Opening Hubs & Clubs.'
      );
      navigate('hubs');
    }
  };

  const mobileFrameStyle = isWideHost
    ? [
        styles.mobilePhoneFrame,
        {
          backgroundColor: theme.bg,
          borderColor: theme.borderStrong,
          height: Math.min(height - 32, 860),
        },
        !theme.isDark
          ? {
              shadowColor: '#1C261F',
              shadowOpacity: 0.14,
              shadowRadius: 28,
              shadowOffset: { width: 0, height: 12 },
            }
          : null,
      ]
    : [styles.mobileFullBleed, { backgroundColor: theme.bg }];

  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: isWideHost ? theme.backdrop : theme.bg },
      ]}
    >
      {/* Discreet outside-the-phone quick controls ONLY on wide preview viewports */}
      {isWideHost ? (
        <View style={styles.previewCornerTools}>
          <TactilePressable
            onPress={() => setThemeMode(resolvedDark ? 'light' : 'dark')}
            scaleTo={0.95}
            accessibilityLabel="Toggle OLED Dark Mode"
            style={[
              styles.cornerPill,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {resolvedDark ? (
              <SunIcon size={15} color={theme.primaryBright} />
            ) : (
              <MoonIcon size={15} color={theme.primary} />
            )}
            <Text style={[styles.cornerPillText, { color: theme.text }]}>
              {resolvedDark ? 'OLED Dark' : 'Warm Light'}
            </Text>
          </TactilePressable>

          <TactilePressable
            onPress={toggleInspector}
            scaleTo={0.95}
            accessibilityLabel="Open Role & RN Spec Inspector"
            style={[
              styles.cornerPill,
              {
                backgroundColor: inspectorOpen ? theme.primary : theme.surface,
                borderColor: inspectorOpen ? theme.primary : theme.border,
              },
            ]}
          >
            <CodeIcon
              size={15}
              color={inspectorOpen ? theme.primaryFg : theme.text}
            />
            <Text
              style={[
                styles.cornerPillText,
                { color: inspectorOpen ? theme.primaryFg : theme.text },
              ]}
            >
              {roleMeta.shortLabel} · RN Spec
            </Text>
          </TactilePressable>
        </View>
      ) : null}

      <View style={[styles.centerStage, isWideHost ? styles.centerStageWide : null]}>
        {/* Pure Mobile App Frame */}
        <View style={mobileFrameStyle}>
          {/* Subtle mobile status bar strip (9:41) matching the mobile UI tiles */}
          <View style={[styles.statusBarRow, { backgroundColor: 'transparent' }]}>
            <Text
              style={[
                styles.statusTime,
                {
                  color:
                    activeScreen === 'profile' || activeScreen === 'event_detail'
                      ? '#FFFFFF'
                      : theme.text,
                },
              ]}
            >
              9:41
            </Text>
            <View style={styles.statusSignalRow}>
              <View
                style={[
                  styles.signalBar,
                  {
                    height: 5,
                    backgroundColor:
                      activeScreen === 'profile' || activeScreen === 'event_detail'
                        ? '#FFFFFF'
                        : theme.text,
                  },
                ]}
              />
              <View
                style={[
                  styles.signalBar,
                  {
                    height: 8,
                    backgroundColor:
                      activeScreen === 'profile' || activeScreen === 'event_detail'
                        ? '#FFFFFF'
                        : theme.text,
                  },
                ]}
              />
              <View
                style={[
                  styles.signalBar,
                  {
                    height: 11,
                    backgroundColor:
                      activeScreen === 'profile' || activeScreen === 'event_detail'
                        ? '#FFFFFF'
                        : theme.text,
                  },
                ]}
              />
              <View
                style={[
                  styles.batteryShell,
                  {
                    borderColor:
                      activeScreen === 'profile' || activeScreen === 'event_detail'
                        ? 'rgba(255,255,255,0.7)'
                        : theme.textMuted,
                  },
                ]}
              >
                <View
                  style={[
                    styles.batteryFill,
                    {
                      backgroundColor:
                        activeScreen === 'profile' || activeScreen === 'event_detail'
                          ? '#FFFFFF'
                          : theme.text,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={{ flex: 1, position: 'relative' }}>
            <AnimatedScreen screenKey={activeScreen} direction={navDirection}>
              {renderScreen()}
            </AnimatedScreen>

            <View style={styles.toastContainer} pointerEvents="box-none">
              <FeedbackBannerView />
            </View>

            {/* Exact 5-Slot Mobile Bottom Navigation Bar from Mockup */}
            {!isFullScreenRoute ? (
              <View
                style={[
                  styles.bottomTabBar,
                  {
                    backgroundColor: theme.tabBarBg,
                    borderTopColor: theme.border,
                  },
                  !theme.isDark && platformOS === 'android'
                    ? { elevation: 10, shadowColor: '#000' }
                    : null,
                ]}
              >
                <View style={styles.tabBtn}>
                  <BottomTabButton
                    label="Home"
                    active={activeScreen === 'home'}
                    activeColor={theme.isDark ? theme.primaryBright : theme.primary}
                    inactiveColor={theme.textMuted}
                    onPress={() => navigate('home')}
                    renderIcon={(c, f) => <HomeIcon size={21} color={c} filled={f} />}
                  />
                </View>

                <View style={styles.tabBtn}>
                  <BottomTabButton
                    label="Explore"
                    active={activeScreen === 'explore'}
                    activeColor={theme.isDark ? theme.primaryBright : theme.primary}
                    inactiveColor={theme.textMuted}
                    onPress={() => navigate('explore')}
                    renderIcon={(c, f) => <CompassIcon size={21} color={c} filled={f} />}
                  />
                </View>

                {/* Center '+' Circle FAB matching Mockup */}
                <View style={styles.centerTabSlot}>
                  <TactilePressable
                    onPress={handleCenterButton}
                    scaleTo={0.9}
                    accessibilityLabel={
                      canPublish ? 'Publish official event or announcement' : 'Open Campus Hubs'
                    }
                    style={[styles.centerFab, { backgroundColor: theme.primary }]}
                  >
                    <PlusIcon size={22} color={theme.primaryFg} />
                  </TactilePressable>
                </View>

                <View style={styles.tabBtn}>
                  <BottomTabButton
                    label="Saved"
                    active={activeScreen === 'saved'}
                    activeColor={theme.isDark ? theme.primaryBright : theme.primary}
                    inactiveColor={theme.textMuted}
                    onPress={() => navigate('saved')}
                    renderIcon={(c, f) => <BookmarkIcon size={21} color={c} filled={f} />}
                  />
                </View>

                <View style={styles.tabBtn}>
                  <BottomTabButton
                    label="Profile"
                    active={activeScreen === 'profile'}
                    activeColor={theme.isDark ? theme.primaryBright : theme.primary}
                    inactiveColor={theme.textMuted}
                    onPress={() => navigate('profile')}
                    renderIcon={(c, f) => <UserIcon size={21} color={c} filled={f} />}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <HandoffInspector />
      </View>

      <PublishModal />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <CollegeConnectProvider>
      <AppShell />
    </CollegeConnectProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  previewCornerTools: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 60,
    flexDirection: 'row',
    gap: 8,
  },
  cornerPill: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cornerPillText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
  centerStage: {
    flex: 1,
    flexDirection: 'row',
  },
  centerStageWide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 20,
  },
  mobileFullBleed: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mobilePhoneFrame: {
    width: '100%',
    maxWidth: 412,
    borderRadius: 36,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  statusBarRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  statusTime: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statusSignalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  signalBar: {
    width: 3,
    borderRadius: 1.5,
  },
  batteryShell: {
    width: 20,
    height: 11,
    borderRadius: 3,
    borderWidth: 1.3,
    padding: 1.5,
    marginLeft: 4,
    justifyContent: 'center',
  },
  batteryFill: {
    flex: 1,
    borderRadius: 1,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 82,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  tabBtn: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnWrap: {
    minWidth: 56,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabActivePill: {
    width: 18,
    height: 2.5,
    borderRadius: 2,
    marginBottom: 1,
  },
  tabLabel: {
    fontFamily: FONTS.ui,
    fontSize: 10,
    fontWeight: '600',
  },
  centerTabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
