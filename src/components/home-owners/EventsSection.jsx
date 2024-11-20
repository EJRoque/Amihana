import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Spin,
  Select,
  Table,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { fetchReservationsForToday } from "../../firebases/firebaseFunctions";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const { Text, Title } = Typography;
const db = getFirestore();

export default function EventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [basketballAmount, setBasketballAmount] = useState(null);
  const [clubhouseAmount, setClubhouseAmount] = useState(null);
  const [filter, setFilter] = useState("all"); // Default to "all"

  // Fetch venue amounts from Firestore once and store them
  const fetchVenueAmounts = async () => {
    try {
      const basketballDocRef = doc(db, "venueAmounts", "BasketballCourt");
      const clubhouseDocRef = doc(db, "venueAmounts", "ClubHouse");
      const basketballDoc = await getDoc(basketballDocRef);
      const clubhouseDoc = await getDoc(clubhouseDocRef);

      // Store amounts in state (cache them)
      const basketballAmountFromFirestore = basketballDoc.exists()
        ? basketballDoc.data().amount
        : null;
      const clubhouseAmountFromFirestore = clubhouseDoc.exists()
        ? clubhouseDoc.data().amount
        : null;

      setBasketballAmount(basketballAmountFromFirestore);
      setClubhouseAmount(clubhouseAmountFromFirestore);
    } catch (error) {
      toast.error("Failed to fetch venue amounts.");
      console.error("Error fetching venue amounts:", error);
    }
  };

  useEffect(() => {
    fetchVenueAmounts(); // Fetch venue amounts once on mount
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const allReservations = await fetchReservationsForToday();
      const today = new Date().toISOString().split("T")[0];

      // Enrich reservations with total amount based on venue
      const enrichedReservations = allReservations.map((reservation) => {
        const venueAmount =
          reservation.venue === "Basketball Court"
            ? basketballAmount
            : clubhouseAmount;

        const { startTime, endTime, status } = reservation;

        const totalAmount =
          status === "approved"
            ? reservation.totalAmount
            : calculateTotalAmount(startTime, endTime, venueAmount);

        return {
          ...reservation,
          totalAmount: totalAmount,
        };
      });

      setEvents(enrichedReservations);
      setFilteredEvents(enrichedReservations);
    } catch (error) {
      toast.error("Failed to fetch reservations for today.");
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(); // Fetch reservations after venue amounts are fetched
  }, [basketballAmount, clubhouseAmount]);

  useEffect(() => {
    // Filter events based on selected filter
    let filtered;
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));

    if (filter === "last7days") {
      filtered = events.filter(
        (event) => new Date(event.date) >= sevenDaysAgo
      );
    } else if (filter === "lastMonth") {
      filtered = events.filter(
        (event) => new Date(event.date) >= startOfMonth
      );
    } else if (filter === "lastYear") {
      filtered = events.filter((event) => new Date(event.date) >= startOfYear);
    } else {
      filtered = events; // Default to all reservations
    }

    setFilteredEvents(filtered);
  }, [filter, events]);

  // Helper function to calculate totalAmount
  const calculateTotalAmount = (startTime, endTime, amountPerHour) => {
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);

    let durationInHours = (end - start) / (1000 * 60 * 60);

    if (durationInHours < 0) {
      durationInHours += 24; // Handle crossing midnight
    }

    return durationInHours * amountPerHour; // Total amount = duration * amount per hour
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  return (
    <div className="section-wrapper p-4">
      {/* Filter Options */}
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

      {/* Approved Reservations */}
      <div className="mt-8">
        <Title level={4}>Reservation Details</Title>
        {loading ? (
          <Spin indicator={<LoadingOutlined spin />} />
        ) : filteredEvents.length > 0 ? (
          <Table
            dataSource={filteredEvents.map((reservation, index) => ({
              key: index, // Unique key for each row
              userName: reservation.userName,
              date: formatDate(reservation.date),
              startTime: reservation.startTime,
              endTime: reservation.endTime,
              venue: reservation.venue,
              totalAmount: `₱${parseFloat(reservation.totalAmount).toFixed(2)}`,
              status: reservation.status,
            }))}
            bordered
            pagination={{ pageSize: 5 }} // Pagination settings to show 5 records
            scroll={{ x: 800 }} // Enables horizontal scrolling for small screens
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
