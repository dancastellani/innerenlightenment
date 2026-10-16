import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import content from '../content/pt.json';
import type { Message } from '../scripts/parse-message';
import { dayKey, fillPlan, type Plan } from './plan';

const messages = content.messages as Message[];
const books = content.books;
const bookNames = Object.fromEntries(books.map((b) => [b.slug, b.name]));

// UC-08, UC-09: saved on the phone.
type Settings = { hour: number; minute: number; enabled: boolean };
const DEFAULT_SETTINGS: Settings = { hour: 8, minute: 0, enabled: true };

async function loadSettings(): Promise<Settings> {
  const saved = await AsyncStorage.getItem('settings');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
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
  const plan = fillPlan(saved ? JSON.parse(saved) : {}, messages.map((m) => m.id), new Date());
  await AsyncStorage.setItem('plan', JSON.stringify(plan));

  await Notifications.setNotificationChannelAsync('daily', {
    name: 'Daily message',
    importance: Notifications.AndroidImportance.HIGH,
  });
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
    const message = messages.find((m) => m.id === id);
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

export default function App() {
  const [message, setMessage] = useState<Message>();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [allowed, setAllowed] = useState(true);
  const [screen, setScreen] = useState<'message' | 'settings' | 'index'>('message');
  const [indexBook, setIndexBook] = useState<string>(); // UC-20: the book picked on the index
  const tapped = Notifications.useLastNotificationResponse();

  // On open: top up the schedule and show today's message.
  useEffect(() => {
    loadSettings().then(async (saved) => {
      setSettings(saved);
      const { plan, allowed } = await scheduleDays(saved);
      setAllowed(allowed);
      setMessage((current) => current ?? messages.find((m) => m.id === plan[dayKey(new Date())]));
    });
  }, []);

  // UC-02: tapping a notification shows that message.
  useEffect(() => {
    const id = tapped?.notification.request.content.data?.id;
    const found = messages.find((m) => m.id === id);
    if (found) setMessage(found);
  }, [tapped]);

  // UC-08, UC-09: save the change and reschedule; each day keeps its message.
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
    const others = messages.filter((m) => m !== message);
    setMessage(others[Math.floor(Math.random() * others.length)]);
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
    const bookMessages = messages.filter((m) => m.book === indexBook);
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.page}>
        <Text style={styles.title}>Index</Text>
        <View style={styles.actions}>
          {books.map((book) => (
            <Action key={book.slug} title={book.name} onPress={() => setIndexBook(book.slug)} main={book.slug === indexBook} />
          ))}
        </View>
        {indexBook && <Text style={styles.bookTitle}>{bookNames[indexBook]}</Text>}
        {bookMessages.map((m) => (
          <Text
            key={m.id}
            style={styles.indexItem}
            onPress={() => {
              setMessage(m);
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
          <Action title="Test notification in 10 seconds" onPress={sendTest} />
          <Action title="Back" onPress={() => setScreen('message')} main />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.page}>
      <Text style={styles.title}>{message.title}</Text>
      <Text style={styles.source}>
        {bookNames[message.book ?? '']} · {message.chapter}
      </Text>
      {message.paragraphs.map((text, i) => (
        <Text key={i} style={styles.paragraph}>
          {text}
        </Text>
      ))}
      {message.signature && <Text style={styles.signature}>{message.signature}</Text>}
      <View style={styles.actions}>
        <Action title="Another message" onPress={showAnother} main />
        <Action title="Share" onPress={share} />
        <Action title="Open on fonteviva.org" onPress={() => Linking.openURL(message.url)} />
      </View>
      <View style={styles.links}>
        <Pressable accessibilityRole="button" onPress={() => setScreen('index')} style={styles.link}>
          <Text style={styles.linkText}>Index</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setScreen('settings')} style={styles.link}>
          <Text style={styles.linkText}>Settings</Text>
        </Pressable>
      </View>
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
  links: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 28 },
  link: { padding: 12 },
  linkText: { fontSize: 16, color: colors.muted, textDecorationLine: 'underline' },
  settings: { gap: 12, marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, borderBottomWidth: 1, borderColor: colors.rule },
  label: { fontSize: 18, color: colors.ink },
  warning: { color: colors.warning, marginBottom: 8 },
  backButton: { marginTop: 32 },
  bookTitle: { fontFamily: 'serif', fontSize: 24, fontWeight: '600', color: colors.ink, marginTop: 36, marginBottom: 8 },
  indexItem: { fontFamily: 'serif', fontSize: 18, color: colors.spring, paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.rule },
});
