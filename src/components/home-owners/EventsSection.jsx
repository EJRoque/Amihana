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
            const userPending = pending.filter(reservation => reservation.formValues.userName === userName);
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
        pendingReservations.map((reservation, index) => (
          <Card
            key={index}
            className="max-w-xl mx-auto mb-4"
            title="Reservation Details"
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

      <Title level={4}>Approved Reservations</Title>
      {approvedReservations.length > 0 ? (
        approvedReservations.map((reservation, index) => (
          <Card
            key={index}
            className="max-w-xl mx-auto mb-4"
            title="Reservation Details"
            bordered={true}
          >
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
            <Text strong>Status: </Text>
            <Text type="success">{reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}</Text>
          </Card>
        ))
      ) : (
        <Text>No approved reservations found.</Text>
      )}
    </div>
  );
}