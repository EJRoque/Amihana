// Import necessary dependencies
import React, { useState, useEffect } from "react";
import { Typography, Button } from "antd";
import { db } from "../../../../firebases/FirebaseConfig";
import { collection, onSnapshot, deleteDoc, doc, getDoc } from "firebase/firestore";
import { getCurrentUserId, fetchUserFullName } from "../../../../firebases/firebaseFunctions";
import { CalendarFilled , DeleteFilled} from "@ant-design/icons";
const { Text, Title, Paragraph } = Typography;

const Notification = ({ setNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [venueAmounts, setVenueAmounts] = useState({ basketball: 0, clubhouse: 0 });

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    // Fetch user data
    const storedNotifications = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(storedNotifications);

    const fetchUserName = async () => {
      if (currentUserId) {
        try {
          await fetchUserFullName(currentUserId);
        } catch (error) {
          console.error("Failed to fetch user full name:", error);
        }
      }
    };
    fetchUserName();
  }, [currentUserId]);

  useEffect(() => {
    // Fetch venue amounts
    const fetchVenueAmounts = async () => {
      try {
        const basketballDocRef = doc(db, "venueAmounts", "BasketballCourt");
        const clubhouseDocRef = doc(db, "venueAmounts", "ClubHouse");
        const basketballDoc = await getDoc(basketballDocRef);
        const clubhouseDoc = await getDoc(clubhouseDocRef);

        setVenueAmounts({
          basketball: basketballDoc.exists() ? basketballDoc.data().amount : 0,
          clubhouse: clubhouseDoc.exists() ? clubhouseDoc.data().amount : 0,
        });
      } catch (error) {
        console.error("Error fetching venue amounts:", error);
      }
    };

    fetchVenueAmounts();
  }, []);

  useEffect(() => {
    // Listen for notifications and update the count
    const unsubscribe = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const updatedNotifications = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "approved" || data.status === "declined") {
          const { userName, venue, date, startTime, endTime } = data.formValues || {};
          const totalAmount = calculateTotalAmount(startTime, endTime, venue);
          updatedNotifications.push({
            id: doc.id,
            userName,
            status: data.status,
            venue,
            date,
            startTime,
            endTime,
            totalAmount,
            message: `Hi ${userName}, your reservation for ${venue} on ${date} from ${startTime} to ${endTime} has been ${
              data.status === "approved" ? "approved" : "declined"
            } by the admin.`,
          });
        }
      });

      setNotifications(updatedNotifications);
      setNotificationCount(updatedNotifications.length); // Update notification count
    });

    return () => unsubscribe();
  }, [venueAmounts, setNotificationCount]);

  const calculateTotalAmount = (startTime, endTime, venue) => {
    if (!startTime || !endTime || !venue) return 0;
    const amountPerHour = venue === "Basketball Court" ? venueAmounts.basketball : venueAmounts.clubhouse;
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);
    let durationInHours = (end - start) / (1000 * 60 * 60);
    if (durationInHours < 0) durationInHours += 24; // Adjust if crossing midnight
    return durationInHours * amountPerHour;
  };

  const removeNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to remove notification:", error);
    }
  };

  const handleGoToEventPage = async (id) => {
    await removeNotification(id);
    window.location.href = "/events-home-owners";
  };

  return (
    <div className="flex flex-col space-y-4 p-6 bg-white rounded shadow-lg">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="border border-gray-300 rounded-lg p-4 shadow-md flex flex-col space-y-2"
        >
          <Paragraph>{notification.message}</Paragraph>
          <div className="flex desktop:justify-end space-x-4 phone:justify-center">
            <Button onClick={() => handleGoToEventPage(notification.id)} className="bg-blue-500 text-white">
             <h1 className="phone:hidden">Go to Events Page</h1>
            <CalendarFilled />
            </Button>
            <Button onClick={() => removeNotification(notification.id)} className="bg-red-500 text-white">
            <h1 className="phone:hidden">Dismiss</h1>
            <DeleteFilled />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
