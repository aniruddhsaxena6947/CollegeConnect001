import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCollegeConnect } from '../../context/CollegeConnectContext';
import { FONTS, RADII, SPACING, TOUCH_TARGET } from '../../theme/tokens';
import {
  AlertCircleIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from '../icons/NavIcons';
import { SparkStarDoodle, SwirlDoodle } from '../illustrations/CampusArtwork';
import { TactilePressable } from '../ui/RNPrimitives';

export const SignUpScreen: React.FC = () => {
  const { signUp, navigate, theme } = useCollegeConnect();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [program, setProgram] = useState('BCA');
  const [year, setYear] = useState('1st Year');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    'name' | 'email' | 'program' | 'year' | 'studentId' | 'password' | 'confirm' | null
  >(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeFocusColor = theme.isDark ? theme.primaryBright : theme.primary;

  const handleCreateAccount = () => {
    setErrorMsg(null);
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Re-enter both fields.');
      return;
    }

    const res = signUp({
      name,
      email,
      program,
      year,
      studentId,
      password,
    });
    if (!res.ok) {
      setErrorMsg(res.error ?? 'Unable to create account.');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View
        pointerEvents="none"
        style={[
          styles.blobTopLeft,
          { backgroundColor: theme.sage, opacity: theme.isDark ? 0.3 : 0.55 },
        ]}
      />

      <View style={styles.topBar}>
        <TactilePressable
          onPress={() => navigate('login')}
          scaleTo={0.92}
          accessibilityLabel="Back to sign in"
          style={[
            styles.backBtn,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <ChevronLeftIcon size={20} color={theme.text} />
        </TactilePressable>

        <View style={styles.doodlesRight}>
          <SparkStarDoodle color={theme.text} size={18} />
          <SwirlDoodle color={theme.textMuted} size={24} />
        </View>
      </View>

      <View style={styles.heroHeader}>
        <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Join CollegeConnect for events, clubs &amp; student passes.
        </Text>
      </View>

      <View
        style={[
          styles.formCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {errorMsg ? (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: theme.dangerBg, borderColor: theme.danger },
            ]}
          >
            <AlertCircleIcon size={16} color={theme.danger} />
            <Text style={[styles.errorText, { color: theme.danger }]}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Full Name</Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: theme.surfaceMuted,
                borderColor: focusedField === 'name' ? activeFocusColor : theme.border,
              },
            ]}
          >
            <UserIcon
              size={17}
              color={focusedField === 'name' ? activeFocusColor : theme.textMuted}
            />
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (errorMsg) setErrorMsg(null);
              }}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Ananya Verma"
              placeholderTextColor={theme.textMuted}
              returnKeyType="next"
              style={[styles.input, { color: theme.text }]}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>University Email</Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: theme.surfaceMuted,
                borderColor: focusedField === 'email' ? activeFocusColor : theme.border,
              },
            ]}
          >
            <MailIcon
              size={17}
              color={focusedField === 'email' ? activeFocusColor : theme.textMuted}
            />
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errorMsg) setErrorMsg(null);
              }}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="you@collegeconnect.edu"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              style={[styles.input, { color: theme.text }]}
            />
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Program</Text>
            <View
              style={[
                styles.inputWrapPlain,
                {
                  backgroundColor: theme.surfaceMuted,
                  borderColor: focusedField === 'program' ? activeFocusColor : theme.border,
                },
              ]}
            >
              <TextInput
                value={program}
                onChangeText={setProgram}
                onFocus={() => setFocusedField('program')}
                onBlur={() => setFocusedField(null)}
                placeholder="B.Tech CS"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Year</Text>
            <View
              style={[
                styles.inputWrapPlain,
                {
                  backgroundColor: theme.surfaceMuted,
                  borderColor: focusedField === 'year' ? activeFocusColor : theme.border,
                },
              ]}
            >
              <TextInput
                value={year}
                onChangeText={setYear}
                onFocus={() => setFocusedField('year')}
                onBlur={() => setFocusedField(null)}
                placeholder="1st Year"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
            Student ID (Optional)
          </Text>
          <View
            style={[
              styles.inputWrapPlain,
              {
                backgroundColor: theme.surfaceMuted,
                borderColor: focusedField === 'studentId' ? activeFocusColor : theme.border,
              },
            ]}
          >
            <TextInput
              value={studentId}
              onChangeText={setStudentId}
              onFocus={() => setFocusedField('studentId')}
              onBlur={() => setFocusedField(null)}
              placeholder="Auto-generated if left blank (e.g. CC-2025-0642)"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="characters"
              style={[styles.input, { color: theme.text }]}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
            Password (min. 6 characters)
          </Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: theme.surfaceMuted,
                borderColor: focusedField === 'password' ? activeFocusColor : theme.border,
              },
            ]}
          >
            <LockIcon
              size={17}
              color={focusedField === 'password' ? activeFocusColor : theme.textMuted}
            />
            <TextInput
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errorMsg) setErrorMsg(null);
              }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="Create a password"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={[styles.input, { color: theme.text }]}
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              style={styles.eyeBtn}
            >
              {showPassword ? (
                <EyeOffIcon size={17} color={theme.textMuted} />
              ) : (
                <EyeIcon size={17} color={theme.textMuted} />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Confirm Password</Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: theme.surfaceMuted,
                borderColor: focusedField === 'confirm' ? activeFocusColor : theme.border,
              },
            ]}
          >
            <LockIcon
              size={17}
              color={focusedField === 'confirm' ? activeFocusColor : theme.textMuted}
            />
            <TextInput
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (errorMsg) setErrorMsg(null);
              }}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              placeholder="Re-enter password"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleCreateAccount}
              style={[styles.input, { color: theme.text }]}
            />
          </View>
        </View>

        {/* Governance Note */}
        <View
          style={[
            styles.governanceNote,
            { backgroundColor: theme.note, borderColor: theme.border },
          ]}
        >
          <ShieldIcon size={16} color={theme.noteInk} />
          <Text style={[styles.governanceText, { color: theme.noteInk }]}>
            New self-registered accounts start with Student access. Official publishing roles are provisioned by university administrators.
          </Text>
        </View>

        <TactilePressable
          onPress={handleCreateAccount}
          scaleTo={0.97}
          accessibilityLabel="Create Account"
          style={[
            styles.primaryBtn,
            {
              backgroundColor: theme.primary,
            },
          ]}
        >
          <Text style={[styles.primaryBtnText, { color: theme.primaryFg }]}>
            Create Account
          </Text>
          <ArrowRightIcon size={17} color={theme.primaryFg} />
        </TactilePressable>
      </View>

      <View style={styles.footerWrap}>
        <Text style={[styles.footerPrompt, { color: theme.textMuted }]}>
          Already have an account?
        </Text>
        <Pressable
          onPress={() => navigate('login')}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.footerActionBtn}
        >
          <Text
            style={[
              styles.footerActionText,
              { color: theme.isDark ? theme.primaryBright : theme.primary },
            ]}
          >
            Sign In
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 40,
    paddingBottom: 32,
    gap: 14,
    position: 'relative',
  },
  blobTopLeft: {
    position: 'absolute',
    top: -32,
    left: -36,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doodlesRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroHeader: {
    gap: 2,
  },
  title: {
    fontFamily: FONTS.handwritten,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: FONTS.ui,
    fontSize: 13.5,
    lineHeight: 19,
  },
  formCard: {
    borderRadius: RADII.xxl,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  errorBox: {
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontFamily: FONTS.ui,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
  fieldGroup: {
    gap: 5,
  },
  fieldLabel: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrap: {
    minHeight: 46,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrapPlain: {
    minHeight: 46,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: FONTS.ui,
    fontSize: 13.5,
    height: 42,
    outlineStyle: 'none',
  },
  eyeBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  governanceNote: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  governanceText: {
    flex: 1,
    fontFamily: FONTS.ui,
    fontSize: 11.5,
    lineHeight: 16,
  },
  primaryBtn: {
    minHeight: 50,
    borderRadius: RADII.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },
  primaryBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 15,
    fontWeight: '700',
  },
  footerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerPrompt: {
    fontFamily: FONTS.ui,
    fontSize: 13,
  },
  footerActionBtn: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  footerActionText: {
    fontFamily: FONTS.ui,
    fontSize: 13.5,
    fontWeight: '700',
  },
});
