import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, AutoComplete, Input, Button, Modal, Table, Select } from "antd";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { fetchReservationsForToday } from "../../firebases/firebaseFunctions";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";

const { Text, Title } = Typography;
const { Option } = Select;
const db = getFirestore();

export default function EventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const allReservations = await fetchReservationsForToday();
      const today = new Date().toISOString().split("T")[0];

      // Enrich reservations with total amount based on venue
      const enrichedReservations = allReservations.map((reservation) => {
        const { startTime, endTime, status, venue } = reservation;
        const amountPerHour = venue === "Basketball Court" ? 800 : 500;

        // If the reservation is approved, keep the original totalAmount
        const totalAmount =
          status === "approved"
            ? reservation.totalAmount // Don't change approved reservation's amount
            : calculateTotalAmount(startTime, endTime, amountPerHour);

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
    fetchReservations(); // Fetch reservations when the component mounts
  }, []);

  useEffect(() => {
    filterReservations();
  }, [searchText, selectedFilter, events]);

  const filterReservations = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    const filtered = events.filter((event) => {
      const reservationDate = new Date(event.date);

      if (selectedFilter === "today") {
        return reservationDate.toDateString() === today.toDateString();
      } else if (selectedFilter === "lastMonth") {
        return (
          reservationDate >= lastMonth &&
          reservationDate < new Date(today.getFullYear(), today.getMonth(), 1)
        );
      } else if (selectedFilter === "lastYear") {
        return reservationDate >= lastYear && reservationDate < new Date(today.getFullYear(), 0, 1);
      } else {
        return true; // Show all for "all"
      }
    });

    const searchFiltered = filtered.filter(
      (event) =>
        event.userName.toLowerCase().includes(searchText.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchText.toLowerCase())
    );

    setFilteredEvents(searchFiltered);
  };

  const calculateTotalAmount = (startTime, endTime, amountPerHour) => {
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);

    let durationInHours = (end - start) / (1000 * 60 * 60);

    if (durationInHours < 0) {
      durationInHours += 24;
    }

    return durationInHours * amountPerHour; // Total amount = duration * amount per hour
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  return (
    <div className="section-wrapper p-4">
      {/* Search Bar for Filtering Events */}
      <div className="mt-8">
        <AutoComplete
          onChange={setSearchText}
          placeholder="Search by name or venue"
        >
          <Input suffix={<SearchOutlined />} />
        </AutoComplete>

        <Select
          value={selectedFilter}
          onChange={setSelectedFilter}
          style={{ width: 200 }}
        >
          <Option value="all">All Reservations</Option>
          <Option value="today">Today</Option>
          <Option value="lastMonth">Last Month</Option>
          <Option value="lastYear">Last Year</Option>
        </Select>
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
              totalAmount: `₱${parseFloat(reservation.totalAmount).toFixed(2)}`,
              status: reservation.status,
            }))}
            bordered
            pagination={{ pageSize: 5 }}
            scroll={{ x: 800 }}
          >
            <Table.Column title="Name" dataIndex="userName" key="userName" />
            <Table.Column title="Date" dataIndex="date" key="date" />
            <Table.Column title="Start Time" dataIndex="startTime" key="startTime" />
            <Table.Column title="End Time" dataIndex="endTime" key="endTime" />
            <Table.Column title="Venue" dataIndex="venue" key="venue" />
            <Table.Column title="Total Amount" dataIndex="totalAmount" key="totalAmount" />
            <Table.Column title="Status" dataIndex="status" key="status" />
          </Table>
        ) : (
          <Text>No reservations found.</Text>
        )}
      </div>
    </div>
  );
}
