import { db } from './FirebaseConfig'; // Adjust the path if necessary
import { collection, query, where, getDocs, addDoc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
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

// Function to check if a similar reservation exists by the same user
export const checkDuplicateReservation = async (userName, date, startTime, endTime, venue) => {
  const reservationsRef = collection(db, 'eventReservations');
  const q = query(
    reservationsRef,
    where('date', '==', date),
    where('userName', '==', userName),
    where('venue', '==', venue)
  );

  const querySnapshot = await getDocs(q);

  for (const doc of querySnapshot.docs) {
    const { startTime: existingStartTime, endTime: existingEndTime } = doc.data();

    const newStart = new Date(`1970-01-01T${startTime}:00Z`).getTime();
    const newEnd = new Date(`1970-01-01T${endTime}:00Z`).getTime();
    const existingStart = new Date(`1970-01-01T${existingStartTime}:00Z`).getTime();
    const existingEnd = new Date(`1970-01-01T${existingEndTime}:00Z`).getTime();

    if (
      (newStart < existingEnd && newEnd > existingStart) ||
      (newStart === existingEnd)
    ) {
      return true; // Duplicate found
    }
  }

  return false; // No duplicate found
};

// Function to add a reservation (does not store until admin approval)
export const addEventReservation = async (formValues) => {
  try {
    const { userName, date, startTime, endTime, venue } = formValues;

    // Check for duplicate reservations
    const isDuplicate = await checkDuplicateReservation(userName, date, startTime, endTime, venue);

    if (isDuplicate) {
      throw new Error('Duplicate reservation detected');
    }

    // Send notification to admin if not a duplicate
    await sendNotificationToAdmin({
      message: `New reservation request by ${userName}, for ${venue} on ${date} from ${startTime} to ${endTime}`,
      formValues,
      status: 'pending',
    });

    return true; // Indicate that the reservation was successfully sent for admin review
  } catch (error) {
    console.error('Error adding reservation:', error);
    throw new Error(error.message || 'Failed to add reservation');
  }
};

// Function to send notification to the admin
const sendNotificationToAdmin = async (notificationData) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: Timestamp.now(),
      status: 'unread', // Set unread by default
    });
  } catch (error) {
    console.error('Error sending notification: ', error);
  }
};

// Fetch pending reservations for admin (fetches reservation details from notifications)
export const getPendingReservations = async () => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(notificationsRef, where('status', '==', 'unread'));

  const querySnapshot = await getDocs(q);
  const reservations = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return reservations;
};

// Function to store reservation after admin approval
export const approveReservation = async (reservationId, formValues) => {
  try {
    // Add reservation to Firestore
    await addDoc(collection(db, 'eventReservations'), {
      ...formValues,
      createdAt: Timestamp.now(),
      status: 'approved',
    });

    // Update notification status to 'approved'
    await updateDoc(doc(db, 'notifications', reservationId), {
      status: 'approved',
    });
  } catch (error) {
    console.error('Error approving reservation: ', error);
    throw new Error('Failed to approve reservation');
  }
};

// Decline reservation and mark notification as declined
export const declineReservation = async (reservationId) => {
  try {
    // Reference to the notification document
    const notificationDocRef = doc(db, 'notifications', reservationId);
    
    // Update notification status to 'declined'
    await updateDoc(notificationDocRef, { status: 'declined' });
  } catch (error) {
    console.error('Error declining reservation:', error);
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
      (newStartTime < endTime && newEndTime > startTime) ||
      (newStartTime === endTime) // Prevent booking if the start time matches the end time of an existing booking
    ) {
      return true; // Conflict exists
    }
  }

  return false; // No conflicts found
};

// Fetch balance sheet record by full name and year
export const fetchBalanceSheetRecord = async (fullName, year) => {
  try {
    const yearDocRef = doc(db, 'balanceSheetRecord', year);
    const yearDocSnap = await getDoc(yearDocRef);

    if (yearDocSnap.exists()) {
      const userData = yearDocSnap.data().Name?.[fullName];
      return userData || {}; // Return empty object if user data is not found
    } else {
      return {}; // Return empty object if year document does not exist
    }
  } catch (error) {
    console.error('Error fetching balance sheet record:', error);
    return {}; // Return empty object in case of error
  }
};


// Function to add Income Statement record to Firestore
export const fetchIncomeStateDates = async () => {
  const snapshot = await getDocs(collection(db, 'incomeStatementRecords'));
  return snapshot.docs.map(doc => doc.id);
};

export const fetchIncomeStateRecord = async (date) => {
  const docRef = doc(db, 'incomeStatementRecords', date);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error('No record found for this date');
  }
};

export const addIncomeStatementRecord = async (record) => {
  await setDoc(doc(db, 'incomeStatementRecords', record.date), record);
};