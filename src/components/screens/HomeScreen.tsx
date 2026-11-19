import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCollegeConnect } from '../../context/CollegeConnectContext';
import { FONTS, RADII, SPACING, TOUCH_TARGET } from '../../theme/tokens';
import { ScreenId } from '../../types/collegeConnect';
import {
  ArrowRightIcon,
  BellIcon,
  CalendarIcon,
  MapPinIcon,
  MegaphoneIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
  XIcon,
} from '../icons/NavIcons';
import {
  EventArtworkCard,
  SparkStarDoodle,
  SwirlDoodle,
} from '../illustrations/CampusArtwork';
import {
  EmptyStateCard,
  ErrorStateCard,
  EventRowCard,
  LoadingSkeletonList,
  TactilePressable,
} from '../ui/RNPrimitives';

export const HomeScreen: React.FC = () => {
  const {
    profile,
    role,
    roleMeta,
    visibleEvents,
    pendingEvents,
    unreadNotificationsCount,
    uiStateMode,
    setUIStateMode,
    navigate,
    openPublishSheet,
    theme,
  } = useCollegeConnect();

  const [quickQuery, setQuickQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const firstName = profile.name.split(' ')[0] || 'Aaryan';
  const featuredEvent =
    visibleEvents.find((e) => e.featured) ?? visibleEvents[0];
  const upcomingEvents = visibleEvents
    .filter((e) => e.id !== featuredEvent?.id)
    .slice(0, 3);

  const initials = profile.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const shortcuts: Array<{
    id: string;
    label: string;
    target: ScreenId;
    active?: boolean;
    icon: (color: string) => React.ReactNode;
  }> = [
    {
      id: 'events',
      label: 'Events',
      target: 'explore',
      icon: (c) => <CalendarIcon size={24} color={c} />,
    },
    {
      id: 'notices',
      label: 'Notices',
      target: 'announcements',
      icon: (c) => <MegaphoneIcon size={24} color={c} />,
    },
    {
      id: 'clubs',
      label: 'Clubs',
      target: 'hubs',
      active: true,
      icon: (c) => <UsersIcon size={24} color={c} />,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      target: 'calendar',
      icon: (c) => <CalendarIcon size={24} color={c} filled />,
    },
  ];

  const handleSearchSubmit = () => {
    navigate('explore', { searchQuery: quickQuery });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Personalized Greeting Bar matching Tile 2 */}
      <View style={styles.greetingBar}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[styles.greetingTitle, { color: theme.text }]}>
            Hey, {firstName}
          </Text>
          <Text numberOfLines={1} style={[styles.greetingSub, { color: theme.textMuted }]}>
            {role === 'student'
              ? 'Good to see you back!'
              : `${roleMeta.label} · ${profile.program}`}
          </Text>
        </View>

        <View style={styles.topRightActions}>
          <TactilePressable
            onPress={() => navigate('profile')}
            scaleTo={0.93}
            accessibilityLabel="Open profile"
            style={[
              styles.avatarCircle,
              {
                backgroundColor: theme.note,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: theme.noteInk }]}>{initials}</Text>
          </TactilePressable>

          <TactilePressable
            onPress={() => navigate('notifications')}
            scaleTo={0.93}
            accessibilityLabel="Open notifications"
            style={[
              styles.bellButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <BellIcon size={19} color={theme.text} />
            {unreadNotificationsCount > 0 ? (
              <View
                style={[
                  styles.bellBadge,
                  { backgroundColor: theme.isDark ? theme.primaryBright : theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.bellBadgeText,
                    { color: theme.isDark ? '#04140B' : '#FFFFFF' },
                  ]}
                >
                  {unreadNotificationsCount}
                </Text>
              </View>
            ) : null}
          </TactilePressable>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: theme.surface,
            borderColor: searchFocused
              ? theme.isDark
                ? theme.primaryBright
                : theme.primary
              : theme.border,
          },
        ]}
      >
        <SearchIcon
          size={18}
          color={
            searchFocused
              ? theme.isDark
                ? theme.primaryBright
                : theme.primary
              : theme.textMuted
          }
        />
        <TextInput
          value={quickQuery}
          onChangeText={setQuickQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          placeholder="Search events, clubs, notices..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {quickQuery.length > 0 ? (
          <View style={styles.searchActions}>
            <Pressable
              onPress={() => setQuickQuery('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <XIcon size={15} color={theme.textMuted} />
            </Pressable>
            {quickQuery.trim().length > 0 ? (
              <TactilePressable
                onPress={handleSearchSubmit}
                scaleTo={0.92}
                accessibilityLabel="Submit search"
                style={[styles.searchGoBtn, { backgroundColor: theme.primary }]}
              >
                <ArrowRightIcon size={15} color={theme.primaryFg} />
              </TactilePressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* 4 Hanging-Tag Shortcut Cards matching Tile 2 */}
      <View style={styles.hangingWrapper}>
        <View style={styles.shortcutGrid}>
          {shortcuts.map((item) => {
            const isActive = item.active;
            const bg = isActive ? theme.primary : theme.surfaceTag;
            const fg = isActive ? theme.primaryFg : theme.text;
            return (
              <View key={item.id} style={styles.hangingColumn}>
                <View style={[styles.stringStem, { backgroundColor: theme.borderStrong }]} />
                <TactilePressable
                  onPress={() => navigate(item.target)}
                  scaleTo={0.94}
                  containerStyle={{ width: '100%' }}
                  accessibilityLabel={`Open ${item.label}`}
                  style={[
                    styles.shortcutTile,
                    {
                      backgroundColor: bg,
                      borderColor: isActive ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.holeRing,
                      {
                        borderColor: isActive ? 'rgba(255,255,255,0.4)' : theme.borderStrong,
                      },
                    ]}
                  />
                  {item.icon(fg)}
                  <Text numberOfLines={1} style={[styles.shortcutLabel, { color: fg }]}>
                    {item.label}
                  </Text>
                </TactilePressable>
              </View>
            );
          })}
        </View>
      </View>

      {/* Role-Gated Official Publishing / Governance Banner */}
      {role !== 'student' ? (
        <View
          style={[
            styles.roleBanner,
            { backgroundColor: theme.sage, borderColor: theme.border },
          ]}
        >
          <View style={styles.roleBannerLeft}>
            <ShieldIcon
              size={18}
              color={theme.isDark ? theme.primaryBright : theme.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.roleBannerTitle, { color: theme.text }]}>
                {roleMeta.label} Mode
              </Text>
              <Text style={[styles.roleBannerDesc, { color: theme.textMuted }]}>
                {role === 'super_admin' && pendingEvents.length > 0
                  ? `${pendingEvents.length} submission awaiting review`
                  : roleMeta.badgeDescription}
              </Text>
            </View>
          </View>
          <TactilePressable
            onPress={openPublishSheet}
            scaleTo={0.94}
            accessibilityLabel="Publish new event or notice"
            style={[styles.roleBannerBtn, { backgroundColor: theme.primary }]}
          >
            <PlusIcon size={14} color={theme.primaryFg} />
            <Text style={[styles.roleBannerBtnText, { color: theme.primaryFg }]}>
              Publish
            </Text>
          </TactilePressable>
        </View>
      ) : null}

      {/* State Mode Handling */}
      {uiStateMode === 'loading' ? (
        <LoadingSkeletonList count={3} />
      ) : uiStateMode === 'error' ? (
        <ErrorStateCard onRetry={() => setUIStateMode('default')} />
      ) : uiStateMode === 'empty' || visibleEvents.length === 0 ? (
        <EmptyStateCard
          title="No upcoming campus events"
          description="Check back later for cultural fests, hackathons, and club workshops."
          actionLabel="Explore Archive"
          onAction={() => {
            setUIStateMode('default');
            navigate('explore');
          }}
        />
      ) : (
        <>
          {/* Tilted Featured Card + Doodles matching Tile 2 */}
          {featuredEvent ? (
            <View style={styles.featuredOuter}>
              <View style={styles.doodleTopLeft} pointerEvents="none">
                <SwirlDoodle color={theme.text} size={28} />
              </View>
              <View style={styles.doodleTopRight} pointerEvents="none">
                <SparkStarDoodle color={theme.text} size={20} />
              </View>

              <View style={{ transform: [{ rotate: '-2deg' }] }}>
                <TactilePressable
                  onPress={() => navigate('event_detail', { eventId: featuredEvent.id })}
                  scaleTo={0.98}
                  accessibilityLabel={`Featured event ${featuredEvent.title}`}
                  style={[
                    styles.featuredCard,
                    {
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <EventArtworkCard
                    theme={featuredEvent.artwork}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={[styles.featuredScrim, { backgroundColor: theme.scrim }]} />

                  <View style={styles.featuredContent}>
                    <View style={styles.featuredTop}>
                      <View style={styles.featuredTag}>
                        <Text style={styles.featuredTagText}>Featured</Text>
                      </View>
                    </View>

                    <View style={styles.featuredBottom}>
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text numberOfLines={1} style={styles.featuredTitle}>
                          {featuredEvent.title}
                        </Text>
                        <Text numberOfLines={1} style={styles.featuredHighlights}>
                          {featuredEvent.highlights.join('  •  ')}
                        </Text>
                        <View style={styles.featuredMetaLine}>
                          <CalendarIcon size={12} color="rgba(255,255,255,0.85)" />
                          <Text numberOfLines={1} style={[styles.featuredMeta, styles.tabular]}>
                            {featuredEvent.dateDisplay.replace(' 2025', '')}  •  {featuredEvent.time}
                          </Text>
                        </View>
                        <View style={styles.featuredMetaLine}>
                          <MapPinIcon size={12} color="rgba(255,255,255,0.85)" />
                          <Text numberOfLines={1} style={styles.featuredMeta}>
                            {featuredEvent.venue}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.featuredArrowCircle}>
                        <ArrowRightIcon size={18} color="#1E3A2B" />
                      </View>
                    </View>
                  </View>
                </TactilePressable>
              </View>

              <View style={styles.doodleBottomRight} pointerEvents="none">
                <SwirlDoodle color={theme.text} size={32} />
              </View>
            </View>
          ) : null}

          {/* Upcoming Events */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Upcoming Events
              </Text>
              <Pressable
                onPress={() => navigate('explore')}
                accessibilityRole="button"
                hitSlop={8}
                style={styles.seeAllBtn}
              >
                <Text
                  style={[
                    styles.seeAllText,
                    { color: theme.isDark ? theme.primaryBright : theme.primary },
                  ]}
                >
                  See all
                </Text>
                <ArrowRightIcon
                  size={14}
                  color={theme.isDark ? theme.primaryBright : theme.primary}
                />
              </Pressable>
            </View>

            <View style={{ gap: 10 }}>
              {upcomingEvents.map((event) => (
                <EventRowCard
                  key={event.id}
                  event={event}
                  showApprovalStatus={role === 'super_admin'}
                  onPress={() => navigate('event_detail', { eventId: event.id })}
                />
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 38,
    paddingBottom: 92,
    gap: 14,
  },
  greetingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  greetingTitle: {
    fontFamily: FONTS.handwritten,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
  },
  greetingSub: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    marginTop: 1,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    fontWeight: '700',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
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
  bellBadgeText: {
    fontFamily: FONTS.ui,
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  searchBox: {
    minHeight: 46,
    borderRadius: RADII.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.ui,
    fontSize: 13,
    height: 42,
    outlineStyle: 'none',
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchGoBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangingWrapper: {
    marginTop: -6,
  },
  shortcutGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  hangingColumn: {
    flex: 1,
    alignItems: 'center',
  },
  stringStem: {
    width: 1.5,
    height: 12,
  },
  shortcutTile: {
    width: '100%',
    minHeight: 92,
    borderRadius: RADII.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 6,
  },
  holeRing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.4,
    marginBottom: 2,
  },
  shortcutLabel: {
    fontFamily: FONTS.ui,
    fontSize: 12.5,
    fontWeight: '600',
  },
  roleBanner: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  roleBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBannerTitle: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
  roleBannerDesc: {
    fontFamily: FONTS.ui,
    fontSize: 11,
  },
  roleBannerBtn: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleBannerBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '700',
  },
  featuredOuter: {
    position: 'relative',
    paddingTop: 8,
    paddingBottom: 14,
  },
  doodleTopLeft: {
    position: 'absolute',
    top: -4,
    left: 2,
    zIndex: 5,
  },
  doodleTopRight: {
    position: 'absolute',
    top: 2,
    right: 6,
    zIndex: 5,
  },
  doodleBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: 16,
    zIndex: 5,
  },
  featuredCard: {
    minHeight: 168,
    borderRadius: RADII.xl,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  featuredScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 168,
  },
  featuredTop: {
    flexDirection: 'row',
  },
  featuredTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(230, 213, 184, 0.94)',
  },
  featuredTagText: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A2B',
  },
  featuredBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  featuredTitle: {
    fontFamily: FONTS.handwritten,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
    color: '#FFFFFF',
  },
  featuredHighlights: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.88)',
  },
  featuredMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  featuredMeta: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    color: 'rgba(255,255,255,0.86)',
  },
  featuredArrowCircle: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: 22,
    backgroundColor: '#FAF8F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.ui,
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
  },
  seeAllText: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    fontWeight: '600',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
