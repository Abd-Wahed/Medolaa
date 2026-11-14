import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MedicationDetails({
  medication,
  onBack,
  onEdit,
  onDelete,
}) {
  if (!medication) return null;

  const confirmDelete = () => {
    Alert.alert(
      "Medication Deletion Confirmation",
      `Are you sure you want to delete "${medication.name}" and all its reminders?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",

          style: "destructive",
          onPress: () => onDelete(medication),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{medication.name}</Text>
        <Text style={styles.dosage}>Dosage: {medication.dosage}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Schedule:</Text>
        <Text style={styles.valueText}>
          {" "}
          {medication.frequency} times per day
        </Text>

        <Text style={styles.sectionLabel}>Start Date:</Text>
        <Text style={styles.valueText}>
          {new Date(medication.startDate).toLocaleDateString()}
        </Text>

        <Text style={styles.sectionLabel}>Scheduled Times:</Text>
        {medication.times.map((t, index) => (
          <Text key={index} style={styles.timeItem}>
            • Dosage {index + 1}:{" "}
            {new Date(t).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        ))}
      </View>

      {/* Edit & Delete Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(medication)}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back to List</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#0F172A" },
  dosage: { fontSize: 16, color: "#2563EB", fontWeight: "600", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 16 },
  sectionLabel: { fontSize: 14, color: "#64748B", marginTop: 12 },
  valueText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
    marginTop: 2,
  },
  timeItem: { fontSize: 16, color: "#059669", fontWeight: "600", marginTop: 6 },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  editButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  deleteButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  backButton: {
    marginTop: 12,
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
