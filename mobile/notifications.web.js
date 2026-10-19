// Stand-in for expo-notifications in the web build, which only exists to take screenshots (docs/development.md#screenshots).
// Browsers can't schedule these notifications, so every call does nothing.
const nothing = async () => {};

module.exports = {
  setNotificationHandler: () => {},
  setNotificationChannelAsync: nothing,
  cancelAllScheduledNotificationsAsync: nothing,
  requestPermissionsAsync: async () => ({ granted: true }),
  scheduleNotificationAsync: nothing,
  useLastNotificationResponse: () => null,
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
};
