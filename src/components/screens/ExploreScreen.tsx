import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCollegeConnect } from '../../context/CollegeConnectContext';
import { FONTS, RADII, SPACING, TOUCH_TARGET } from '../../theme/tokens';
import { EventCategory } from '../../types/collegeConnect';
import { PlusIcon, SearchIcon, SlidersIcon, XIcon } from '../icons/NavIcons';
import { SwirlDoodle } from '../illustrations/CampusArtwork';
import {
  EmptyStateCard,
  ErrorStateCard,
  EventRowCard,
  LoadingSkeletonList,
  SmoothBottomSheet,
  TactilePressable,
} from '../ui/RNPrimitives';

const CATEGORIES: Array<'All' | EventCategory> = [
  'All',
  'Cultural',
  'Tech',
  'Sports',
  'Workshop',
  'Competition',
  'Social',
];

export const ExploreScreen: React.FC = () => {
  const {
    visibleEvents,
    exploreSearchQuery,
    setExploreSearchQuery,
    uiStateMode,
    setUIStateMode,
    navigate,
    role,
    roleMeta,
    openPublishSheet,
    theme,
  } = useCollegeConnect();

  const [localSearch, setLocalSearch] = useState(exploreSearchQuery);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'soonest' | 'popular'>('soonest');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setLocalSearch(exploreSearchQuery);
  }, [exploreSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== exploreSearchQuery) {
        setExploreSearchQuery(localSearch);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [localSearch, exploreSearchQuery, setExploreSearchQuery]);

  const activeFiltersCount = (freeOnly ? 1 : 0) + (sortOrder === 'popular' ? 1 : 0);
  const hasAnyFilter =
    selectedCategory !== 'All' || freeOnly || sortOrder !== 'soonest' || localSearch.trim().length > 0;

  const filteredEvents = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    return visibleEvents
      .filter((event) => {
        if (selectedCategory !== 'All' && event.category !== selectedCategory) return false;
        if (freeOnly && !event.isFree) return false;
        if (q) {
          const haystack = `${event.title} ${event.category} ${event.venue} ${event.hubName} ${event.organizerName}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'popular') return b.attendeeCount - a.attendeeCount;
        return a.date.localeCompare(b.date);
      });
  }, [visibleEvents, localSearch, selectedCategory, freeOnly, sortOrder]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header matching Tile 3 */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Explore</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Find what excites you.
            </Text>
          </View>
          <View style={styles.headerRight}>
            <SwirlDoodle color={theme.text} size={28} />
            {roleMeta.canPublishEvents ? (
              <Pressable
                onPress={openPublishSheet}
                accessibilityRole="button"
                accessibilityLabel="Publish event"
                style={[styles.publishMiniBtn, { backgroundColor: theme.primary }]}
              >
                <PlusIcon size={15} color={theme.primaryFg} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Search + Filter Trigger matching Tile 3 */}
        <View style={styles.searchRow}>
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
              value={localSearch}
              onChangeText={setLocalSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search events, clubs, or keywords..."
              placeholderTextColor={theme.textMuted}
              style={[styles.searchInput, { color: theme.text }]}
            />
            {localSearch.length > 0 ? (
              <Pressable
                onPress={() => {
                  setLocalSearch('');
                  setExploreSearchQuery('');
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <XIcon size={16} color={theme.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <TactilePressable
            onPress={() => setFilterOpen(true)}
            scaleTo={0.93}
            accessibilityLabel="Filter events"
            style={[
              styles.filterBtn,
              {
                backgroundColor: activeFiltersCount > 0 ? theme.primary : theme.surface,
                borderColor: activeFiltersCount > 0 ? theme.primary : theme.border,
              },
            ]}
          >
            <SlidersIcon
              size={18}
              color={activeFiltersCount > 0 ? theme.primaryFg : theme.text}
            />
            {activeFiltersCount > 0 ? (
              <View style={[styles.filterCountBadge, { backgroundColor: theme.note }]}>
                <Text style={[styles.filterCountText, { color: theme.noteInk }]}>
                  {activeFiltersCount}
                </Text>
              </View>
            ) : null}
          </TactilePressable>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TactilePressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                scaleTo={0.95}
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.primary : theme.surfaceTag,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.chipText,
                    { color: active ? theme.primaryFg : theme.text },
                  ]}
                >
                  {cat}
                </Text>
              </TactilePressable>
            );
          })}
        </ScrollView>

        {/* Live Result Summary Row */}
        {uiStateMode === 'default' ? (
          <View style={styles.resultsMetaRow}>
            <Text style={[styles.resultsCountText, styles.tabular, { color: theme.textMuted }]}>
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
              {sortOrder === 'popular' ? ' · Most popular' : ' · Soonest first'}
              {freeOnly ? ' · Free only' : ''}
            </Text>
            {hasAnyFilter ? (
              <Pressable
                onPress={() => {
                  setSelectedCategory('All');
                  setFreeOnly(false);
                  setSortOrder('soonest');
                  setLocalSearch('');
                  setExploreSearchQuery('');
                }}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.clearFilterText,
                    { color: theme.isDark ? theme.primaryBright : theme.primary },
                  ]}
                >
                  Reset
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* Events List */}
        {uiStateMode === 'loading' ? (
          <LoadingSkeletonList count={4} />
        ) : uiStateMode === 'error' ? (
          <ErrorStateCard onRetry={() => setUIStateMode('default')} />
        ) : uiStateMode === 'empty' || filteredEvents.length === 0 ? (
          <EmptyStateCard
            title="No matching events found"
            description="Try clearing your search or switching to another campus category."
            actionLabel="Reset Filters"
            onAction={() => {
              setSelectedCategory('All');
              setFreeOnly(false);
              setSortOrder('soonest');
              setLocalSearch('');
              setExploreSearchQuery('');
              setUIStateMode('default');
            }}
          />
        ) : (
          <View style={styles.listCol}>
            {filteredEvents.map((event) => (
              <EventRowCard
                key={event.id}
                event={event}
                showApprovalStatus={role === 'super_admin'}
                onPress={() => navigate('event_detail', { eventId: event.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Smooth Filter Sheet Modal */}
      <SmoothBottomSheet visible={filterOpen} onClose={() => setFilterOpen(false)}>
        <View
          style={[
            styles.sheetCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.grabHandle, { backgroundColor: theme.borderStrong }]} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Filter &amp; Sort</Text>
            <Pressable onPress={() => setFilterOpen(false)} hitSlop={10}>
              <XIcon size={20} color={theme.textMuted} />
            </Pressable>
          </View>

          <View style={[styles.toggleRow, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: theme.text }]}>
                Free Entry Events Only
              </Text>
              <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                Hide paid competition passes
              </Text>
            </View>
            <Switch
              value={freeOnly}
              onValueChange={setFreeOnly}
              trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={{ gap: 10 }}>
            <Text style={[styles.toggleTitle, { color: theme.text }]}>Sort Order</Text>
            <View style={styles.sortRow}>
              {[
                { id: 'soonest' as const, label: 'Soonest Date' },
                { id: 'popular' as const, label: 'Most Popular' },
              ].map((opt) => {
                const active = sortOrder === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setSortOrder(opt.id)}
                    style={[
                      styles.sortBtn,
                      {
                        backgroundColor: active ? theme.primary : theme.surfaceMuted,
                        borderColor: active ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortBtnText,
                        { color: active ? theme.primaryFg : theme.text },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TactilePressable
            onPress={() => setFilterOpen(false)}
            style={[styles.applyBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.applyBtnText, { color: theme.primaryFg }]}>
              Show {filteredEvents.length} Events
            </Text>
          </TactilePressable>
        </View>
      </SmoothBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 38,
    paddingBottom: 92,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONTS.handwritten,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: FONTS.ui,
    fontSize: 13,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  publishMiniBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
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
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: RADII.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterCountText: {
    fontFamily: FONTS.ui,
    fontSize: 10,
    fontWeight: '700',
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 15,
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
  resultsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  resultsCountText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '500',
  },
  clearFilterText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  listCol: {
    gap: 10,
  },
  sheetCard: {
    borderTopLeftRadius: RADII.xxl,
    borderTopRightRadius: RADII.xxl,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
    gap: 18,
  },
  grabHandle: {
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
  sheetTitle: {
    fontFamily: FONTS.ui,
    fontSize: 18,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  toggleTitle: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleSub: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    marginTop: 2,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sortBtn: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    fontWeight: '600',
  },
  applyBtn: {
    minHeight: 48,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    fontWeight: '700',
  },
});
