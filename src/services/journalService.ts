import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';

// Interface for Journal Entry data
interface JournalEntryData {
  userId: string;
  planet: string;
  timestamp: any; // Use serverTimestamp()
  landscapeUrl?: string | null;
  species?: any[] | null; // Array of species objects
  notes?: string;
  // Add other fields like missionLog, isFavorite later
}

// Function to add a new journal entry
export const addJournalEntry = async (entryData: Omit<JournalEntryData, 'timestamp'>) => {
  if (!entryData.userId) {
    throw new Error("User ID is required to save journal entry.");
  }
  try {
    const docRef = await addDoc(collection(db, `users/${entryData.userId}/journalEntries`), {
      ...entryData,
      timestamp: serverTimestamp() // Use Firestore server timestamp
    });
    console.log("Journal entry written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding journal entry: ", e);
    throw e; // Re-throw the error for handling in the component
  }
};

// Function to get journal entries for a user
export const getJournalEntries = async (userId: string) => {
  if (!userId) {
    console.warn("Attempted to fetch journal entries without user ID.");
    return [];
  }
  try {
    const entries: any[] = []; // Define a proper type later
    const q = query(
      collection(db, `users/${userId}/journalEntries`),
      orderBy('timestamp', 'desc') // Order by most recent first
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    console.log(`Fetched ${entries.length} journal entries for user ${userId}`);
    return entries;
  } catch (e) {
    console.error("Error getting journal entries: ", e);
    return []; // Return empty array on error
  }
};

// Add functions for updating/deleting entries later if needed
