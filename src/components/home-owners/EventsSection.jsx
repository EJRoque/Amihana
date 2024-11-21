import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Select, Table } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { fetchReservationsForToday } from "../../firebases/firebaseFunctions";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Auth to get the logged-in user

const { Text, Title } = Typography;
const db = getFirestore();

export default function EventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [basketballAmount, setBasketballAmount] = useState(null);
  const [clubhouseAmount, setClubhouseAmount] = useState(null);
  const [filter, setFilter] = useState("all"); // Default to "all"
  const [userFullName, setUserFullName] = useState(""); // Store the full name of the logged-in user

  // Fetch the current user's full name
  const fetchUserFullName = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Assume the user's full name is stored in Firestore under their UID
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserFullName(userDoc.data().fullName);
        } else {
          toast.error("User information not found.");
        }
      } else {
        toast.error("User not logged in.");
      }
    } catch (error) {
      toast.error("Failed to fetch user details.");
      console.error("Error fetching user details:", error);
    }
  };

  // Fetch venue amounts from Firestore once and store them
  const fetchVenueAmounts = async () => {
    try {
      const basketballDocRef = doc(db, "venueAmounts", "BasketballCourt");
      const clubhouseDocRef = doc(db, "venueAmounts", "ClubHouse");
      const basketballDoc = await getDoc(basketballDocRef);
      const clubhouseDoc = await getDoc(clubhouseDocRef);

      setBasketballAmount(
        basketballDoc.exists() ? basketballDoc.data().amount : null
      );
      setClubhouseAmount(
        clubhouseDoc.exists() ? clubhouseDoc.data().amount : null
      );
    } catch (error) {
      toast.error("Failed to fetch venue amounts.");
      console.error("Error fetching venue amounts:", error);
    }
  };

  useEffect(() => {
    fetchUserFullName(); // Fetch the user's full name on mount
    fetchVenueAmounts(); // Fetch venue amounts on mount
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const allReservations = await fetchReservationsForToday();
      const enrichedReservations = allReservations.map((reservation) => {
        const venueAmount =
          reservation.venue === "Basketball Court"
            ? basketballAmount
            : clubhouseAmount;

        const { startTime, endTime, status } = reservation;

        const totalAmount =
          status === "approved"
            ? parseFloat(reservation.totalAmount)
            : calculateTotalAmount(startTime, endTime, venueAmount);

        return {
          ...reservation,
          totalAmount: totalAmount,
        };
      });

      // Filter reservations to only include those with a matching full name
      const userReservations = enrichedReservations.filter(
        (reservation) => reservation.userName === userFullName
      );

      setEvents(userReservations);
      setFilteredEvents(userReservations);
    } catch (error) {
      toast.error("Failed to fetch reservations for today.");
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userFullName) {
      fetchReservations(); // Fetch reservations after user's full name is available
    }
  }, [userFullName, basketballAmount, clubhouseAmount]);

  const calculateTotalAmount = (startTime, endTime, amountPerHour) => {
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);

    let durationInHours = (end - start) / (1000 * 60 * 60);
    if (durationInHours < 0) {
      durationInHours += 24;
    }

    return durationInHours * amountPerHour;
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  return (
    <div className="section-wrapper p-4">
      <div className="mt-8">
        <Select
          value={filter}
          onChange={setFilter}
          style={{ width: 200 }}
          options={[
            { label: "All", value: "all" },
            { label: "Last 7 Days", value: "last7days" },
            { label: "Last Month", value: "lastMonth" },
            { label: "Last Year", value: "lastYear" },
          ]}
        />
      </div>

      <div className="mt-8">
        <Title level={4}>Reservation Details</Title>
        {loading ? (
          <Spin indicator={<LoadingOutlined spin />} />
        ) : filteredEvents.length > 0 ? (
          <Table
            dataSource={filteredEvents.map((reservation, index) => ({
              key: index,
              userName: reservation.userName,
              date: formatDate(reservation.date),
              startTime: reservation.startTime,
              endTime: reservation.endTime,
              venue: reservation.venue,
              totalAmount: reservation.totalAmount,
              status: reservation.status,
            }))}
            bordered
            pagination={{ pageSize: 5 }}
            scroll={{ x: 800 }}
          >
            <Table.Column title="Name" dataIndex="userName" key="userName" />
            <Table.Column title="Date" dataIndex="date" key="date" />
            <Table.Column
              title="Start Time"
              dataIndex="startTime"
              key="startTime"
            />
            <Table.Column title="End Time" dataIndex="endTime" key="endTime" />
            <Table.Column title="Venue" dataIndex="venue" key="venue" />
            <Table.Column
              title="Total Amount"
              dataIndex="totalAmount"
              key="totalAmount"
              render={(amount) => {
                const numericAmount = parseFloat(amount);
                if (isNaN(numericAmount)) {
                  return "₱0.00";
                }

                const formattedAmount = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "PHP",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(numericAmount);

                return formattedAmount;
              }}
            />
            <Table.Column
              title="Status"
              dataIndex="status"
              key="status"
              render={(status) => <Text type="success">{status}</Text>}
            />
          </Table>
        ) : (
          <Text>No reservations found.</Text>
        )}
      </div>
    </div>
  );
}
