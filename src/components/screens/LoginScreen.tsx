import React, { useEffect, useState } from 'react';
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
} from '../icons/NavIcons';
import {
  BotanicalLeavesDoodle,
  CrownDoodle,
  PaperPlaneDoodle,
  SwirlDoodle,
} from '../illustrations/CampusArtwork';
import { TactilePressable } from '../ui/RNPrimitives';

export const LoginScreen: React.FC = () => {
  const {
    authPrefillEmail,
    signIn,
    navigate,
    theme,
  } = useCollegeConnect();

  const [email, setEmail] = useState(authPrefillEmail || 'aaryan.sharma@collegeconnect.edu');
  const [password, setPassword] = useState('campus123');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeFocusColor = theme.isDark ? theme.primaryBright : theme.primary;

  useEffect(() => {
    if (authPrefillEmail) {
      setEmail(authPrefillEmail);
    }
  }, [authPrefillEmail]);

  const handleLogin = () => {
    setErrorMsg(null);
    const res = signIn(email, password);
    if (!res.ok) {
      setErrorMsg(res.error ?? 'Unable to sign in.');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Corner decorative sage accents */}
      <View
        pointerEvents="none"
        style={[
          styles.blobTopRight,
          { backgroundColor: theme.sage, opacity: theme.isDark ? 0.35 : 0.6 },
        ]}
      />

      {/* Top Back + Doodles */}
      <View style={styles.topBar}>
        <TactilePressable
          onPress={() => navigate('welcome')}
          scaleTo={0.92}
          accessibilityLabel="Back to welcome"
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

        <PaperPlaneDoodle color={theme.textMuted} width={64} height={32} />
      </View>

      {/* Handwritten Title Header */}
      <View style={styles.heroHeader}>
        <View style={styles.titleRow}>
          <CrownDoodle color={theme.text} width={30} height={20} />
          <SwirlDoodle color={theme.textMuted} size={24} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Sign in to your campus events, clubs &amp; passes.
        </Text>
      </View>

      {/* Main Sign-In Form Card */}
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
              placeholder="name@collegeconnect.edu"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              style={[styles.input, { color: theme.text }]}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.passwordLabelRow}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Password</Text>
            <Pressable
              onPress={() => navigate('forgot_password')}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text
                style={[
                  styles.forgotLink,
                  { color: theme.isDark ? theme.primaryBright : theme.primary },
                ]}
              >
                Forgot password?
              </Text>
            </Pressable>
          </View>

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
              placeholder="Enter your password"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
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

        <TactilePressable
          onPress={handleLogin}
          scaleTo={0.97}
          accessibilityLabel="Sign In"
          style={[
            styles.primaryBtn,
            {
              backgroundColor: theme.primary,
            },
          ]}
        >
          <Text style={[styles.primaryBtnText, { color: theme.primaryFg }]}>
            Sign In
          </Text>
          <ArrowRightIcon size={17} color={theme.primaryFg} />
        </TactilePressable>
      </View>

      {/* New User Account Link */}
      <View style={styles.footerWrap}>
        <Text style={[styles.footerPrompt, { color: theme.textMuted }]}>
          New to CollegeConnect?
        </Text>
        <Pressable
          onPress={() => navigate('signup')}
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
            Create Account
          </Text>
        </Pressable>
      </View>

      <View style={styles.bottomLeaf} pointerEvents="none">
        <BotanicalLeavesDoodle isDark={theme.isDark} size={74} />
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
    gap: 16,
    position: 'relative',
  },
  blobTopRight: {
    position: 'absolute',
    top: -36,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
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
  heroHeader: {
    gap: 2,
    paddingTop: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.handwritten,
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
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
    gap: 14,
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
    gap: 6,
  },
  fieldLabel: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotLink: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
  inputWrap: {
    minHeight: 48,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.ui,
    fontSize: 14,
    height: 44,
    outlineStyle: 'none',
  },
  eyeBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingTop: 2,
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
  bottomLeaf: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.35,
  },
});
