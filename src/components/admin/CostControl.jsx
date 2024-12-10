import React, { useState, useEffect } from 'react';
import { Tooltip, Input, message, Button, Modal } from 'antd';
import { collection, getDocs, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig';

export default function CostControl() {
  const [venueData, setVenueData] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Function to send a notification after updating the venue amount
  const sendAmountChangeNotification = async (venue, newAmount) => {
    try {
      // Check if the notification already exists in Firestore to avoid duplicates
      const notificationRef = collection(db, "notifications");

      // Create a unique notification ID based on venue, amount, and date
      const notificationId = `${venue}-${newAmount}-${
        new Date().toISOString().split("T")[0]
      }`;

      // Check if a similar notification already exists by querying Firestore
      const snapshot = await getDocs(notificationRef);
      const existingNotification = snapshot.docs.find(
        (doc) => doc.id === notificationId
      );

      if (existingNotification) {
        console.log(
          "Notification already exists for this venue and amount change. Skipping..."
        );
        return; // Skip if the notification already exists in Firestore
      }

      // Create a new notification message
      const message = `The amount for the ${venue} has been changed to ₱${newAmount}`;

      // Send notification as a batch write
      const batch = writeBatch(db);

      // Add a notification document
      const newNotificationRef = doc(notificationRef, notificationId); // Using the unique ID as document ID
      batch.set(newNotificationRef, {
        status: "info", // Status can be 'info', 'warning', etc.
        message: message,
        date: new Date().toLocaleDateString(),
        timestamp: new Date(), // Add the timestamp
        formValues: {
          userName: "Admin", // Assuming the admin made the change
          venue: venue,
          amount: newAmount,
        },
      });

      // Commit the batch write
      await batch.commit();

      console.log("Amount change notification sent!");
    } catch (error) {
      console.error("Error sending amount change notification:", error);
      message.error("Failed to send notification.");
    }
  };

  // Fetch venues and their prices on component mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const venueCollection = collection(db, 'venueAmounts');
        const venueSnapshot = await getDocs(venueCollection);

        // Extract venue names and amounts from Firestore documents
        const venues = venueSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.id.replace(/([A-Z])/g, ' $1').trim(), // Format the name
          amount: doc.data().amount,
        }));
        setVenueData(venues);
      } catch (error) {
        message.error('Error fetching venues');
        console.error('Error fetching venues:', error);
      }
    };

    fetchVenues();
  }, []);

  // Show modal to update amount
  const showModal = (venue) => {
    setSelectedVenue(venue);
    setNewAmount(venue.amount);
    setIsModalVisible(true);
  };

  // Handle updating the venue amount in Firestore
  const handleUpdateAmount = async () => {
    if (!newAmount) {
      message.error('Please enter a valid amount');
      return;
    }

    try {
      const venueAmountDocRef = doc(db, 'venueAmounts', selectedVenue.id);
      await updateDoc(venueAmountDocRef, {
        amount: newAmount,
        updatedAt: serverTimestamp(),
      });

      message.success(`Amount updated for ${selectedVenue.name} to ₱${newAmount}`);

      // Send notification after amount is updated
      await sendAmountChangeNotification(selectedVenue.name, newAmount);

      // Update the local state to reflect the new amount
      setVenueData((prev) =>
        prev.map((venue) =>
          venue.id === selectedVenue.id ? { ...venue, amount: newAmount } : venue
        )
      );

      setIsModalVisible(false);
      setSelectedVenue(null);
    } catch (error) {
      message.error('Error updating venue amount');
      console.error('Error updating venue amount:', error);
    }
  };

  return (
    <div className="bg-white shadow-md h-full w-full flex flex-col px-4 md:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6 text-start sm:text-left">Cost Control</h1>

      <div className="flex flex-col space-y-2">
        <h1>Venue Prices</h1>

        {venueData.map((venue) => (
          <div key={venue.id} className="flex flex-row space-x-2 items-center">
            <Tooltip title="Venue Name">
              <Input
                placeholder="Venue"
                className="w-auto"
                value={venue.name}
                readOnly
              />
            </Tooltip>

            <Input
              placeholder="Price"
              className="w-[50%]"
              prefix="₱"
              value={venue.amount}
              readOnly
            />

            <Button type="primary" onClick={() => showModal(venue)}>
              Change Amount
            </Button>
          </div>
        ))}
      </div>

      {/* Modal for updating the amount */}
      <Modal
        title={`Update Amount for ${selectedVenue?.name}`}
        visible={isModalVisible}
        onOk={handleUpdateAmount}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          prefix="₱"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          placeholder="Enter new amount"
        />
      </Modal>
    </div>
  );
}
