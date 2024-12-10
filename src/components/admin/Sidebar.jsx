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
  SettingFilled,
  ScheduleFilled,
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
      case "/venue-management-admin":
        return "7";
      case "/user-management":
        return "8";
      case "/cost-control":
        return "9";
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
          <Link to="/events-admin">Venue Reservations</Link>
        </Menu.Item>
        <Menu.SubMenu
          key="management"
          icon={<SettingFilled style={{ color: "#0C82B4" }} />}
          title={<span style={{ color: "#0C82B4" }}>Management</span>}
          style={{ color: "#0C82B4" }}
          popupClassName="management-popup"
        >
          <Menu.Item
             key="9"
             icon={<DollarCircleFilled style={{ color: "#0C82B4" }}/>}
             style={selectedKey() === "9" ? menuItemSelectedStyle : menuItemStyle}
          >
            <Link to="/cost-control">Facilities Price Control</Link>
          </Menu.Item>
          <Menu.Item
            key="3"
            icon={<LineChartOutlined style={{ color: "#0C82B4" }} />}
            style={selectedKey() === "3" ? menuItemSelectedStyle : menuItemStyle}
          >
            <Link to="/cash-flow-admin">Cash Flow Management</Link>
          </Menu.Item>
          <Menu.Item
            key="4"
            icon={<ContainerFilled style={{ color: "#0C82B4" }} />}
            style={selectedKey() === "4" ? menuItemSelectedStyle : menuItemStyle}
          >
            <Link to="/income-state-admin">Income Management</Link>
          </Menu.Item>
          <Menu.Item
            key="7"
            icon={<ScheduleFilled style={{ color: "#0C82B4" }} />}
            style={selectedKey() === "7" ? menuItemSelectedStyle : menuItemStyle}
          >
            <Link to="/venue-management-admin">Revenue and Expenses Management</Link>
          </Menu.Item>
          <Menu.Item
            key="8"
            icon={<SettingFilled style={{ color: "#0C82B4" }} />}
            style={selectedKey() === "8" ? menuItemSelectedStyle : menuItemStyle}
          >
            <Link to="/user-management">User Management</Link>
          </Menu.Item>
        </Menu.SubMenu>
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
