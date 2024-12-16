import React, { useState, useEffect } from 'react';
import { Tooltip, Input, message, Button, Modal } from 'antd';
import { collection, getDocs, doc, updateDoc, serverTimestamp, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig';
import { DeleteOutlined } from '@ant-design/icons'; // Import Delete icon

export default function CostControl() {
  const [venueData, setVenueData] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAmount, setNewVenueAmount] = useState('');

  const handleNewFacilityAmountChange = (e) => {
    const value = e.target.value;
    const validValue = /^[0-9]*\.?[0-9]{0,2}$/.test(value) ? value : '';
    setNewVenueAmount(validValue);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setNewAmount(value);
    }
  };

  const sendNewFacilityNotification = async (venueName, venueAmount) => {
    try {
      const notificationRef = collection(db, "notifications");
      const notificationId = `${venueName}-${venueAmount}-${new Date().toISOString().split("T")[0]}`;
      const snapshot = await getDocs(notificationRef);
      const existingNotification = snapshot.docs.find((doc) => doc.id === notificationId);
      if (existingNotification) {
        console.log("Notification already exists for this venue and amount change. Skipping...");
        return;
      }

      const message = `A new venue ${venueName} has been added with an amount of ₱${venueAmount}`;
      const newNotificationRef = doc(notificationRef, notificationId);

      await setDoc(newNotificationRef, {
        status: "info",
        message: message,
        date: new Date().toLocaleDateString(),
        timestamp: new Date(),
        formValues: {
          userName: "Admin",
          venue: venueName,
          amount: venueAmount,
        },
      });

      console.log("New facility notification sent!");
    } catch (error) {
      console.error("Error sending new facility notification:", error);
      message.error("Failed to send notification.");
    }
  };

  const sendAmountChangeNotification = async (venue, newAmount) => {
    try {
      const notificationRef = collection(db, "notifications");
      const notificationId = `${venue}-${newAmount}-${new Date().toISOString().split("T")[0]}`;
      const snapshot = await getDocs(notificationRef);
      const existingNotification = snapshot.docs.find((doc) => doc.id === notificationId);
      if (existingNotification) {
        console.log("Notification already exists for this venue and amount change. Skipping...");
        return;
      }

      const message = `The amount for the ${venue} has been changed to ₱${newAmount}`;
      const newNotificationRef = doc(notificationRef, notificationId);

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
  
    // Check if a venue with the same name already exists
    const venueExists = venueData.some((venue) => venue.name.toLowerCase() === newVenueName.toLowerCase());
  
    if (venueExists) {
      message.error('A facility with this name already exists. Please use a different name.');
      return;
    }
  
    try {
      const venueCollection = collection(db, 'venueAmounts');
      const venueDocRef = doc(venueCollection, newVenueName);
      await setDoc(venueDocRef, {
        name: newVenueName,
        amount: newVenueAmount,
        updatedAt: serverTimestamp(),
      });
  
      const newVenue = {
        id: newVenueName,
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

  const handleDeleteVenue = async (venueId) => {
    try {
      await deleteDoc(doc(db, 'venueAmounts', venueId));
      setVenueData((prev) => prev.filter((venue) => venue.id !== venueId));
      message.success('Venue deleted successfully');
    } catch (error) {
      message.error('Error deleting venue');
      console.error('Error deleting venue:', error);
    }
  };

  const showDeleteConfirmation = (venueId, venueName) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: (
        <span>
          Are you sure you want to delete the <strong>{venueName}</strong>?
        </span>
      ),
      onOk: () => handleDeleteVenue(venueId),
    });
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
            onChange={handleNewFacilityAmountChange}
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

            <DeleteOutlined
              className="text-red-500 cursor-pointer"
              onClick={() => showDeleteConfirmation(venue.id, venue.name)} // Pass both id and name
            />
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
