import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true, // সাউন্ড বাজানোর জন্য বাধ্যতামূলক
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.log("Notification handler error:", error);
}
export const cancelMedicationReminders = async (notificationIds) => {
  try {
    if (!notificationIds || !Array.isArray(notificationIds)) return;
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (error) {
    console.log("Cancel notification error:", error);
  }
};
export const initNotifications = async () => {
  try {
    if (Platform.OS === "android") {
      // নতুন চ্যানেল আইডি (med-alarm-v2) দেওয়া হলো যাতে নতুন সাউন্ড সেটিংস কাজ করে
      await Notifications.setNotificationChannelAsync("med-alarm-v3", {
        name: "Medication Alarm Sound",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 1000, 500, 1000, 500, 1000],
        sound: "alarm.mp3",
        enableVibrate: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
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
  } catch (error) {
    console.log("initNotifications error:", error);
  }
};

export const requestNotificationPermission = async () => {
  try {
    if (!Device.isDevice) return true;
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === "granted";
  } catch (error) {
    return false;
  }
};

export const scheduleMedicationReminders = async (medication) => {
  const notificationIds = [];

  try {
    for (const timeIso of medication.times) {
      const dateObj = new Date(timeIso);
      const hour = dateObj.getHours();
      const minute = dateObj.getMinutes();

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `💊 It's time for your medication: ${medication.name}`,
          body: `Dose: ${medication.dosage || " prescribed dosage"}。 Take it now.`,
          sound: "alarm.mp3",
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: "MED_REMINDER",
          data: { medName: medication.name, dosage: medication.dosage },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: "med-alarm-v3",
        },
      });
      notificationIds.push(id);
    }
  } catch (error) {
    console.log("Schedule error:", error);
  }

  return notificationIds;
};

export const registerSnoozeListener = () => {
  try {
    return Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        try {
          if (response.actionIdentifier === "SNOOZE_10") {
            const data = response.notification.request.content.data || {};
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `⏰ Snooze Alert: ${data.medName || "Medication Reminder"}`,
                body: `Dose: ${data.dosage || ""} (10 minutes from now)`,
                sound: "alarm.mp3",
                priority: Notifications.AndroidNotificationPriority.MAX,
                categoryIdentifier: "MED_REMINDER",
                data: { medName: data.medName, dosage: data.dosage },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 600,
                repeats: false,
                channelId: "med-alarm-v3",
              },
            });
          }
        } catch (err) {
          console.log("Snooze error:", err);
        }
      },
    );
  } catch (error) {
    return { remove: () => {} };
  }
};
