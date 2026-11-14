import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// অ্যাপ খোলা অবস্থায়ও যেন নোটিফিকেশন পপ-আপ ও সাউন্ড হয়
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// অ্যালার্ম চ্যানেল ও Snooze বাটন সেটআপ
export const initNotifications = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("med-alarm", {
      name: "Medication Alarms",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 500, 500],
      sound: "default",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  await Notifications.setNotificationCategoryAsync("MED_REMINDER", [
    {
      identifier: "SNOOZE_10",
      buttonTitle: "Snooze (10m)",
      options: { opensAppToForeground: false },
    },
    {
      identifier: "TAKEN",
      buttonTitle: "Mark Taken",
      options: { opensAppToForeground: true },
    },
  ]);
};

// In-context পারমিশন চাওয়া (ফর্ম সেভ করার সময় কল হবে)
export const requestNotificationPermission = async () => {
  if (!Device.isDevice) {
    // এমুলেটরে টেস্ট করার জন্য true রিটার্ন করতে পারেন, তবে রিয়েল ডিভাইসে পারমিশন চেক হবে
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === "granted";
};

// প্রতিটি ডোজের সময়ের জন্য ডেইলি রিমাইন্ডার শিডিউল করা
export const scheduleMedicationReminders = async (medication) => {
  const notificationIds = [];

  for (const timeIso of medication.times) {
    const dateObj = new Date(timeIso);
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 ওষুধের সময় হয়েছে: ${medication.name}`,
        body: `ডোজ: ${medication.dosage || "নির্ধারিত মাত্রা"}। এখনই সেবন করুন।`,
        sound: true,
        categoryIdentifier: "MED_REMINDER",
        data: { medName: medication.name, dosage: medication.dosage },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: "med-alarm",
      },
    });
    notificationIds.push(id);
  }

  return notificationIds;
};

// Snooze বাটনে চাপ দিলে ১০ মিনিট পর আবার অ্যালার্ম বাজানোর লিসেনার
export const registerSnoozeListener = () => {
  return Notifications.addNotificationResponseReceivedListener(
    async (response) => {
      if (response.actionIdentifier === "SNOOZE_10") {
        const { medName, dosage } = response.notification.request.content.data;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ Snooze অ্যালার্ম: ${medName}`,
            body: `ডোজ: ${dosage || ""} (১০ মিনিট পর রিমাইন্ডার)`,
            sound: true,
            categoryIdentifier: "MED_REMINDER",
            data: { medName, dosage },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 600, // ১০ মিনিট
            channelId: "med-alarm",
          },
        });
      }
    },
  );
};
