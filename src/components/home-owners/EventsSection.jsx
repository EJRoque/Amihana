import React, { useEffect, useState } from 'react';
import { Card, Typography, Tabs } from 'antd';
import { getPendingReservations, fetchUserFullName, getApprovedReservations } from '../../firebases/firebaseFunctions';
import { getAuth } from 'firebase/auth';
import { toast } from "react-toastify";
import ReserveVenue from '../Modals/Events Forms/ReserveVenue';

const { Text } = Typography;

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
            userPending.sort((a, b) => b.timestamp - a.timestamp);
            setPendingReservations(userPending);
          }

          if (approved) {
            approved.sort((a, b) => b.timestamp - a.timestamp);
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

  const renderReservations = (reservations, type) => {
    if (reservations.length === 0) {
      return <Text className="text-base md:text-lg lg:text-xl">No {type.toLowerCase()} reservations found.</Text>;
    }
  
    return reservations.map((reservation, index) => {
      const formValues = reservation.formValues || {};
      const userName = formValues.userName || reservation.userName || 'Unknown User';
      const date = formValues.date || reservation.date || 'N/A';
      const startTime = formValues.startTime || reservation.startTime || 'N/A';
      const endTime = formValues.endTime || reservation.endTime || 'N/A';
      const venue = formValues.venue || reservation.venue || 'N/A';
      const totalAmount = formValues.totalAmount || reservation.totalAmount || 'N/A';
      const status = reservation.status || 'Pending';
  
      // Format the date into "Month Day, Year" format
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
  
      return (
        <Card
          key={index}
          className="max-w-md mx-auto mb-4 sm:max-w-lg lg:max-w-3xl"
          title={<span className="text-lg md:text-xl lg:text-2xl">Reservation Details</span>}
          bordered={true}
        >
          <Text className="text-base md:text-lg lg:text-xl" strong>User Name: </Text>
          <Text className="text-base md:text-lg lg:text-xl">{userName}</Text>
          <br />
          <Text className="text-base md:text-lg lg:text-xl" strong>Date: </Text>
          <Text className="text-base md:text-lg lg:text-xl">{formattedDate}</Text>
          <br />
          <Text className="text-base md:text-lg lg:text-xl" strong>Start Time: </Text>
          <Text className="text-base md:text-lg lg:text-xl">{startTime}</Text>
          <br />
          <Text className="text-base md:text-lg lg:text-xl" strong>End Time: </Text>
          <Text className="text-base md:text-lg lg:text-xl">{endTime}</Text>
          <br />
          <Text className="text-base md:text-lg lg:text-xl" strong>Venue: </Text>
          <Text className="text-base md:text-lg lg:text-xl">{venue}</Text>
          <br />
          <Text className="text-base md:text-lg lg:text-xl" strong>Total Amount: </Text>
          <Text className="text-base md:text-lg lg:text-xl">₱{parseFloat(totalAmount).toFixed(2)}</Text>
          <br />
          <Text className="text-base md:text-lg lg:text-xl" strong>Status: </Text>
          <Text
            className={`text-base md:text-lg lg:text-xl ${status === "Pending" ? "text-yellow-500" : "text-green-500"}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </Card>
      );
    });
  };

  const reservationItems = [
    {
      key: "1",
      label: <span className="text-sm sm:text-base md:text-lg lg:text-xl text-[#2072AF]">Pending Reservations</span>,
      children: renderReservations(pendingReservations, "Pending"),
    },
    {
      key: "2",
      label: <span className="text-sm sm:text-base md:text-lg lg:text-xl text-[#2072AF]">Approved Reservations</span>,
      children: renderReservations(approvedReservations, "Approved"),
    },
  ];

  const tabItems = [
    {
      key: "reservations",
      label: <span className="text-base md:text-lg lg:text-xl text-[#2072AF]">Reservations</span>,
      children: <Tabs className="custom-tabs" defaultActiveKey="1" items={reservationItems} />,
    },
    {
      key: "reserveVenue",
      label: <span className="text-base md:text-lg lg:text-xl text-[#2072AF]">Reserve a Venue</span>,
      children: <ReserveVenue />,
    },
  ];

  return (
    <div className="section-wrapper p-4">
      <Tabs
        defaultActiveKey="reservations"
        items={tabItems}

      />
    </div>
  );
}
