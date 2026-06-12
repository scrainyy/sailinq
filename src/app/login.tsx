import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SailinqColors, SailinqRadius } from '@/constants/sailinq';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError('Podaj email i hasło.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Podaj swoje imię.');
      return;
    }
    setBusy(true);
    const res =
      mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, name.trim());
    setBusy(false);

    if (res.error) {
      setError(translateError(res.error));
    } else if (mode === 'signup') {
      setInfo('Konto utworzone! Sprawdź email, aby potwierdzić, a potem zaloguj się.');
      setMode('login');
    }
  };

  return (
    <LinearGradient
      colors={[SailinqColors.bgGradientTop, SailinqColors.bg, SailinqColors.bgGradientBottom]}
      style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Logo + hasło */}
            <View style={styles.brand}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.brandName}>SAILINQ</Text>
              <Text style={styles.tagline}>
                Już nigdy <Text style={{ color: SailinqColors.mint }}>sam</Text> na pokładzie.
              </Text>
            </View>

            {/* Przełącznik login / rejestracja */}
            <View style={styles.toggle}>
              <Pressable
                style={[styles.toggleBtn, mode === 'login' && styles.toggleBtnActive]}
                onPress={() => setMode('login')}>
                <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>
                  Logowanie
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, mode === 'signup' && styles.toggleBtnActive]}
                onPress={() => setMode('signup')}>
                <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
                  Rejestracja
                </Text>
              </Pressable>
            </View>

            {/* Formularz */}
            <View style={styles.form}>
              {mode === 'signup' && (
                <Input icon="person-outline" placeholder="Imię" value={name} onChangeText={setName} />
              )}
              <Input
                icon="mail-outline"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                icon="lock-closed-outline"
                placeholder="Hasło"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              {error && <Text style={styles.error}>{error}</Text>}
              {info && <Text style={styles.info}>{info}</Text>}

              <Pressable style={styles.submit} onPress={submit} disabled={busy}>
                {busy ? (
                  <ActivityIndicator color={SailinqColors.mintDark} />
                ) : (
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Input({
  icon,
  ...props
}: { icon: keyof typeof Ionicons.glyphMap } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={20} color={SailinqColors.textMuted} />
      <TextInput
        placeholderTextColor={SailinqColors.textFaint}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

function translateError(msg: string): string {
  if (/Invalid login credentials/i.test(msg)) return 'Błędny email lub hasło.';
  if (/already registered/i.test(msg)) return 'Ten email jest już zarejestrowany.';
  if (/at least 6/i.test(msg)) return 'Hasło musi mieć min. 6 znaków.';
  if (/Email not confirmed/i.test(msg)) return 'Potwierdź email klikając link, który wysłaliśmy.';
  return msg;
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  brand: { alignItems: 'center', marginBottom: 36 },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 16,
  },
  brandName: { color: SailinqColors.text, fontSize: 24, fontWeight: '800', letterSpacing: 3 },
  tagline: { color: SailinqColors.textMuted, fontSize: 16, marginTop: 8, fontWeight: '500' },
  toggle: {
    flexDirection: 'row',
    backgroundColor: SailinqColors.surface,
    borderRadius: SailinqRadius.pill,
    padding: 4,
    marginBottom: 22,
  },
  toggleBtn: { flex: 1, paddingVertical: 11, borderRadius: SailinqRadius.pill, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: SailinqColors.mint },
  toggleText: { color: SailinqColors.textMuted, fontWeight: '700', fontSize: 14 },
  toggleTextActive: { color: SailinqColors.mintDark },
  form: { gap: 14 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SailinqColors.surface,
    borderRadius: SailinqRadius.md,
    paddingHorizontal: 16,
    height: 56,
  },
  input: { flex: 1, color: SailinqColors.text, fontSize: 16 },
  error: { color: SailinqColors.nope, fontSize: 14, marginTop: 2 },
  info: { color: SailinqColors.mint, fontSize: 14, marginTop: 2, lineHeight: 20 },
  submit: {
    backgroundColor: SailinqColors.mint,
    borderRadius: SailinqRadius.pill,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: { color: SailinqColors.mintDark, fontSize: 16, fontWeight: '800' },
});
