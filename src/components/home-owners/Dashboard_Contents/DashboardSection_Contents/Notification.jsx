import React, { useState, useEffect } from "react";
import { Typography, Button } from "antd";
import { db } from "../../../../firebases/FirebaseConfig";
import { collection, onSnapshot, deleteDoc, doc, getDoc, query, where } from "firebase/firestore";
import { getCurrentUserId, fetchUserFullName } from "../../../../firebases/firebaseFunctions";
import { CalendarFilled, DeleteFilled } from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;

const Notification = ({ setNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [venueAmounts, setVenueAmounts] = useState({ basketball: 0, clubhouse: 0 });
  const [userName, setUserName] = useState("");

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(storedNotifications);

    const fetchUserName = async () => {
      if (currentUserId) {
        try {
          const name = await fetchUserFullName(currentUserId);
          setUserName(name); // Store the user's name to use in the filter
        } catch (error) {
          console.error("Failed to fetch user full name:", error);
        }
      }
    };
    fetchUserName();
  }, [currentUserId]);

  useEffect(() => {
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
    if (!userName) return;

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("formValues.userName", "==", userName) // Filter notifications for the current user
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
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
      setNotificationCount(updatedNotifications.length);
    });

    return () => unsubscribe();
  }, [userName, venueAmounts, setNotificationCount]);

  const calculateTotalAmount = (startTime, endTime, venue) => {
    if (!startTime || !endTime || !venue) return 0;
    const amountPerHour = venue === "Basketball Court" ? venueAmounts.basketball : venueAmounts.clubhouse;
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);
    let durationInHours = (end - start) / (1000 * 60 * 60);
    if (durationInHours < 0) durationInHours += 24;
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
    <div className="flex flex-col space-y-4 p-2 bg-white rounded shadow-lg w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="border border-gray-300 rounded-lg p-4 shadow-md flex flex-col space-y-2"
        >
          <Paragraph>{notification.message}</Paragraph>
          <div className="flex desktop:justify-end space-x-4 phone:justify-center tablet:justify-end laptop:justify-end">
            <Button
              onClick={() => handleGoToEventPage(notification.id)}
              className="bg-blue-500 text-white desktop:px-4 laptop:px-4 phone:p-2 tablet:p-2 rounded"
            >
              <span className="desktop:inline laptop:inline phone:text-[12px] tablet:hidden">Events Page</span>
              <CalendarFilled className="phone:inline tablet:inline desktop:hidden laptop:hidden" />
            </Button>
            <Button
              onClick={() => removeNotification(notification.id)}
              className="bg-red-500 text-white desktop:px-4 laptop:px-4 phone:p-2 tablet:p-2 rounded"
            >
              <span className="desktop:inline laptop:inline phone:text-[12px] tablet:hidden">Dismiss</span>
              <DeleteFilled className="phone:inline tablet:inline desktop:hidden laptop:hidden" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
