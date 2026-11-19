import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCollegeConnect } from '../../context/CollegeConnectContext';
import { ROLE_PERSONAS } from '../../data/mockCampusData';
import { FONTS, RADII, SPACING, TOUCH_TARGET } from '../../theme/tokens';
import { PlatformOS, ThemeMode, UserRole } from '../../types/collegeConnect';
import {
  CodeIcon,
  LogOutIcon,
  MoonIcon,
  RefreshIcon,
  ShieldIcon,
  SmartphoneIcon,
  SunIcon,
} from '../icons/NavIcons';
import { ScreenHeader, TactilePressable } from '../ui/RNPrimitives';

const ROLES: UserRole[] = ['student', 'faculty', 'hub_incharge', 'super_admin'];

export const SettingsScreen: React.FC = () => {
  const {
    themeMode,
    setThemeMode,
    resolvedDark,
    platformOS,
    setPlatformOS,
    role,
    setRole,
    profile,
    updateProfile,
    replayOnboarding,
    resetDemoData,
    toggleInspector,
    signOut,
    theme,
  } = useCollegeConnect();

  const [nameInput, setNameInput] = useState(profile.name);
  const [programInput, setProgramInput] = useState(profile.program);
  const [yearInput, setYearInput] = useState(profile.year);
  const [focusedField, setFocusedField] = useState<'name' | 'program' | 'year' | null>(null);

  const activeFocusBorder = theme.isDark ? theme.primaryBright : theme.primary;

  useEffect(() => {
    setNameInput(profile.name);
    setProgramInput(profile.program);
    setYearInput(profile.year);
  }, [profile]);

  const themeOptions: Array<{ id: ThemeMode; label: string }> = [
    { id: 'system', label: 'System' },
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'OLED Dark' },
  ];

  const platformOptions: Array<{ id: PlatformOS; label: string }> = [
    { id: 'ios', label: 'iOS' },
    { id: 'android', label: 'Android' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScreenHeader
        title="Settings"
        subtitle="Theme, platform & campus role."
        showBack
        handwrittenTitle
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardTitleRow}>
            {resolvedDark ? (
              <MoonIcon size={18} color={theme.primaryBright} />
            ) : (
              <SunIcon size={18} color={theme.primary} />
            )}
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Appearance &amp; OLED Dark Theme
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.textMuted }]}>
            Follows system preference or locks Warm Parchment / Pure Black OLED (#000000).
          </Text>

          <View style={styles.segmentRow}>
            {themeOptions.map((opt) => {
              const active = themeMode === opt.id;
              return (
                <TactilePressable
                  key={opt.id}
                  onPress={() => setThemeMode(opt.id)}
                  scaleTo={0.95}
                  containerStyle={{ flex: 1 }}
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Theme ${opt.label}`}
                  style={[
                    styles.segmentBtn,
                    {
                      backgroundColor: active ? theme.primary : theme.surfaceTag,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.segmentText,
                      { color: active ? theme.primaryFg : theme.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TactilePressable>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardTitleRow}>
            <SmartphoneIcon
              size={18}
              color={theme.isDark ? theme.primaryBright : theme.primary}
            />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Platform Ergonomics
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.textMuted }]}>
            Switch header alignment and surface elevation between iOS and Android conventions.
          </Text>

          <View style={styles.segmentRow}>
            {platformOptions.map((opt) => {
              const active = platformOS === opt.id;
              return (
                <TactilePressable
                  key={opt.id}
                  onPress={() => setPlatformOS(opt.id)}
                  scaleTo={0.95}
                  containerStyle={{ flex: 1 }}
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Platform ${opt.label}`}
                  style={[
                    styles.segmentBtn,
                    {
                      backgroundColor: active ? theme.primary : theme.surfaceTag,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: active ? theme.primaryFg : theme.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TactilePressable>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardTitleRow}>
            <ShieldIcon
              size={18}
              color={theme.isDark ? theme.primaryBright : theme.primary}
            />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Active Role Permission View
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.textMuted }]}>
            {ROLE_PERSONAS[role].badgeDescription}
          </Text>

          <View style={styles.roleGrid}>
            {ROLES.map((r) => {
              const active = role === r;
              return (
                <TactilePressable
                  key={r}
                  onPress={() => setRole(r)}
                  scaleTo={0.95}
                  containerStyle={{ width: '48.5%' }}
                  accessibilityLabel={ROLE_PERSONAS[r].label}
                  style={[
                    styles.roleBtn,
                    {
                      backgroundColor: active ? theme.primary : theme.surfaceTag,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.roleBtnText,
                      { color: active ? theme.primaryFg : theme.text },
                    ]}
                  >
                    {ROLE_PERSONAS[r].label}
                  </Text>
                </TactilePressable>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>Profile Details</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Full Name</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="Full Name"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.inputField,
                {
                  backgroundColor: theme.surfaceMuted,
                  borderColor: focusedField === 'name' ? activeFocusBorder : theme.border,
                  color: theme.text,
                },
              ]}
            />
          </View>
          <View style={styles.twoColInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Program / Dept</Text>
              <TextInput
                value={programInput}
                onChangeText={setProgramInput}
                onFocus={() => setFocusedField('program')}
                onBlur={() => setFocusedField(null)}
                placeholder="Program"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.inputField,
                  {
                    backgroundColor: theme.surfaceMuted,
                    borderColor: focusedField === 'program' ? activeFocusBorder : theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Year / Title</Text>
              <TextInput
                value={yearInput}
                onChangeText={setYearInput}
                onFocus={() => setFocusedField('year')}
                onBlur={() => setFocusedField(null)}
                placeholder="Year"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.inputField,
                  {
                    backgroundColor: theme.surfaceMuted,
                    borderColor: focusedField === 'year' ? activeFocusBorder : theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>
          </View>
          <TactilePressable
            onPress={() =>
              updateProfile({
                name: nameInput.trim() || profile.name,
                program: programInput.trim() || profile.program,
                year: yearInput.trim() || profile.year,
              })
            }
            scaleTo={0.97}
            accessibilityLabel="Save Profile"
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.saveBtnText, { color: theme.primaryFg }]}>
              Save Profile
            </Text>
          </TactilePressable>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <TactilePressable
            onPress={toggleInspector}
            scaleTo={0.97}
            accessibilityLabel="Open RN Handoff and QA Inspector"
            style={[
              styles.secondaryRowBtn,
              { borderColor: theme.border, backgroundColor: theme.surfaceTag },
            ]}
          >
            <CodeIcon
              size={16}
              color={theme.isDark ? theme.primaryBright : theme.primary}
            />
            <Text style={[styles.secondaryRowText, { color: theme.text }]}>
              Open RN Handoff &amp; QA Inspector
            </Text>
          </TactilePressable>

          <TactilePressable
            onPress={signOut}
            scaleTo={0.97}
            accessibilityLabel="Sign Out or Switch Account"
            style={[styles.secondaryRowBtn, { borderColor: theme.border }]}
          >
            <LogOutIcon size={16} color={theme.text} />
            <Text style={[styles.secondaryRowText, { color: theme.text }]}>
              Sign Out / Switch Account
            </Text>
          </TactilePressable>

          <TactilePressable
            onPress={replayOnboarding}
            scaleTo={0.97}
            accessibilityLabel="Replay Welcome Onboarding"
            style={[styles.secondaryRowBtn, { borderColor: theme.border }]}
          >
            <Text style={[styles.secondaryRowText, { color: theme.text }]}>
              Replay Welcome Onboarding
            </Text>
          </TactilePressable>

          <TactilePressable
            onPress={resetDemoData}
            scaleTo={0.97}
            accessibilityLabel="Reset Campus Demo Data"
            style={[
              styles.secondaryRowBtn,
              { borderColor: theme.danger, backgroundColor: theme.dangerBg },
            ]}
          >
            <RefreshIcon size={16} color={theme.danger} />
            <Text style={[styles.secondaryRowText, { color: theme.danger }]}>
              Reset Campus Demo Data
            </Text>
          </TactilePressable>
        </View>
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
  card: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: FONTS.ui,
    fontSize: 14.5,
    fontWeight: '700',
  },
  cardDesc: {
    fontFamily: FONTS.ui,
    fontSize: 12.5,
    lineHeight: 18,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segmentText: {
    fontFamily: FONTS.ui,
    fontSize: 12.5,
    fontWeight: '600',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBtn: {
    width: '100%',
    minHeight: 40,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  roleBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 12.5,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 4,
  },
  twoColInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  inputLabel: {
    fontFamily: FONTS.ui,
    fontSize: 11.5,
    fontWeight: '600',
  },
  inputField: {
    minHeight: TOUCH_TARGET,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontFamily: FONTS.ui,
    fontSize: 13.5,
    outlineStyle: 'none',
  },
  saveBtn: {
    minHeight: 44,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  saveBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 13.5,
    fontWeight: '700',
  },
  secondaryRowBtn: {
    minHeight: 42,
    borderRadius: RADII.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  secondaryRowText: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    fontWeight: '700',
  },
});
