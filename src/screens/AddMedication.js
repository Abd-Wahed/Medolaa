import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddMedication({ initialData, onSave, onCancel }) {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData ? initialData.name : "");
  const [dosage, setDosage] = useState(initialData ? initialData.dosage : "");
  const [frequency, setFrequency] = useState(
    initialData ? initialData.frequency : 1,
  );
  const [startDate, setStartDate] = useState(
    initialData ? new Date(initialData.startDate) : new Date(),
  );
  const [times, setTimes] = useState(
    initialData ? initialData.times.map((t) => new Date(t)) : [new Date()],
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleFrequencyChange = (newFreq) => {
    setFrequency(newFreq);
    const updatedTimes = [...times];
    while (updatedTimes.length < newFreq) {
      const nextTime = new Date();
      nextTime.setHours(8 + updatedTimes.length * 6, 0, 0, 0);
      updatedTimes.push(nextTime);
    }
    setTimes(updatedTimes.slice(0, newFreq));
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim())
      newErrors.name = "Medication name is required (e.g., Napa Extra)।";
    if (!dosage.trim())
      newErrors.dosage = "dosage is required (e.g., 500 mg )।";
    if (times.length !== frequency) {
      newErrors.times = `For ${frequency} times per day, please select ${frequency} time(s).`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);

    const medicationData = {
      id: isEditing ? initialData.id : Date.now().toString(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      startDate: startDate.toISOString(),
      times: times.map((t) => t.toISOString()),
      notificationIds: isEditing ? initialData.notificationIds : [],
    };

    await onSave(medicationData, isEditing);
    setSubmitting(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>
        {isEditing ? "Edit Medication Info" : "Add New Medication"}
      </Text>

      <Text style={styles.label}>Medication Name *</Text>
      <TextInput
        style={[styles.input, errors.name ? styles.inputError : null]}
        placeholder="e.g., Napa Extra"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errors.name) setErrors({ ...errors, name: null });
        }}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <Text style={styles.label}>Dosage *</Text>
      <TextInput
        style={[styles.input, errors.dosage ? styles.inputError : null]}
        placeholder="e.g., 500 mg or 1 tablet"
        value={dosage}
        onChangeText={(text) => {
          setDosage(text);
          if (errors.dosage) setErrors({ ...errors, dosage: null });
        }}
      />
      {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}

      <Text style={styles.label}>Times per Day (Frequency) *</Text>
      <View style={styles.freqRow}>
        {[1, 2, 3].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.freqButton,
              frequency === num && styles.freqButtonActive,
            ]}
            onPress={() => handleFrequencyChange(num)}
          >
            <Text
              style={[
                styles.freqText,
                frequency === num && styles.freqTextActive,
              ]}
            >
              Daily {num} Times
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.pickerText}>
          📅 {startDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>
        Time to Take Medication ({frequency} doses)
      </Text>
      {times.map((timeItem, index) => (
        <TouchableOpacity
          key={index}
          style={styles.pickerButton}
          onPress={() => setActiveTimeIndex(index)}
        >
          <Text style={styles.pickerText}>
            ⏰ Dose {index + 1}:{" "}
            {timeItem.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </TouchableOpacity>
      ))}
      {errors.times && <Text style={styles.errorText}>{errors.times}</Text>}

      {activeTimeIndex !== null && (
        <DateTimePicker
          value={times[activeTimeIndex]}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            const idx = activeTimeIndex;
            setActiveTimeIndex(null);
            if (selectedTime) {
              const updated = [...times];
              updated[idx] = selectedTime;
              setTimes(updated);
            }
          }}
        />
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.saveButtonText}>
            {submitting
              ? "Saving..."
              : isEditing
                ? "Update"
                : "Save & Set Alarm"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: { borderColor: "#EF4444" },
  errorText: { color: "#EF4444", fontSize: 13, marginTop: 4 },
  freqRow: { flexDirection: "row", gap: 10 },
  freqButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  freqButtonActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  freqText: { color: "#334155", fontWeight: "600" },
  freqTextActive: { color: "#FFFFFF" },
  pickerButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  pickerText: { fontSize: 16, color: "#0F172A" },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 28, marginBottom: 40 },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
  },
  cancelButtonText: { color: "#475569", fontSize: 16, fontWeight: "600" },
  saveButton: {
    flex: 2,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
