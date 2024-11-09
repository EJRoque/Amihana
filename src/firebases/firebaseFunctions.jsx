import { db } from "./FirebaseConfig"; // Adjust the path if necessary
import { collection, query, where, getDocs, addDoc, updateDoc, Timestamp, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { auth } from "./FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Function to add cash flow record to Firestore
export const fetchCashFlowDates = async () => {
  const snapshot = await getDocs(collection(db, "cashFlowRecords"));
  return snapshot.docs.map((doc) => doc.id);
};

export const fetchCashFlowRecord = async (date) => {
  const docRef = doc(db, "cashFlowRecords", date);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("No record found for this date");
  }
};

export const addCashFlowRecord = async (record) => {
  await setDoc(doc(db, "cashFlowRecords", record.date), record);
};

// Function to check if a user has made 3 reservations for the day
export const checkDailyReservationLimit = async (userName) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    // Fetch all reservations for the user
    const reservationsQuery = query(
      collection(db, "eventReservations"),
      where("userName", "==", userName)
    );

    const querySnapshot = await getDocs(reservationsQuery);

    // Count reservations with the same createdAt date
    let reservationCount = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt.toDate(); // Convert Firestore timestamp to JavaScript Date object

      if (createdAt >= startOfDay && createdAt <= endOfDay) {
        reservationCount++;
      }
    });

    // Check if the user has reached the limit
    return reservationCount >= 3;
  } catch (error) {
    console.error("Error checking daily reservation limit:", error);
    throw new Error("Failed to check reservation limit.");
  }
};

// Function to check if a similar reservation exists by the same user
export const checkDuplicateReservation = async (
  userName,
  date,
  startTime,
  endTime,
  venue
) => {
  const reservationsRef = collection(db, "eventReservations");
  const q = query(
    reservationsRef,
    where("date", "==", date),
    where("userName", "==", userName),
    where("venue", "==", venue)
  );

  const querySnapshot = await getDocs(q);

  for (const doc of querySnapshot.docs) {
    const { startTime: existingStartTime, endTime: existingEndTime } =
      doc.data();

      const newStart = new Date(`${date}T${startTime}:00Z`).getTime();
      const newEnd = new Date(`${date}T${endTime}:00Z`).getTime();
      const existingStart = new Date(`${date}T${existingStartTime}:00Z`).getTime();
      const existingEnd = new Date(`${date}T${existingEndTime}:00Z`).getTime();

    if (
      (newStart < existingEnd && newEnd > existingStart) ||
      newStart === existingEnd // Allow overlapping if exact match
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

    // Fetch the amounts for the venues
    const basketballAmountDocRef = doc(db, "venueAmounts", "BasketballCourt");
    const clubhouseAmountDocRef = doc(db, "venueAmounts", "ClubHouse");

    const basketballAmountDoc = await getDoc(basketballAmountDocRef);
    const clubhouseAmountDoc = await getDoc(clubhouseAmountDocRef);

    let amount = '';
    if (venue === 'Basketball Court' && basketballAmountDoc.exists()) {
      amount = basketballAmountDoc.data().amount;
    } else if (venue === 'Club House' && clubhouseAmountDoc.exists()) {
      amount = clubhouseAmountDoc.data().amount;
    }

    // Check if the user has already reached the daily limit of 3 reservations
    const hasReachedLimit = await checkDailyReservationLimit(userName);
    if (hasReachedLimit) {
      throw new Error(
        "You have reached the maximum of 3 reservations for today."
      );
    }

    // Check for duplicate reservations based on date, time, and venue
    const isDuplicate = await checkDuplicateReservation(
      userName,
      date,
      startTime,
      endTime,
      venue
    );
    if (isDuplicate) {
      throw new Error("Duplicate reservation detected.");
    }

    // Send a notification to the admin (reservation is not approved yet)
    await sendNotificationToAdmin({
      message: `New reservation request by ${userName}, for ${venue} on ${date} from ${startTime} to ${endTime}`,
      formValues: { ...formValues, amount },  // Include the amount in the formValues
      status: "pending",
    });

    return true; // Indicate the reservation was successfully sent for review
  } catch (error) {
    console.error("Error adding reservation:", error);
    throw new Error(error.message || "Failed to add reservation");
  }
};

// Function to send notification to the admin
const sendNotificationToAdmin = async (notificationData) => {
  try {
    await addDoc(collection(db, "notifications"), {
      ...notificationData,
      createdAt: Timestamp.now(),
      status: "unread", // Set unread by default
    });
  } catch (error) {
    console.error("Error sending notification: ", error);
  }
};

// Fetch pending reservations for admin (fetches reservation details from notifications)
export const getPendingReservations = async () => {
  const notificationsRef = collection(db, "notifications");
  const q = query(notificationsRef, where("status", "==", "unread"));

  const querySnapshot = await getDocs(q);
  const reservations = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return reservations;
};

// Fetch approved reservations for a specific user
export const getApprovedReservations = async (userName) => {
  const reservationsRef = collection(db, "eventReservations");
  const q = query(
    reservationsRef,
    where("userName", "==", userName),
    where("status", "==", "approved")
  );

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
    // Add reservation to Firestore with the approved status and amount
    const { venue } = formValues;
    let amount = '';

    const basketballAmountDocRef = doc(db, "venueAmounts", "BasketballCourt");
    const clubhouseAmountDocRef = doc(db, "venueAmounts", "ClubHouse");

    const basketballAmountDoc = await getDoc(basketballAmountDocRef);
    const clubhouseAmountDoc = await getDoc(clubhouseAmountDocRef);

    if (venue === 'Basketball Court' && basketballAmountDoc.exists()) {
      amount = basketballAmountDoc.data().amount;
    } else if (venue === 'Club House' && clubhouseAmountDoc.exists()) {
      amount = clubhouseAmountDoc.data().amount;
    }

    await addDoc(collection(db, "eventReservations"), {
      ...formValues,
      createdAt: Timestamp.now(),
      status: "approved",
      amount, // Add the amount to the reservation
    });

    // Update notification status to 'approved'
    await updateDoc(doc(db, "notifications", reservationId), {
      status: "approved",
    });
  } catch (error) {
    console.error("Error approving reservation: ", error);
    throw new Error("Failed to approve reservation");
  }
};

// Decline reservation and mark notification as declined
export const declineReservation = async (reservationId) => {
  try {
    // Reference to the notification document
    const notificationDocRef = doc(db, "notifications", reservationId);

    // Update notification status to 'declined'
    await updateDoc(notificationDocRef, { status: "declined" });
  } catch (error) {
    console.error("Error declining reservation:", error);
  }
};

export const getCurrentUserId = () => {
  const user = auth.currentUser;
  return user ? user.uid : null; // Return the user ID or null if not authenticated
};

// Function to fetch user data by user ID
export const fetchUserFullName = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data().fullName;
  } else {
    throw new Error("User not found");
  }
};

export const checkReservationConflict = async (
  date,
  venue,
  newStartTime,
  newEndTime
) => {
  const reservationsRef = collection(db, "eventReservations");
  const q = query(
    reservationsRef,
    where("date", "==", date),
    where("venue", "==", venue)
  );

  const querySnapshot = await getDocs(q);

  for (const doc of querySnapshot.docs) {
    const { startTime, endTime } = doc.data();

    // Check if the new reservation overlaps with existing reservations
    if (
      (newStartTime < endTime && newEndTime > startTime) ||
      newStartTime === endTime // Prevent booking if the start time matches the end time of an existing booking
    ) {
      return true; // Conflict exists
    }
  }

  return false; // No conflicts found
};

export const fetchReservationsForToday = async () => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const reservationsRef = collection(db, "eventReservations");
  const q = query(
    reservationsRef,
    where("createdAt", ">=", startOfDay),
    where("createdAt", "<=", endOfDay)
  );

  const querySnapshot = await getDocs(q);
  const reservations = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return reservations;
};

// Fetch balance sheet record by full name and year
export const fetchBalanceSheetRecord = async (fullName, year) => {
  try {
    const yearDocRef = doc(db, "balanceSheetRecord", year);
    const yearDocSnap = await getDoc(yearDocRef);

    if (yearDocSnap.exists()) {
      const userData = yearDocSnap.data().Name?.[fullName];
      return userData || {}; // Return empty object if user data is not found
    } else {
      return {}; // Return empty object if year document does not exist
    }
  } catch (error) {
    console.error("Error fetching balance sheet record:", error);
    return {}; // Return empty object in case of error
  }
};

// Function to add Income Statement record to Firestore
export const fetchIncomeStateDates = async () => {
  const snapshot = await getDocs(collection(db, "incomeStatementRecords"));
  return snapshot.docs.map((doc) => doc.id);
};

export const fetchIncomeStateRecord = async (date) => {
  const docRef = doc(db, "incomeStatementRecords", date);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("No record found for this date");
  }
};

export const addIncomeStatementRecord = async (record) => {
  await setDoc(doc(db, "incomeStatementRecords", record.date), record);
};

export const balanceSheetData = async (year) => {
  try {
    const docRef = doc(db, "balanceSheetRecord", year);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Fetched Document Data for year:", year, docSnap.data()); // Debugging

      // Return the document data
      return docSnap.data();
    } else {
      console.log("No balance sheet found for year", { year });
      return {};
    }
  } catch (error) {
    console.error("Error fetching balance sheet data:", error);
    return {};
  }
};

export const fetchNames = async () => {
  try {
    const balanceSheetRef = collection(db, "balanceSheetRecord"); // Access the collection

    // Get all documents (years) in balanceSheetRecord collection
    const yearDocsSnap = await getDocs(balanceSheetRef);

    let allNames = []; // Array to store all the names

    // Loop through each year document (2023, 2024, etc.)
    for (const yearDoc of yearDocsSnap.docs) {
      const yearData = yearDoc.data(); // Get data of the current year

      if (yearData.Name) {
        const names = Object.keys(yearData.Name); // Get the names under the "Name" field
        allNames = [...allNames, ...names]; // Combine names into allNames array
      }
    }

    // Remove duplicates using Set
    const uniqueNames = [...new Set(allNames)]; // Set removes duplicates, and we convert it back to an array

    return uniqueNames; // Return the unique names
  } catch (error) {
    console.error("Error fetching names:", error);
    return [];
  }
};

export const getYearDocuments = async () => {
  const yearCollection = collection(db, "balanceSheetRecord");
  const yearSnapshot = await getDocs(yearCollection);
  const yearList = yearSnapshot.docs.map((doc) => doc.id); // Get the document IDs (which are the years)
  return yearList;
};

//Bar chart income statement
export const fetchIncomeStatementData = async () => {
  try {
    const incomeRecords = [];
    const querySnapshot = await getDocs(
      collection(db, "incomeStatementRecords")
    );
    querySnapshot.forEach((doc) => {
      incomeRecords.push({ id: doc.id, ...doc.data() });
    });
    return incomeRecords;
  } catch (error) {
    console.error("Error fetching income statement records: ", error);
  }
};
