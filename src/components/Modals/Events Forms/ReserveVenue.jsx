  import React, { useState, useEffect } from 'react';
  import Calendar from 'react-calendar';
  import 'react-calendar/dist/Calendar.css';
  import { getFirestore, collection, doc, getDoc, setDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
  import { Select, Typography, TimePicker, Tooltip, Form, Button, message } from 'antd';
  import { getAuth } from 'firebase/auth';
  import dayjs from 'dayjs';
  import { checkDuplicateNotification } from '../../../firebases/firebaseFunctions';  // Adjust path as needed
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
          const { startTime, endTime, venue } = doc.data();
          reservedSlots.push({ startTime, endTime, venue });
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
      const timeObj = dayjs(time, 'h A').hour();  // Only check the hour (not minutes)
      
      return reservedTimes.some(({ startTime, endTime }) => {
        const start = dayjs(startTime, 'h A').hour();
        const end = dayjs(endTime, 'h A').hour();
        
        // Check if the timeObj falls within the range of any reserved time
        return timeObj >= start && timeObj < end; // Updated to just check hours
      });
    };

    const getDisabledHours = (isStartTime = true) => {
      const disabledHours = [];
      
      // For the Basketball Court, we disable hours that are already reserved
      if (selectedVenue === 'BasketballCourt') {
        reservedTimes.forEach(({ startTime, endTime, venue }) => {
          const startHour = dayjs(startTime, 'h A').hour();
          const endHour = dayjs(endTime, 'h A').hour();
          
          // Disable hours for BasketballCourt
          if (venue === 'BasketballCourt') {
            for (let hour = startHour; hour < endHour; hour++) {
              if (!disabledHours.includes(hour)) disabledHours.push(hour);
            }
          }
        });
      }
    
      // Add custom logic for other venues if needed
      if (selectedVenue === 'ClubHouse') {
        // Specific restrictions for ClubHouse
        if (isStartTime) {
          return [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];  // Only 8 AM allowed
        } else {
          return [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];  // Only 5 PM allowed
        }
      }
    
      return disabledHours;
    };

    const handleStartTimeChange = (time) => {
      if (time) {
        const formattedTime = time.format('h A');
        if (selectedVenue === 'ClubHouse') {
          if (formattedTime !== '8 AM') {
            message.error('Start time for ClubHouse must be 8 AM');
            setSelectedStartTime(null);
            return;
          }
          setSelectedStartTime(formattedTime);
          return;
        }
    
        if (isTimeSlotReserved(formattedTime)) {
          message.error('This time slot is already reserved.');
          setSelectedStartTime(null);
          return;
        }
    
        setSelectedStartTime(formattedTime);
      
        // If other venues, proceed with the normal logic (e.g., check if reserved)
        if (isTimeSlotReserved(formattedTime)) {
          message.error('This time slot is already reserved.');
          setSelectedStartTime(null);
          return;
        }
    
        setSelectedStartTime(formattedTime);
    
        // Check if the start time is between two reservations (boundary)
        const nextAvailableEndTime = getNextAvailableEndTime(formattedTime);
        
        // If the start time is in the middle of two reservations, auto set the end time
        if (nextAvailableEndTime && !selectedEndTime) {
          setSelectedEndTime(nextAvailableEndTime);  // Automatically set the end time to the next available hour
          const calculatedAmount = calculateTotalAmount(formattedTime, nextAvailableEndTime, venueAmount);
          setTotalAmount(calculatedAmount);
        } else if (selectedEndTime) {
          const calculatedAmount = calculateTotalAmount(formattedTime, selectedEndTime, venueAmount);
          setTotalAmount(calculatedAmount);
        }
      }
    };

    const getNextAvailableEndTime = (startTime) => {
    const startHour = dayjs(startTime, 'h A').hour();

    // Check for any reservations where the selected start time is between two existing reservations
    const nextAvailableEndTime = reservedTimes.reduce((nextTime, { startTime: resStart, endTime: resEnd }) => {
      const resStartHour = dayjs(resStart, 'h A').hour();
      const resEndHour = dayjs(resEnd, 'h A').hour();

      // Check if the selected start time is between the end of one reservation and the start of another
      if (startHour === resEndHour) {
        const nextHour = resEndHour + 1;  // Set the end time to the next hour after the current reservation
        return nextHour;
      }

      return nextTime;
    }, null); // Return null if no available end time is found (no boundary)

    // If an available end time is found, return the formatted next hour (next available hour)
    return nextAvailableEndTime !== null ? dayjs().hour(nextAvailableEndTime).minute(0).format('h A') : null;
  };

  const handleEndTimeChange = (time) => {
    if (time) {
      const formattedTime = time.format('h A');

      // For ClubHouse, end time must always be 5 PM
      if (selectedVenue === 'ClubHouse') {
        if (formattedTime !== '5 PM') {
          message.error('End time for ClubHouse must be 5 PM');
          setSelectedEndTime(null);
          return;
        }
        setSelectedEndTime(formattedTime);
        return;
      }

      // For other venues, ensure that the end time is after the start time
      const startTimeObj = dayjs(selectedStartTime, 'h A');
      const endTimeObj = dayjs(formattedTime, 'h A');
      if (endTimeObj.isBefore(startTimeObj)) {
        message.error('End time must be after the start time!');
        setSelectedEndTime(null);
        return;
      }

      // Set the end time and calculate the total amount if both start and end times are selected
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
          const amount = venueDoc.data().amount;
          setVenueAmount(amount);
    
          // If the venue is ClubHouse, set the totalAmount based on the fixed amount
          if (venue === 'ClubHouse') {
            setTotalAmount(amount); // Set the fixed amount for ClubHouse
          } else {
            // If not ClubHouse, calculate the amount based on selected times
            if (selectedStartTime && selectedEndTime) {
              const calculatedAmount = calculateTotalAmount(selectedStartTime, selectedEndTime, amount);
              setTotalAmount(calculatedAmount);
            }
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
      
      // Automatically set start and end time for ClubHouse
      if (value === 'ClubHouse') {
        const startTime = dayjs().hour(8).minute(0); // 8 AM
        const endTime = dayjs().hour(17).minute(0); // 5 PM
        
        // Set the selected times for ClubHouse
        setSelectedStartTime(startTime.format('h A'));
        setSelectedEndTime(endTime.format('h A'));
        
        // Set the fixed total amount for ClubHouse
        setTotalAmount(venueAmount);
      }
    };

      const checkDailyReservationLimit = async (userName) => {
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

    const checkDuplicateReservation = async (venue, date, startTime, endTime) => {
      // Validate the inputs before proceeding
      if (!venue || !date || !startTime || !endTime) {
        console.error('Missing required parameters for checking duplicate reservation');
        return false; // Or handle this case accordingly
      }
    
      try {
        const formattedDate = formatDate(date); // Ensure date is properly formatted
        const reservationsRef = collection(db, 'eventReservations');
      
        // Query Firestore to check for existing reservations with the same venue, date, and times
        const q = query(
          reservationsRef,
          where('venue', '==', venue),
          where('date', '==', formattedDate),
          where('status', 'in', ['approved', 'unread']) // Include unread reservations as well
        );
      
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} reservations for the selected time`);
      
        // Check for overlap with any existing reservation
        const isDuplicate = querySnapshot.docs.some(doc => {
          const data = doc.data();
          const existingStartTime = dayjs(data.startTime, 'h A'); // Convert start time to dayjs
          const existingEndTime = dayjs(data.endTime, 'h A'); // Convert end time to dayjs
          const selectedStartTimeObj = dayjs(startTime, 'h A'); // Convert new start time to dayjs
          const selectedEndTimeObj = dayjs(endTime, 'h A'); // Convert new end time to dayjs
      
          console.log(`Checking overlap: Existing - ${existingStartTime} to ${existingEndTime}, New - ${selectedStartTimeObj} to ${selectedEndTimeObj}`);
      
          // Check for overlapping reservations
          return selectedStartTimeObj.isBefore(existingEndTime) && selectedEndTimeObj.isAfter(existingStartTime);
        });
      
        if (isDuplicate) {
          console.log('Duplicate found!');
          return true;
        } else {
          console.log('No duplicate found.');
          return false;
        }
      } catch (error) {
        console.error('Error checking for duplicate reservations:', error);
        return false; // Return false in case of an error
      }
    };
    
    const handleSubmitReservation = async () => {
      if (loadingUserDetails) {
        message.error('Loading user details. Please wait...');
        return;
      }
    
      let isValid = true;
    
      // Check if each field is selected, and show specific error messages
      if (!selectedDate) {
        message.error('Please select a Date.');
        isValid = false;
      }
    
      if (!selectedVenue) {
        message.error('Please select a Venue.');
        isValid = false;
      }
    
      if (!selectedStartTime) {
        message.error('Please select a Start time.');
        isValid = false;
      }
    
      if (!selectedEndTime) {
        message.error('Please select an End time.');
        isValid = false;
      }
    
      // If any required field is missing, stop further execution
      if (!isValid) {
        return;
      }
    
      const user = getAuth().currentUser;
      if (!user) {
        message.error('You must be logged in to make a reservation.');
        return;
      }
    
      // Fetch the full name or email for the user
      const userName = userFullName || user.email;
    
      // Check if the user has already made 3 reservations for the day
      const isDailyLimitReached = await checkDailyReservationLimit(userName);
      if (isDailyLimitReached) {
        message.error('You have reached your daily reservation limit. Please try again tomorrow.');
        return;
      }
    
      // Check for duplicate reservation before proceeding
      const isDuplicate = await checkDuplicateReservation(selectedVenue, selectedDate, selectedStartTime, selectedEndTime);
    
      if (isDuplicate) {
        message.error('This time slot is already reserved. Please choose a different time.');
        return;
      }
    
      // Check for duplicate notification
      const isNotificationDuplicate = await checkDuplicateNotification(userName, selectedVenue, selectedDate, selectedStartTime, selectedEndTime);
    
      if (isNotificationDuplicate) {
        message.error('Duplicate Reservation Detected');
        return;
      }
    
      console.log('No duplicate reservation or notification found. Proceeding...');
    
      // Disable the button while the submission is being processed
      setLoading(true);
    
      // Continue with reservation submission logic...
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
      } finally {
        setLoading(false); // Re-enable the button after submission
      }
    };

    // Define renderTimeOptions function
    const renderTimeOptions = () => {
      const disabledStartHours = selectedVenue === 'ClubHouse' ? [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16] : []; // Disable all hours except 8 AM for start time
      const disabledEndHours = selectedVenue === 'ClubHouse' ? [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23] : []; // Disable all hours except 5 PM for end time
      
      return (
        <Form layout="vertical" style={{ marginTop: 20 }} className='flex'>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <Form.Item label="Start Time">
                <Tooltip title="Select a start time">
                <TimePicker
                  value={selectedStartTime ? dayjs(selectedStartTime, 'h A') : null}
                  format="h A"
                  onChange={handleStartTimeChange}
                  disabledHours={() => getDisabledHours(true)}  // For start time, check the disabled hours
                  style={{ width: 'auto' }}
                />
                </Tooltip>
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item label="End Time">
                <Tooltip title="Select an end time">
                <TimePicker
                  value={selectedEndTime ? dayjs(selectedEndTime, 'h A') : null}
                  format="h A"
                  onChange={handleEndTimeChange}
                  disabledHours={() => getDisabledHours(false)}  // For end time, check the disabled hours
                  style={{ width: 'auto' }}
                />
                </Tooltip>
              </Form.Item>
            </div>
          </div>
        </Form>
      );
    };
    
    return (
      <div className="flex w-full py-8 desktop:justify-center phone:justify-center">
        <div className="flex flex-col tablet:flex-row w-auto space-y-4 tablet:space-y-0 tablet:space-x-6">
          {/* Left side - Calendar and Venue Selection */}
          <div className="w-full tablet:w-2/3 phone:w-[30vh]">
            <Calendar onChange={handleDateChange} value={date} />
    
            <Select
              style={{ width: 'auto', marginTop: 20 }}
              placeholder="Select a Venue"
              value={selectedVenue || null}
              onChange={handleVenueChange}
              options={venues.map(venue => ({ value: venue.value, label: venue.label }))}
            />
    
            {renderTimeOptions()}
    
            <Button
             type="primary"
             onClick={handleSubmitReservation}
             style={{ marginTop: 20 }}
             loading={loading} // Add the loading state here
             disabled={loading} // Optionally disable the button while submitting
            >
              Submit Reservation
            </Button>
          </div>
    
          {/* Reservation Details */}
          <div className="flex-row bg-gray-100 p-8 rounded-lg shadow-lg phone:w-[30vh] desktop:w-[50vh] tablet:w-[35vh] ">
            <h3 className="text-lg font-semibold mb-4">Reservation Details</h3>
    
            <div className="mb-2">
              <Text strong>Venue:</Text> <span>{venues.find((v) => v.value === selectedVenue)?.label || ''}</span>
            </div>
            <div className="mb-2">
              <Text strong>Date: </Text>
              <span>{selectedDate ? dayjs(selectedDate).format('MMMM D, YYYY') : ''}</span>
            </div>
            <div className="mb-2">
              <Text strong>Start Time:</Text> <span>{selectedStartTime}</span>
            </div>
            <div className="mb-2">
              <Text strong>End Time:</Text> <span>{selectedEndTime}</span>
            </div>
            <div className="mb-4">
              <Text strong>Amount: </Text> 
              <span>₱{venueAmount > 0 ? venueAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
            </div>
            <div className="mb-4">
              <Text strong>Total Amount: </Text> 
              <span>₱{totalAmount > 0 ? totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
