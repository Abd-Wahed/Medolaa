import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const getNextReminderTime = (times) => {
  if (!times || times.length === 0) return "No time set";
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sortedTimes = times
    .map((t) => new Date(t))
    .sort(
      (a, b) =>
        a.getHours() * 60 +
        a.getMinutes() -
        (b.getHours() * 60 + b.getMinutes()),
    );

  const upcoming = sortedTimes.find(
    (d) => d.getHours() * 60 + d.getMinutes() > currentMinutes,
  );

  const nextDate = upcoming || sortedTimes[0];
  const label = upcoming ? "Today" : "Tomorrow ";
  const formattedTime = nextDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${label} ${formattedTime}`;
};

export default function MedicationList({
  medications,
  loading,
  permissionWarning,
  onAddPress,
  onSelectMedication,
}) {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading medication list...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {permissionWarning && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Notification permission is turned off, so alarms/reminders won't
            work. Please enable permission in your phone's Settings.
          </Text>
        </View>
      )}

      {medications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No medications added</Text>
          <Text style={styles.emptySubtitle}>
            To receive timely reminders for your daily medications, click the
            button below to add your first medication.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onAddPress}>
            <Text style={styles.primaryButtonText}>+ Add First Medication</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={medications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => onSelectMedication(item)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.medName}>{item.name}</Text>
                  <Text style={styles.dosageBadge}>
                    {item.dosage || "No dosage"}
                  </Text>
                </View>
                <Text style={styles.scheduleText}>
                  Schedule: {item.frequency} times per day
                </Text>
                <Text style={styles.nextTimeText}>
                  ⏰ Next reminder: {getNextReminderTime(item.times)}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.fab} onPress={onAddPress}>
            <Text style={styles.fabText}>+ Add Medication</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748B" },
  warningBanner: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#F59E0B",
  },
  warningText: { color: "#92400E", fontSize: 13, lineHeight: 18 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  listContent: { padding: 16, paddingBottom: 90 },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  medName: { fontSize: 18, fontWeight: "bold", color: "#0F172A" },
  dosageBadge: {
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  scheduleText: { fontSize: 14, color: "#475569", marginBottom: 4 },
  nextTimeText: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
  },
  fabText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
