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

  const getDisabledHours = () => {
    const disabledHours = [];
    reservedTimes.forEach(({ startTime, endTime }) => {
      const startHour = dayjs(startTime, 'h A').hour();
      const endHour = dayjs(endTime, 'h A').hour();
      for (let hour = startHour; hour < endHour; hour++) {
        if (!disabledHours.includes(hour)) disabledHours.push(hour);
      }
    });
    return disabledHours;
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
    return hours * hourlyRate;
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
        setVenueAmount(venueDoc.data().amount);
        if (selectedStartTime && selectedEndTime) {
          const calculatedAmount = calculateTotalAmount(selectedStartTime, selectedEndTime, venueDoc.data().amount);
          setTotalAmount(calculatedAmount);
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
    fetchVenueAmount(value);
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

    const reservationMessage = `New reservation request from ${userName} for ${formattedDate} from ${selectedStartTime} to ${selectedEndTime}. Total Amount: ₱${totalAmount.toLocaleString()}.`;

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

  // Define renderTimeOptions function
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
                disabledHours={getDisabledHours}
                style={{ width: '100%' }}
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
                disabledHours={getDisabledHours}
                style={{ width: '100%' }}
              />
            </Tooltip>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <div>
      <h2>Reserve a Venue</h2>
      <Calendar onChange={handleDateChange} value={date} />

      <Select
        style={{ width: 200, marginTop: 20 }}
        placeholder="Select a Venue"
        value={selectedVenue}
        onChange={handleVenueChange}
        options={venues.map(venue => ({ value: venue.value, label: venue.label }))}
      />

      {selectedVenue && !loadingAmount && (
        <div style={{ marginTop: 10 }}>
          <Text strong>Venue Amount: ₱{venueAmount.toLocaleString()}</Text>
        </div>
      )}

      {totalAmount > 0 && (
        <div style={{ marginTop: 10 }}>
          <Text strong>Total Amount: ₱{totalAmount.toLocaleString()}</Text>
        </div>
      )}

      {loadingAmount && <Text>Loading amount...</Text>}

      {renderTimeOptions()}

      <Button
        type="primary"
        onClick={handleSubmitReservation}
        style={{ marginTop: 20 }}
      >
        Submit Reservation
      </Button>
    </div>
  );
}
