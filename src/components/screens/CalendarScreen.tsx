import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCollegeConnect } from '../../context/CollegeConnectContext';
import { FONTS, RADII, SPACING, TOUCH_TARGET } from '../../theme/tokens';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '../icons/NavIcons';
import { BotanicalLeavesDoodle, SparkStarDoodle, SwirlDoodle } from '../illustrations/CampusArtwork';
import {
  EmptyStateCard,
  ErrorStateCard,
  EventRowCard,
  LoadingSkeletonList,
  ScreenHeader,
  TactilePressable,
} from '../ui/RNPrimitives';

const MONTHS = [
  { year: 2025, month: 2, label: 'March 2025', days: 31, startOffset: 5 },
  { year: 2025, month: 3, label: 'April 2025', days: 30, startOffset: 1 },
  { year: 2025, month: 4, label: 'May 2025', days: 31, startOffset: 3 },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toIsoDate(year: number, monthIndex: number, day: number): string {
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function formatReadableDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export const CalendarScreen: React.FC = () => {
  const {
    visibleEvents,
    announcements,
    role,
    roleMeta,
    uiStateMode,
    setUIStateMode,
    navigate,
    openPublishSheet,
    theme,
  } = useCollegeConnect();

  const [monthIdx, setMonthIdx] = useState(1);
  const [selectedIso, setSelectedIso] = useState('2025-04-15');

  const currentMonth = MONTHS[monthIdx];

  const eventDateSet = useMemo(() => {
    const set = new Set<string>();
    visibleEvents.forEach((e) => set.add(e.date));
    announcements.forEach((a) => set.add(a.date));
    return set;
  }, [visibleEvents, announcements]);

  const dayEvents = useMemo(
    () => visibleEvents.filter((e) => e.date === selectedIso),
    [visibleEvents, selectedIso]
  );

  const dayNotices = useMemo(
    () => announcements.filter((a) => a.date === selectedIso),
    [announcements, selectedIso]
  );

  const calendarCells = useMemo(() => {
    const cells: Array<{ day: number | null; iso: string | null }> = [];
    for (let i = 0; i < currentMonth.startOffset; i++) {
      cells.push({ day: null, iso: null });
    }
    for (let d = 1; d <= currentMonth.days; d++) {
      cells.push({ day: d, iso: toIsoDate(currentMonth.year, currentMonth.month, d) });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, iso: null });
    }
    return cells;
  }, [currentMonth]);

  const weeks = useMemo(() => {
    const rows: (typeof calendarCells)[] = [];
    for (let i = 0; i < calendarCells.length; i += 7) {
      rows.push(calendarCells.slice(i, i + 7));
    }
    return rows;
  }, [calendarCells]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, position: 'relative' }}>
      <ScreenHeader
        title="Calendar"
        subtitle="Your month at a glance."
        handwrittenTitle
        rightSlot={
          roleMeta.canPublishEvents ? (
            <TactilePressable
              onPress={openPublishSheet}
              scaleTo={0.94}
              accessibilityLabel="Schedule new event"
              style={[styles.addBtn, { backgroundColor: theme.primary }]}
            >
              <PlusIcon size={15} color={theme.primaryFg} />
              <Text style={[styles.addBtnText, { color: theme.primaryFg }]}>Schedule</Text>
            </TactilePressable>
          ) : (
            <SparkStarDoodle color={theme.text} size={22} />
          )
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Grid Card matching Mockup Tile 5 */}
        <View
          style={[
            styles.monthCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.monthHeader}>
            <TactilePressable
              onPress={() => setMonthIdx((i) => Math.max(0, i - 1))}
              disabled={monthIdx === 0}
              scaleTo={0.88}
              accessibilityLabel="Previous month"
              style={[styles.monthNavBtn, { opacity: monthIdx === 0 ? 0.35 : 1 }]}
            >
              <ChevronLeftIcon size={20} color={theme.text} />
            </TactilePressable>

            <Text style={[styles.monthTitle, { color: theme.text }]}>
              {currentMonth.label}
            </Text>

            <TactilePressable
              onPress={() => setMonthIdx((i) => Math.min(MONTHS.length - 1, i + 1))}
              disabled={monthIdx === MONTHS.length - 1}
              scaleTo={0.88}
              accessibilityLabel="Next month"
              style={[
                styles.monthNavBtn,
                { opacity: monthIdx === MONTHS.length - 1 ? 0.35 : 1 },
              ]}
            >
              <ChevronRightIcon size={20} color={theme.text} />
            </TactilePressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, { color: theme.textMuted }]}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={{ gap: 2 }}>
            {weeks.map((week, wIdx) => (
              <View key={wIdx} style={styles.weekRow}>
                {week.map((cell, cIdx) => {
                  if (!cell.day || !cell.iso) {
                    return <View key={cIdx} style={styles.dayCell} />;
                  }
                  const selected = cell.iso === selectedIso;
                  const hasItems = eventDateSet.has(cell.iso);
                  return (
                    <TactilePressable
                      key={cell.iso}
                      onPress={() => setSelectedIso(cell.iso!)}
                      scaleTo={0.88}
                      containerStyle={{ flex: 1 }}
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Select ${cell.iso}`}
                      style={styles.dayCell}
                    >
                      <View
                        style={[
                          styles.dayCircle,
                          selected
                            ? { backgroundColor: theme.primary }
                            : hasItems
                            ? { backgroundColor: theme.surfaceTag }
                            : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNumber,
                            styles.tabular,
                            {
                              color: selected ? theme.primaryFg : theme.text,
                              fontWeight: selected || hasItems ? '700' : '500',
                            },
                          ]}
                        >
                          {cell.day}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.eventMarker,
                          {
                            backgroundColor: hasItems
                              ? selected
                                ? theme.primaryBright
                                : theme.primary
                              : 'transparent',
                          },
                        ]}
                      />
                    </TactilePressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Selected Date Pill + One-Tap Today Jump + Swirl Accent */}
        <View style={styles.agendaHeaderPill}>
          <View style={styles.dateChipGroup}>
            <View style={[styles.dateChip, { backgroundColor: theme.surfaceTag }]}>
              <Text style={[styles.dateChipText, styles.tabular, { color: theme.text }]}>
                {selectedIso === '2025-04-15'
                  ? `Today, ${formatReadableDate(selectedIso)}`
                  : formatReadableDate(selectedIso)}
              </Text>
            </View>

            {selectedIso !== '2025-04-15' || monthIdx !== 1 ? (
              <TactilePressable
                onPress={() => {
                  setMonthIdx(1);
                  setSelectedIso('2025-04-15');
                }}
                scaleTo={0.93}
                accessibilityLabel="Jump to today"
                style={[styles.todayJumpChip, { borderColor: theme.borderStrong }]}
              >
                <Text
                  style={[
                    styles.todayJumpText,
                    { color: theme.isDark ? theme.primaryBright : theme.primary },
                  ]}
                >
                  Today
                </Text>
              </TactilePressable>
            ) : null}
          </View>

          <View style={styles.agendaRight}>
            <Text style={[styles.agendaCount, styles.tabular, { color: theme.textMuted }]}>
              {dayEvents.length + dayNotices.length} scheduled
            </Text>
            <SwirlDoodle color={theme.text} size={26} />
          </View>
        </View>

        {uiStateMode === 'loading' ? (
          <LoadingSkeletonList count={2} />
        ) : uiStateMode === 'error' ? (
          <ErrorStateCard onRetry={() => setUIStateMode('default')} />
        ) : uiStateMode === 'empty' || (dayEvents.length === 0 && dayNotices.length === 0) ? (
          <EmptyStateCard
            title="Clear schedule on this date"
            description="No campus events or official deadlines are scheduled for this day."
            actionLabel={roleMeta.canPublishEvents ? 'Schedule Event' : 'Browse All Events'}
            onAction={() => {
              setUIStateMode('default');
              if (roleMeta.canPublishEvents) {
                openPublishSheet();
              } else {
                navigate('explore');
              }
            }}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {dayEvents.map((event) => (
              <EventRowCard
                key={event.id}
                event={event}
                showApprovalStatus={role === 'super_admin'}
                onPress={() => navigate('event_detail', { eventId: event.id })}
              />
            ))}

            {dayNotices.map((notice) => (
              <TactilePressable
                key={notice.id}
                onPress={() => navigate('announcements')}
                scaleTo={0.985}
                accessibilityLabel={`Open notice ${notice.title}`}
                style={[
                  styles.noticeMiniCard,
                  { backgroundColor: theme.note, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.noticeMiniKicker, { color: theme.noteInk }]}>
                  Official Notice · {notice.category}
                </Text>
                <Text style={[styles.noticeMiniTitle, { color: theme.noteInk }]}>
                  {notice.title}
                </Text>
                <Text style={[styles.noticeMiniIssuer, { color: theme.noteInk }]}>
                  {notice.issuerTitle}
                </Text>
              </TactilePressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Subtle Botanical Corner Accent matching Mockup Tile 5 */}
      <View style={styles.bottomCornerDoodle} pointerEvents="none">
        <BotanicalLeavesDoodle isDark={theme.isDark} size={74} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: 96,
    gap: 14,
  },
  addBtn: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: RADII.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
  monthCard: {
    borderRadius: RADII.xxl,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNavBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontFamily: FONTS.ui,
    fontSize: 16,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
  },
  weekdayText: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '600',
  },
  dayCell: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontFamily: FONTS.ui,
    fontSize: 13,
  },
  eventMarker: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  agendaHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateChipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADII.md,
  },
  dateChipText: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    fontWeight: '700',
  },
  todayJumpChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    borderWidth: 1,
  },
  todayJumpText: {
    fontFamily: FONTS.ui,
    fontSize: 11.5,
    fontWeight: '700',
  },
  agendaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agendaCount: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  noticeMiniCard: {
    padding: 14,
    borderRadius: RADII.lg,
    borderWidth: 1,
    gap: 4,
  },
  noticeMiniKicker: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '700',
  },
  noticeMiniTitle: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    fontWeight: '700',
  },
  noticeMiniIssuer: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    opacity: 0.85,
  },
  bottomCornerDoodle: {
    position: 'absolute',
    right: -6,
    bottom: 64,
    opacity: 0.5,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
