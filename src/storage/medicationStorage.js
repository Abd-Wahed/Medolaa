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
export const updateMedication = async (updatedMed) => {
  try {
    const existing = await getMedications();
    const updatedList = existing.map((item) =>
      item.id === updatedMed.id ? updatedMed : item,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (error) {
    console.error("Failed to update medication:", error);
    throw error;
  }
};

export const deleteMedication = async (id) => {
  try {
    const existing = await getMedications();
    const filteredList = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredList));
    return filteredList;
  } catch (error) {
    console.error("Failed to delete medication:", error);
    throw error;
  }
};
