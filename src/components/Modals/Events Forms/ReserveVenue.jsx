import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Select, Typography, TimePicker, Row, Col, Tooltip, Form, Button, message } from 'antd';
import dayjs from 'dayjs';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

const { Text } = Typography;
const db = getFirestore();

export default function ReserveVenue() {
  const [date, setDate] = useState(new Date());
  const [venueAmount, setVenueAmount] = useState(0);
  const [reservedDates, setReservedDates] = useState([]);
  const [reservedTimes, setReservedTimes] = useState([]); // To track reserved time slots for basketball
  const [basketballAmount, setBasketballAmount] = useState(0);
  const [clubhouseAmount, setClubhouseAmount] = useState(0);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const venues = [
    { value: 'Basketball Court', label: 'Basketball Court' },
    { value: 'Club House', label: 'Club House' },
  ];

  const fetchUserFullName = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);  // Assuming user profiles are stored in the 'users' collection
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data().fullName; // Assuming the full name field is called 'fullName'
      } else {
        console.error('User data not found!');
        return 'Unknown User';
      }
    } catch (error) {
      console.error('Error fetching user full name:', error);
      return 'Unknown User';
    }
  };

  // Fetch reserved dates and times in real-time from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'eventReservations'), (snapshot) => {
      const reservedDatesSet = new Set();
      const reservedTimesSet = new Set();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'approved') {
          reservedDatesSet.add(data.date);
          if (data.venue === 'Basketball Court') {
            reservedTimesSet.add(`${data.date}_${data.startTime}-${data.endTime}`);
          }
        }
      });
      setReservedDates(Array.from(reservedDatesSet));
      setReservedTimes(Array.from(reservedTimesSet)); // Track reserved times for basketball court
    });
    return () => unsubscribe(); // Cleanup the subscription
  }, []);

  // Fetch venue amounts from Firestore
  useEffect(() => {
    const fetchVenueAmounts = async () => {
      try {
        const basketballDoc = doc(db, 'venueAmounts', 'BasketballCourt');
        const basketballSnapshot = await getDoc(basketballDoc);
        if (basketballSnapshot.exists()) {
          setBasketballAmount(basketballSnapshot.data().amount);
        }

        const clubhouseDoc = doc(db, 'venueAmounts', 'ClubHouse');
        const clubhouseSnapshot = await getDoc(clubhouseDoc);
        if (clubhouseSnapshot.exists()) {
          setClubhouseAmount(clubhouseSnapshot.data().amount);
        }
      } catch (error) {
        console.error("Error fetching venue amounts:", error);
      }
    };
    fetchVenueAmounts();
  }, []);


  const formatDate = (date) => {
    const adjustedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return adjustedDate.toISOString().split('T')[0];
  };

  // Check if a specific time slot is reserved for basketball
  const isBasketballReservedForToday = (calendarDate) => {
    const formattedDate = formatDate(calendarDate);
    return reservedTimes.some(timeSlot => timeSlot.includes(formattedDate) && timeSlot.includes('8 AM - 10 AM'));
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedDate(formatDate(newDate));
  };

  const handleVenueChange = (value) => {
    setSelectedVenue(value);
    if (value === 'Basketball Court') {
      setVenueAmount(basketballAmount);
      // Automatically set start time to 10 AM if 8-10 AM is already reserved
      if (isBasketballReservedForToday(date)) {
        setSelectedStartTime('10 AM');
      }
    } else if (value === 'Club House') {
      setVenueAmount(clubhouseAmount);
    }
    setSelectedStartTime(null);
    setSelectedEndTime(null);
  };

  const handleStartTimeChange = (time) => {
    if (time) {
      setSelectedStartTime(time.format('h A'));
    }
  };

  const handleEndTimeChange = (time) => {
    if (time) {
      const newEndTime = time.format('h A');
      if (selectedStartTime) {
        const startTimeObj = dayjs(selectedStartTime, 'h A');
        const endTimeObj = dayjs(newEndTime, 'h A');
        if (endTimeObj.isBefore(startTimeObj)) {
          message.error('End time must be after the start time!');
          setSelectedEndTime(null);
          return;
        }
      }
      setSelectedEndTime(newEndTime);
    }
  };

  const handleSubmitReservation = async () => {
    if (!selectedDate || !selectedVenue || !selectedStartTime || !selectedEndTime) {
      message.error('Please select a date, venue, and valid start and end times.');
      return;
    }

    setLoading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) {
        message.error('You must be logged in to make a reservation.');
        setLoading(false);
        return;
      }

      // Fetch full name if displayName is not available
      const userName = user.displayName || await fetchUserFullName(user.uid);

      // Convert selectedDate to Firestore Timestamp
      const reservationDate = dayjs(selectedDate).toDate();  // Ensure it's a Date object

      // Calculate totalAmount (just an example logic for now)
      const totalAmount = venueAmount * 2;  // Assuming it's a 2-hour reservation

      // Prepare reservation data
      const reservationData = {
        createdAt: Timestamp.fromDate(new Date()),  // Current timestamp for createdAt
        formValues: {
          amount: venueAmount,  // Single hour price
          date: selectedDate,  // Reservation date
          endTime: selectedEndTime,  // End time
          startTime: selectedStartTime,  // Start time
          totalAmount: totalAmount,  // Total amount calculated
          userName: userName,  // Full name (from displayName or fetched from Firestore)
          venue: selectedVenue,  // Selected venue
        },
        message: `New reservation request by ${userName}, for ${selectedVenue} on ${dayjs(reservationDate).format('YYYY-MM-DD')} from ${selectedStartTime} to ${selectedEndTime}`,
        status: 'unread',  // Reservation status
      };

      const reservationRef = collection(db, 'reservationRequests');
      const newDocRef = doc(reservationRef);

      // Save reservation data to Firestore
      await setDoc(newDocRef, reservationData);

      toast.success('Your reservation request has been submitted for approval.');

      // Trigger Admin Notification with full reservation details
      const adminNotificationRef = collection(db, 'notifications');
      const notificationData = {
        createdAt: Timestamp.fromDate(new Date()),  // Current timestamp for notification
        formValues: {
          amount: venueAmount,  // Single hour price
          date: selectedDate,  // Reservation date
          endTime: selectedEndTime,  // End time
          startTime: selectedStartTime,  // Start time
          totalAmount: totalAmount,  // Total amount calculated
          userName: userName,  // Full name (from displayName or fetched from Firestore)
          venue: selectedVenue,  // Selected venue
        },
        message: `New reservation request from ${userName} for ${selectedVenue} on ${dayjs(reservationDate).format('MMMM D, YYYY')} from ${dayjs(selectedStartTime, 'h A').format('h A')} to ${dayjs(selectedEndTime, 'h A').format('h A')}. Total Amount: ${formatPrice(totalAmount)}`,
        status: 'unread',  // Notification status
      };
      await setDoc(doc(adminNotificationRef), notificationData);

    } catch (error) {
      console.error('Error submitting reservation request:', error);
      message.error('There was an error submitting your reservation request.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderTimeOptions = () => {
    return (
      <Form layout="vertical" style={{ marginTop: 20 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Start Time">
              <Tooltip title="Select a start time">
                <TimePicker
                  value={selectedStartTime ? dayjs(selectedStartTime, 'h A') : null}
                  format="h A"
                  onChange={handleStartTimeChange}
                  minuteStep={60}
                  use12Hours
                  style={{ width: '100%' }}
                  placeholder="Start Time"
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
                  minuteStep={60}
                  use12Hours
                  style={{ width: '100%' }}
                  placeholder="End Time"
                />
              </Tooltip>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <Text strong style={{ fontSize: '1.25rem' }}>Venue Selection</Text>
      <div style={{ marginTop: '20px' }}>
        <Select
          placeholder="Select a Venue"
          onChange={handleVenueChange}
          style={{ width: '250px' }}
        >
          {venues.map((venue) => (
            <Select.Option key={venue.value} value={venue.value}>
              {venue.label}
            </Select.Option>
          ))}
        </Select>

        <div>
          <Text strong style={{ fontSize: '1.1rem' }}>Total Amount: {formatPrice(venueAmount)}</Text>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Reserve a Venue</h2>
        <Calendar
          onChange={handleDateChange}
          value={date}
          tileContent={({ date }) => {
            const isReserved = reservedDates.includes(formatDate(date));
            return isReserved ? (
              <div
                style={{
                  backgroundColor: 'lightcoral',
                  borderRadius: '50%',
                  width: '80%',
                  height: '80%',
                  margin: '10px auto',
                }}
              />
            ) : null;
          }}
        />
        {renderTimeOptions()}
        <Button
          type="primary"
          onClick={handleSubmitReservation}
          loading={loading}
          disabled={loading}
          style={{ marginTop: '20px' }}
        >
          Confirm Reservation
        </Button>
      </div>
    </div>
  );
}
