// firebaseFunctions.jsx
import { db } from '../firebases/FirebaseConfig'; // Adjust the path if necessary
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';

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