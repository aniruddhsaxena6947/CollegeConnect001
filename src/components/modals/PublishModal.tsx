import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SmoothBottomSheet, TactilePressable } from '../ui/RNPrimitives';
import { useCollegeConnect } from '../../context/CollegeConnectContext';
import { FONTS, RADII, SPACING, TOUCH_TARGET } from '../../theme/tokens';
import {
  AnnouncementCategory,
  EventArtworkTheme,
  EventCategory,
} from '../../types/collegeConnect';
import { CheckIcon, ShieldIcon, XIcon } from '../icons/NavIcons';

const EVENT_CATEGORIES: EventCategory[] = [
  'Cultural',
  'Tech',
  'Sports',
  'Workshop',
  'Competition',
  'Social',
];

const NOTICE_CATEGORIES: AnnouncementCategory[] = [
  'Academic',
  'Exam',
  'Hostel',
  'General',
];

const ARTWORK_OPTIONS: Array<{ id: EventArtworkTheme; label: string }> = [
  { id: 'music_fest', label: 'Stage Lights' },
  { id: 'hackathon', label: 'Tech Lab' },
  { id: 'photography', label: 'Camera' },
  { id: 'business_plan', label: 'Pitch' },
  { id: 'blood_camp', label: 'Civic' },
  { id: 'campus_general', label: 'Campus' },
];

export const PublishModal: React.FC = () => {
  const {
    publishSheetOpen,
    closePublishSheet,
    role,
    roleMeta,
    hubs,
    profile,
    pendingEvents,
    publishEvent,
    publishAnnouncement,
    approveEvent,
    rejectEvent,
    showFeedback,
    theme,
  } = useCollegeConnect();

  const [mode, setMode] = useState<'event' | 'announcement' | 'approvals'>('event');
  const [title, setTitle] = useState('');
  const [eventCat, setEventCat] = useState<EventCategory>('Cultural');
  const [date, setDate] = useState('2025-04-22');
  const [time, setTime] = useState('4:30 PM');
  const [venue, setVenue] = useState('Seminar Hall');
  const [isFree, setIsFree] = useState(true);
  const [entryLabel, setEntryLabel] = useState('₹100');
  const [hubId, setHubId] = useState(profile.assignedHubId || hubs[0]?.id || 'hub-cultural');
  const [artwork, setArtwork] = useState<EventArtworkTheme>('campus_general');
  const [description, setDescription] = useState('');

  const [noticeCat, setNoticeCat] = useState<AnnouncementCategory>('Academic');
  const [noticePinned, setNoticePinned] = useState(false);

  const handleSubmit = () => {
    if (title.trim().length < 3 || description.trim().length < 8) {
      showFeedback('error', 'Missing Details', 'Enter a title and clear summary before publishing.');
      return;
    }

    if (mode === 'event') {
      publishEvent({
        title,
        category: eventCat,
        date,
        time,
        venue,
        entryLabel,
        isFree,
        description,
        hubId,
        artwork,
      });
    } else if (mode === 'announcement') {
      publishAnnouncement({
        title,
        category: noticeCat,
        summary: description,
        pinned: noticePinned,
      });
    }

    setTitle('');
    setDescription('');
  };

  return (
    <SmoothBottomSheet
      visible={publishSheetOpen}
      onClose={closePublishSheet}
      backdropOpacity={0.58}
      topSpacerFlex={0.15}
    >
      <View
        style={[
          styles.sheet,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
          <View style={[styles.handle, { backgroundColor: theme.borderStrong }]} />

          <View style={styles.sheetHeader}>
            <View style={styles.titleRow}>
              <ShieldIcon
                size={18}
                color={theme.isDark ? theme.primaryBright : theme.primary}
              />
              <View>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>
                  Official Campus Console
                </Text>
                <Text style={[styles.sheetSub, { color: theme.textMuted }]}>
                  Signed in as {roleMeta.label}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={closePublishSheet}
              hitSlop={10}
              accessibilityRole="button"
              style={styles.closeBtn}
            >
              <XIcon size={20} color={theme.textMuted} />
            </Pressable>
          </View>

          {/* Mode Selector Tabs */}
          <View style={[styles.modeBar, { backgroundColor: theme.surfaceMuted }]}>
            {[
              { id: 'event' as const, label: 'New Event' },
              { id: 'announcement' as const, label: 'Official Notice' },
              ...(roleMeta.canApproveSubmissions
                ? [{ id: 'approvals' as const, label: `Queue (${pendingEvents.length})` }]
                : []),
            ].map((tab) => {
              const active = mode === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setMode(tab.id)}
                  accessibilityRole="button"
                  style={[
                    styles.modeTab,
                    active ? { backgroundColor: theme.primary } : null,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.modeTabText,
                      { color: active ? theme.primaryFg : theme.textMuted },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView
            style={{ maxHeight: 460 }}
            contentContainerStyle={{ gap: 14, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {mode === 'approvals' ? (
              pendingEvents.length === 0 ? (
                <View style={[styles.emptyQueue, { borderColor: theme.border }]}>
                  <CheckIcon
                    size={24}
                    color={theme.isDark ? theme.primaryBright : theme.primary}
                  />
                  <Text style={[styles.emptyQueueTitle, { color: theme.text }]}>
                    Approval queue clear
                  </Text>
                  <Text style={[styles.emptyQueueDesc, { color: theme.textMuted }]}>
                    All faculty and club event submissions have been reviewed.
                  </Text>
                </View>
              ) : (
                pendingEvents.map((evt) => (
                  <View
                    key={evt.id}
                    style={[
                      styles.queueCard,
                      { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                    ]}
                  >
                    <Text style={[styles.queueTitle, { color: theme.text }]}>{evt.title}</Text>
                    <Text style={[styles.queueMeta, { color: theme.textMuted }]}>
                      {evt.category} · {evt.dateDisplay} · {evt.venue} · by {evt.organizerName}
                    </Text>
                    <View style={styles.queueActions}>
                      <Pressable
                        onPress={() => approveEvent(evt.id)}
                        style={[styles.queueApprove, { backgroundColor: theme.primary }]}
                      >
                        <Text style={[styles.queueBtnText, { color: theme.primaryFg }]}>
                          Approve &amp; Publish
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => rejectEvent(evt.id)}
                        style={[
                          styles.queueReject,
                          { backgroundColor: theme.dangerBg, borderColor: theme.danger },
                        ]}
                      >
                        <Text style={[styles.queueBtnText, { color: theme.danger }]}>
                          Decline
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                    {mode === 'event' ? 'Event Title' : 'Announcement Headline'}
                  </Text>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder={
                      mode === 'event'
                        ? 'e.g., Robotics Expo 2025'
                        : 'e.g., Revised Lab Viva Schedule'
                    }
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.surfaceMuted,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {(mode === 'event' ? EVENT_CATEGORIES : NOTICE_CATEGORIES).map((cat) => {
                      const active =
                        mode === 'event' ? eventCat === cat : noticeCat === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() =>
                            mode === 'event'
                              ? setEventCat(cat as EventCategory)
                              : setNoticeCat(cat as AnnouncementCategory)
                          }
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? theme.primary : theme.surfaceMuted,
                              borderColor: active ? theme.primary : theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              { color: active ? theme.primaryFg : theme.text },
                            ]}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {mode === 'event' ? (
                  <>
                    <View style={styles.rowTwo}>
                      <View style={[styles.fieldGroup, { flex: 1 }]}>
                        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                          Date (YYYY-MM-DD)
                        </Text>
                        <TextInput
                          value={date}
                          onChangeText={setDate}
                          style={[
                            styles.input,
                            {
                              backgroundColor: theme.surfaceMuted,
                              borderColor: theme.border,
                              color: theme.text,
                            },
                          ]}
                        />
                      </View>
                      <View style={[styles.fieldGroup, { flex: 1 }]}>
                        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Time</Text>
                        <TextInput
                          value={time}
                          onChangeText={setTime}
                          style={[
                            styles.input,
                            {
                              backgroundColor: theme.surfaceMuted,
                              borderColor: theme.border,
                              color: theme.text,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Venue</Text>
                      <TextInput
                        value={venue}
                        onChangeText={setVenue}
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.surfaceMuted,
                            borderColor: theme.border,
                            color: theme.text,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                        Organizing Hub
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8 }}
                      >
                        {hubs.map((h) => {
                          const active = hubId === h.id;
                          return (
                            <Pressable
                              key={h.id}
                              onPress={() => setHubId(h.id)}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: active ? theme.primary : theme.surfaceMuted,
                                  borderColor: active ? theme.primary : theme.border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  { color: active ? theme.primaryFg : theme.text },
                                ]}
                              >
                                {h.name.replace(' Hub', '')}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                        Cover Visual Theme
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8 }}
                      >
                        {ARTWORK_OPTIONS.map((art) => {
                          const active = artwork === art.id;
                          return (
                            <Pressable
                              key={art.id}
                              onPress={() => setArtwork(art.id)}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: active ? theme.primary : theme.surfaceMuted,
                                  borderColor: active ? theme.primary : theme.border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  { color: active ? theme.primaryFg : theme.text },
                                ]}
                              >
                                {art.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={[styles.switchLabel, { color: theme.text }]}>
                        Free Student Entry
                      </Text>
                      <Switch
                        value={isFree}
                        onValueChange={setIsFree}
                        trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
                        thumbColor="#FFFFFF"
                      />
                    </View>

                    {!isFree ? (
                      <TextInput
                        value={entryLabel}
                        onChangeText={setEntryLabel}
                        placeholder="Entry Fee (e.g., ₹150)"
                        placeholderTextColor={theme.textMuted}
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.surfaceMuted,
                            borderColor: theme.border,
                            color: theme.text,
                          },
                        ]}
                      />
                    ) : null}
                  </>
                ) : (
                  <View style={styles.switchRow}>
                    <Text style={[styles.switchLabel, { color: theme.text }]}>
                      Pin Official Notice at Top
                    </Text>
                    <Switch
                      value={noticePinned}
                      onValueChange={setNoticePinned}
                      trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                )}

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                    Description / Official Summary
                  </Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    placeholder="Provide complete campus details, eligibility, or instructions..."
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: theme.surfaceMuted,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                  />
                </View>

                <TactilePressable
                  onPress={handleSubmit}
                  style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={[styles.submitBtnText, { color: theme.primaryFg }]}>
                    {mode === 'event'
                      ? role === 'faculty'
                        ? 'Submit Event for Approval'
                        : 'Publish Event Live'
                      : 'Publish Official Notice'}
                  </Text>
                </TactilePressable>
              </>
            )}
          </ScrollView>
      </View>
    </SmoothBottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: RADII.xxl,
    borderTopRightRadius: RADII.xxl,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: 14,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sheetTitle: {
    fontFamily: FONTS.ui,
    fontSize: 17,
    fontWeight: '700',
  },
  sheetSub: {
    fontFamily: FONTS.ui,
    fontSize: 12,
  },
  closeBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: RADII.lg,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    minHeight: 40,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  modeTabText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    minHeight: TOUCH_TARGET,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontFamily: FONTS.ui,
    fontSize: 14,
    outlineStyle: 'none',
  },
  textArea: {
    minHeight: 86,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FONTS.ui,
    fontSize: 14,
    outlineStyle: 'none',
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchLabel: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    minHeight: 50,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyQueue: {
    padding: SPACING.xxl,
    borderRadius: RADII.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyQueueTitle: {
    fontFamily: FONTS.ui,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyQueueDesc: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    textAlign: 'center',
  },
  queueCard: {
    padding: 14,
    borderRadius: RADII.lg,
    borderWidth: 1,
    gap: 8,
  },
  queueTitle: {
    fontFamily: FONTS.ui,
    fontSize: 15,
    fontWeight: '700',
  },
  queueMeta: {
    fontFamily: FONTS.ui,
    fontSize: 12,
  },
  queueActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  queueApprove: {
    flex: 1,
    minHeight: 40,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueReject: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
});
