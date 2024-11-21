import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Badge } from "antd";
import {
  MenuOutlined,
  HomeFilled,
  DollarCircleFilled,
  LineChartOutlined,
  ContainerFilled,
  NotificationFilled,
  CalendarFilled,
} from "@ant-design/icons";
import { db } from "../../firebases/FirebaseConfig"; // Firebase config import
import { collection, onSnapshot } from "firebase/firestore"; // Firestore functions

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  // State for notification count
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Listen for notifications in Firestore
    const unsubscribe = onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        const updatedNotifications = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === "approved" || data.status === "declined") {
            const { userName, venue, date, startTime, endTime } =
              data.formValues || {};
            const message = `Hi ${userName}, your reservation for ${venue} on ${date} from ${startTime} to ${endTime} has been ${
              data.status === "approved" ? "approved" : "declined"
            } by the admin.`;

            updatedNotifications.push({
              id: doc.id,
              userName,
              status: data.status,
              venue,
              date,
              startTime,
              endTime,
              message,
            });
          }
        });

        setNotifications(updatedNotifications);
        setNotificationCount(updatedNotifications.length); // Update notification count
      }
    );

    // Cleanup listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Function to determine the selected key based on the current path
  const selectedKey = () => {
    switch (location.pathname) {
      case "/dashboard-home-owners":
        return "1";
      case "/balance-sheet-home-owners":
        return "2";
      case "/cash-flow-home-owners":
        return "3";
      case "/income-state-home-owners":
        return "4";
      case "/announcement-home-owners":
        return "5";
      case "/events-home-owners":
        return "6";
      default:
        return "1";
    }
  };

  const menuItemStyle = {
    color: "#0C82B4",
  };

  const menuItemSelectedStyle = {
    color: "#468FEA",
    backgroundColor: "#E3F2FD",
  };

  return (
    <div
      style={{
        width: collapsed ? "56px" : "256px",
        transition: "width 0.4s ease, opacity 0.4s ease",
      }}
      className="bg-white shadow-lg min-h-screen flex flex-col"
    >
      <div
        className="flex flex-row space-x-20 px-4 py-2"
        style={{
          justifyContent: "end",
          alignItems: "center",
          height: "64px",
          transition: "all 0.4s ease",
        }}
      >
        <MenuOutlined
          className="text-lg cursor-pointer"
          onClick={toggleSidebar}
          style={{
            color: "#0C82B4",
            transition: "transform 0.4s ease",
            transform: collapsed ? "translateX(0)" : "translateX(0)",
          }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey()]}
        style={{
          width: "100%",
          transition: "all 0.4s ease",
        }}
        inlineCollapsed={collapsed}
        theme="light"
        className="font-poppins -mt-[17px]"
      >
        <Menu.Item
          key="1"
          style={selectedKey() === "1" ? menuItemSelectedStyle : menuItemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#B9D9EB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color =
              selectedKey() === "1" ? "#468FEA" : "#0C82B4")
          }
        >
          <div className="flex justify-between items-center">
            <Link to="/dashboard-home-owners">
              <HomeFilled /> <span className="ml-2">Home</span>
            </Link>
            <Badge
              count={notificationCount} // Display notification count here
              style={{
                backgroundColor: "#D64933",
                color: "#FFFF",
                borderRadius: "5px",
                padding: "0px 8px 0px 8px",
              }}
              className="rounded-md"
            />
          </div>
        </Menu.Item>
        <Menu.Item
          key="2"
          icon={<DollarCircleFilled />}
          title="Balance Sheet"
          style={selectedKey() === "2" ? menuItemSelectedStyle : menuItemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#B9D9EB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color =
              selectedKey() === "2" ? "#468FEA" : "#0C82B4")
          }
        >
          <Link to="/balance-sheet-home-owners">Balance Sheet</Link>
        </Menu.Item>
        {/* <Menu.Item
          key="3"
          icon={<LineChartOutlined />}
          title="Cash Flow Record"
          style={selectedKey() === "3" ? menuItemSelectedStyle : menuItemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#B9D9EB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color =
              selectedKey() === "3" ? "#468FEA" : "#0C82B4")
          }
        >
          <Link to="/cash-flow-home-owners">Cash Flow Record</Link>
        </Menu.Item>
        <Menu.Item
          key="4"
          icon={<ContainerFilled />}
          title="Income Statement"
          style={selectedKey() === "4" ? menuItemSelectedStyle : menuItemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#B9D9EB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color =
              selectedKey() === "4" ? "#468FEA" : "#0C82B4")
          }
        >
          <Link to="/income-state-home-owners">Income Statement</Link>
        </Menu.Item> */}
        <Menu.Item
          key="5"
          icon={<NotificationFilled />}
          title="Announcement"
          style={selectedKey() === "5" ? menuItemSelectedStyle : menuItemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#B9D9EB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color =
              selectedKey() === "5" ? "#468FEA" : "#0C82B4")
          }
        >
          <Link to="/announcement-home-owners">Announcement</Link>
        </Menu.Item>
        <Menu.Item
          key="6"
          icon={<CalendarFilled />}
          title="Venues"
          style={selectedKey() === "6" ? menuItemSelectedStyle : menuItemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#B9D9EB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color =
              selectedKey() === "6" ? "#468FEA" : "#0C82B4")
          }
        >
          <Link to="/events-home-owners">Venue Reservations</Link>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Sidebar;
