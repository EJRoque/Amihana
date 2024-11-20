import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getFirestore, collection, doc, getDoc, setDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { Select, Typography, TimePicker, Row, Col, Tooltip, Form, Button, message } from 'antd';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { Text } = Typography;
const db = getFirestore();

export default function ReserveVenue() {
  const [date, setDate] = useState(new Date());
  const [reservedTimes, setReservedTimes] = useState([]);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [userFullName, setUserFullName] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(true);
  const [venueAmount, setVenueAmount] = useState(0);
  const [loadingAmount, setLoadingAmount] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const venues = [
    { value: 'BasketballCourt', label: 'Basketball Court' },
    { value: 'ClubHouse', label: 'Club House' },
  ];

  const formatDate = (date) => dayjs(date).format('YYYY-MM-DD');

  const fetchReservedTimes = async (date) => {
    try {
      const formattedDate = formatDate(date);
      const reservationsRef = collection(db, 'eventReservations');
      const q = query(reservationsRef, where('date', '==', formattedDate), where('status', '==', 'approved'));
      const querySnapshot = await getDocs(q);

      const reservedSlots = [];
      querySnapshot.forEach((doc) => {
        const { startTime, endTime } = doc.data();
        reservedSlots.push({ startTime, endTime });
      });

      setReservedTimes(reservedSlots);
    } catch (error) {
      console.error('Error fetching reserved times:', error);
      message.error('Failed to fetch reserved times.');
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedDate(formatDate(newDate));
    fetchReservedTimes(newDate);
  };

  const isTimeSlotReserved = (time) => {
    const timeObj = dayjs(time, 'h A');
    return reservedTimes.some(({ startTime, endTime }) => {
      const start = dayjs(startTime, 'h A');
      const end = dayjs(endTime, 'h A');
      return timeObj.isBetween(start, end, null, '[)');
    });
  };

  const getDisabledTime = () => {
    const disabledHours = [];
    reservedTimes.forEach(({ startTime, endTime }) => {
      const startHour = dayjs(startTime, 'h A').hour();
      const endHour = dayjs(endTime, 'h A').hour();
      for (let hour = startHour; hour < endHour; hour++) {
        if (!disabledHours.includes(hour)) disabledHours.push(hour);
      }
    });
    return {
      disabledHours: () => disabledHours,
    };
  };

  const handleStartTimeChange = (time) => {
    if (time) {
      const formattedTime = time.format('h A');
      if (isTimeSlotReserved(formattedTime)) {
        message.error('This time slot is already reserved.');
        setSelectedStartTime(null);
        return;
      }
      setSelectedStartTime(formattedTime);

      if (selectedEndTime) {
        const calculatedAmount = calculateTotalAmount(formattedTime, selectedEndTime, venueAmount);
        setTotalAmount(calculatedAmount);
      }
    }
  };

  const handleEndTimeChange = (time) => {
    if (time) {
      const formattedTime = time.format('h A');
      const startTimeObj = dayjs(selectedStartTime, 'h A');
      const endTimeObj = dayjs(formattedTime, 'h A');
      if (endTimeObj.isBefore(startTimeObj)) {
        message.error('End time must be after the start time!');
        setSelectedEndTime(null);
        return;
      }
      setSelectedEndTime(formattedTime);

      if (selectedStartTime) {
        const calculatedAmount = calculateTotalAmount(selectedStartTime, formattedTime, venueAmount);
        setTotalAmount(calculatedAmount);
      }
    }
  };

  const calculateTotalAmount = (startTime, endTime, hourlyRate) => {
    const start = dayjs(startTime, 'h A');
    const end = dayjs(endTime, 'h A');
    const hours = end.diff(start, 'hour');
    if (hours < 1) {
      message.error('Duration must be at least 1 hour');
      return 0;
    }
    return (hours * hourlyRate).toFixed(2); // Make sure it's formatted as a string with 2 decimals
  };

  const fetchUserFullName = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data().fullName;
    } else {
      throw new Error('User not found');
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = getAuth().currentUser;
      if (user) {
        try {
          const fullName = await fetchUserFullName(user.uid);
          setUserFullName(fullName);
        } catch (error) {
          console.error('Error fetching user full name:', error);
        }
      }
      setLoadingUserDetails(false);
    };
    fetchUserDetails();
  }, []);

  const fetchVenueAmount = async (venue) => {
    setLoadingAmount(true);
    try {
      const venueRef = doc(db, 'venueAmounts', venue);
      const venueDoc = await getDoc(venueRef);
  
      if (venueDoc.exists()) {
        const amount = venueDoc.data().amount;
        setVenueAmount(amount);
  
        // If the selected venue is ClubHouse, set the total amount to the fetched amount directly
        if (venue === 'ClubHouse') {
          setTotalAmount(amount); // Set the total amount directly to the venue amount (e.g., 500)
        }
      } else {
        message.error('Amount not found for the selected venue.');
      }
    } catch (error) {
      console.error('Error fetching venue amount:', error);
      message.error('Failed to fetch venue amount.');
    } finally {
      setLoadingAmount(false);
    }
  };

  const handleVenueChange = (value) => {
    setSelectedVenue(value);
  
    // Clear the amount when switching between venues
    setVenueAmount(0); // Reset the venue amount before fetching the new one
  
    // If the selected venue is Club House, set the start time to 8 AM and end time to 5 PM by default
    if (value === 'ClubHouse') {
      setSelectedStartTime('8 AM'); // Automatically set start time to 8 AM
      setSelectedEndTime('5 PM'); // Automatically set end time to 5 PM
  
      // Fetch the amount for the ClubHouse and set the total amount directly
      fetchVenueAmount(value);
    } else if (value === 'BasketballCourt') {
      // For BasketballCourt, ensure you fetch the correct amount
      fetchVenueAmount(value); // Fetch the amount for the Basketball Court
      setSelectedStartTime(null); // Reset selected start time
      setSelectedEndTime(null); // Reset selected end time
      setTotalAmount(0); // Reset the total amount for other venues
    }
  };

  const handleSubmitReservation = async () => {
    if (loadingUserDetails) {
      message.error('Loading user details. Please wait...');
      return;
    }

    if (!selectedDate || !selectedVenue || !selectedStartTime || !selectedEndTime) {
      message.error('Please select a date, venue, and valid start and end times.');
      return;
    }

    const user = getAuth().currentUser;
    if (!user) {
      message.error('You must be logged in to make a reservation.');
      return;
    }

    const userName = userFullName || user.email;
    const formattedDate = selectedDate;

    // Check for existing reservation by the user
    const reservationRef = collection(db, 'eventReservations');
    const q = query(
      reservationRef,
      where('userId', '==', user.uid),
      where('date', '==', formattedDate),
      where('venue', '==', selectedVenue),
      where('startTime', '==', selectedStartTime),
      where('endTime', '==', selectedEndTime),
      where('status', '==', 'approved')
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If the query returns a result, it means there's already a reservation for this time slot
      message.error('You have already made this reservation for the selected time slot. Please modify the details if needed.');
      return;
    }

    // Proceed with creating a new reservation if no existing reservation is found
    const reservationMessage = `New reservation request from ${userName} for ${formattedDate} from ${selectedStartTime} to ${selectedEndTime}. Total Amount: ₱${parseFloat(totalAmount).toFixed(2)}.`;

    const adminNotificationRef = collection(db, 'notifications');
    const notificationData = {
      createdAt: Timestamp.fromDate(new Date()),
      formValues: {
        amount: venueAmount,
        date: selectedDate,
        endTime: selectedEndTime,
        startTime: selectedStartTime,
        totalAmount: totalAmount,
        userName: userName,
        venue: selectedVenue,
      },
      message: reservationMessage,
      status: 'unread',
    };

    try {
      await setDoc(doc(adminNotificationRef), notificationData);
      message.success('Reservation request submitted successfully!');
    } catch (error) {
      console.error('Error submitting reservation request:', error);
      message.error('There was an error submitting your reservation request.');
    }
  };

  const renderTimeOptions = () => (
    <Form layout="vertical" style={{ marginTop: 20 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Start Time">
            <Tooltip title="Select a start time">
              <TimePicker
                value={selectedStartTime ? dayjs(selectedStartTime, 'h A') : null}
                format="h A"
                onChange={handleStartTimeChange}
                disabledTime={selectedVenue === 'ClubHouse' ? () => ({}) : getDisabledTime}
                style={{ width: '100%' }}
                disabled={selectedVenue === 'ClubHouse'}
              />
            </Tooltip>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="End Time">
            <Tooltip title="Select an end time">
              <TimePicker
                value={selectedEndTime ? dayjs(selectedEndTime, 'h A') : null}
                format="h A"
                onChange={handleEndTimeChange}
                disabledTime={selectedVenue === 'ClubHouse' ? () => ({}) : getDisabledTime}
                style={{ width: '100%' }}
                disabled={selectedVenue === 'ClubHouse'}
              />
            </Tooltip>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const tileDisabled = ({ date }) => {
    return dayjs(date).isBefore(dayjs(), 'day');
  };

  return (
    <div>
      <h1>Reserve a Venue</h1>
      <Calendar onChange={handleDateChange} value={date} tileDisabled={tileDisabled} />

      <Select
        style={{ width: 200, marginTop: 20 }}
        placeholder="Select a Venue"
        value={selectedVenue || null}
        onChange={handleVenueChange}
        options={venues.map((venue) => ({ value: venue.value, label: venue.label }))} 
      />

      {selectedVenue && !loadingAmount && (
        <div style={{ marginTop: 10 }}>
          <Text strong>Venue Amount: ₱{venueAmount.toFixed(2)}</Text>
        </div>
      )}

      {totalAmount > 0 && (
        <div style={{ marginTop: 10 }}>
          <Text strong>Total Amount: ₱{parseFloat(totalAmount).toFixed(2)}</Text>
        </div>
      )}

      {loadingAmount && <Text>Loading amount...</Text>}

      {renderTimeOptions()}

      <Button
        type="primary"
        onClick={handleSubmitReservation}
        style={{ marginTop: 20, background: "#0C82B4" }}
      >
        Submit Reservation
      </Button>
    </div>
  );
}
