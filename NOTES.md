## APIs & Native Modules Used

Since this application operates completely offline without a remote backend, it relies on the following Native & Expo Device APIs:

1. **Expo Notifications API (`expo-notifications`)**
   - **`requestPermissionsAsync` / `getPermissionsAsync`**: Requests notification permission in-context when the user saves their first medication rather than on cold app launch.
   - **`setNotificationChannelAsync`**: Configures a high-priority Android notification channel (`med-alarm-v3`) with custom sound (`alarm.mp3`), vibration patterns, and DND bypass.
   - **`setNotificationCategoryAsync`**: Registers interactive notification action buttons (`Snooze (10m)` and `Mark Taken`) directly on the lock screen/notification tray.
   - **`scheduleNotificationAsync`**: Schedules daily recurring reminders (`DAILY` trigger) for each dose time and one-off delayed reminders (`TIME_INTERVAL` trigger) when snoozed.
   - **`addNotificationReceivedListener` & `addNotificationResponseReceivedListener`**: Handles foreground alerts and background Snooze actions.

2. **AsyncStorage API (`@react-native-async-storage/async-storage`)**
   - **`setItem` & `getItem`**: Persists the serialized JSON list of medications locally on the device so data survives app restarts and force-closes.

3. **Native DateTimePicker API (`@react-native-community/datetimepicker`)**
   - Renders native OS date and time selection dialogs for choosing the medication start date and individual dose schedules.

4. **Expo Device & React Native Core APIs (`expo-device`, `Alert`, `Vibration`)**
   - **`Device.isDevice`**: Safely checks physical device capability before requesting native permissions.
   - **`Alert` & `Vibration`**: Triggers immediate visual and haptic feedback when a reminder fires while the app is open in the foreground.
