import { useEffect, useState } from 'react';
import { AppState, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import portugueseContent from '../content/pt.json';
import englishContent from '../content/en.json';
import labels from '../website/languages.json';
import type { Message } from '../scripts/parse-message';
import { dayKey, fillPlan, type Plan } from './plan';
import { bookName, findMessage, languageFor, originalLink, withOriginal, type Book, type Language } from './language';
import { readable } from './text';

// UC-05: Portuguese is the original; translations may leave a message out, so the plan uses the Portuguese ids.
const portuguese = (portugueseContent.messages as Message[]).map(readable);
const translations: Record<Language, Message[]> = { pt: portuguese, en: englishContent.messages as Message[] };
const books = portugueseContent.books;
const bookTranslations: Record<Language, Book[]> = { pt: books, en: englishContent.books };

function bookNameIn(language: Language, slug: string): string {
  return bookName(slug, bookTranslations[language], books);
}

function messageIn(language: Language, id: number | undefined): Message | undefined {
  return findMessage(id, translations[language], portuguese);
}

// UC-05, UC-08, UC-09: saved on the phone. The language starts as the phone's.
type Settings = { hour: number; minute: number; enabled: boolean; language: Language };
const DEFAULT_SETTINGS: Settings = {
  hour: 8,
  minute: 0,
  enabled: true,
  language: languageFor(Intl.DateTimeFormat().resolvedOptions().locale),
};

async function loadSettings(): Promise<Settings> {
  const saved = await AsyncStorage.getItem('settings');
  return { ...DEFAULT_SETTINGS, ...(saved ? JSON.parse(saved) : {}) };
}

// Show notifications even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// The link added to shared messages. Switch to our own site's page per message once it exists (#35).
function shareLink(message: Message): string {
  return message.url;
}

function notificationContent(message: Message) {
  return { title: message.title, body: message.paragraphs[0], data: { id: message.id } };
}

// UC-01: give each upcoming day a message and schedule one notification per day at the chosen time.
// Returns false when the phone blocks notifications for the app.
async function scheduleDays(settings: Settings): Promise<{ plan: Plan; allowed: boolean }> {
  const saved = await AsyncStorage.getItem('plan');
  const plan = fillPlan(saved ? JSON.parse(saved) : {}, portuguese.map((m) => m.id), new Date());
  await AsyncStorage.setItem('plan', JSON.stringify(plan));

  // Expo Go can't create channels (#90); Android then uses expo-notifications' fallback channel.
  await Notifications.setNotificationChannelAsync('daily', {
    name: 'Daily message',
    importance: Notifications.AndroidImportance.HIGH,
  }).catch(() => {});
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled) return { plan, allowed: true };
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return { plan, allowed: false };

  const now = new Date();
  let scheduled = 0;
  for (const [day, id] of Object.entries(plan).sort()) {
    if (day.length !== 10) continue; // skip extra messages like '2026-10-16 +1'
    const [year, month, date] = day.split('-').map(Number);
    const at = new Date(year, month - 1, date, settings.hour, settings.minute);
    const message = messageIn(settings.language, id);
    if (at <= now || !message || scheduled === 14) continue;
    await Notifications.scheduleNotificationAsync({
      content: notificationContent(message),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: 'daily' },
    });
    scheduled++;
  }
  return { plan, allowed: true };
}

// The same colours as the website: a clear spring's cool paper, slate ink and teal.
const colors = { paper: '#f6f8f7', ink: '#1d2b2c', muted: '#566464', spring: '#17605b', rule: '#d3dfdc', warning: '#a3261b' };

// A full-width button. The main action is filled; the others are outlined.
function Action({ title, onPress, main = false }: { title: string; onPress: () => void; main?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.action, main && styles.mainAction, pressed && styles.pressed]}
    >
      <Text style={[styles.actionText, main && styles.mainActionText]}>{title}</Text>
    </Pressable>
  );
}

// The options in the menu at the top right, each opening its own screen.
const MENU = [
  { title: 'Index', screen: 'index' },
  { title: 'Settings', screen: 'settings' },
] as const;

// The menu button: three bars, like the website's.
function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={onPress} style={styles.menuButton}>
      <View style={styles.bar} />
      <View style={styles.bar} />
      <View style={styles.bar} />
    </Pressable>
  );
}

export default function App() {
  const [messageId, setMessageId] = useState<number>();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [allowed, setAllowed] = useState(true);
  const [screen, setScreen] = useState<'message' | 'settings' | 'index'>('message');
  const [indexBook, setIndexBook] = useState<string>(); // UC-20: the book picked on the index
  const [showOriginal, setShowOriginal] = useState(false); // UC-18: the Portuguese text after each paragraph
  const [menuOpen, setMenuOpen] = useState(false);
  const tapped = Notifications.useLastNotificationResponse();

  // On open, and when the app comes back to the front on a new day (UC-03.4):
  // top up the schedule and show today's message.
  useEffect(() => {
    let shownDay = '';
    function showToday() {
      const today = dayKey(new Date());
      if (today === shownDay) return;
      const isNewDay = shownDay !== '';
      shownDay = today;
      loadSettings().then(async (saved) => {
        setSettings(saved);
        const { plan, allowed } = await scheduleDays(saved);
        setAllowed(allowed);
        // On the first open, a message opened from a notification (UC-02) stays.
        setMessageId((current) => (isNewDay ? plan[today] : (current ?? plan[today])));
      });
    }
    showToday();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') showToday();
    });
    return () => subscription.remove();
  }, []);

  // UC-02: tapping a notification shows that message.
  useEffect(() => {
    const id = tapped?.notification.request.content.data?.id;
    if (typeof id === 'number') setMessageId(id);
  }, [tapped]);

  // UC-05.3: the current message follows the chosen language.
  const message = messageIn(settings.language, messageId);
  const isTranslation = !!message && !portuguese.includes(message);

  // UC-05.3, UC-08, UC-09: save the change and reschedule; each day keeps its message.
  async function changeSettings(next: Settings) {
    setSettings(next);
    await AsyncStorage.setItem('settings', JSON.stringify(next));
    setAllowed((await scheduleDays(next)).allowed);
  }

  function pickTime() {
    DateTimePickerAndroid.open({
      mode: 'time',
      is24Hour: true,
      value: new Date(2000, 0, 1, settings.hour, settings.minute),
      onChange: (event, date) => {
        if (event.type === 'set' && date) changeSettings({ ...settings, hour: date.getHours(), minute: date.getMinutes() });
      },
    });
  }

  // UC-04: show a different, random message.
  function showAnother() {
    const others = portuguese.filter((m) => m.id !== messageId);
    setMessageId(others[Math.floor(Math.random() * others.length)].id);
  }

  // UC-06: title, body, signature and link through the system share sheet.
  function share() {
    if (!message) return;
    const text = [message.title, ...message.paragraphs, message.signature, shareLink(message)].filter(Boolean).join('\n\n');
    Share.share({ message: text });
  }

  // For testing: the same notification in 10 seconds instead of waiting for 08:00.
  async function sendTest() {
    if (!message) return;
    await Notifications.scheduleNotificationAsync({
      content: notificationContent(message),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 10, channelId: 'daily' },
    });
  }

  if (!message) return null;

  // UC-20: the books at the top; picking one lists its messages.
  if (screen === 'index') {
    const bookMessages = portuguese.filter((m) => m.book === indexBook).map((m) => messageIn(settings.language, m.id)!);
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.page}>
        <Text style={styles.title}>Index</Text>
        <View style={styles.actions}>
          {books.map((book) => (
            <Action key={book.slug} title={bookNameIn(settings.language, book.slug)} onPress={() => setIndexBook(book.slug)} main={book.slug === indexBook} />
          ))}
        </View>
        {indexBook && <Text style={styles.bookTitle}>{bookNameIn(settings.language, indexBook)}</Text>}
        {bookMessages.map((m) => (
          <Text
            key={m.id}
            style={styles.indexItem}
            onPress={() => {
              setMessageId(m.id);
              setScreen('message');
            }}
          >
            {m.title}
          </Text>
        ))}
        <View style={styles.backButton}>
          <Action title="Back" onPress={() => (indexBook ? setIndexBook(undefined) : setScreen('message'))} />
        </View>
      </ScrollView>
    );
  }

  if (screen === 'settings') {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.page}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.settings}>
          <View style={styles.row}>
            <Text style={styles.label}>Daily notification</Text>
            <Switch
              value={settings.enabled}
              onValueChange={(enabled) => changeSettings({ ...settings, enabled })}
              trackColor={{ true: colors.spring }}
            />
          </View>
          {settings.enabled && (
            <Action
              title={`Time: ${String(settings.hour).padStart(2, '0')}:${String(settings.minute).padStart(2, '0')}`}
              onPress={pickTime}
            />
          )}
          {settings.enabled && !allowed && (
            <View>
              <Text style={styles.warning}>Notifications are blocked for this app in the phone settings.</Text>
              <Action title="Open phone settings" onPress={() => Linking.openSettings()} />
            </View>
          )}
          <Text style={styles.label}>Language</Text>
          {(['en', 'pt'] as const).map((language) => (
            <Action
              key={language}
              title={labels[language].name}
              onPress={() => changeSettings({ ...settings, language })}
              main={language === settings.language}
            />
          ))}
          <Action title="Test notification in 10 seconds" onPress={sendTest} />
          <Action title="Back" onPress={() => setScreen('message')} main />
        </View>
      </ScrollView>
    );
  }

  // UC-18: a translation can show the Portuguese original after each paragraph.
  const original = messageIn('pt', message.id)!;
  const comparing = isTranslation && showOriginal;
  const paragraphs = comparing
    ? withOriginal(message.paragraphs, original.paragraphs)
    : message.paragraphs.map((text) => ({ text, isOriginal: false }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.page}>
      <View style={styles.topBar}>
        {isTranslation ? (
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: showOriginal }}
            onPress={() => setShowOriginal(!showOriginal)}
            style={[styles.pill, showOriginal && styles.pillOn]}
          >
            <Text style={[styles.pillText, showOriginal && styles.pillTextOn]}>{labels.en.original}</Text>
          </Pressable>
        ) : (
          <Text style={[styles.pill, styles.originalMark]}>{labels.pt.original}</Text>
        )}
        <MenuButton onPress={() => setMenuOpen(true)} />
      </View>
      {/* The menu opens under the button at the top right; tapping outside closes it. */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.menu}>
            {MENU.map((item) => (
              <Pressable
                key={item.screen}
                accessibilityRole="button"
                onPress={() => {
                  setMenuOpen(false);
                  setScreen(item.screen);
                }}
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              >
                <Text style={styles.menuItemText}>{item.title}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
      <Text style={styles.title}>{message.title}</Text>
      {comparing && <Text style={[styles.paragraph, styles.original]}>{original.title}</Text>}
      <Text style={styles.source}>
        {bookNameIn(settings.language, message.book ?? '')} · {message.chapter}
      </Text>
      {paragraphs.map((paragraph, i) => (
        <Text key={i} style={paragraph.isOriginal ? [styles.paragraph, styles.original] : styles.paragraph}>
          {paragraph.text}
        </Text>
      ))}
      {message.signature && <Text style={styles.signature}>{message.signature}</Text>}
      <View style={styles.actions}>
        <Action title="Another message" onPress={showAnother} main />
        <Action title="Share" onPress={share} />
        <Action title="Open on fonteviva.org" onPress={() => Linking.openURL(originalLink(message.url, settings.language))} />
      </View>
      <View style={styles.links}>
        <Pressable accessibilityRole="button" onPress={() => setScreen('index')} style={styles.link}>
          <Text style={styles.linkText}>Index</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setScreen('settings')} style={styles.link}>
          <Text style={styles.linkText}>Settings</Text>
        </Pressable>
      </View>
      <Text style={styles.disclaimer}>
        {labels.en.disclaimer}
        {isTranslation && ` ${labels.en.translationDisclaimer}`}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.paper },
  page: { padding: 24, paddingTop: 64, paddingBottom: 48 },
  title: { fontFamily: 'serif', fontSize: 34, lineHeight: 40, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  source: { fontSize: 14, color: colors.muted, marginBottom: 28 },
  paragraph: { fontFamily: 'serif', fontSize: 19, lineHeight: 31, color: colors.ink, marginBottom: 16 },
  signature: { fontFamily: 'serif', fontSize: 19, fontStyle: 'italic', color: colors.ink, textAlign: 'right', marginTop: 12 },
  actions: { gap: 12, marginTop: 40 },
  action: { minHeight: 52, borderRadius: 26, borderWidth: 1.5, borderColor: colors.spring, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  mainAction: { backgroundColor: colors.spring },
  pressed: { opacity: 0.7 },
  actionText: { fontSize: 17, fontWeight: '600', color: colors.spring },
  mainActionText: { color: colors.paper },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  menuButton: { width: 48, height: 48, marginTop: -8, marginRight: -8, alignItems: 'center', justifyContent: 'center', gap: 5 },
  bar: { width: 22, height: 2, borderRadius: 1, backgroundColor: colors.ink },
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.15)' },
  menu: { position: 'absolute', top: 104, right: 16, minWidth: 200, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.rule, elevation: 6 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 20 },
  menuItemText: { fontSize: 17, color: colors.ink },
  settings: { gap: 12, marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, borderBottomWidth: 1, borderColor: colors.rule },
  label: { fontSize: 18, color: colors.ink },
  warning: { color: colors.warning, marginBottom: 8 },
  pill: { alignSelf: 'flex-start', borderWidth: 1.5, borderColor: colors.spring, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 16 },
  pillOn: { backgroundColor: colors.spring },
  pillText: { fontSize: 15, fontWeight: '600', color: colors.spring },
  pillTextOn: { color: colors.paper },
  originalMark: { borderColor: colors.rule, fontSize: 15, color: colors.muted },
  original: { fontStyle: 'italic', color: colors.muted, borderLeftWidth: 3, borderColor: colors.rule, paddingLeft: 12 },
  disclaimer: { fontSize: 13, color: colors.muted, marginTop: 24 },
  backButton: { marginTop: 32 },
  bookTitle: { fontFamily: 'serif', fontSize: 24, fontWeight: '600', color: colors.ink, marginTop: 36, marginBottom: 8 },
  indexItem: { fontFamily: 'serif', fontSize: 18, color: colors.spring, paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.rule },
});
