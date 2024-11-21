import React, { useState, useEffect } from "react";
import { Typography, Button, Tabs, Empty, Badge } from "antd";
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  StopOutlined, 
  InfoCircleOutlined 
} from "@ant-design/icons";
import { db } from "../../../../firebases/FirebaseConfig";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { getCurrentUserId, fetchUserFullName } from "../../../../firebases/firebaseFunctions";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const Notification = ({ setNotificationCount = () => {} }) => {
  const [notifications, setNotifications] = useState({
    all: [],
    approved: [],
    declined: [],
    info: []
  });
  const [userName, setUserName] = useState("");
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUserId) {
        try {
          const name = await fetchUserFullName(currentUserId);
          setUserName(name);
          await fetchNotifications(name);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };
    fetchUserData();

    const intervalId = setInterval(fetchUserData, 60000);
    return () => clearInterval(intervalId);
  }, [currentUserId]);

  const isNewNotification = (timestamp) => {
    if (!timestamp) return false;
    const notificationDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const hoursDifference = (now - notificationDate) / (1000 * 60 * 60);
    return hoursDifference <= 24;
  };

  const fetchNotifications = async (userName) => {
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("status", "in", ["approved", "declined", "info"])
      );

      const snapshot = await getDocs(notificationsQuery);
      const processedNotifications = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const { status, message, timestamp, formValues, amountDetails, createdAt, readBy } = data;

          if (readBy && readBy.includes(currentUserId)) {
            return null;
          }

          let notificationMessage = "";
          let detailedMessage = "";

          if (status === "info") {
            if (amountDetails) {
              if (amountDetails.type === "monthly") {
                notificationMessage = `Monthly Amount Update`;
                detailedMessage = `The amount for ${amountDetails.month} ${amountDetails.year} is changed to ₱${amountDetails.amount}`;
              } else if (amountDetails.type === "hoa") {
                notificationMessage = `HOA Membership Update`;
                detailedMessage = `HOA membership amount changed to ₱${amountDetails.amount} for ${amountDetails.year}`;
              }
            } else {
              notificationMessage = "Information";
              detailedMessage = message || "New information available";
            }
          } else if (status === "approved" || status === "declined") {
            if (formValues?.userName !== userName) {
              return null;
            }
            const safeVenue = formValues?.venue || "N/A";
            const reservationDate = formValues?.date ? formatDate(formValues.date) : "N/A";
            const safeStartTime = formValues?.startTime ? formatTimeTo12Hour(formValues.startTime) : "N/A";
            const safeEndTime = formValues?.endTime ? formatTimeTo12Hour(formValues.endTime) : "N/A";

            notificationMessage = status === "approved" ? "Reservation Approved" : "Reservation Declined";
            detailedMessage = `${safeVenue} reservation on ${reservationDate} from ${safeStartTime} to ${safeEndTime}`;
          }

          return {
            id: doc.id,
            title: notificationMessage,
            message: detailedMessage,
            status: status,
            timestamp: timestamp || createdAt,
            formattedDate: formatDate(timestamp || createdAt),
            isNew: isNewNotification(timestamp || createdAt)
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.timestamp - a.timestamp);

      setNotifications({
        all: processedNotifications,
        approved: processedNotifications.filter(n => n.status === "approved"),
        declined: processedNotifications.filter(n => n.status === "declined"),
        info: processedNotifications.filter(n => n.status === "info")
      });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const removeNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      const updatedNotifications = Object.fromEntries(
        Object.entries(notifications).map(([key, value]) => [
          key, 
          value.filter(notification => notification.id !== id)
        ])
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const renderNotificationContent = (notificationList) => {
    if (notificationList.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <Empty description="No notifications" />
        </div>
      );
    }

    return notificationList.map((notification) => (
      <div 
        key={notification.id} 
        className="w-[400rem] border-b p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <div className="flex-grow mr-4 ">
          <div className="flex items-center mb-2">
            {notification.status === "approved" && <CheckCircleOutlined className="text-green-500 mr-2" />}
            {notification.status === "declined" && <StopOutlined className="text-red-500 mr-2" />}
            {notification.status === "info" && <InfoCircleOutlined className="text-blue-500 mr-2" />}
            <Title level={5} className="m-0 flex items-center">
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
          <Paragraph className="text-gray-600 mb-1">{notification.message}</Paragraph>
          <div className="text-xs text-gray-400">{notification.formattedDate}</div>
        </div>
        <Button 
          type="text" 
          onClick={() => removeNotification(notification.id)}
          className="text-gray-500 hover:text-red-500"
        >
          Dismiss
        </Button>
      </div>
    ));
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const formatTimeTo12Hour = (time) => {
    if (!time) return "N/A";
    const [hourStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex items-center">
        <BellOutlined className="text-xl mr-2" />
        <Title level={4} className="m-0">Notifications</Title>
      </div>
      <Tabs defaultActiveKey="1" className="px-4">
        <TabPane tab={
          <Badge count={notifications.all.filter(n => n.isNew).length} size="small">
            All
          </Badge>
        } key="1">
          {renderNotificationContent(notifications.all)}
        </TabPane>
        <TabPane tab={
          <Badge count={notifications.approved.filter(n => n.isNew).length} size="small">
            Approved
          </Badge>
        } key="2">
          {renderNotificationContent(notifications.approved)}
        </TabPane>
        <TabPane tab={
          <Badge count={notifications.declined.filter(n => n.isNew).length} size="small">
            Declined
          </Badge>
        } key="3">
          {renderNotificationContent(notifications.declined)}
        </TabPane>
        <TabPane tab={
          <Badge count={notifications.info.filter(n => n.isNew).length} size="small">
            Information
          </Badge>
        } key="4">
          {renderNotificationContent(notifications.info)}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Notification;