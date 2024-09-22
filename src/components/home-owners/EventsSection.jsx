import React, { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import { getPendingReservations, fetchUserFullName, getApprovedReservations } from '../../firebases/firebaseFunctions';
import { getAuth } from 'firebase/auth';
import { toast } from "react-toastify";

const { Text, Title } = Typography;

export default function EventsSection() {
  const [pendingReservations, setPendingReservations] = useState([]);
  const [approvedReservations, setApprovedReservations] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (userName) {
      const fetchUserReservations = async () => {
        try {
          const pending = await getPendingReservations();
          const approved = await getApprovedReservations(userName);

          if (pending) {
            const userPending = pending.filter(reservation => 
              reservation.formValues && reservation.formValues.userName === userName
            );
            setPendingReservations(userPending);
          }

          if (approved) {
            setApprovedReservations(approved);
          }
        } catch (error) {
          toast.error("Failed to fetch reservations.");
          console.error("Error fetching reservations:", error);
        }
      };

      fetchUserReservations();
    }
  }, [userName]);

  return (
    <div className="section-wrapper p-4">
      <Title level={4}>Pending Reservations</Title>
      {pendingReservations.length > 0 ? (
  pendingReservations.map((reservation, index) => {
    const formValues = reservation.formValues || {};
    const userName = formValues.userName || 'Unknown User';
    const date = formValues.date || 'N/A';
    const startTime = formValues.startTime || 'N/A';
    const endTime = formValues.endTime || 'N/A';
    const venue = formValues.venue || 'N/A';

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
        <Text strong>Status: </Text>
        <Text type="warning">Pending</Text>
      </Card>
    );
  })
) : (
  <Text>No pending reservations found.</Text>
)}

      <Title level={4}>Approved Reservations</Title>
      {approvedReservations.length > 0 ? (
  approvedReservations.map((reservation, index) => {
    const userName = reservation.userName || 'Unknown User';
    const date = reservation.date || 'N/A';
    const startTime = reservation.startTime || 'N/A';
    const endTime = reservation.endTime || 'N/A';
    const venue = reservation.venue || 'N/A';
    const status = reservation.status || 'N/A';

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
        <Text strong>Status: </Text>
        <Text type="success">{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
      </Card>
    );
  })
) : (
  <Text>No approved reservations found.</Text>
)}
    </div>
  );
}