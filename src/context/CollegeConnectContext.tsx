import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CLUBS,
  INITIAL_EVENTS,
  INITIAL_HUBS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFILE,
  ROLE_PERSONAS,
} from '../data/mockCampusData';
import { CCTheme, LIGHT_THEME, OLED_DARK_THEME } from '../theme/tokens';
import {
  AnnouncementCategory,
  AppNotification,
  CampusAccount,
  CampusClub,
  CampusEvent,
  CampusHub,
  EventArtworkTheme,
  EventCategory,
  FeedbackBanner,
  OfficialAnnouncement,
  PlatformOS,
  ScreenId,
  ThemeMode,
  UIStateMode,
  UserProfile,
  UserRole,
} from '../types/collegeConnect';

const STORAGE_KEY = 'collegeconnect_rn_prototype_v1';

const INITIAL_ACCOUNTS: CampusAccount[] = [
  {
    id: 'acc-student',
    name: 'Aaryan Sharma',
    email: 'aaryan.sharma@collegeconnect.edu',
    password: 'campus123',
    role: 'student',
    program: 'BCA',
    year: '2nd Year',
    studentId: 'CC-2025-0418',
    assignedHubId: 'hub-cultural',
  },
  {
    id: 'acc-faculty',
    name: 'Dr. Meera Nair',
    email: 'meera.nair@collegeconnect.edu',
    password: 'campus123',
    role: 'faculty',
    program: 'Computer Science',
    year: 'Associate Professor',
    studentId: 'FAC-2025-0104',
    assignedHubId: 'hub-tech',
  },
  {
    id: 'acc-hub',
    name: 'Rohan Kulkarni',
    email: 'rohan.kulkarni@collegeconnect.edu',
    password: 'campus123',
    role: 'hub_incharge',
    program: 'Cultural & Media Hub',
    year: 'Hub Coordinator',
    studentId: 'HUB-2025-0022',
    assignedHubId: 'hub-cultural',
  },
  {
    id: 'acc-admin',
    name: 'Prof. Vikram Rao',
    email: 'vikram.rao@collegeconnect.edu',
    password: 'campus123',
    role: 'super_admin',
    program: 'Dean of Student Affairs',
    year: 'Campus Admin',
    studentId: 'ADM-2025-0001',
    assignedHubId: 'hub-cultural',
  },
];

interface PersistedState {
  events: CampusEvent[];
  announcements: OfficialAnnouncement[];
  clubs: CampusClub[];
  hubs: CampusHub[];
  notifications: AppNotification[];
  profile: UserProfile;
  role: UserRole;
  themeMode: ThemeMode;
  platformOS: PlatformOS;
  onboardingComplete: boolean;
  accounts: CampusAccount[];
  isAuthenticated: boolean;
}

export interface NewEventInput {
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  entryLabel: string;
  isFree: boolean;
  description: string;
  hubId: string;
  artwork: EventArtworkTheme;
}

export interface NewAnnouncementInput {
  title: string;
  category: AnnouncementCategory;
  summary: string;
  pinned: boolean;
}

interface CollegeConnectContextValue {
  events: CampusEvent[];
  visibleEvents: CampusEvent[];
  pendingEvents: CampusEvent[];
  announcements: OfficialAnnouncement[];
  clubs: CampusClub[];
  hubs: CampusHub[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  profile: UserProfile;
  role: UserRole;
  roleMeta: (typeof ROLE_PERSONAS)[UserRole];
  themeMode: ThemeMode;
  resolvedDark: boolean;
  theme: CCTheme;
  platformOS: PlatformOS;
  uiStateMode: UIStateMode;
  activeScreen: ScreenId;
  navDirection: 'forward' | 'back' | 'tab';
  selectedEventId: string;
  selectedEvent: CampusEvent | undefined;
  onboardingComplete: boolean;
  publishSheetOpen: boolean;
  inspectorOpen: boolean;
  feedback: FeedbackBanner | null;
  exploreSearchQuery: string;

  navigate: (screen: ScreenId, options?: { eventId?: string; searchQuery?: string }) => void;
  goBack: () => void;
  setExploreSearchQuery: (q: string) => void;
  setRole: (role: UserRole) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setPlatformOS: (os: PlatformOS) => void;
  setUIStateMode: (mode: UIStateMode) => void;
  completeOnboarding: () => void;
  replayOnboarding: () => void;
  openPublishSheet: () => void;
  closePublishSheet: () => void;
  toggleInspector: () => void;
  setInspectorOpen: (open: boolean) => void;
  clearFeedback: () => void;
  showFeedback: (kind: FeedbackBanner['kind'], title: string, message: string) => void;

  toggleEventRegistration: (eventId: string) => void;
  toggleEventSaved: (eventId: string) => void;
  toggleAnnouncementSaved: (announcementId: string) => void;
  markAnnouncementRead: (announcementId: string) => void;
  toggleClubMembership: (clubId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  approveEvent: (eventId: string) => void;
  rejectEvent: (eventId: string) => void;
  publishEvent: (input: NewEventInput) => void;
  publishAnnouncement: (input: NewAnnouncementInput) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  resetDemoData: () => void;

  accounts: CampusAccount[];
  isAuthenticated: boolean;
  authPrefillEmail: string;
  setAuthPrefillEmail: (email: string) => void;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (input: {
    name: string;
    email: string;
    program: string;
    year: string;
    studentId?: string;
    password: string;
  }) => { ok: boolean; error?: string };
  requestPasswordReset: (email: string) => { ok: boolean; code?: string; error?: string };
  resetPassword: (email: string, code: string, newPassword: string) => { ok: boolean; error?: string };
  signOut: () => void;
}

const CollegeConnectContext = createContext<CollegeConnectContextValue | null>(null);

const storageAdapter = {
  getItem(key: string): string | null {
    try {
      if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        return globalThis.localStorage.getItem(key);
      }
    } catch {
      // Ignore storage access errors
    }
    return null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        globalThis.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage quota errors
    }
  },
  removeItem(key: string): void {
    try {
      if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        globalThis.localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  },
};

function loadInitialState(): PersistedState {
  try {
    const raw = storageAdapter.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        events: parsed.events ?? INITIAL_EVENTS,
        announcements: parsed.announcements ?? INITIAL_ANNOUNCEMENTS,
        clubs: parsed.clubs ?? INITIAL_CLUBS,
        hubs: parsed.hubs ?? INITIAL_HUBS,
        notifications: parsed.notifications ?? INITIAL_NOTIFICATIONS,
        profile: parsed.profile ?? INITIAL_PROFILE,
        role: parsed.role ?? 'student',
        themeMode: parsed.themeMode ?? 'system',
        platformOS: parsed.platformOS ?? 'ios',
        onboardingComplete: parsed.onboardingComplete ?? false,
        accounts:
          parsed.accounts && parsed.accounts.length > 0
            ? parsed.accounts
            : INITIAL_ACCOUNTS,
        isAuthenticated: parsed.isAuthenticated ?? false,
      };
    }
  } catch {
    // Fall back cleanly
  }

  return {
    events: INITIAL_EVENTS,
    announcements: INITIAL_ANNOUNCEMENTS,
    clubs: INITIAL_CLUBS,
    hubs: INITIAL_HUBS,
    notifications: INITIAL_NOTIFICATIONS,
    profile: INITIAL_PROFILE,
    role: 'student',
    themeMode: 'system',
    platformOS: 'ios',
    onboardingComplete: false,
    accounts: INITIAL_ACCOUNTS,
    isAuthenticated: false,
  };
}

function formatDateDisplay(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const CollegeConnectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => loadInitialState(), []);
  const rnColorScheme = useColorScheme();

  const [events, setEvents] = useState<CampusEvent[]>(initial.events);
  const [announcements, setAnnouncements] = useState<OfficialAnnouncement[]>(initial.announcements);
  const [clubs, setClubs] = useState<CampusClub[]>(initial.clubs);
  const [hubs, setHubs] = useState<CampusHub[]>(initial.hubs);
  const [notifications, setNotifications] = useState<AppNotification[]>(initial.notifications);
  const [profile, setProfile] = useState<UserProfile>(initial.profile);
  const [role, setRoleState] = useState<UserRole>(initial.role);
  const [themeMode, setThemeMode] = useState<ThemeMode>(initial.themeMode);
  const [platformOS, setPlatformOS] = useState<PlatformOS>(initial.platformOS);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(initial.onboardingComplete);
  const [accounts, setAccounts] = useState<CampusAccount[]>(initial.accounts);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initial.isAuthenticated);
  const [authPrefillEmail, setAuthPrefillEmail] = useState<string>(initial.profile.email);
  const [pendingResetCodes, setPendingResetCodes] = useState<Record<string, string>>({});

  const [appearanceScheme, setAppearanceScheme] = useState<'light' | 'dark'>(() =>
    (rnColorScheme ?? Appearance.getColorScheme()) === 'dark' ? 'dark' : 'light'
  );

  const [activeScreen, setActiveScreen] = useState<ScreenId>(
    !initial.onboardingComplete ? 'welcome' : initial.isAuthenticated ? 'home' : 'login'
  );
  const [navDirection, setNavDirection] = useState<'forward' | 'back' | 'tab'>('tab');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initial.events[0]?.id ?? 'evt-music-fest'
  );
  const [exploreSearchQuery, setExploreSearchQuery] = useState<string>('');
  const [uiStateMode, setUIStateMode] = useState<UIStateMode>('default');
  const [publishSheetOpen, setPublishSheetOpen] = useState<boolean>(false);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null);

  const stateRef = useRef({
    events,
    announcements,
    clubs,
    hubs,
    notifications,
    profile,
    role,
    activeScreen,
    isAuthenticated,
    accounts,
    pendingResetCodes,
    publishSheetOpen,
  });
  stateRef.current = {
    events,
    announcements,
    clubs,
    hubs,
    notifications,
    profile,
    role,
    activeScreen,
    isAuthenticated,
    accounts,
    pendingResetCodes,
    publishSheetOpen,
  };

  useEffect(() => {
    if (rnColorScheme === 'dark' || rnColorScheme === 'light') {
      setAppearanceScheme(rnColorScheme);
    }
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme === 'dark' || colorScheme === 'light') {
        setAppearanceScheme(colorScheme);
      }
    });
    return () => sub?.remove?.();
  }, [rnColorScheme]);

  const resolvedDark =
    themeMode === 'dark' ? true : themeMode === 'light' ? false : appearanceScheme === 'dark';

  const theme = useMemo(() => (resolvedDark ? OLED_DARK_THEME : LIGHT_THEME), [resolvedDark]);

  // Keep web container background synced to OLED/Light theme without CSS classes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = theme.bg;
      document.body.style.color = theme.text;
    }
  }, [theme]);

  // Debounced storage write so synchronous JSON.stringify never hitches 60fps transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      const payload: PersistedState = {
        events,
        announcements,
        clubs,
        hubs,
        notifications,
        profile,
        role,
        themeMode,
        platformOS,
        onboardingComplete,
        accounts,
        isAuthenticated,
      };
      storageAdapter.setItem(STORAGE_KEY, JSON.stringify(payload));
    }, 220);
    return () => clearTimeout(timer);
  }, [
    events,
    announcements,
    clubs,
    hubs,
    notifications,
    profile,
    role,
    themeMode,
    platformOS,
    onboardingComplete,
    accounts,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const showFeedback = useCallback((kind: FeedbackBanner['kind'], title: string, message: string) => {
    setFeedback({ id: String(Date.now()), kind, title, message });
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  const TAB_ROOTS = useMemo(() => new Set<ScreenId>(['home', 'explore', 'saved', 'profile']), []);

  const navigate = useCallback(
    (screen: ScreenId, options?: { eventId?: string; searchQuery?: string }) => {
      if (options?.eventId) {
        setSelectedEventId(options.eventId);
      }
      if (options?.searchQuery !== undefined) {
        setExploreSearchQuery(options.searchQuery);
      }
      const current = stateRef.current.activeScreen;
      if (screen !== current) {
        const isTabSwitch = TAB_ROOTS.has(screen) && TAB_ROOTS.has(current);
        setNavDirection(isTabSwitch ? 'tab' : 'forward');
        setScreenHistory((prev) => [...prev.slice(-8), current]);
        setActiveScreen(screen);
      }
    },
    [TAB_ROOTS]
  );

  const goBack = useCallback(() => {
    setNavDirection('back');
    setScreenHistory((prev) => {
      if (prev.length === 0) {
        setActiveScreen('home');
        return [];
      }
      const next = [...prev];
      const last = next.pop() ?? 'home';
      setActiveScreen(last);
      return next;
    });
  }, []);

  const setRole = useCallback(
    (nextRole: UserRole) => {
      setRoleState(nextRole);
      const persona = ROLE_PERSONAS[nextRole];
      setProfile((prev) => ({
        ...prev,
        name: persona.defaultName,
        program: persona.defaultProgram,
        year: persona.defaultYear,
      }));
      if (!persona.canPublishEvents && stateRef.current.publishSheetOpen) {
        setPublishSheetOpen(false);
      }
      showFeedback('info', `Role: ${persona.label}`, persona.badgeDescription);
    },
    [showFeedback]
  );

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true);
    setNavDirection('forward');
    setActiveScreen(stateRef.current.isAuthenticated ? 'home' : 'login');
    setScreenHistory([]);
  }, []);

  const replayOnboarding = useCallback(() => {
    setOnboardingComplete(false);
    setNavDirection('back');
    setActiveScreen('welcome');
  }, []);

  const openPublishSheet = useCallback(() => {
    const meta = ROLE_PERSONAS[stateRef.current.role];
    if (!meta.canPublishEvents && !meta.canPublishAnnouncements) {
      showFeedback(
        'error',
        'Permission Restricted',
        'Only Faculty, Hub In-charge, or Super Admin can publish official campus information.'
      );
      return;
    }
    setPublishSheetOpen(true);
  }, [showFeedback]);

  const closePublishSheet = useCallback(() => setPublishSheetOpen(false), []);
  const toggleInspector = useCallback(() => setInspectorOpen((prev) => !prev), []);

  const toggleEventRegistration = useCallback(
    (eventId: string) => {
      const target = stateRef.current.events.find((e) => e.id === eventId);
      if (!target) return;
      const nextRegistered = !target.isRegistered;
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                isRegistered: nextRegistered,
                attendeeCount: Math.max(0, e.attendeeCount + (nextRegistered ? 1 : -1)),
              }
            : e
        )
      );
      showFeedback(
        'success',
        nextRegistered ? 'Registration Confirmed' : 'Registration Cancelled',
        nextRegistered
          ? `Your pass for ${target.title} is available in Saved & Passes.`
          : `You cancelled your registration for ${target.title}.`
      );
    },
    [showFeedback]
  );

  const toggleEventSaved = useCallback(
    (eventId: string) => {
      const target = stateRef.current.events.find((e) => e.id === eventId);
      if (!target) return;
      const nextSaved = !target.isSaved;
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, isSaved: nextSaved } : e))
      );
      showFeedback(
        'success',
        nextSaved ? 'Saved for Later' : 'Removed from Saved',
        nextSaved ? `${target.title} added to Saved.` : `${target.title} removed.`
      );
    },
    [showFeedback]
  );

  const toggleAnnouncementSaved = useCallback(
    (announcementId: string) => {
      const target = stateRef.current.announcements.find((a) => a.id === announcementId);
      if (!target) return;
      const nextSaved = !target.isSaved;
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === announcementId ? { ...a, isSaved: nextSaved } : a))
      );
      showFeedback('success', nextSaved ? 'Notice Bookmarked' : 'Bookmark Removed', target.title);
    },
    [showFeedback]
  );

  const markAnnouncementRead = useCallback((announcementId: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === announcementId && !a.isRead ? { ...a, isRead: true } : a))
    );
  }, []);

  const toggleClubMembership = useCallback(
    (clubId: string) => {
      const target = stateRef.current.clubs.find((c) => c.id === clubId);
      if (!target) return;
      const nextJoined = !target.isJoined;
      setClubs((prev) =>
        prev.map((c) =>
          c.id === clubId
            ? {
                ...c,
                isJoined: nextJoined,
                memberCount: Math.max(0, c.memberCount + (nextJoined ? 1 : -1)),
              }
            : c
        )
      );
      showFeedback(
        'success',
        nextJoined ? `Joined ${target.name}` : `Left ${target.name}`,
        nextJoined ? `Schedule: ${target.meetingSchedule} · ${target.location}` : 'Club membership updated.'
      );
    },
    [showFeedback]
  );

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId && !n.isRead ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showFeedback('success', 'All Caught Up', 'All notifications marked as read.');
  }, [showFeedback]);

  const approveEvent = useCallback(
    (eventId: string) => {
      const { role: curRole, events: curEvents } = stateRef.current;
      if (!ROLE_PERSONAS[curRole].canApproveSubmissions) return;
      const target = curEvents.find((e) => e.id === eventId);
      if (!target) return;
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'approved' } : e)));
      setNotifications((prev) => [
        {
          id: `not-${Date.now()}`,
          type: 'approved',
          title: 'Event Approved',
          message: `"${target.title}" is now live on the campus feed.`,
          timeAgo: 'Just now',
          isRead: false,
          targetScreen: 'event_detail',
          targetId: target.id,
        },
        ...prev,
      ]);
      showFeedback('success', 'Submission Approved', `${target.title} is now live.`);
    },
    [showFeedback]
  );

  const rejectEvent = useCallback(
    (eventId: string) => {
      const { role: curRole, events: curEvents } = stateRef.current;
      if (!ROLE_PERSONAS[curRole].canApproveSubmissions) return;
      const target = curEvents.find((e) => e.id === eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      showFeedback(
        'info',
        'Submission Removed',
        target ? `${target.title} removed from review queue.` : 'Submission removed.'
      );
    },
    [showFeedback]
  );

  const publishEvent = useCallback(
    (input: NewEventInput) => {
      const { role: curRole, hubs: curHubs, profile: curProfile } = stateRef.current;
      const meta = ROLE_PERSONAS[curRole];
      if (!meta.canPublishEvents) return;
      const hub = curHubs.find((h) => h.id === input.hubId) ?? curHubs[0];
      const isDirectApproved = curRole === 'super_admin' || curRole === 'hub_incharge';
      const newId = `evt-${Date.now()}`;
      const created: CampusEvent = {
        id: newId,
        title: input.title.trim(),
        category: input.category,
        date: input.date,
        dateDisplay: formatDateDisplay(input.date),
        time: input.time.trim() || '4:00 PM',
        venue: input.venue.trim() || hub.building,
        entryLabel: input.isFree ? 'Free Entry' : input.entryLabel.trim() || 'Paid Entry',
        isFree: input.isFree,
        description: input.description.trim(),
        highlights: [input.category, hub.name.split(' ')[0], input.isFree ? 'Free' : 'Pass'],
        hubId: hub.id,
        hubName: hub.name,
        organizerName: curProfile.name,
        authorRole: curRole,
        status: isDirectApproved ? 'approved' : 'pending',
        artwork: input.artwork,
        attendeeCount: 1,
        capacity: 200,
        isRegistered: false,
        isSaved: false,
      };

      setEvents((prev) => [created, ...prev]);
      setNotifications((prev) => [
        {
          id: `not-${Date.now()}`,
          type: isDirectApproved ? 'new_event' : 'approved',
          title: isDirectApproved ? 'New Event Published' : 'Submitted for Review',
          message: isDirectApproved
            ? `${created.title} on ${created.dateDisplay} is now live.`
            : `${created.title} sent to Super Admin for approval.`,
          timeAgo: 'Just now',
          isRead: false,
          targetScreen: 'event_detail',
          targetId: newId,
        },
        ...prev,
      ]);
      setPublishSheetOpen(false);
      showFeedback(
        'success',
        isDirectApproved ? 'Event Published' : 'Submitted for Review',
        isDirectApproved ? `${created.title} added to campus feed.` : `${created.title} awaits Super Admin approval.`
      );
      if (isDirectApproved) {
        navigate('event_detail', { eventId: newId });
      }
    },
    [navigate, showFeedback]
  );

  const publishAnnouncement = useCallback(
    (input: NewAnnouncementInput) => {
      const { role: curRole, profile: curProfile } = stateRef.current;
      const meta = ROLE_PERSONAS[curRole];
      if (!meta.canPublishAnnouncements) return;
      const created: OfficialAnnouncement = {
        id: `ann-${Date.now()}`,
        title: input.title.trim(),
        category: input.category,
        issuerTitle: `${curProfile.name} · ${meta.label}`,
        authorRole: curRole,
        summary: input.summary.trim(),
        postedAt: 'Just now',
        date: '2025-04-15',
        pinned: input.pinned && (curRole === 'super_admin' || curRole === 'faculty'),
        isRead: false,
        isSaved: false,
      };
      setAnnouncements((prev) => [created, ...prev]);
      setNotifications((prev) => [
        {
          id: `not-${Date.now()}`,
          type: 'announcement',
          title: 'Official Announcement',
          message: created.title,
          timeAgo: 'Just now',
          isRead: false,
          targetScreen: 'announcements',
          targetId: created.id,
        },
        ...prev,
      ]);
      setPublishSheetOpen(false);
      showFeedback('success', 'Official Notice Published', created.title);
      navigate('announcements');
    },
    [navigate, showFeedback]
  );

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((prev) => ({ ...prev, ...patch }));
      showFeedback('success', 'Profile Updated', 'Your campus profile details were saved.');
    },
    [showFeedback]
  );

  const resetDemoData = useCallback(() => {
    storageAdapter.removeItem(STORAGE_KEY);
    setEvents(INITIAL_EVENTS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setClubs(INITIAL_CLUBS);
    setHubs(INITIAL_HUBS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setProfile(INITIAL_PROFILE);
    setRoleState('student');
    setAccounts(INITIAL_ACCOUNTS);
    setIsAuthenticated(false);
    setPendingResetCodes({});
    setUIStateMode('default');
    showFeedback('success', 'Demo Data Restored', 'All campus events, hubs, and accounts reset.');
  }, [showFeedback]);

  const signIn = useCallback(
    (emailRaw: string, password: string): { ok: boolean; error?: string } => {
      const email = emailRaw.trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return { ok: false, error: 'Enter a valid university email address.' };
      }
      if (!password) {
        return { ok: false, error: 'Enter your campus account password.' };
      }
      const found = stateRef.current.accounts.find((acc) => acc.email.toLowerCase() === email);
      if (!found) {
        return { ok: false, error: 'No campus account found for that email. Try creating a new account.' };
      }
      if (found.password !== password) {
        return { ok: false, error: 'Incorrect password. Use Forgot Password to reset it.' };
      }

      setRoleState(found.role);
      setProfile({
        name: found.name,
        email: found.email,
        program: found.program,
        year: found.year,
        studentId: found.studentId,
        assignedHubId: found.assignedHubId,
      });
      setIsAuthenticated(true);
      setOnboardingComplete(true);
      setAuthPrefillEmail(found.email);
      setNavDirection('forward');
      setActiveScreen('home');
      setScreenHistory([]);
      showFeedback('success', `Welcome, ${found.name.split(' ')[0]}`, `Signed in as ${ROLE_PERSONAS[found.role].label}.`);
      return { ok: true };
    },
    [showFeedback]
  );

  const signUp = useCallback(
    (input: {
      name: string;
      email: string;
      program: string;
      year: string;
      studentId?: string;
      password: string;
    }): { ok: boolean; error?: string } => {
      const name = input.name.trim();
      const email = input.email.trim().toLowerCase();
      const program = input.program.trim() || 'B.Tech';
      const year = input.year.trim() || '1st Year';

      if (name.length < 2) {
        return { ok: false, error: 'Enter your full name.' };
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { ok: false, error: 'Enter a valid campus email address.' };
      }
      if (stateRef.current.accounts.some((a) => a.email.toLowerCase() === email)) {
        return { ok: false, error: 'An account with this email already exists. Try signing in.' };
      }
      if (input.password.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters.' };
      }

      const generatedId =
        input.studentId?.trim() ||
        `CC-2025-${String(Math.floor(1000 + Math.random() * 8999))}`;

      const created: CampusAccount = {
        id: `acc-${Date.now()}`,
        name,
        email,
        password: input.password,
        role: 'student',
        program,
        year,
        studentId: generatedId,
        assignedHubId: 'hub-cultural',
      };

      setAccounts((prev) => [created, ...prev]);
      setRoleState('student');
      setProfile({
        name: created.name,
        email: created.email,
        program: created.program,
        year: created.year,
        studentId: created.studentId,
        assignedHubId: created.assignedHubId,
      });
      setIsAuthenticated(true);
      setOnboardingComplete(true);
      setAuthPrefillEmail(created.email);
      setNavDirection('forward');
      setActiveScreen('home');
      setScreenHistory([]);
      showFeedback('success', 'Account Created', `Welcome to CollegeConnect, ${name.split(' ')[0]}!`);
      return { ok: true };
    },
    [showFeedback]
  );

  const requestPasswordReset = useCallback(
    (emailRaw: string): { ok: boolean; code?: string; error?: string } => {
      const email = emailRaw.trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return { ok: false, error: 'Enter a valid university email address.' };
      }
      const found = stateRef.current.accounts.find((acc) => acc.email.toLowerCase() === email);
      if (!found) {
        return { ok: false, error: 'No registered campus account matches that email.' };
      }
      const code = String(Math.floor(100000 + Math.random() * 899999));
      setPendingResetCodes((prev) => ({ ...prev, [email]: code }));
      return { ok: true, code };
    },
    []
  );

  const resetPassword = useCallback(
    (emailRaw: string, codeRaw: string, newPassword: string): { ok: boolean; error?: string } => {
      const email = emailRaw.trim().toLowerCase();
      const expected = stateRef.current.pendingResetCodes[email];
      if (!expected || codeRaw.trim() !== expected) {
        return { ok: false, error: 'Invalid or expired 6-digit verification code.' };
      }
      if (newPassword.length < 6) {
        return { ok: false, error: 'New password must be at least 6 characters.' };
      }
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.email.toLowerCase() === email ? { ...acc, password: newPassword } : acc
        )
      );
      setPendingResetCodes((prev) => {
        const next = { ...prev };
        delete next[email];
        return next;
      });
      setAuthPrefillEmail(email);
      showFeedback('success', 'Password Updated', 'Sign in with your new campus password.');
      return { ok: true };
    },
    [showFeedback]
  );

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setPublishSheetOpen(false);
    setNavDirection('back');
    setActiveScreen('login');
    setScreenHistory([]);
    showFeedback('info', 'Signed Out', 'You have signed out of CollegeConnect.');
  }, [showFeedback]);

  const visibleEvents = useMemo(() => {
    if (role === 'super_admin') return events;
    return events.filter((e) => e.status === 'approved' || e.authorRole === role);
  }, [events, role]);

  const pendingEvents = useMemo(
    () => events.filter((e) => e.status === 'pending'),
    [events]
  );

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? visibleEvents[0],
    [events, selectedEventId, visibleEvents]
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const value = useMemo<CollegeConnectContextValue>(
    () => ({
      events,
      visibleEvents,
      pendingEvents,
      announcements,
      clubs,
      hubs,
      notifications,
      unreadNotificationsCount,
      profile,
      role,
      roleMeta: ROLE_PERSONAS[role],
      themeMode,
      resolvedDark,
      theme,
      platformOS,
      uiStateMode,
      activeScreen,
      navDirection,
      selectedEventId,
      selectedEvent,
      onboardingComplete,
      publishSheetOpen,
      inspectorOpen,
      feedback,
      exploreSearchQuery,
      navigate,
      goBack,
      setExploreSearchQuery,
      setRole,
      setThemeMode,
      setPlatformOS,
      setUIStateMode,
      completeOnboarding,
      replayOnboarding,
      openPublishSheet,
      closePublishSheet,
      toggleInspector,
      setInspectorOpen,
      clearFeedback,
      showFeedback,
      toggleEventRegistration,
      toggleEventSaved,
      toggleAnnouncementSaved,
      markAnnouncementRead,
      toggleClubMembership,
      markNotificationRead,
      markAllNotificationsRead,
      approveEvent,
      rejectEvent,
      publishEvent,
      publishAnnouncement,
      updateProfile,
      resetDemoData,
      accounts,
      isAuthenticated,
      authPrefillEmail,
      setAuthPrefillEmail,
      signIn,
      signUp,
      requestPasswordReset,
      resetPassword,
      signOut,
    }),
    [
      events,
      visibleEvents,
      pendingEvents,
      announcements,
      clubs,
      hubs,
      notifications,
      unreadNotificationsCount,
      profile,
      role,
      themeMode,
      resolvedDark,
      theme,
      platformOS,
      uiStateMode,
      activeScreen,
      navDirection,
      selectedEventId,
      selectedEvent,
      onboardingComplete,
      publishSheetOpen,
      inspectorOpen,
      feedback,
      exploreSearchQuery,
      navigate,
      goBack,
      setRole,
      completeOnboarding,
      replayOnboarding,
      openPublishSheet,
      closePublishSheet,
      toggleInspector,
      clearFeedback,
      showFeedback,
      toggleEventRegistration,
      toggleEventSaved,
      toggleAnnouncementSaved,
      markAnnouncementRead,
      toggleClubMembership,
      markNotificationRead,
      markAllNotificationsRead,
      approveEvent,
      rejectEvent,
      publishEvent,
      publishAnnouncement,
      updateProfile,
      resetDemoData,
      accounts,
      isAuthenticated,
      authPrefillEmail,
      signIn,
      signUp,
      requestPasswordReset,
      resetPassword,
      signOut,
    ]
  );

  return (
    <CollegeConnectContext.Provider value={value}>
      {children}
    </CollegeConnectContext.Provider>
  );
};

export function useCollegeConnect(): CollegeConnectContextValue {
  const ctx = useContext(CollegeConnectContext);
  if (!ctx) {
    throw new Error('useCollegeConnect must be used inside CollegeConnectProvider');
  }
  return ctx;
}
