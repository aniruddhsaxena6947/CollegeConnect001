import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCollegeConnect } from '../../context/CollegeConnectContext';
import { FONTS, RADII, SPACING, TOUCH_TARGET } from '../../theme/tokens';
import { AnnouncementCategory } from '../../types/collegeConnect';
import { BookmarkIcon, MegaphoneIcon, PlusIcon, ShieldIcon } from '../icons/NavIcons';
import {
  EmptyStateCard,
  ErrorStateCard,
  LoadingSkeletonList,
  ScreenHeader,
  TactilePressable,
} from '../ui/RNPrimitives';

const NOTICE_TABS: Array<'All' | AnnouncementCategory> = [
  'All',
  'Exam',
  'Academic',
  'Hostel',
  'General',
];

export const AnnouncementsScreen: React.FC = () => {
  const {
    announcements,
    roleMeta,
    uiStateMode,
    setUIStateMode,
    markAnnouncementRead,
    toggleAnnouncementSaved,
    openPublishSheet,
    theme,
  } = useCollegeConnect();

  const [category, setCategory] = useState<'All' | AnnouncementCategory>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const base =
      category === 'All'
        ? announcements
        : announcements.filter((a) => a.category === category);
    return [...base].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  }, [announcements, category]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScreenHeader
        title="Notices"
        subtitle="Official university & faculty updates."
        showBack
        handwrittenTitle
        rightSlot={
          roleMeta.canPublishAnnouncements ? (
            <TactilePressable
              onPress={openPublishSheet}
              scaleTo={0.94}
              accessibilityLabel="Post notice"
              style={[styles.postBtn, { backgroundColor: theme.primary }]}
            >
              <PlusIcon size={15} color={theme.primaryFg} />
              <Text style={[styles.postBtnText, { color: theme.primaryFg }]}>
                Post
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
          contentContainerStyle={styles.tabsRow}
        >
          {NOTICE_TABS.map((tab) => {
            const active = category === tab;
            return (
              <TactilePressable
                key={tab}
                onPress={() => setCategory(tab)}
                scaleTo={0.94}
                accessibilityLabel={`Filter by ${tab}`}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: active ? theme.primary : theme.surfaceTag,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: active ? theme.primaryFg : theme.text },
                  ]}
                >
                  {tab}
                </Text>
              </TactilePressable>
            );
          })}
        </ScrollView>

        {uiStateMode === 'loading' ? (
          <LoadingSkeletonList count={3} />
        ) : uiStateMode === 'error' ? (
          <ErrorStateCard onRetry={() => setUIStateMode('default')} />
        ) : uiStateMode === 'empty' || filtered.length === 0 ? (
          <EmptyStateCard
            title="No notices in this category"
            description="Official updates from Deans, Exam Cell, and Hub In-charges appear here."
            actionLabel="View All Notices"
            onAction={() => {
              setCategory('All');
              setUIStateMode('default');
            }}
          />
        ) : (
          <View style={styles.listWrap}>
            {filtered.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.noticeCard,
                    {
                      backgroundColor: item.pinned ? theme.note : theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      markAnnouncementRead(item.id);
                      setExpandedId(isExpanded ? null : item.id);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Read notice ${item.title}`}
                    style={({ pressed }) => [
                      styles.noticeBodyPressable,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <View style={styles.noticeLeftHeader}>
                      <View
                        style={[
                          styles.iconBadge,
                          {
                            backgroundColor: item.pinned
                              ? theme.primary
                              : theme.surfaceTag,
                          },
                        ]}
                      >
                        {item.pinned ? (
                          <ShieldIcon size={16} color={theme.primaryFg} />
                        ) : (
                          <MegaphoneIcon
                            size={16}
                            color={theme.isDark ? theme.primaryBright : theme.primary}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.noticeKicker,
                            {
                              color: item.pinned
                                ? theme.noteInk
                                : theme.isDark
                                ? theme.primaryBright
                                : theme.primary,
                            },
                          ]}
                        >
                          {item.pinned ? 'Pinned · ' : ''}
                          {item.category} · {item.postedAt}
                          {!item.isRead ? ' · Unread' : ''}
                        </Text>
                        <Text
                          style={[
                            styles.noticeTitle,
                            { color: item.pinned ? theme.noteInk : theme.text },
                          ]}
                        >
                          {item.title}
                        </Text>
                      </View>
                    </View>

                    <Text
                      numberOfLines={isExpanded ? undefined : 3}
                      style={[
                        styles.noticeSummary,
                        {
                          color: item.pinned ? theme.noteInk : theme.textMuted,
                        },
                      ]}
                    >
                      {item.summary}
                    </Text>

                    <View style={styles.noticeFooterRow}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.noticeIssuer,
                          {
                            color: item.pinned ? theme.noteInk : theme.textMuted,
                          },
                        ]}
                      >
                        Issued by {item.issuerTitle}
                      </Text>
                      <Text
                        style={[
                          styles.expandCue,
                          {
                            color: item.pinned
                              ? theme.noteInk
                              : theme.isDark
                              ? theme.primaryBright
                              : theme.primary,
                          },
                        ]}
                      >
                        {isExpanded ? 'Show less ▴' : 'Read full notice ▾'}
                      </Text>
                    </View>
                  </Pressable>

                  <TactilePressable
                    onPress={() => toggleAnnouncementSaved(item.id)}
                    hitSlop={8}
                    scaleTo={0.85}
                    accessibilityLabel={item.isSaved ? 'Remove bookmark' : 'Bookmark notice'}
                    style={styles.bookmarkBtn}
                  >
                    <BookmarkIcon
                      size={18}
                      color={
                        item.isSaved
                          ? item.pinned
                            ? theme.noteInk
                            : theme.isDark
                            ? theme.primaryBright
                            : theme.primary
                          : theme.textMuted
                      }
                      filled={item.isSaved}
                    />
                  </TactilePressable>
                </View>
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
    gap: 12,
  },
  postBtn: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: RADII.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  postBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
  tabsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  tabChip: {
    minHeight: 36,
    paddingHorizontal: 15,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  listWrap: {
    gap: 10,
  },
  noticeCard: {
    padding: 14,
    borderRadius: RADII.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noticeBodyPressable: {
    flex: 1,
    gap: 8,
  },
  noticeLeftHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  noticeKicker: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  noticeTitle: {
    fontFamily: FONTS.ui,
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 2,
  },
  bookmarkBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    marginRight: -6,
  },
  noticeSummary: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    lineHeight: 19,
  },
  noticeFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  noticeIssuer: {
    flex: 1,
    fontFamily: FONTS.ui,
    fontSize: 11.5,
    fontWeight: '600',
    opacity: 0.85,
  },
  expandCue: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '700',
  },
});
