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
  CheckCircleIcon,
  ChevronLeftIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  LockIcon,
  MailIcon,
} from '../icons/NavIcons';
import { PaperPlaneDoodle, SwirlDoodle } from '../illustrations/CampusArtwork';
import { TactilePressable } from '../ui/RNPrimitives';

export const ForgotPasswordScreen: React.FC = () => {
  const {
    authPrefillEmail,
    requestPasswordReset,
    resetPassword,
    navigate,
    theme,
  } = useCollegeConnect();

  const [step, setStep] = useState<'email' | 'verify' | 'done'>('email');
  const [email, setEmail] = useState(authPrefillEmail || 'aaryan.sharma@collegeconnect.edu');
  const [issuedCode, setIssuedCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    'email' | 'code' | 'newPassword' | 'confirm' | null
  >(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeFocusColor = theme.isDark ? theme.primaryBright : theme.primary;

  const handleSendCode = () => {
    setErrorMsg(null);
    const res = requestPasswordReset(email);
    if (!res.ok || !res.code) {
      setErrorMsg(res.error ?? 'Could not send verification code.');
      return;
    }
    setIssuedCode(res.code);
    setCodeInput('');
    setStep('verify');
  };

  const handleReset = () => {
    setErrorMsg(null);
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    const res = resetPassword(email, codeInput, newPassword);
    if (!res.ok) {
      setErrorMsg(res.error ?? 'Could not reset password.');
      return;
    }
    setStep('done');
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
          styles.blobTopRight,
          { backgroundColor: theme.sage, opacity: theme.isDark ? 0.32 : 0.55 },
        ]}
      />

      <View style={styles.topBar}>
        <TactilePressable
          onPress={() => (step === 'verify' ? setStep('email') : navigate('login'))}
          scaleTo={0.92}
          accessibilityLabel="Back"
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

        <PaperPlaneDoodle color={theme.textMuted} width={60} height={30} />
      </View>

      <View style={styles.heroHeader}>
        <View style={styles.titleRow}>
          <KeyIcon size={22} color={theme.isDark ? theme.primaryBright : theme.primary} />
          <SwirlDoodle color={theme.textMuted} size={24} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {step === 'email'
            ? 'Enter your registered campus email to receive a 6-digit recovery code.'
            : step === 'verify'
            ? 'Enter the 6-digit code and choose a fresh password.'
            : 'Your campus account password has been updated.'}
        </Text>
      </View>

      {/* Step Progress Indicator */}
      <View style={styles.stepRow}>
        {[
          { key: 'email', num: '1', label: 'Email' },
          { key: 'verify', num: '2', label: 'Verify' },
          { key: 'done', num: '3', label: 'Updated' },
        ].map((item, idx) => {
          const activeIdx = step === 'email' ? 0 : step === 'verify' ? 1 : 2;
          const active = idx <= activeIdx;
          return (
            <View key={item.key} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: active ? theme.primary : theme.surfaceTag,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepNum,
                    styles.tabular,
                    { color: active ? theme.primaryFg : theme.textMuted },
                  ]}
                >
                  {item.num}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  { color: active ? theme.text : theme.textMuted },
                ]}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>

      {step === 'email' ? (
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
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
              Registered University Email
            </Text>
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
                returnKeyType="done"
                onSubmitEditing={handleSendCode}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          <TactilePressable
            onPress={handleSendCode}
            scaleTo={0.97}
            accessibilityLabel="Send Recovery Code"
            style={[
              styles.primaryBtn,
              { backgroundColor: theme.primary },
            ]}
          >
            <Text style={[styles.primaryBtnText, { color: theme.primaryFg }]}>
              Send Recovery Code
            </Text>
            <ArrowRightIcon size={17} color={theme.primaryFg} />
          </TactilePressable>
        </View>
      ) : step === 'verify' ? (
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Kraft Demo Inbox Note showing OTP so user can test immediately */}
          <View
            style={[
              styles.codeBanner,
              { backgroundColor: theme.note, borderColor: theme.border },
            ]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.codeBannerTitle, { color: theme.noteInk }]}>
                Campus Inbox Code Sent
              </Text>
              <Text style={[styles.codeBannerBody, styles.tabular, { color: theme.noteInk }]}>
                Use code {issuedCode} for {email.trim().toLowerCase()}
              </Text>
            </View>
            <TactilePressable
              onPress={() => setCodeInput(issuedCode)}
              scaleTo={0.92}
              accessibilityLabel="Autofill verification code"
              style={[styles.autofillBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.autofillText, { color: theme.primaryFg }]}>Fill</Text>
            </TactilePressable>
          </View>

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
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
              6-Digit Verification Code
            </Text>
            <View
              style={[
                styles.inputWrapPlain,
                {
                  backgroundColor: theme.surfaceMuted,
                  borderColor: focusedField === 'code' ? activeFocusColor : theme.border,
                },
              ]}
            >
              <TextInput
                value={codeInput}
                onChangeText={(t) => {
                  setCodeInput(t);
                  if (errorMsg) setErrorMsg(null);
                }}
                onFocus={() => setFocusedField('code')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter 6-digit code"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                style={[styles.input, styles.tabular, { color: theme.text }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
              New Password (min. 6 characters)
            </Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: theme.surfaceMuted,
                  borderColor: focusedField === 'newPassword' ? activeFocusColor : theme.border,
                },
              ]}
            >
              <LockIcon
                size={17}
                color={focusedField === 'newPassword' ? activeFocusColor : theme.textMuted}
              />
              <TextInput
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  if (errorMsg) setErrorMsg(null);
                }}
                onFocus={() => setFocusedField('newPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter new password"
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
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
              Confirm New Password
            </Text>
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
                placeholder="Re-enter new password"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleReset}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          <TactilePressable
            onPress={handleReset}
            scaleTo={0.97}
            accessibilityLabel="Update Password"
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.primaryBtnText, { color: theme.primaryFg }]}>
              Update Password
            </Text>
            <ArrowRightIcon size={17} color={theme.primaryFg} />
          </TactilePressable>
        </View>
      ) : (
        <View
          style={[
            styles.successCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.successIconWrap, { backgroundColor: theme.successBg }]}>
            <CheckCircleIcon size={28} color={theme.success} />
          </View>
          <Text style={[styles.successTitle, { color: theme.text }]}>
            Password Reset Complete
          </Text>
          <Text style={[styles.successDesc, { color: theme.textMuted }]}>
            Your new password is active for {email.trim().toLowerCase()}. You can now sign in to your campus account.
          </Text>
          <TactilePressable
            onPress={() => navigate('login')}
            scaleTo={0.97}
            containerStyle={{ width: '100%' }}
            accessibilityLabel="Back to Sign In"
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.primaryBtnText, { color: theme.primaryFg }]}>
              Back to Sign In
            </Text>
            <ArrowRightIcon size={17} color={theme.primaryFg} />
          </TactilePressable>
        </View>
      )}

      {step !== 'done' ? (
        <View style={styles.footerWrap}>
          <Text style={[styles.footerPrompt, { color: theme.textMuted }]}>
            Remembered your password?
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
      ) : null}
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
  heroHeader: {
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
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
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 2,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontFamily: FONTS.ui,
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabel: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: RADII.xxl,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  codeBanner: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codeBannerTitle: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
  },
  codeBannerBody: {
    fontFamily: FONTS.ui,
    fontSize: 11.5,
  },
  autofillBtn: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autofillText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 14,
    height: 42,
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
  successCard: {
    borderRadius: RADII.xxl,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    gap: 12,
  },
  successIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontFamily: FONTS.ui,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  successDesc: {
    fontFamily: FONTS.ui,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
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
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
