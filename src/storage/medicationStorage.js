import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@medolaa_medications_v1";

export const getMedications = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load medications:", error);
    return [];
  }
};

export const saveMedication = async (newMed) => {
  try {
    const existing = await getMedications();
    const updated = [newMed, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to save medication:", error);
    throw error;
  }
};
