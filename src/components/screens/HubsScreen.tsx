import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCollegeConnect } from '../../context/CollegeConnectContext';
import { FONTS, RADII, SPACING } from '../../theme/tokens';
import { CheckIcon, ClockIcon, MapPinIcon, PlusIcon, ShieldIcon, UsersIcon } from '../icons/NavIcons';
import {
  EmptyStateCard,
  ErrorStateCard,
  LoadingSkeletonList,
  ScreenHeader,
  TactilePressable,
} from '../ui/RNPrimitives';

export const HubsScreen: React.FC = () => {
  const {
    hubs,
    clubs,
    role,
    roleMeta,
    profile,
    uiStateMode,
    setUIStateMode,
    toggleClubMembership,
    openPublishSheet,
    theme,
  } = useCollegeConnect();

  const [selectedHubId, setSelectedHubId] = useState<string>('all');

  const activeHub = useMemo(
    () => hubs.find((h) => h.id === selectedHubId) ?? null,
    [hubs, selectedHubId]
  );

  const filteredClubs = useMemo(
    () => (selectedHubId === 'all' ? clubs : clubs.filter((c) => c.hubId === selectedHubId)),
    [clubs, selectedHubId]
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScreenHeader
        title="Hubs & Clubs"
        subtitle="Find your campus community."
        showBack
        handwrittenTitle
        rightSlot={
          roleMeta.canManageHub ? (
            <TactilePressable
              onPress={openPublishSheet}
              scaleTo={0.94}
              accessibilityLabel="Create hub event"
              style={[styles.headerAction, { backgroundColor: theme.primary }]}
            >
              <PlusIcon size={15} color={theme.primaryFg} />
              <Text style={[styles.headerActionText, { color: theme.primaryFg }]}>
                Hub Event
              </Text>
            </TactilePressable>
          ) : null
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hubChipsRow}
        >
          <TactilePressable
            onPress={() => setSelectedHubId('all')}
            scaleTo={0.94}
            accessibilityLabel="All Hubs"
            style={[
              styles.hubChip,
              {
                backgroundColor: selectedHubId === 'all' ? theme.primary : theme.surfaceTag,
                borderColor: selectedHubId === 'all' ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.hubChipText,
                { color: selectedHubId === 'all' ? theme.primaryFg : theme.text },
              ]}
            >
              All Hubs ({hubs.length})
            </Text>
          </TactilePressable>

          {hubs.map((hub) => {
            const active = selectedHubId === hub.id;
            const isAssigned = role === 'hub_incharge' && profile.assignedHubId === hub.id;
            return (
              <TactilePressable
                key={hub.id}
                onPress={() => setSelectedHubId(hub.id)}
                scaleTo={0.94}
                accessibilityLabel={hub.name}
                style={[
                  styles.hubChip,
                  {
                    backgroundColor: active ? theme.primary : theme.surfaceTag,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.hubChipText,
                    { color: active ? theme.primaryFg : theme.text },
                  ]}
                >
                  {hub.name.replace(' Hub', '')}
                  {isAssigned ? ' · Yours' : ''}
                </Text>
              </TactilePressable>
            );
          })}
        </ScrollView>

        {activeHub ? (
          <View
            style={[
              styles.hubBanner,
              { backgroundColor: theme.sage, borderColor: theme.border },
            ]}
          >
            <View style={styles.hubBannerTop}>
              <Text style={[styles.hubBannerTitle, { color: theme.text }]}>
                {activeHub.name}
              </Text>
              {role === 'hub_incharge' && profile.assignedHubId === activeHub.id ? (
                <View style={[styles.managedBadge, { backgroundColor: theme.primary }]}>
                  <ShieldIcon size={12} color={theme.primaryFg} />
                  <Text style={[styles.managedText, { color: theme.primaryFg }]}>
                    Managed by You
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.hubBannerFocus, { color: theme.textMuted }]}>
              {activeHub.focus}
            </Text>
            <Text style={[styles.hubBannerMeta, styles.tabular, { color: theme.text }]}>
              In-charge: {activeHub.inChargeName} · {activeHub.building} · {activeHub.activeEventsCount} active events
            </Text>
          </View>
        ) : null}

        {uiStateMode === 'loading' ? (
          <LoadingSkeletonList count={3} />
        ) : uiStateMode === 'error' ? (
          <ErrorStateCard onRetry={() => setUIStateMode('default')} />
        ) : uiStateMode === 'empty' || filteredClubs.length === 0 ? (
          <EmptyStateCard
            title="No clubs in this hub"
            description="Switch to All Hubs to view student societies across campus."
            actionLabel="Show All Hubs"
            onAction={() => {
              setSelectedHubId('all');
              setUIStateMode('default');
            }}
          />
        ) : (
          <View style={styles.colWrap}>
            {filteredClubs.map((club) => (
              <View
                key={club.id}
                style={[
                  styles.clubCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.clubCardHeader}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.clubHubKicker,
                        { color: theme.isDark ? theme.primaryBright : theme.primary },
                      ]}
                    >
                      {club.hubName}
                    </Text>
                    <Text style={[styles.clubName, { color: theme.text }]}>{club.name}</Text>
                  </View>

                  <TactilePressable
                    onPress={() => toggleClubMembership(club.id)}
                    scaleTo={0.92}
                    accessibilityState={{ selected: club.isJoined }}
                    accessibilityLabel={club.isJoined ? `Leave ${club.name}` : `Join ${club.name}`}
                    style={[
                      styles.joinBtn,
                      {
                        backgroundColor: club.isJoined ? theme.surfaceTag : theme.primary,
                        borderColor: club.isJoined ? theme.borderStrong : theme.primary,
                        borderWidth: club.isJoined ? 1 : 0,
                      },
                    ]}
                  >
                    {club.isJoined ? (
                      <CheckIcon
                        size={14}
                        color={theme.isDark ? theme.primaryBright : theme.primary}
                      />
                    ) : null}
                    <Text
                      style={[
                        styles.joinBtnText,
                        {
                          color: club.isJoined
                            ? theme.isDark
                              ? theme.primaryBright
                              : theme.primary
                            : theme.primaryFg,
                        },
                      ]}
                    >
                      {club.isJoined ? 'Joined' : 'Join'}
                    </Text>
                  </TactilePressable>
                </View>

                <Text style={[styles.clubTagline, { color: theme.textMuted }]}>
                  {club.tagline}
                </Text>

                <View style={[styles.clubMetaRow, { borderTopColor: theme.border }]}>
                  <View style={styles.clubMetaItem}>
                    <ClockIcon size={13} color={theme.textMuted} />
                    <Text style={[styles.clubMetaText, styles.tabular, { color: theme.textMuted }]}>
                      {club.meetingSchedule}
                    </Text>
                  </View>
                  <View style={styles.clubMetaItem}>
                    <MapPinIcon size={13} color={theme.textMuted} />
                    <Text style={[styles.clubMetaText, { color: theme.textMuted }]}>
                      {club.location}
                    </Text>
                  </View>
                  <View style={styles.clubMetaItem}>
                    <UsersIcon size={13} color={theme.textMuted} />
                    <Text style={[styles.clubMetaText, styles.tabular, { color: theme.textMuted }]}>
                      {club.memberCount} members
                    </Text>
                  </View>
                </View>
              </View>
            ))}
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
    gap: 12,
  },
  headerAction: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: RADII.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerActionText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
  hubChipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  hubChip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubChipText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  hubBanner: {
    padding: 14,
    borderRadius: RADII.xl,
    borderWidth: 1,
    gap: 5,
  },
  hubBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  hubBannerTitle: {
    fontFamily: FONTS.ui,
    fontSize: 15,
    fontWeight: '700',
  },
  managedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.pill,
  },
  managedText: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '700',
  },
  hubBannerFocus: {
    fontFamily: FONTS.ui,
    fontSize: 12.5,
    lineHeight: 18,
  },
  hubBannerMeta: {
    fontFamily: FONTS.ui,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
  },
  colWrap: {
    gap: 10,
  },
  clubCard: {
    padding: 14,
    borderRadius: RADII.xl,
    borderWidth: 1,
    gap: 9,
  },
  clubCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  clubHubKicker: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '700',
  },
  clubName: {
    fontFamily: FONTS.ui,
    fontSize: 15,
    fontWeight: '700',
  },
  joinBtn: {
    minHeight: 36,
    minWidth: 74,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  joinBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
  clubTagline: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    lineHeight: 18,
  },
  clubMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  clubMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clubMetaText: {
    fontFamily: FONTS.ui,
    fontSize: 11.5,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
