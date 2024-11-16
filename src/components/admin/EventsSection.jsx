import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, AutoComplete, Input, Button, Modal } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";
import { fetchReservationsForToday } from '../../firebases/firebaseFunctions';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, writeBatch } from 'firebase/firestore';

const { Text, Title } = Typography;
const db = getFirestore();

export default function EventsSection() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [basketballAmount, setBasketballAmount] = useState(null);
    const [clubhouseAmount, setClubhouseAmount] = useState(null);
    const [isBasketballModalVisible, setIsBasketballModalVisible] = useState(false);
    const [isClubhouseModalVisible, setIsClubhouseModalVisible] = useState(false);
    const [tempAmount, setTempAmount] = useState('');

    // Fetch venue amounts from Firestore once and store them
    const fetchVenueAmounts = async () => {
        try {
            const basketballDocRef = doc(db, "venueAmounts", "BasketballCourt");
            const clubhouseDocRef = doc(db, "venueAmounts", "ClubHouse");
            const basketballDoc = await getDoc(basketballDocRef);
            const clubhouseDoc = await getDoc(clubhouseDocRef);

            // Store amounts in state (cache them)
            const basketballAmountFromFirestore = basketballDoc.exists() ? basketballDoc.data().amount : null;
            const clubhouseAmountFromFirestore = clubhouseDoc.exists() ? clubhouseDoc.data().amount : null;

            setBasketballAmount(basketballAmountFromFirestore);
            setClubhouseAmount(clubhouseAmountFromFirestore);
        } catch (error) {
            toast.error('Failed to fetch venue amounts.');
            console.error("Error fetching venue amounts:", error);
        }
    };

    useEffect(() => {
        fetchVenueAmounts();  // Fetch venue amounts once on mount
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const allReservations = await fetchReservationsForToday();
            const today = new Date().toISOString().split('T')[0];

            // Filter reservations to only include those with today's date
            const todayReservations = allReservations.filter(reservation => reservation.date === today);

            // Enrich reservations with total amount based on venue
            const enrichedReservations = todayReservations.map(reservation => {
                // Check if the reservation is approved (not updating the amount for approved ones)
                const venueAmount = reservation.venue === 'Basketball Court' 
                    ? basketballAmount 
                    : clubhouseAmount;

                const { startTime, endTime, status } = reservation;

                // If the reservation is approved, keep the original totalAmount
                const totalAmount = status === 'approved' 
                    ? reservation.totalAmount  // Don't change approved reservation's amount
                    : calculateTotalAmount(startTime, endTime, venueAmount);

                return {
                    ...reservation,
                    totalAmount: totalAmount,  // Add totalAmount to reservation
                };
            });

            setEvents(enrichedReservations);
            setFilteredEvents(enrichedReservations);
        } catch (error) {
            toast.error('Failed to fetch reservations for today.');
            console.error("Error fetching reservations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();  // Fetch reservations after venue amounts are fetched
    }, [basketballAmount, clubhouseAmount]);

    useEffect(() => {
        // Filter events based on search text
        const filtered = events.filter(event =>
            event.userName.toLowerCase().includes(searchText.toLowerCase()) ||
            event.venue.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredEvents(filtered);
    }, [searchText, events]);

    // Helper function to calculate totalAmount
    const calculateTotalAmount = (startTime, endTime, amountPerHour) => {
        const start = new Date(`1970-01-01T${startTime}:00Z`);
        const end = new Date(`1970-01-01T${endTime}:00Z`);

        let durationInHours = (end - start) / (1000 * 60 * 60);

        if (durationInHours < 0) {
            durationInHours += 24; // Handle crossing midnight
        }

        return durationInHours * amountPerHour; // Total amount = duration * amount per hour
    };

    // Handle amount change and save to Firestore
    const handleAmountChange = async (venue, value) => {
        try {
            // Update the local state first
            if (venue === 'Basketball Court') {
                setBasketballAmount(value);
                await updateAmountInFirestore("BasketballCourt", value);  // Update Firestore
            } else if (venue === 'Club House') {
                setClubhouseAmount(value);
                await updateAmountInFirestore("ClubHouse", value);  // Update Firestore
            }

            // After updating Firestore, send the notification
            sendAmountChangeNotification(venue, value);

        } catch (error) {
            toast.error(`Failed to update amount for ${venue}.`);
            console.error("Error updating amount:", error);
        }
    };

    // Update amounts in Firestore when admin sets them
    const updateAmountInFirestore = async (venue, amount) => {
        try {
            const docRef = doc(db, "venueAmounts", venue);
            await setDoc(docRef, { amount: parseFloat(amount) });  // Ensure the amount is a number
        } catch (error) {
            toast.error(`Failed to update amount for ${venue}.`);
            console.error("Error updating amount:", error);
        }
    };

    // Function to send a notification after updating the venue amount
    const sendAmountChangeNotification = async (venue, newAmount) => {
        try {
          // Check if the notification already exists in Firestore to avoid duplicates
          const notificationRef = collection(db, "notifications");
      
          // Create a unique notification ID based on venue, amount, and date
          const notificationId = `${venue}-${newAmount}-${new Date().toISOString().split('T')[0]}`;
      
          // Check if a similar notification already exists by querying Firestore
          const snapshot = await getDocs(notificationRef);
          const existingNotification = snapshot.docs.find(doc => doc.id === notificationId);
      
          if (existingNotification) {
            console.log("Notification already exists for this venue and amount change. Skipping...");
            return; // Skip if the notification already exists in Firestore
          }
      
          // Create a new notification message
          const message = `The amount for the ${venue} has been changed to ${newAmount} Php.`;
      
          // Send notification as a batch write
          const batch = writeBatch(db);
      
          // Add a notification document
          const newNotificationRef = doc(notificationRef, notificationId); // Using the unique ID as document ID
          batch.set(newNotificationRef, {
            status: "info",  // Status can be 'info', 'warning', etc.
            message: message,
            date: new Date().toLocaleDateString(),
            timestamp: new Date(),  // Add the timestamp
            formValues: {
              userName: "Admin",  // Assuming the admin made the change
              venue: venue,
              amount: newAmount,
            },
          });
      
          // Commit the batch write
          await batch.commit();
      
          console.log("Amount change notification sent!");
      
        } catch (error) {
          console.error("Error sending amount change notification:", error);
          toast.error("Failed to send notification.");
        }
      };

    // Open Modal for setting Basketball Court amount
    const showBasketballModal = () => {
        setTempAmount(basketballAmount);  // Set the current basketball amount in the modal
        setIsBasketballModalVisible(true);
    };

    // Open Modal for setting Clubhouse amount
    const showClubhouseModal = () => {
        setTempAmount(clubhouseAmount);  // Set the current clubhouse amount in the modal
        setIsClubhouseModalVisible(true);
    };

    // Handle OK button for Basketball Court amount
    const handleBasketballOk = () => {
        if (tempAmount !== basketballAmount) {  // Check if the value has actually changed
            handleAmountChange('Basketball Court', tempAmount);  // Save the new amount
        }
        setTempAmount('');  // Reset the temp amount
        setIsBasketballModalVisible(false);  // Close the modal
    };

    // Handle OK button for Clubhouse amount
    const handleClubhouseOk = () => {
        if (tempAmount !== clubhouseAmount) {  // Check if the value has actually changed
            handleAmountChange('Club House', tempAmount);  // Save the new amount
        }
        setTempAmount('');  // Reset the temp amount
        setIsClubhouseModalVisible(false);  // Close the modal
    };

    return (
        <div className="section-wrapper p-4">
            {/* Admin UI to set the venue amounts */}
            <div className="mt-4">
                <Title level={4}>Set Amounts for Venues</Title>
                <div className="flex space-x-4">
                    <div>
                        <Button 
                            type="primary" 
                            onClick={showBasketballModal}
                        >
                            Set Amount for Basketball Court
                        </Button>
                        <div className="mt-2">
                            <Text strong>Basketball Amount per Hour: </Text>
                            <Text>{basketballAmount !== null ? `${basketballAmount} Php` : 'Not set'}</Text>
                        </div>
                    </div>
                    <div>
                        <Button 
                            type="primary" 
                            onClick={showClubhouseModal}
                        >
                            Set Amount for Club House
                        </Button>
                        <div className="mt-2">
                            <Text strong>Clubhouse Amount per Hour: </Text>
                            <Text>{clubhouseAmount !== null ? `${clubhouseAmount} Php` : 'Not set'}</Text>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar for Filtering Events */}
            <div className="mt-8">
                <AutoComplete 
                    style={{ width: 300 }} 
                    onChange={setSearchText}
                    placeholder="Search by User or Venue"
                >
                    <Input suffix={<SearchOutlined />} />
                </AutoComplete>
            </div>

            {/* Approved Reservations */}
            <div className="mt-8">
                <Title level={4}>Approved Reservations</Title>
                {loading ? (
                    <Spin indicator={<LoadingOutlined spin />} />
                ) : (
                    filteredEvents.length > 0 ? (
                        filteredEvents.map((reservation, index) => {
                            const { userName, date, startTime, endTime, venue, totalAmount, status } = reservation;
                            return (
                                <Card key={index} className="max-w-xl mx-auto mb-4" title="Reservation Details" bordered={true}>
                                    <Text strong>User Name: </Text>
                                    <Text>{userName}</Text>
                                    <br />
                                    <Text strong>Date: </Text>
                                    <Text>{date}</Text>
                                    <br />
                                    <Text strong>Start Time: </Text>
                                    <Text>{startTime}</Text>
                                    <br />
                                    <Text strong>End Time: </Text>
                                    <Text>{endTime}</Text>
                                    <br />
                                    <Text strong>Venue: </Text>
                                    <Text>{venue}</Text>
                                    <br />
                                    <Text strong>Total Amount: </Text>
                                    <Text>{totalAmount} Php</Text>
                                    <br />
                                    <Text strong>Status: </Text>
                                    <Text type="success">{status}</Text>
                                </Card>
                            );
                        })
                    ) : (
                        <Text>No reservations found.</Text>
                    )
                )}
            </div>

            {/* Modals for Setting Amounts */}
            <Modal
                title="Set Amount for Basketball Court"
                visible={isBasketballModalVisible}
                onOk={handleBasketballOk}
                onCancel={() => setIsBasketballModalVisible(false)}
            >
                <Input 
                    type="number"
                    value={tempAmount}
                    onChange={(e) => setTempAmount(e.target.value)} // Update tempAmount when typing
                    placeholder="Enter amount per hour"
                />
            </Modal>

            <Modal
                title="Set Amount for Club House"
                visible={isClubhouseModalVisible}
                onOk={handleClubhouseOk}
                onCancel={() => setIsClubhouseModalVisible(false)}
            >
                <Input 
                    type="number"
                    value={tempAmount}
                    onChange={(e) => setTempAmount(e.target.value)} // Update tempAmount when typing
                    placeholder="Enter amount per hour"
                />
            </Modal>
        </div>
    );
}
