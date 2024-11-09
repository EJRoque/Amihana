import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, AutoComplete, Input, Button, Modal } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";
import { fetchReservationsForToday } from '../../firebases/firebaseFunctions';
import nogroup from "../../assets/images/no-group.png";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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

    // Fetch today's reservations for all homeowners
    const fetchReservations = async () => {
        setLoading(true);
        try {
            const allReservations = await fetchReservationsForToday();
            const today = new Date().toISOString().split('T')[0];

            // Fetch amounts from Firestore directly for each venue
            const basketballDocRef = doc(db, "venueAmounts", "BasketballCourt");
            const clubhouseDocRef = doc(db, "venueAmounts", "ClubHouse");

            const basketballDoc = await getDoc(basketballDocRef);
            const clubhouseDoc = await getDoc(clubhouseDocRef);

            // Store amounts in state (global amounts)
            const basketballAmountFromFirestore = basketballDoc.exists() ? basketballDoc.data().amount : null;
            const clubhouseAmountFromFirestore = clubhouseDoc.exists() ? clubhouseDoc.data().amount : null;

            setBasketballAmount(basketballAmountFromFirestore);
            setClubhouseAmount(clubhouseAmountFromFirestore);

            // Filter reservations to only include those with today's date
            const todayReservations = allReservations.filter(reservation => reservation.date === today);

            // Add totalAmount to the reservation data
            const enrichedReservations = todayReservations.map(reservation => {
                const venueAmount = reservation.venue === 'Basketball Court' 
                    ? basketballAmountFromFirestore 
                    : clubhouseAmountFromFirestore;

                // Calculate totalAmount (amount per hour * duration in hours)
                const { startTime, endTime } = reservation;
                const totalAmount = calculateTotalAmount(startTime, endTime, venueAmount);

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
        fetchReservations();
    }, []);

    // Update filtered events based on search text
    useEffect(() => {
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

    // Handle amount input change and save to Firestore
    const handleAmountChange = (venue, value) => {
        if (venue === 'Basketball Court') {
            setBasketballAmount(value);
            updateAmountInFirestore("BasketballCourt", value); // Update Firestore
        } else if (venue === 'Club House') {
            setClubhouseAmount(value);
            updateAmountInFirestore("ClubHouse", value); // Update Firestore
        }
    };

    // Update amounts in Firestore when admin sets them
    const updateAmountInFirestore = async (venue, amount) => {
        try {
            const docRef = doc(db, "venueAmounts", venue);
            await setDoc(docRef, { amount: amount });
        } catch (error) {
            toast.error(`Failed to update amount for ${venue}.`);
            console.error("Error updating amount:", error);
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
            handleAmountChange('Basketball Court', tempAmount);
        }
        setTempAmount('');
        setIsBasketballModalVisible(false);
    };

    // Handle OK button for Clubhouse amount
    const handleClubhouseOk = () => {
        if (tempAmount !== clubhouseAmount) {  // Check if the value has actually changed
            handleAmountChange('Club House', tempAmount);
        }
        setTempAmount('');
        setIsClubhouseModalVisible(false);
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

            <div className='flex space-x-4 mt-8'>
                <Title level={4}>Today's Reservations</Title>
                <AutoComplete 
                    style={{ width: 200 }}
                    placeholder="Search"
                    onSearch={setSearchText}
                    onSelect={(value) => setSearchText(value)}
                />
            </div>

            {/* Modals */}
            <Modal
                title="Set Basketball Court Amount"
                visible={isBasketballModalVisible}
                onOk={handleBasketballOk}
                onCancel={() => setIsBasketballModalVisible(false)}
            >
                <Input 
                    type="number" 
                    value={tempAmount} 
                    onChange={(e) => setTempAmount(e.target.value)} 
                    placeholder="Enter amount for Basketball Court" 
                />
            </Modal>

            <Modal
                title="Set Clubhouse Amount"
                visible={isClubhouseModalVisible}
                onOk={handleClubhouseOk}
                onCancel={() => setIsClubhouseModalVisible(false)}
            >
                <Input 
                    type="number" 
                    value={tempAmount} 
                    onChange={(e) => setTempAmount(e.target.value)} 
                    placeholder="Enter amount for Club House" 
                />
            </Modal>

            {loading ? (
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            ) : filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center opacity-30">
                    <img 
                        src={nogroup} 
                        alt="No Events Available" 
                        className="max-h-screen max-w-screen mb-2"
                    />
                    <Text>No reservations for today.</Text>
                </div>
            ) : (
                filteredEvents.map((reservation, index) => (
                    <Card key={index} className="max-w-xl mx-auto mb-4" title="Reservation Details" bordered={true}>
                        <Text strong>User Name: </Text>
                        <Text>{reservation.userName}</Text>
                        <br />
                        <Text strong>Date: </Text>
                        <Text>{reservation.date}</Text>
                        <br />
                        <Text strong>Start Time: </Text>
                        <Text>{reservation.startTime}</Text>
                        <br />
                        <Text strong>End Time: </Text>
                        <Text>{reservation.endTime}</Text>
                        <br />
                        <Text strong>Venue: </Text>
                        <Text>{reservation.venue}</Text>
                        <br />
                        <Text strong>Total Amount: </Text>
                        <Text>{reservation.totalAmount ? `${reservation.totalAmount} Php` : 'Amount not set'}</Text>
                        <br />
                        <Text strong>Status: </Text>
                        <Text type={reservation.status === 'approved' ? "success" : "warning"}>{reservation.status}</Text>
                    </Card>
                ))
            )}
        </div>
    );
}