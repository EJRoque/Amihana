import React, { useState, useEffect } from "react";
import { Typography, Button, Tabs, Empty, Badge, Pagination } from "antd";
import { BellOutlined, CheckCircleOutlined, StopOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../../firebases/FirebaseConfig";
import { getCurrentUserId, fetchUserFullName } from "../../../../firebases/firebaseFunctions";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const Notification = ({ setNotificationCount = () => {} }) => {
  const [notifications, setNotifications] = useState({
    all: [],
    approved: [],
    declined: [],
    info: [],
  });
  const [userName, setUserName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const currentUserId = getCurrentUserId();

  // Fetch and categorize notifications
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUserId) {
        try {
          const name = await fetchUserFullName(currentUserId);
          setUserName(name);
          await fetchNotifications(name);
          await fetchApprovedDeclinedNotifications(name); // Fetch approved and declined notifications separately
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };
    fetchUserData();

    const intervalId = setInterval(fetchUserData, 60000);
    return () => clearInterval(intervalId);
  }, [currentUserId]);

  const fetchNotifications = async () => {
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("status", "in", ["info"]) // Fetch info notifications separately
      );

      const snapshot = await getDocs(notificationsQuery);
      const processedNotifications = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const {
            status,
            message,
            timestamp,
            formValues,
            amountDetails,
            createdAt,
            readBy,
          } = data;

          // Skip if already read
          if (readBy?.includes(currentUserId)) return null;

          let notificationMessage = "";
          let detailedMessage = "";

          if (status === "info") {
            if (amountDetails) {
              const { type, month, year, amount } = amountDetails;
              if (type === "monthly") {
                notificationMessage = "Monthly Amount Update";
                detailedMessage = `The amount for ${month} ${year} is changed to ₱${amount}`;
              } else if (type === "hoa") {
                notificationMessage = "HOA Membership Update";
                detailedMessage = `HOA membership amount changed to ₱${amount} for ${year}`;
              } else {
                notificationMessage = "Information";
                detailedMessage = message || "New information available";
              }
            } else {
              notificationMessage = "Information";
              detailedMessage = message || "New information available";
            }
          }

          return {
            id: doc.id,
            title: notificationMessage,
            message: detailedMessage,
            status,
            timestamp: timestamp || createdAt,
            formattedDate: formatDate(timestamp || createdAt),
            isNew: isNewNotification(timestamp || createdAt),
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.timestamp - a.timestamp);

      setNotifications((prev) => ({
        ...prev,
        info: processedNotifications,
        all: [...prev.approved, ...prev.declined, ...processedNotifications], // Combine all notifications
      }));

      setNotificationCount(processedNotifications.filter((n) => n.isNew).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchApprovedDeclinedNotifications = async (userName) => {
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("status", "in", ["approved", "declined"])
      );

      const snapshot = await getDocs(notificationsQuery);
      const processedNotifications = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const {
            status,
            formValues,
            timestamp,
            createdAt,
          } = data;

          // Skip if not related to the current user
          if (formValues?.userName !== userName) return null;

          let notificationMessage = "";
          let detailedMessage = "";

          const safeVenue = formValues?.venue || "N/A";
          const reservationDate = formValues?.date
            ? formatDate(formValues.date)
            : "N/A";
          const safeStartTime = formValues?.startTime
            ? formatTimeTo12Hour(formValues.startTime)
            : "N/A";
          const safeEndTime = formValues?.endTime
            ? formatTimeTo12Hour(formValues.endTime)
            : "N/A";

          notificationMessage =
            status === "approved"
              ? "Reservation Approved"
              : "Reservation Declined";
          detailedMessage = `${safeVenue} reservation on ${reservationDate} from ${safeStartTime} to ${safeEndTime}`;

          return {
            id: doc.id,
            title: notificationMessage,
            message: detailedMessage,
            status,
            timestamp: timestamp || createdAt,
            formattedDate: formatDate(timestamp || createdAt),
            isNew: isNewNotification(timestamp || createdAt),
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.timestamp - a.timestamp);

      setNotifications((prev) => ({
        ...prev,
        approved: processedNotifications.filter((n) => n.status === "approved"),
        declined: processedNotifications.filter((n) => n.status === "declined"),
        all: [...prev.approved, ...prev.declined, ...prev.info], // Combine all notifications
      }));

    } catch (error) {
      console.error("Failed to fetch approved/declined notifications:", error);
    }
  };

  // New function to remove approved/declined notification from Firestore and state
  const deleteApprovedDeclinedNotification = async (id) => {
    try {
      // Delete the notification from Firestore
      await deleteDoc(doc(db, "notifications", id));

      // Update the state by removing the notification from approved/declined lists
      const updatedNotifications = Object.fromEntries(
        Object.entries(notifications).map(([key, value]) => [
          key,
          value.filter((notification) => notification.id !== id),
        ])
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Failed to delete approved/declined notification:", error);
    }
  };

  // Function to remove info notifications from the list (already implemented)
  const removeInfoNotification = async (id) => {
    try {
      // Update the state by removing it from the info notifications list
      const updatedNotifications = Object.fromEntries(
        Object.entries(notifications).map(([key, value]) => [
          key,
          value.filter((notification) => notification.id !== id),
        ])
      );
      setNotifications(updatedNotifications);

      // Mark the notification as read for the current user without deleting it
      const notificationRef = doc(db, "notifications", id);
      await updateDoc(notificationRef, {
        readBy: arrayUnion(currentUserId), // Mark this notification as read by current user
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const paginatedNotifications = (notificationList) => {
    const startIndex = (currentPage - 1) * pageSize;
    return notificationList.slice(startIndex, startIndex + pageSize);
  };

  const renderNotificationContent = (notificationList) => {
    if (!notificationList || notificationList.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <Empty description="No notifications" />
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full">
        {paginatedNotifications(notificationList).map((notification) => (
          <div key={notification.id} className="notification-item">
            <div className="flex-grow mr-4">
              <div className="flex items-center mb-2">
                {notification.status === "approved" && (
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                )}
                {notification.status === "declined" && (
                  <StopOutlined className="text-red-500 mr-2" />
                )}
                {notification.status === "info" && (
                  <InfoCircleOutlined className="text-blue-500 mr-2" />
                )}
                <Title level={5} className="m-0">
                  {notification.title}
                  {notification.isNew && (
                    <Badge
                      count="New"
                      className="ml-2"
                      style={{
                        backgroundColor: '#52c41a',
                        fontSize: '12px',
                        padding: '0 6px',
                      }}
                    />
                  )}
                </Title>
              </div>
              <Paragraph>
                {notification.message || "No details available"}
              </Paragraph>
              <div className="text-xs text-gray-400">
                {notification.formattedDate}
              </div>
            </div>
            <Button
              type="text"
              onClick={() => {
                if (notification.status === "approved" || notification.status === "declined") {
                  deleteApprovedDeclinedNotification(notification.id);
                } else {
                  removeInfoNotification(notification.id);
                }
              }} 
              className="text-white bg-red-500 my-4"
            >
              Dismiss
            </Button>
          </div>
        ))}
        <div className="flex justify-center my-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={notificationList.length}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    );
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeTo12Hour = (time) => {
    const [hourStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour} ${ampm}`;
  };

  const isNewNotification = (timestamp) => {
    const notificationDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return (new Date() - notificationDate) / (1000 * 60 * 60 * 24) < 1;
  };

  return (
    <div className="notifications">
      <Tabs defaultActiveKey="all" onChange={(key) => setCurrentPage(1)}>
        <TabPane tab="All" key="all">
          {renderNotificationContent(notifications.all)}
        </TabPane>
        <TabPane tab="Approved" key="approved">
          {renderNotificationContent(notifications.approved)}
        </TabPane>
        <TabPane tab="Declined" key="declined">
          {renderNotificationContent(notifications.declined)}
        </TabPane>
        <TabPane tab="Information" key="info">
          {renderNotificationContent(notifications.info)}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Notification;
