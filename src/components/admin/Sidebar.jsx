import React, { useState, useMemo } from "react";
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

const { SubMenu } = Menu;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Toggle sidebar
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Memoize styles
  const menuItemStyle = useMemo(
    () => ({
      color: "#0C82B4",
    }),
    []
  );

  const menuItemSelectedTextStyle = useMemo(
    () => ({
      color: "#468FEA",
    }),
    []
  );

  const selectedKey = useMemo(() => {
    switch (location.pathname) {
      case "/dashboard-admin":
        return "1";
      case "/balance-sheet-admin":
        return "2";
      case "/cash-flow-admin":
      case "/cash-flow-admin/sub1":
      case "/cash-flow-admin/sub2":
        return "3";
      case "/income-state-admin":
      case "/income-state-admin/revenue":
      case "/income-state-admin/expenses":
        return "4";
      case "/announcement-admin":
        return "5";
      case "/events-admin":
        return "6";
      default:
        return "1";
    }
  }, [location.pathname]);

  return (
    <div
      style={{
        width: collapsed ? "56px" : "256px",
        transition: "width 0.4s ease, opacity 0.4s ease",
      }}
      className="bg-white shadow-lg min-h-screen flex flex-col"
    >
      <div
        className="flex items-center px-4 py-2"
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: "64px",
          transition: "all 0.4s ease",
        }}
      >
        {!collapsed && (
          <h1
            style={{
              opacity: collapsed ? 0 : 1,
              transition: "opacity 0.4s ease",
              fontSize: "1rem",
              color: "#666",
              fontWeight: "500",
              marginRight: "auto",
            }}
          >
            Menu
          </h1>
        )}
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
        selectedKeys={[selectedKey]}
        style={{
          width: "100%",
          transition: "all 0.4s ease",
        }}
        inlineCollapsed={collapsed}
        theme="light"
      >
        <Menu.Item
          key="1"
          icon={<HomeFilled />}
          style={menuItemStyle}
        >
          <Link
            to="/dashboard-admin"
            style={selectedKey === "1" ? menuItemSelectedTextStyle : {}}
          >
            Dashboard
          </Link>
        </Menu.Item>
        <Menu.Item
          key="2"
          icon={<DollarCircleFilled />}
          style={menuItemStyle}
        >
          <Link
            to="/balance-sheet-admin"
            style={selectedKey === "2" ? menuItemSelectedTextStyle : {}}
          >
            Balance Sheet
          </Link>
        </Menu.Item>

        <SubMenu
          key="3"
          icon={<LineChartOutlined style={{ color: "#0C82B4" }} />}
          title={<span style={menuItemStyle}>Cash Flow Record</span>}
        >
          <Menu.Item key="3-1" style={menuItemStyle}>
            <Link
              to="/cash-flow-admin"
              style={
                location.pathname === "/cash-flow-admin"
                  ? menuItemSelectedTextStyle
                  : {}
              }
            >
              Cashflow
            </Link>
          </Menu.Item>
          <Menu.Item key="3-2" style={menuItemStyle}>
            <Link
              to="/cash-flow-admin/sub1"
              style={
                location.pathname === "/cash-flow-admin/sub1"
                  ? menuItemSelectedTextStyle
                  : {}
              }
            >
              Pledges
            </Link>
          </Menu.Item>
          <Menu.Item key="3-3" style={menuItemStyle}>
            <Link
              to="/cash-flow-admin/sub2"
              style={
                location.pathname === "/cash-flow-admin/sub2"
                  ? menuItemSelectedTextStyle
                  : {}
              }
            >
              Cash Paid Out
            </Link>
          </Menu.Item>
        </SubMenu>

        <SubMenu
          key="4"
          icon={<ContainerFilled style={{ color: "#0C82B4" }} />}
          title={<span style={menuItemStyle}>Income Statement</span>}
        >
          <Menu.Item key="4-1" style={menuItemStyle}>
            <Link
              to="/income-state-admin"
              style={
                location.pathname === "/income-state-admin"
                  ? menuItemSelectedTextStyle
                  : {}
              }
            >
              Income Statement
            </Link>
          </Menu.Item>
          <Menu.Item key="4-2" style={menuItemStyle}>
            <Link
              to="/income-state-admin/revenue"
              style={
                location.pathname === "/income-state-admin/revenue"
                  ? menuItemSelectedTextStyle
                  : {}
              }
            >
              Revenue
            </Link>
          </Menu.Item>
          <Menu.Item key="4-3" style={menuItemStyle}>
            <Link
              to="/income-state-admin/expenses"
              style={
                location.pathname === "/income-state-admin/expenses"
                  ? menuItemSelectedTextStyle
                  : {}
              }
            >
              Expenses
            </Link>
          </Menu.Item>
        </SubMenu>

        <Menu.Item key="5" icon={<NotificationFilled />} style={menuItemStyle}>
          <Link
            to="/announcement-admin"
            style={selectedKey === "5" ? menuItemSelectedTextStyle : {}}
          >
            Announcement
          </Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<CalendarFilled />} style={menuItemStyle}>
          <Link
            to="/events-admin"
            style={selectedKey === "6" ? menuItemSelectedTextStyle : {}}
          >
            Events
          </Link>
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
