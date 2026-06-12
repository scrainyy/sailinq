import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SailinqColors, SailinqRadius } from '@/constants/sailinq';

/** Pokazywane dopóki w src/config.ts nie ma prawdziwych kluczy Supabase. */
export function SetupNeeded() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.icon}>
          <Ionicons name="server-outline" size={32} color={SailinqColors.mint} />
        </View>
        <Text style={styles.title}>Prawie gotowe!</Text>
        <Text style={styles.sub}>
          Brakuje tylko podłączenia bazy danych Supabase. Wykonaj 3 kroki, a aplikacja ożyje.
        </Text>

        <Step n="1" text="Załóż darmowy projekt na supabase.com" />
        <Step n="2" text="Wklej plik supabase-schema.sql w SQL Editor i kliknij Run" />
        <Step n="3" text="Skopiuj Project URL i klucz anon do pliku src/config.ts" />

        <View style={styles.hintBox}>
          <Text style={styles.hintText}>
            Po wklejeniu kluczy ten ekran sam zniknie i pojawi się logowanie.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SailinqColors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  icon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: SailinqColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: { color: SailinqColors.text, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  sub: {
    color: SailinqColors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 28,
    lineHeight: 22,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: SailinqColors.surface,
    padding: 16,
    borderRadius: SailinqRadius.md,
    marginBottom: 12,
  },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: SailinqColors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: SailinqColors.mintDark, fontWeight: '800', fontSize: 15 },
  stepText: { color: SailinqColors.text, fontSize: 15, flex: 1, lineHeight: 21 },
  hintBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: SailinqRadius.md,
    backgroundColor: 'rgba(87,224,198,0.1)',
  },
  hintText: { color: SailinqColors.mint, fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
