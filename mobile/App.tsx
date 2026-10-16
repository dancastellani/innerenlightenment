import { useEffect, useState } from 'react';
import { Button, Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import content from '../content/pt.json';
import type { Message } from '../scripts/parse-message';
import { addAnother, dayKey, fillPlan, type Plan } from './plan';

const messages = content.messages as Message[];
const bookNames = Object.fromEntries(content.books.map((b) => [b.slug, b.name]));
const HOUR = 8;

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

// UC-01: give each upcoming day a message and schedule one notification per day at 08:00.
async function scheduleDays(): Promise<Plan> {
  const saved = await AsyncStorage.getItem('plan');
  const plan = fillPlan(saved ? JSON.parse(saved) : {}, messages.map((m) => m.id), new Date());
  await AsyncStorage.setItem('plan', JSON.stringify(plan));

  await Notifications.setNotificationChannelAsync('daily', {
    name: 'Daily message',
    importance: Notifications.AndroidImportance.HIGH,
  });
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return plan;

  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = new Date();
  let scheduled = 0;
  for (const [day, id] of Object.entries(plan).sort()) {
    if (day.length !== 10) continue; // skip extra messages like '2026-10-16 +1'
    const [year, month, date] = day.split('-').map(Number);
    const at = new Date(year, month - 1, date, HOUR);
    const message = messages.find((m) => m.id === id);
    if (at <= now || !message || scheduled === 14) continue;
    await Notifications.scheduleNotificationAsync({
      content: notificationContent(message),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: 'daily' },
    });
    scheduled++;
  }
  return plan;
}

export default function App() {
  const [message, setMessage] = useState<Message>();
  const tapped = Notifications.useLastNotificationResponse();

  // On open: top up the schedule and show today's message.
  useEffect(() => {
    scheduleDays().then((plan) => {
      setMessage((current) => current ?? messages.find((m) => m.id === plan[dayKey(new Date())]));
    });
  }, []);

  // UC-02: tapping a notification shows that message.
  useEffect(() => {
    const id = tapped?.notification.request.content.data?.id;
    const found = messages.find((m) => m.id === id);
    if (found) setMessage(found);
  }, [tapped]);

  // UC-04: show a message not seen recently, and remember it.
  async function showAnother() {
    const saved = await AsyncStorage.getItem('plan');
    const [plan, id] = addAnother(saved ? JSON.parse(saved) : {}, messages.map((m) => m.id), new Date());
    await AsyncStorage.setItem('plan', JSON.stringify(plan));
    setMessage(messages.find((m) => m.id === id));
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

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.source}>
        {bookNames[message.book ?? '']} · {message.chapter}
      </Text>
      <Text style={styles.title}>{message.title}</Text>
      {message.paragraphs.map((text, i) => (
        <Text key={i} style={styles.paragraph}>
          {text}
        </Text>
      ))}
      {message.signature && <Text style={styles.signature}>{message.signature}</Text>}
      <View style={styles.actions}>
        <Button title="Another message" onPress={showAnother} />
        <Button title="Share" onPress={share} />
        <Button title="Open on fonteviva.org" onPress={() => Linking.openURL(message.url)} />
      </View>
      <View style={styles.test}>
        <Button title="Test notification in 10 seconds" onPress={sendTest} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 24, paddingTop: 64 },
  source: { color: '#666', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
  paragraph: { fontSize: 18, lineHeight: 28, marginBottom: 12 },
  signature: { fontSize: 18, fontStyle: 'italic', textAlign: 'right', marginTop: 8 },
  actions: { gap: 12, marginTop: 24 },
  test: { marginTop: 32 },
});
