  import React, { useState, useEffect } from 'react';
  import Calendar from 'react-calendar';
  import 'react-calendar/dist/Calendar.css';
  import { getFirestore, collection, doc, getDoc, setDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
  import { Modal, Select, Typography, TimePicker, Tooltip, Form, Button, message } from 'antd';
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
    const [venues, setVenues] = useState([]);
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
    const [isModalVisible, setIsModalVisible] = useState(false); // State to manage modal visibility
    const [reservationDetails, setReservationDetails] = useState(null); // State to store reservation details to show in modal
    
    const formatDate = (date) => dayjs(date).format('YYYY-MM-DD');

    // Function to fetch venues from Firestore
const fetchVenues = async () => {
  try {
    const venuesRef = collection(db, 'venueAmounts');
    const querySnapshot = await getDocs(venuesRef);
    
    // Map Firestore documents to the format needed for the dropdown
    const venueOptions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { value: data.name, label: `${data.name}` };
    });
    
    setVenues(venueOptions); // Update state with fetched data
  } catch (error) {
    console.error('Error fetching venues:', error);
    message.error('Failed to load venues. Please try again.');
  }
};

// Fetch venues on component mount
useEffect(() => {
  fetchVenues();
}, []);

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
    
        setReservedTimes(reservedSlots);  // Store the reserved times
      } catch (error) {
        console.error('Error fetching reserved times:', error);
        message.error('Failed to fetch reserved times.');
      }
    };

    useEffect(() => {
      if (selectedDate) {
        fetchReservedTimes(selectedDate);
      }
    }, [selectedDate]);
    

    const handleDateChange = (newDate) => {
      setDate(newDate);
      setSelectedDate(formatDate(newDate));
      fetchReservedTimes(newDate);
    };

    const isTimeSlotReserved = (time) => {
      const timeObj = dayjs(time, 'h:mm A').hour();  // Only check the hour (not minutes)
      
      return reservedTimes.some(({ startTime, endTime }) => {
        const start = dayjs(startTime, 'h:mm A').hour();
        const end = dayjs(endTime, 'h:mm A').hour();
        
        // Check if the timeObj falls within the range of any reserved time
        return timeObj >= start && timeObj < end; // Updated to just check hours
      });
    };

    const handleStartTimeChange = (time) => {
      if (time) {
        const formattedTime = time.format('h:mm A');
    
        // Check for 'ClubHouse' special case
        if (selectedVenue === 'ClubHouse') {
          if (formattedTime !== '8 AM') {
            message.error('Start time for ClubHouse must be 8 AM');
            setSelectedStartTime(null);
            return;
          }
          setSelectedStartTime(formattedTime);
          return;
        }
    
        // Check if the time slot is reserved
        if (isTimeSlotReserved(formattedTime)) {
          message.error('This time slot is already reserved.');
          setSelectedStartTime(null);
          return;
        }
    
        setSelectedStartTime(formattedTime);
    
        // Calculate and update end time if not set
        if (!selectedEndTime) {
          const calculatedEndTime = dayjs(formattedTime, 'h:mm A').add(1, 'hour').format('h:mm A');
          setSelectedEndTime(calculatedEndTime);  // Automatically set the end time
          const calculatedAmount = calculateTotalAmount(formattedTime, calculatedEndTime, venueAmount);
          setTotalAmount(calculatedAmount);
        } else if (selectedEndTime) {
          const calculatedAmount = calculateTotalAmount(formattedTime, selectedEndTime, venueAmount);
          setTotalAmount(calculatedAmount);
        }
    
        // Check if the start time is between two reservations (boundary)
        const nextAvailableEndTime = getNextAvailableEndTime(formattedTime);
        
        // If the start time is in the middle of two reservations, auto set the end time
        if (nextAvailableEndTime && !selectedEndTime) {
          setSelectedEndTime(nextAvailableEndTime);  // Automatically set the end time to the next available hour
          const calculatedAmount = calculateTotalAmount(formattedTime, nextAvailableEndTime, venueAmount);
          setTotalAmount(calculatedAmount);
        }
      }
    };
    
    
    const getNextAvailableEndTime = (startTime) => {
      const startHour = dayjs(startTime, 'h:mm A').hour();
    
      // Check for any reservations where the selected start time is between two existing reservations
      const nextAvailableEndTime = reservedTimes.reduce((nextTime, { startTime: resStart, endTime: resEnd }) => {
        const resStartHour = dayjs(resStart, 'h:mm A').hour();
        const resEndHour = dayjs(resEnd, 'h:mm A').hour();
    
        // Check if the selected start time is between the end of one reservation and the start of another
        if (startHour === resEndHour) {
          const nextHour = resEndHour + 1;  // Set the end time to the next hour after the current reservation
          return nextHour;
        }
    
        return nextTime;
      }, null); // Return null if no available end time is found (no boundary)
    
      // If an available end time is found, return the formatted next hour (next available hour)
      return nextAvailableEndTime !== null ? dayjs().hour(nextAvailableEndTime).minute(0).format('h:mm A') : null;
    };
    
    const handleEndTimeChange = (time) => {
      if (time) {
        const formattedTime = time.format('h:mm A');
    
        // For ClubHouse, end time must always be 5 PM
        if (selectedVenue === 'ClubHouse') {
          if (formattedTime !== '5 PM') {
            setSelectedEndTime(null); // Reset the end time
            return;
          }
          setSelectedEndTime(formattedTime);
          return;
        }
    
        // For other venues, ensure that the end time is after the start time
        const startTimeObj = dayjs(selectedStartTime, 'h:mm A');
        const endTimeObj = dayjs(formattedTime, 'h:mm A');
        
        if (endTimeObj.isBefore(startTimeObj)) {
          setSelectedEndTime(null); // Reset the end time if invalid
          return;
        }
    
        // Extract the minutes from the start time and lock the end time minutes
        const startMinutes = startTimeObj.minute(); // Get minutes from start time
        const endTimeWithStartMinutes = endTimeObj.minute(startMinutes).format('h:mm A'); // Set the end time to match start time minutes
    
        // Set the end time minutes automatically to match the start time's minutes
        setSelectedEndTime(endTimeWithStartMinutes);
    
        // Calculate the total amount only if both start and end times are selected
        if (selectedStartTime) {
          const calculatedAmount = calculateTotalAmount(selectedStartTime, endTimeWithStartMinutes, venueAmount);
          setTotalAmount(calculatedAmount);
        }
      }
    };
    
  
    const calculateTotalAmount = (startTime, endTime, hourlyRate) => {
      const start = dayjs(startTime, 'h:mm A');
      const end = dayjs(endTime, 'h:mm A');
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
        setSelectedStartTime(startTime.format('h:mm A'));
        setSelectedEndTime(endTime.format('h:mm A'));
        
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
        message.info(`Found ${querySnapshot.size} reservations for the selected time`);
      
        // Check for overlap with any existing reservation
        const isDuplicate = querySnapshot.docs.some(doc => {
          const data = doc.data();
          const existingStartTime = dayjs(data.startTime, 'h:mm A'); // Convert start time to dayjs
          const existingEndTime = dayjs(data.endTime, 'h:mm A'); // Convert end time to dayjs
          const selectedStartTimeObj = dayjs(startTime, 'h:mm A'); // Convert new start time to dayjs
          const selectedEndTimeObj = dayjs(endTime, 'h:mm A'); // Convert new end time to dayjs
      
          console.log(`Checking overlap: Existing - ${existingStartTime} to ${existingEndTime}, New - ${selectedStartTimeObj} to ${selectedEndTimeObj}`);
          message.useMessage(`Checking overlap: Existing - ${existingStartTime} to ${existingEndTime}, New - ${selectedStartTimeObj} to ${selectedEndTimeObj}`);
          // Check for overlapping reservations
          return selectedStartTimeObj.isBefore(existingEndTime) && selectedEndTimeObj.isAfter(existingStartTime);
        });
      
        if (isDuplicate) {
          message.warning('Duplicate found!');
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
    
      // Collect validation errors in an array to reduce repetition
      const validationErrors = [];
    
      if (!selectedDate) validationErrors.push('Please select a Date.');
      if (!selectedVenue) validationErrors.push('Please select a Venue.');
      if (!selectedStartTime) validationErrors.push('Please select a Start time.');
      if (!selectedEndTime) validationErrors.push('Please select an End time.');
    
      // If there are validation errors, show them and stop further execution
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => message.error(error));
        return;
      }
    
      const user = getAuth().currentUser;
      if (!user) {
        message.error('You must be logged in to make a reservation.');
        return;
      }
    
      const userName = userFullName || user.email;
    
      // Check if the user has reached the daily reservation limit
      if (await checkDailyReservationLimit(userName)) {
        message.error('You have reached your daily reservation limit. Please try again tomorrow.');
        return;
      }
    
      // Check for duplicate reservation or notification before proceeding
      if (await checkDuplicateReservation(selectedVenue, selectedDate, selectedStartTime, selectedEndTime)) {
        message.error('This time slot is already reserved. Please choose a different time.');
        return;
      }
    
      if (await checkDuplicateNotification(userName, selectedVenue, selectedDate, selectedStartTime, selectedEndTime)) {
        message.error('Duplicate Reservation Detected');
        return;
      }
    
      // Prepare reservation details and show confirmation modal
      const reservationMessage = `New reservation request from ${userName} for ${selectedDate} from ${selectedStartTime} to ${selectedEndTime}. Total Amount: ₱${totalAmount.toLocaleString()}.`;
    
      setReservationDetails({
        userName,
        selectedDate,
        selectedVenue,
        selectedStartTime,
        selectedEndTime,
        totalAmount,
        reservationMessage,
      });
    
      setIsModalVisible(true);  // Open modal to review reservation details
    };
    
    const handleConfirmReservation = async () => {
      setLoading(true);
    
      const { userName, selectedDate, selectedVenue, selectedStartTime, selectedEndTime, totalAmount } = reservationDetails;
    
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
        message: reservationDetails.reservationMessage,
        status: 'unread',
      };
    
      try {
        // Submit reservation data and notification
        await setDoc(doc(adminNotificationRef), notificationData);
        message.success('Reservation request submitted successfully!');
      } catch (error) {
        console.error('Error submitting reservation request:', error);
        message.error('There was an error submitting your reservation request.');
      } finally {
        setLoading(false);  // Re-enable the button after submission
        setIsModalVisible(false);  // Close the modal after submitting
      }
    };
    
    

// Define renderTimeOptions function
const renderTimeOptions = () => {
  const disabledStartHours = selectedVenue === 'ClubHouse' ? [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16] : []; // Disable all hours except 8 AM for start time
  const disabledEndHours = selectedVenue === 'ClubHouse' ? [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23] : []; // Disable all hours except 5 PM for end time

  // Function to get the disabled hours based on the start or end time
  const getDisabledHours = (isStart) => {
    const reservedStartTimes = reservedTimes.map(reservation => dayjs(reservation.startTime, 'h:mm A').hour());
    const disabledHours = isStart ? disabledStartHours : disabledEndHours;

    // Combine reserved times and predefined disabled hours
    return [...new Set([...disabledHours, ...reservedStartTimes])];  // Remove duplicates by using a Set
  };

  // Function to get the disabled minutes for the end time based on the selected start time
  const getDisabledMinutes = () => {
    if (!selectedStartTime) return []; // If no start time selected, no minutes to disable

    const startTimeObj = dayjs(selectedStartTime, 'h:mm A');
    const startMinutes = startTimeObj.minute(); // Get the minutes of the start time
    return Array.from({ length: 60 }).map((_, idx) => (idx !== startMinutes ? idx : null)).filter(val => val !== null);
  };

  return (
    <Form layout="vertical" style={{ marginTop: 20 }} className='flex'>
      <div style={{ display: 'flex', gap: '45px' }}>
        <div style={{ flex: 1 }}>
          <Form.Item label="Start Time">
            <Tooltip title="Select a start time">
              <TimePicker
                value={selectedStartTime ? dayjs(selectedStartTime, 'h:mm A') : null}
                format="h:mm A"
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
                value={selectedEndTime ? dayjs(selectedEndTime, 'h:mm A') : null}
                format="h:mm A"
                onChange={handleEndTimeChange}
                disabledHours={() => getDisabledHours(false)}  // For end time, check the disabled hours
                disabledMinutes={getDisabledMinutes} // Disable minutes based on start time's minutes
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
        <div className="flex justify-center w-full">
          <div className="flex flex-col items-center w-full max-w-[20rem] tablet:w-2/3 phone:w-[30vh]">
            {/* Left side - Calendar and Venue Selection */}
            <div className="w-full">
              <Calendar 
                onChange={handleDateChange} 
                value={date} 
                minDate={new Date()} // This disables past dates
              />
    
            <Select
              style={{ width: '100%', marginTop: 20 }}
              placeholder="Select a Venue"
              value={selectedVenue || null}
              onChange={handleVenueChange}
              options={venues} // Use the fetched venues for options
            />
    
            {renderTimeOptions()}
    
            <Button
              type="primary"
              onClick={handleSubmitReservation}
              style={{ marginTop: 20 }}
              loading={loading}
              disabled={loading}
            >
              Submit Reservation
            </Button>
          </div>
    
          {/* Modal for confirming reservation details */}
          <Modal
            title="Confirm Reservation Details"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={loading}
                onClick={handleConfirmReservation}
              >
                Confirm Reservation
              </Button>,
            ]}
          >
            {reservationDetails && (
              <div>
                <p><strong>Venue:</strong> {reservationDetails.selectedVenue}</p>
                <p><strong>Date:</strong> {reservationDetails.selectedDate}</p>
                <p><strong>Start Time:</strong> {reservationDetails.selectedStartTime}</p>
                <p><strong>End Time:</strong> {reservationDetails.selectedEndTime}</p>
                <p><strong>Total Amount:</strong> ₱{reservationDetails.totalAmount.toLocaleString()}</p>
              </div>
            )}
          </Modal>
        </div>
      </div>
    );
    
  }
