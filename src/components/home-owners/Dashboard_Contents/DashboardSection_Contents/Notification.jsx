import React, { useState, useEffect } from "react";
import { Typography, Button } from "antd";
import { db } from "../../../../firebases/FirebaseConfig";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { getCurrentUserId, fetchUserFullName } from "../../../../firebases/firebaseFunctions";
import { CalendarFilled, DeleteFilled } from "@ant-design/icons";

const { Paragraph } = Typography;

const Notification = ({ setNotificationCount = () => {} }) => {
  const [notifications, setNotifications] = useState([]);
  const [venueAmounts, setVenueAmounts] = useState({ basketball: 0, clubhouse: 0 });
  const [userName, setUserName] = useState("");

  const currentUserId = getCurrentUserId();

  // Fetch user name
  useEffect(() => {
    const fetchUserName = async () => {
      if (currentUserId) {
        try {
          const name = await fetchUserFullName(currentUserId);
          setUserName(name);
        } catch (error) {
          console.error("Failed to fetch user full name:", error);
        }
      }
    };
    fetchUserName();
  }, [currentUserId]);

  // Fetch venue amounts
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

  // Fetch notifications
  useEffect(() => {
    if (!userName) return;

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("status", "in", ["approved", "declined", "info"]) // Include "info" for amount change notifications
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const updatedNotifications = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const { status, message, date, createdAt, formValues } = data;

          const safeUserName = formValues?.userName || "N/A";
          const safeVenue = formValues?.venue || "N/A";
          const safeStartTime = formValues?.startTime ? formatTimeTo12Hour(formValues.startTime) : "N/A";
          const safeEndTime = formValues?.endTime ? formatTimeTo12Hour(formValues.endTime) : "N/A";
          const reservationDate = formValues?.date ? formatDate(formValues?.date) : "N/A"; // Format the reservation date

          const approvalTimestamp = createdAt ? formatTimestamp(createdAt) : "N/A";
          const [approvalDate, approvalTime] = approvalTimestamp.split(' at ');

          let notificationMessage = "";

          if (status === "info") {
            // Amount change notification
            notificationMessage = `The amount for <strong>${safeVenue}</strong> has been updated to <strong>${formValues?.amount || "N/A"}</strong> Php per hour.`;
          } else if (status === "approved" || status === "declined") {
            if (formValues?.userName !== userName) {
              return null; // Skip notifications not for the current user
            }

            notificationMessage = `Hi <strong>${safeUserName}</strong>, your reservation for <strong>${safeVenue}</strong> on <strong>${reservationDate}</strong> from <strong>${safeStartTime}</strong> to <strong>${safeEndTime}</strong> has been ${status === "approved" ? "approved" : "declined"} by the admin.`;
          }

          if (!notificationMessage) return null;

          return {
            id: doc.id,
            userName: safeUserName,
            status,
            venue: safeVenue,
            approvalDate,
            approvalTime,
            message: notificationMessage,
          };
        })
        .filter(Boolean);

      setNotifications(updatedNotifications);
      setNotificationCount(updatedNotifications.length);
    });

    return () => unsubscribe();
  }, [userName, currentUserId, setNotificationCount]);

  const formatTimeTo12Hour = (time) => {
    if (!time) return "N/A";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const removeNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      setNotifications((prev) => {
        const newNotifications = prev.filter((item) => item.id !== id);
        setNotificationCount(newNotifications.length);
        return newNotifications;
      });
    } catch (error) {
      console.error("Failed to remove notification:", error);
    }
  };

  const handleGoToEventPage = () => {
    window.location.href = "/events-home-owners";
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return `${date.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Function to format the date in "Friday, November 15, 2024" format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex flex-col space-y-4 p-2 bg-white rounded shadow-lg w-full">
      {notifications.map((notification) => (
        <div key={notification.id} className="border border-gray-300 rounded-lg p-4 shadow-md flex flex-col space-y-2">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>{notification.approvalDate || "N/A"}</span>
            <span className="ml-auto">{notification.approvalTime || "N/A"}</span>
          </div>
          <Paragraph>
            <span dangerouslySetInnerHTML={{ __html: notification.message }} />
          </Paragraph>
          <div className="flex desktop:justify-end space-x-4 phone:justify-center tablet:justify-end laptop:justify-end">
            <Button onClick={() => handleGoToEventPage()} className="bg-blue-500 text-white desktop:px-4 laptop:px-4 phone:p-2 tablet:p-2 rounded">
              <span className="desktop:inline laptop:inline phone:text-[12px] tablet:hidden">
                Events Page
              </span>
              <CalendarFilled className="phone:inline tablet:inline desktop:hidden laptop:hidden" />
            </Button>
            <Button onClick={() => removeNotification(notification.id)} className="bg-red-500 text-white desktop:px-4 laptop:px-4 phone:p-2 tablet:p-2 rounded">
              <span className="desktop:inline laptop:inline phone:text-[12px] tablet:hidden">
                Dismiss
              </span>
              <DeleteFilled className="phone:inline tablet:inline desktop:hidden laptop:hidden" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
