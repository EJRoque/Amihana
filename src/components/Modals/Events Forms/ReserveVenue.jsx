import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';

import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Select, Typography } from 'antd';

const { Text } = Typography;
const db = getFirestore();

export default function ReserveVenue() {
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [venueAmount, setVenueAmount] = useState(0);
  const [basketballAmount, setBasketballAmount] = useState(35);
  const [clubhouseAmount, setClubhouseAmount] = useState(50);

  const venues = [
    { value: 'Basketball Court', label: 'Basketball Court' },
    { value: 'Club House', label: 'Club House' },
  ];

  useEffect(() => {
    const fetchVenueAmounts = async () => {
      try {
        const basketballDocRef = doc(db, 'venueAmounts', 'BasketballCourt');
        const clubhouseDocRef = doc(db, 'venueAmounts', 'ClubHouse');

        const basketballDoc = await getDoc(basketballDocRef);
        const clubhouseDoc = await getDoc(clubhouseDocRef);

        setBasketballAmount(basketballDoc.exists() ? basketballDoc.data().amount : 35);
        setClubhouseAmount(clubhouseDoc.exists() ? clubhouseDoc.data().amount : 50);
      } catch (error) {
        toast.error('Failed to fetch venue amounts.');
        console.error('Error fetching venue amounts:', error);
      }
    };

    fetchVenueAmounts();
  }, []);

  const handleVenueChange = (value) => {
    setVenueAmount(value === 'Basketball Court' ? basketballAmount : clubhouseAmount);
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Example of availability data; this can be replaced with fetched data
  const availability = {
    '2024-11-18': ['10:00 AM', '1:00 PM', '3:00 PM'],
    '2024-11-19': ['9:00 AM', '11:00 AM', '4:00 PM'],
    // Add more dates and times as needed
  };

  const isDateAvailable = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return availability[dateString] !== undefined;
  };

  const handleDateChange = (newDate) => {
    const dateString = newDate.toISOString().split('T')[0];
    setDate(newDate);
    setAvailableTimes(availability[dateString] || []);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleTimeChange = (event) => {
    const time = event.target.value;
    setSelectedTime(time);
  };

  return (
    <div className="flex-col flex">
      <Text strong>Venue</Text>
      <div className='flex flex-row items-center space-x-4'>
        <Select
        className="w-[30vh]"
        placeholder="Select a Venue"
        onChange={handleVenueChange}
      >
        {venues.map((venue) => (
          <Select.Option key={venue.value} value={venue.value}>
            {venue.label}
          </Select.Option>
        ))}
      </Select>

      <div>
        <Text strong>Total Amount: {formatPrice(venueAmount)}</Text>
      </div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div>
          <h1>Reserve a Venue</h1>
          <Calendar
            onChange={handleDateChange}
            value={date}
            tileDisabled={({ date }) => !isDateAvailable(date)}
          />
        </div>
        
        <div>
          <h2>Select a Time</h2>
          {availableTimes.length > 0 ? (
            <select value={selectedTime} onChange={handleTimeChange}>
              <option value="" disabled>Select a time</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time} - {time === selectedTime ? 'Available' : 'Unavailable'}
                </option>
              ))}
            </select>
          ) : (
            <p>No available times for this date.</p>
          )}
        </div>
      </div>
      
    </div>
  );
}
