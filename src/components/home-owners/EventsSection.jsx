import React, { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import { getPendingReservations, fetchUserFullName } from '../../firebases/firebaseFunctions'; // Adjust import path as necessary
import { getAuth } from 'firebase/auth';
import { toast } from "react-toastify";

const { Text, Title } = Typography;

export default function EventsSection() {
  const [pendingReservations, setPendingReservations] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Fetch the logged-in user's full name
    const fetchUserName = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          const fullName = await fetchUserFullName(user.uid);
          setUserName(fullName);
        } catch (error) {
          toast.error("Failed to fetch user data.");
          console.error("Error fetching user name:", error);
        }
      }
    };

    fetchUserName();
  }, []); // Run this effect only once on component mount

  useEffect(() => {
    if (userName) {
      // Fetch all pending reservations and filter by user
      const fetchUserReservations = async () => {
        try {
          const reservations = await getPendingReservations(); // Fetch all pending reservations
          if (reservations) {
            // Filter reservations for the logged-in user
            const userReservations = reservations.filter(reservation => reservation.formValues.userName === userName);
            setPendingReservations(userReservations);
          }
        } catch (error) {
          toast.error("Failed to fetch pending reservations.");
          console.error("Error fetching reservations:", error);
        }
      };

      fetchUserReservations();
    }
  }, [userName]); // Run this effect whenever userName changes

  return (
    <div className="section-wrapper p-4">
      {pendingReservations && pendingReservations.length > 0 ? (
        pendingReservations.map((reservation, index) => (
          <Card
            key={index}
            className="max-w-xl mx-auto mb-4"
            title={<Title level={4}>Reservation Details</Title>}
            bordered={true}
          >
            <Text strong>User Name: </Text>
            <Text>{reservation.formValues.userName}</Text>
            <br />
            <Text strong>Date: </Text>
            <Text>{reservation.formValues.date}</Text>
            <br />
            <Text strong>Start Time: </Text>
            <Text>{reservation.formValues.startTime}</Text>
            <br />
            <Text strong>End Time: </Text>
            <Text>{reservation.formValues.endTime}</Text>
            <br />
            <Text strong>Venue: </Text>
            <Text>{reservation.formValues.venue}</Text>
            <br />
            <Text strong>Status: </Text>
            <Text type="warning">Pending</Text>
          </Card>
        ))
      ) : (
        <Text>No pending reservations found.</Text>
      )}
    </div>
  );
}
