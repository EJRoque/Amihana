import { db } from './FirebaseConfig'; // Adjust the path if necessary
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


// Function to add cash flow record to Firestore
export const fetchCashFlowDates = async () => {
  const snapshot = await getDocs(collection(db, 'cashFlowRecords'));
  return snapshot.docs.map(doc => doc.id);
};

export const fetchCashFlowRecord = async (date) => {
  const docRef = doc(db, 'cashFlowRecords', date);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error('No record found for this date');
  }
};

export const addCashFlowRecord = async (record) => {
  await setDoc(doc(db, 'cashFlowRecords', record.date), record);
};

// Function to add an event reservation to Firestore
export const addEventReservation = async (formValues) => {
  try {
    const reservationRef = await addDoc(collection(db, 'eventReservations'), {
      ...formValues,
      createdAt: Timestamp.now()
    });
    return reservationRef.id;
  } catch (error) {
    console.error('Error adding reservation: ', error);
    throw new Error('Failed to add reservation');
  }
};

// Function to fetch user data by user ID
export const fetchUserFullName = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);
  
  if (userDocSnap.exists()) {
    return userDocSnap.data().fullName;
  } else {
    throw new Error('User not found');
  }
};

// Function to check for reservation conflicts
export const checkReservationConflict = async (date, venue, newStartTime, newEndTime) => {
  const reservationsRef = collection(db, 'eventReservations');
  const q = query(
    reservationsRef,
    where('date', '==', date),
    where('venue', '==', venue)
  );

  const querySnapshot = await getDocs(q);

  for (const doc of querySnapshot.docs) {
    const { startTime, endTime } = doc.data();

    // Check if the new reservation overlaps with existing reservations
    if (
      (newStartTime < endTime && newEndTime > startTime)
    ) {
      return true; // Conflict exists
    }
  }

  return false; // No conflicts found
};