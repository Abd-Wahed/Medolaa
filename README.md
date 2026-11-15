# Medolaa — Medications Feature

A React Native (Expo) vertical slice for tracking daily medications, managing schedules, and triggering exact local alarm reminders with snooze support—built completely offline using local device persistence.

## Features

- **Medication List:** Displays active medications with dosage, daily frequency, and calculated next reminder time, explicitly handling **Loading**, **Empty**, and **Populated** states.
- **Full CRUD Support:** Create, view details, edit, and delete medications with automatic rescheduling or cancellation of associated notifications.
- **Form Validation:** Inline validation preventing empty or incomplete medication entries from saving.
- **Local Persistence:** Uses `AsyncStorage` so saved medications and schedules persist across app restarts and force-closes.
- **Exact Local Alarms & Snooze:** High-priority daily notifications with custom alarm sound (`alarm.mp3`), vibration, in-context permission handling, and a `Snooze (10m)` action button.

## Tech Stack & APIs Used

- **Framework:** React Native & Expo (`expo-router`)
- **Notifications & Alarms:** `expo-notifications`, `expo-device`
- **Local Storage:** `@react-native-async-storage/async-storage`
- **Date & Time Picker:** `@react-native-community/datetimepicker`

## Project Structure

```text
src/
├── app/
│   ├── _layout.tsx            # Root navigation stack configuration
│   └── index.tsx              # Main controller managing state, CRUD, and foreground alerts
├── screens/
│   ├── MedicationList.js      # List screen (Loading, Empty, Has-items states)
│   ├── AddMedication.js       # Add/Edit form with inline validation
│   └── MedicationDetails.js   # Medication details with Edit & Delete actions
├── storage/
│   └── medicationStorage.js   # AsyncStorage CRUD helper functions
└── utils/
    └── notificationHelper.js  # Alarm channel setup, scheduling, snooze, and cancellation
