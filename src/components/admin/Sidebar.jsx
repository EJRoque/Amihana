import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "antd";
import {
  MenuOutlined,
  HomeFilled,
  DollarCircleFilled,
  LineChartOutlined,
  ContainerFilled,
  NotificationFilled,
  CalendarFilled,
} from "@ant-design/icons";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const selectedKey = () => {
    switch (location.pathname) {
      case "/dashboard-admin":
        return "1";
      case "/balance-sheet-admin":
        return "2";
      case "/cash-flow-admin":
        return "3";
      case "/income-state-admin":
        return "4";
      case "/announcement-admin":
        return "5";
      case "/events-admin":
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
          icon={<HomeFilled />}
          title="Dashboard"
          style={selectedKey() === "1" ? menuItemSelectedStyle : menuItemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#B9D9EB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color =
              selectedKey() === "1" ? "#468FEA" : "#0C82B4")
          }
        >
          <Link to="/dashboard-admin">Dashboard</Link>
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
          <Link to="/balance-sheet-admin">Balance Sheet</Link>
        </Menu.Item>
        <Menu.Item
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
          <Link to="/cash-flow-admin">Cash Flow Record</Link>
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
          <Link to="/income-state-admin">Income Statement</Link>
        </Menu.Item>
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
          <Link to="/announcement-admin">Announcement</Link>
        </Menu.Item>
        <Menu.Item
          key="6"
          icon={<CalendarFilled />}
          title="Events"
          style={selectedKey() === "6" ? menuItemSelectedStyle : menuItemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#B9D9EB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color =
              selectedKey() === "6" ? "#468FEA" : "#0C82B4")
          }
        >
          <Link to="/events-admin">Events</Link>
        </Menu.Item>
      </Menu>
    </div>
  );
};

const Layout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex-1 p-4">{children}</div>
  </div>
);

export default Layout;
