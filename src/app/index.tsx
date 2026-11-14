import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
// @ts-ignore
import AddMedication from "../screens/AddMedication";
// @ts-ignore
import MedicationDetail from "../screens/MedicationDetails";
// @ts-ignore
import MedicationList from "../screens/MedicationList";
// @ts-ignore
import {
  deleteMedication,
  getMedications,
  saveMedication,
  updateMedication,
} from "../storage/medicationStorage";
// @ts-ignore
import {
  cancelMedicationReminders,
  initNotifications,
  registerSnoozeListener,
  requestNotificationPermission,
  scheduleMedicationReminders,
} from "../utils/notificationHelper";

export default function App() {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<
    "LIST" | "ADD" | "EDIT" | "DETAIL"
  >("LIST");
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [permissionWarning, setPermissionWarning] = useState<boolean>(false);

  useEffect(() => {
    initNotifications();
    const subscription = registerSnoozeListener();

    const foregroundSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body, data } = notification.request.content;
        Alert.alert(
          title || "💊 Medicine time ",
          body || "It's time to take your medication.",
          [
            {
              text: "Snooze (10 min)",
              onPress: async () => {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: `⏰ Snooze: ${data?.medName || "Medicine"}`,
                    body: `Dosage: ${data?.dosage || ""}`,
                    sound: "alarm.mp3",
                  },
                  trigger: {
                    type: Notifications.SchedulableTriggerInputTypes
                      .TIME_INTERVAL,
                    seconds: 600,
                    channelId: "med-alarm-v3",
                  },
                });
              },
            },
            { text: "OK / Taken", style: "default" },
          ],
        );
      },
    );

    loadInitialData();

    return () => {
      subscription.remove();
      foregroundSub.remove();
    };
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    const storedMeds = await getMedications();
    setMedications(storedMeds);
    setLoading(false);
  };

  // CREATE & UPDATE Handler
  const handleSaveOrUpdateMedication = async (
    medData: any,
    isEditing: boolean,
  ) => {
    if (isEditing && medData.notificationIds) {
      await cancelMedicationReminders(medData.notificationIds);
    }

    const hasPermission = await requestNotificationPermission();
    let notificationIds: string[] = [];

    if (hasPermission) {
      setPermissionWarning(false);
      notificationIds = await scheduleMedicationReminders(medData);
    } else {
      setPermissionWarning(true);
    }

    const finalMed = { ...medData, notificationIds };
    const updatedList = isEditing
      ? await updateMedication(finalMed)
      : await saveMedication(finalMed);

    setMedications(updatedList);
    setSelectedMed(null);
    setCurrentScreen("LIST");
  };

  // DELETE Handler
  const handleDeleteMedication = async (medToDelete: any) => {
    if (medToDelete.notificationIds) {
      await cancelMedicationReminders(medToDelete.notificationIds);
    }
    const updatedList = await deleteMedication(medToDelete.id);
    setMedications(updatedList);
    setSelectedMed(null);
    setCurrentScreen("LIST");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>Medolaa</Text>
      </View>

      {currentScreen === "LIST" && (
        <MedicationList
          medications={medications}
          loading={loading}
          permissionWarning={permissionWarning}
          onAddPress={() => {
            setSelectedMed(null);
            setCurrentScreen("ADD");
          }}
          onSelectMedication={(med: any) => {
            setSelectedMed(med);
            setCurrentScreen("DETAIL");
          }}
        />
      )}

      {(currentScreen === "ADD" || currentScreen === "EDIT") && (
        <AddMedication
          initialData={currentScreen === "EDIT" ? selectedMed : null}
          onSave={handleSaveOrUpdateMedication}
          onCancel={() =>
            setCurrentScreen(currentScreen === "EDIT" ? "DETAIL" : "LIST")
          }
        />
      )}

      {currentScreen === "DETAIL" && (
        <MedicationDetail
          medication={selectedMed}
          onBack={() => setCurrentScreen("LIST")}
          onEdit={() => setCurrentScreen("EDIT")}
          onDelete={handleDeleteMedication}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  appTitle: { fontSize: 20, fontWeight: "bold", color: "#2563EB" },
});
