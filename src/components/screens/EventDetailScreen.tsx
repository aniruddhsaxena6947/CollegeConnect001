import React, { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCollegeConnect } from '../../context/CollegeConnectContext';
import { FONTS, RADII, SPACING, TOUCH_TARGET } from '../../theme/tokens';
import {
  ArrowRightIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  MapPinIcon,
  ShareIcon,
  ShieldIcon,
  TicketIcon,
  XIcon,
} from '../icons/NavIcons';
import {
  CurvedWaveCutout,
  EventArtworkCard,
  MusicNoteDoodle,
} from '../illustrations/CampusArtwork';
import { EmptyStateCard, SmoothBottomSheet, TactilePressable, useReducedMotion } from '../ui/RNPrimitives';

const SAMPLE_ROSTER = [
  { name: 'Aaryan Sharma', id: 'CC-2025-0418', program: 'BCA · 2nd Year' },
  { name: 'Ananya Verma', id: 'CC-2025-0291', program: 'B.Tech CS · 3rd Year' },
  { name: 'Kabir Mehta', id: 'CC-2025-0514', program: 'BBA · 1st Year' },
  { name: 'Sneha Nair', id: 'CC-2025-0388', program: 'B.Des · 2nd Year' },
];

export const EventDetailScreen: React.FC = () => {
  const {
    selectedEvent,
    goBack,
    navigate,
    toggleEventRegistration,
    toggleEventSaved,
    approveEvent,
    rejectEvent,
    showFeedback,
    role,
    theme,
  } = useCollegeConnect();

  const [rosterOpen, setRosterOpen] = useState(false);
  const reduced = useReducedMotion();
  const bookmarkBounce = useRef(new Animated.Value(1)).current;

  if (!selectedEvent) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, padding: SPACING.lg, justifyContent: 'center' }}>
        <EmptyStateCard
          title="Event not found"
          description="This campus event may have been archived or removed."
          actionLabel="Back to Explore"
          onAction={() => navigate('explore')}
        />
      </View>
    );
  }

  const canInspectRoster = role === 'hub_incharge' || role === 'super_admin';
  const canModerate = role === 'super_admin' && selectedEvent.status === 'pending';
  const fillRatio = Math.min(
    1,
    Math.max(0.06, selectedEvent.attendeeCount / Math.max(1, selectedEvent.capacity))
  );

  const handleBookmarkToggle = () => {
    if (!reduced) {
      bookmarkBounce.setValue(0.75);
      Animated.spring(bookmarkBounce, {
        toValue: 1,
        speed: 24,
        bounciness: 10,
        useNativeDriver: false,
      }).start();
    }
    toggleEventSaved(selectedEvent.id);
  };

  const handleShare = () => {
    const shareText = `${selectedEvent.title} · ${selectedEvent.dateDisplay} at ${selectedEvent.time} (${selectedEvent.venue}) on CollegeConnect`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(shareText).catch(() => {});
      }
    } catch {
      // Ignore
    }
    showFeedback('success', 'Event Link Copied', `${selectedEvent.title} details ready to share.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 132 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Full-bleed Hero Artwork with Curved Wave matching Tile 4 */}
        <View style={styles.heroBox}>
          <EventArtworkCard
            theme={selectedEvent.artwork}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[styles.heroScrim, { backgroundColor: 'rgba(10,18,13,0.22)' }]} />

          <View style={styles.heroTopBar}>
            <TactilePressable
              onPress={goBack}
              scaleTo={0.9}
              accessibilityLabel="Back"
              style={styles.heroCircleBtn}
            >
              <ChevronLeftIcon size={20} color="#1C261F" />
            </TactilePressable>

            <TactilePressable
              onPress={handleBookmarkToggle}
              scaleTo={0.9}
              accessibilityLabel={selectedEvent.isSaved ? 'Unsave event' : 'Save event'}
              style={styles.heroCircleBtn}
            >
              <Animated.View style={{ transform: [{ scale: bookmarkBounce }] }}>
                <BookmarkIcon
                  size={19}
                  color="#1E3A2B"
                  filled={selectedEvent.isSaved}
                />
              </Animated.View>
            </TactilePressable>
          </View>

          {selectedEvent.noteTag ? (
            <View
              style={[
                styles.floatingNote,
                { backgroundColor: theme.note, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.floatingNoteText, { color: theme.noteInk }]}>
                {selectedEvent.noteTag} :)
              </Text>
            </View>
          ) : null}

          <View style={styles.waveOverlay}>
            <CurvedWaveCutout fillColor={theme.bg} height={32} />
          </View>
        </View>

        {/* Body Content matching Tile 4 */}
        <View style={styles.bodyContainer}>
          <View style={styles.tagRow}>
            <View style={[styles.categoryChip, { backgroundColor: theme.surfaceTag }]}>
              <Text style={[styles.categoryChipText, { color: theme.text }]}>
                {selectedEvent.category}
              </Text>
            </View>
            {selectedEvent.status === 'pending' ? (
              <Text style={[styles.pendingText, { color: theme.danger }]}>
                Pending Approval
              </Text>
            ) : null}
          </View>

          <Text style={[styles.eventTitle, { color: theme.text }]}>
            {selectedEvent.title}
          </Text>

          <Text style={[styles.descriptionText, { color: theme.textMuted }]}>
            {selectedEvent.description}
          </Text>

          {/* Clean Logistics Rows matching Tile 4 */}
          <View style={styles.logisticsBlock}>
            <View style={styles.logisticsRow}>
              <CalendarIcon size={18} color={theme.text} />
              <Text style={[styles.logisticsValue, styles.tabular, { color: theme.text }]}>
                {selectedEvent.dateDisplay}  ·  {selectedEvent.time}
              </Text>
            </View>

            <View style={styles.logisticsRow}>
              <MapPinIcon size={18} color={theme.text} />
              <Text style={[styles.logisticsValue, { color: theme.text }]}>
                {selectedEvent.venue}
              </Text>
            </View>

            <View style={styles.logisticsRow}>
              <TicketIcon size={18} color={theme.text} />
              <Text style={[styles.logisticsValue, styles.tabular, { color: theme.text }]}>
                {selectedEvent.entryLabel} · {selectedEvent.attendeeCount}/{selectedEvent.capacity} seats
              </Text>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <MusicNoteDoodle color={theme.text} size={26} />
              </View>
            </View>

            <View style={[styles.capacityTrack, { backgroundColor: theme.surfaceTag }]}>
              <View
                style={[
                  styles.capacityFill,
                  {
                    width: `${Math.round(fillRatio * 100)}%`,
                    backgroundColor: theme.isDark ? theme.primaryBright : theme.primary,
                  },
                ]}
              />
            </View>
          </View>

          <Text style={[styles.organizerLine, { color: theme.textMuted }]}>
            Hosted by {selectedEvent.organizerName} · {selectedEvent.hubName}
          </Text>

          {(canInspectRoster || canModerate) ? (
            <View
              style={[
                styles.adminCard,
                { backgroundColor: theme.sage, borderColor: theme.border },
              ]}
            >
              <View style={styles.adminHeader}>
                <ShieldIcon
                  size={17}
                  color={theme.isDark ? theme.primaryBright : theme.primary}
                />
                <Text style={[styles.adminTitle, { color: theme.text }]}>
                  Authorized Controls
                </Text>
              </View>

              {canInspectRoster ? (
                <Pressable
                  onPress={() => setRosterOpen(true)}
                  style={[
                    styles.adminBtn,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.adminBtnText, { color: theme.text }]}>
                    View Attendee Roster ({selectedEvent.attendeeCount})
                  </Text>
                </Pressable>
              ) : null}

              {canModerate ? (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={() => approveEvent(selectedEvent.id)}
                    style={[styles.adminBtn, { flex: 1, backgroundColor: theme.primary, borderColor: theme.primary }]}
                  >
                    <Text style={[styles.adminBtnText, { color: theme.primaryFg }]}>
                      Approve
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      rejectEvent(selectedEvent.id);
                      navigate('explore');
                    }}
                    style={[styles.adminBtn, { flex: 1, backgroundColor: theme.dangerBg, borderColor: theme.danger }]}
                  >
                    <Text style={[styles.adminBtnText, { color: theme.danger }]}>
                      Decline
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom Sticky CTA matching Tile 4 */}
      <View
        style={[
          styles.stickyFooter,
          { backgroundColor: theme.bg, borderTopColor: theme.border },
        ]}
      >
        <TactilePressable
          onPress={() => toggleEventRegistration(selectedEvent.id)}
          style={[
            styles.registerBtn,
            {
              backgroundColor: selectedEvent.isRegistered ? theme.sage : theme.primary,
              borderColor: theme.primary,
              borderWidth: selectedEvent.isRegistered ? 1 : 0,
            },
          ]}
        >
          {selectedEvent.isRegistered ? (
            <>
              <CheckIcon
                size={18}
                color={theme.isDark ? theme.primaryBright : theme.primary}
              />
              <Text
                style={[
                  styles.registerBtnText,
                  { color: theme.isDark ? theme.primaryBright : theme.primary },
                ]}
              >
                Registered · Cancel Pass
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.registerBtnText, { color: theme.primaryFg }]}>
                Register Now
              </Text>
              <ArrowRightIcon size={18} color={theme.primaryFg} />
            </>
          )}
        </TactilePressable>

        <View style={styles.secondaryRow}>
          <Pressable
            onPress={handleBookmarkToggle}
            accessibilityRole="button"
            style={styles.secondaryAction}
          >
            <BookmarkIcon
              size={15}
              color={theme.textMuted}
              filled={selectedEvent.isSaved}
            />
            <Text style={[styles.secondaryActionText, { color: theme.textMuted }]}>
              {selectedEvent.isSaved ? 'Saved' : 'Save for later'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            accessibilityRole="button"
            style={styles.secondaryAction}
          >
            <ShareIcon size={15} color={theme.textMuted} />
            <Text style={[styles.secondaryActionText, { color: theme.textMuted }]}>
              Share
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Smooth Attendee Roster Sheet */}
      <SmoothBottomSheet visible={rosterOpen} onClose={() => setRosterOpen(false)}>
        <View
          style={[
            styles.rosterSheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.grabHandle, { backgroundColor: theme.borderStrong }]} />
          <View style={styles.rosterHeader}>
            <Text style={[styles.rosterTitle, { color: theme.text }]}>
              Registered Students ({selectedEvent.attendeeCount})
            </Text>
            <Pressable onPress={() => setRosterOpen(false)} hitSlop={8}>
              <XIcon size={20} color={theme.textMuted} />
            </Pressable>
          </View>
          {SAMPLE_ROSTER.map((student) => (
            <View
              key={student.id}
              style={[styles.rosterRow, { borderBottomColor: theme.border }]}
            >
              <View>
                <Text style={[styles.rosterName, { color: theme.text }]}>{student.name}</Text>
                <Text style={[styles.rosterSub, { color: theme.textMuted }]}>
                  {student.program}
                </Text>
              </View>
              <Text style={[styles.rosterId, styles.tabular, { color: theme.textMuted }]}>
                {student.id}
              </Text>
            </View>
          ))}
        </View>
      </SmoothBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  heroBox: {
    height: 248,
    position: 'relative',
    justifyContent: 'space-between',
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 38,
    zIndex: 4,
  },
  heroCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(250,248,243,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingNote: {
    alignSelf: 'flex-end',
    marginRight: SPACING.xl,
    marginBottom: 42,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADII.sm,
    borderWidth: 1,
    transform: [{ rotate: '4deg' }],
    zIndex: 4,
  },
  floatingNoteText: {
    fontFamily: FONTS.handwritten,
    fontSize: 16,
    fontWeight: '700',
  },
  waveOverlay: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    zIndex: 3,
  },
  bodyContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 2,
    gap: 10,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryChipText: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '700',
  },
  pendingText: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '700',
  },
  eventTitle: {
    fontFamily: FONTS.handwritten,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
  },
  descriptionText: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    lineHeight: 22,
  },
  logisticsBlock: {
    marginTop: 6,
    gap: 12,
  },
  logisticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logisticsValue: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    fontWeight: '600',
  },
  capacityTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
  },
  organizerLine: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    marginTop: 4,
  },
  adminCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminTitle: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    fontWeight: '700',
  },
  adminBtn: {
    minHeight: TOUCH_TARGET,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  adminBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    fontWeight: '700',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACING.xl,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
  },
  registerBtn: {
    minHeight: 50,
    borderRadius: RADII.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryAction: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  secondaryActionText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  rosterSheet: {
    borderTopLeftRadius: RADII.xxl,
    borderTopRightRadius: RADII.xxl,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: 10,
  },
  grabHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 4,
  },
  rosterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rosterTitle: {
    fontFamily: FONTS.ui,
    fontSize: 16,
    fontWeight: '700',
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rosterName: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    fontWeight: '600',
  },
  rosterSub: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    marginTop: 2,
  },
  rosterId: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
});
