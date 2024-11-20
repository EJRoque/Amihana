import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Select, Typography, TimePicker, Tooltip, Form, Button, message } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { Text } = Typography;

const ReserveVenue = ({ pickerSize = 'default', buttonSize = 'default' }) => {
  const [date, setDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const venues = [
    { value: 'BasketballCourt', label: 'Basketball Court', rate: 200 },
    { value: 'ClubHouse', label: 'Club House', rate: 500 },
  ];

  const formatDate = (date) => dayjs(date).format('YYYY-MM-DD');

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleVenueChange = (value) => {
    const venue = venues.find((v) => v.value === value);
    setSelectedVenue(value);
    setTotalAmount(0);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    if (venue) {
      message.success(`Selected ${venue.label} (Rate: ₱${venue.rate}/hour)`);
    }
  };

  const handleStartTimeChange = (time) => {
    setSelectedStartTime(time ? time.format('h A') : null);
    if (time && selectedEndTime) calculateTotalAmount(time.format('h A'), selectedEndTime);
  };

  const handleEndTimeChange = (time) => {
    setSelectedEndTime(time ? time.format('h A') : null);
    if (time && selectedStartTime) calculateTotalAmount(selectedStartTime, time.format('h A'));
  };

  const calculateTotalAmount = (startTime, endTime) => {
    const venue = venues.find((v) => v.value === selectedVenue);
    if (!venue) return;

    const start = dayjs(startTime, 'h A');
    const end = dayjs(endTime, 'h A');
    const hours = end.diff(start, 'hour');
    if (hours < 1) {
      message.error('Duration must be at least 1 hour');
      setTotalAmount(0);
      return;
    }
    setTotalAmount(hours * venue.rate);
  };

  const tileDisabled = ({ date }) => dayjs(date).isBefore(dayjs(), 'day');

  const handleSubmit = () => {
   
    if (!selectedVenue || !selectedStartTime || !selectedEndTime) {
      message.error('Please complete all fields before submitting!');
      return;
    }
    message.success('Reservation submitted successfully!');
  };

  const renderReservationDetails = () => (
    <div className="bg-[#F5F5F5] p-6 rounded-md border">
      <h3>Reservation Details</h3>
      <Text>Date: {formatDate(date)}</Text>
      <br />
      <Text>Venue: {venues.find((v) => v.value === selectedVenue)?.label || 'Not selected'}</Text>
      <br />
      <Text>Start Time: {selectedStartTime || 'Not selected'}</Text>
      <br />
      <Text>End Time: {selectedEndTime || 'Not selected'}</Text>
      <br />
      <Text strong>Total Amount: ₱{totalAmount > 0 ? totalAmount.toFixed(2) : '0.00'}</Text>
    </div>
  );

  return (
    <div className="flex desktop:flex-row laptop:flex-row tablet:flex-row desktop:justify-center laptop:justify-center phone:flex-col desktop:gap-[20vh] phone:gap-8 ">
      {/* Left Section */}
      <div className="desktop:w-auto phone:w-[30vh]">
        <div className="calendar-wrapper p-4 border rounded-md bg-white">
          <Calendar onChange={handleDateChange} value={date} tileDisabled={tileDisabled} />
        </div>
        <Form layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="Venue">
            <Select
              placeholder="Select a Venue"
              value={selectedVenue || null}
              onChange={handleVenueChange}
              options={venues.map((venue) => ({ value: venue.value, label: venue.label }))}
              style={{ width: 'auto' }}
              size={pickerSize}
            />
          </Form.Item>
          <div className="time-picker-container flex items-center space-x-2">
            <Form.Item label="Start Time" style={{ marginBottom: 0 }}>
              <Tooltip title="Select a start time">
                <TimePicker
                  value={selectedStartTime ? dayjs(selectedStartTime, 'h A') : null}
                  format="h A"
                  onChange={handleStartTimeChange}
                  size={pickerSize}
                />
              </Tooltip>
            </Form.Item>
            <Form.Item label="End Time" style={{ marginBottom: 0 }}>
              <Tooltip title="Select an end time">
                <TimePicker
                  value={selectedEndTime ? dayjs(selectedEndTime, 'h A') : null}
                  format="h A"
                  onChange={handleEndTimeChange}
                  size={pickerSize}
                />
              </Tooltip>
            </Form.Item>
          </div>
          <Button
            type="primary"
            onClick={handleSubmit}
            style={{ background: '#0C82B4', width: 'auto', marginTop: '15px' }}
            size={buttonSize}
          >
            Submit Reservation
          </Button>
        </Form>
      </div>

      {/* Right Section */}
      <div className="w-full laptop:w-1/3">
        {renderReservationDetails()}
      </div>
    </div>
  );
};

export default ReserveVenue;
