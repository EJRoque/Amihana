import React, { useState, useEffect } from 'react';
import { Tooltip, Input, message, Button, Modal } from 'antd';
import { collection, getDocs, doc, updateDoc, serverTimestamp, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig';

export default function CostControl() {
  const [venueData, setVenueData] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAmount, setNewVenueAmount] = useState('');

  // Handle changes to the amount input field for new venue amount
  const handleNewFacilityAmountChange = (e) => {
    const value = e.target.value;

    // Only allow valid numbers and 1 decimal point for amount
    const validValue = /^[0-9]*\.?[0-9]{0,2}$/.test(value) ? value : '';

    // Set the formatted amount
    setNewVenueAmount(validValue);
  };

  // Handle changes to the amount input field for existing venue amount
  const handleAmountChange = (e) => {
    const value = e.target.value;

    // Only allow valid numbers with decimal points
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setNewAmount(value);
    }
  };

  const sendAmountChangeNotification = async (venue, newAmount) => {
    try {
      const notificationRef = collection(db, "notifications");

      const notificationId = `${venue}-${newAmount}-${new Date().toISOString().split("T")[0]}`;

      const snapshot = await getDocs(notificationRef);
      const existingNotification = snapshot.docs.find(
        (doc) => doc.id === notificationId
      );

      if (existingNotification) {
        console.log(
          "Notification already exists for this venue and amount change. Skipping..."
        );
        return;
      }

      const message = `The amount for the ${venue} has been changed to ₱${newAmount}`;

      const newNotificationRef = doc(notificationRef, notificationId);

      // Use setDoc to create the document if it doesn't exist
      await setDoc(newNotificationRef, {
        status: "info",
        message: message,
        date: new Date().toLocaleDateString(),
        timestamp: new Date(),
        formValues: {
          userName: "Admin",
          venue: venue,
          amount: newAmount,
        },
      });

      console.log("Amount change notification sent!");
    } catch (error) {
      console.error("Error sending amount change notification:", error);
      message.error("Failed to send notification.");
    }
  };

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const venueCollection = collection(db, 'venueAmounts');
        const venueSnapshot = await getDocs(venueCollection);

        const venues = venueSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.id.replace(/([A-Z])/g, ' $1').trim(),
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

  const showModal = (venue) => {
    setSelectedVenue(venue);
    setNewAmount(venue.amount);
    setIsModalVisible(true);
  };

  const handleUpdateAmount = async () => {
    if (!newAmount || isNaN(newAmount)) {
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

      await sendAmountChangeNotification(selectedVenue.name, newAmount);

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

  const handleAddVenue = async () => {
    if (!newVenueName || !newVenueAmount) {
      message.error('Please enter both venue name and amount');
      return;
    }

    try {
      const venueCollection = collection(db, 'venueAmounts');

      // Use the venue name as the document ID
      const venueDocRef = doc(venueCollection, newVenueName); // Set the document ID as the venue name
      await setDoc(venueDocRef, {
        name: newVenueName,
        amount: newVenueAmount,
        updatedAt: serverTimestamp(),
      });

      const newVenue = {
        id: newVenueName,  // The ID is now the venue name
        name: newVenueName,
        amount: newVenueAmount,
      };

      setVenueData((prev) => [...prev, newVenue]);
      setNewVenueName('');
      setNewVenueAmount('');

      message.success(`New venue ${newVenueName} added with amount ₱${newVenueAmount}`);
    } catch (error) {
      message.error('Error adding new venue');
      console.error('Error adding new venue:', error);
    }
  };

  return (
    <div className="bg-white shadow-md h-full w-full flex flex-col px-4 md:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6 text-start sm:text-left">Facilities Price Control</h1>

      <div className="flex flex-col space-y-2">
        <h1>Add new Facility</h1>

        <div className="flex flex-row space-x-2 items-center mt-4">
          <Input
            placeholder="New Facility Name"
            className="w-[30%]"
            value={newVenueName}
            onChange={(e) => setNewVenueName(e.target.value)}
          />

          <Input
            placeholder="New Facility Amount"
            className="w-[20%]"
            prefix="₱"
            value={newVenueAmount}
            onChange={handleNewFacilityAmountChange} // Use the new handler for amount
          />

          <Button type="primary" onClick={handleAddVenue}>
            Add new Facility
          </Button>
        </div>

        <h1>Facilities Rate</h1>

        {venueData.map((venue) => (
          <div key={venue.id} className="flex flex-row space-x-2 items-center">
            <Tooltip title="Venue Name">
              <Input
                placeholder="Venue"
                className="w-[30%]"
                value={venue.name}
                readOnly
              />
            </Tooltip>

            <Input
              placeholder="Price"
              className="w-[20%]"
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

      <Modal
        title={`Update Amount for ${selectedVenue?.name}`}
        visible={isModalVisible}
        onOk={handleUpdateAmount}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          prefix="₱"
          value={newAmount}
          onChange={handleAmountChange}
          placeholder="Enter new amount"
        />
      </Modal>
    </div>
  );
}
