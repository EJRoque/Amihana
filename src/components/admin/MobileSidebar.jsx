import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MenuOutlined,
  HomeFilled,
  DollarCircleFilled,
  LineChartOutlined,
  ContainerFilled,
  NotificationFilled,
  CalendarFilled,
} from "@ant-design/icons";
import { Menu, Dropdown } from "antd";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebases/FirebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import defaultProfilePic from "../../assets/images/default-profile-pic.png";

const { SubMenu } = Menu;

export default function MobileSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Guest");
  const [photoURL, setPhotoURL] = useState(defaultProfilePic);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setDisplayName(userData.fullName || "User");
            setPhotoURL(userData.profilePicture || defaultProfilePic);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setDisplayName("Guest");
        setPhotoURL(defaultProfilePic);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      navigate("/");
    });
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <a onClick={handleLogout}>Logout</a>
      </Menu.Item>
    </Menu>
  );

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

  return (
    <div className="relative">
      <div className="fixed top-2 right-2 bg-[#0C82B4] h-8 w-8 flex justify-center z-50">
        <MenuOutlined
          className="text-white transition-transform duration-300"
          onClick={toggleSidebar}
        />
      </div>
      <div
        className={`fixed top-12 right-0 bg-white shadow-lg rounded-b-xl transition-all ease-in-out duration-300 z-50 
          ${collapsed ? "w-full h-0 pointer-events-none" : "w-full h-[80vh] pointer-events-auto"}
          sm:w-[320px] md:w-[360px] lg:w-[400px]`}
        style={{ overflow: "hidden" }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey()]}
          className="p-4"
          onClick={() => setCollapsed(true)}
          style={{
            backgroundColor: "white",
            borderRight: "none",
          }}
        >
          <Menu.Item
            key="1"
            icon={<HomeFilled style={{ color: "#0C82B4" }} />}
            style={{ color: "#0C82B4" }}
          >
            <Link to="/dashboard-admin">Dashboard</Link>
          </Menu.Item>
          <Menu.Item
            key="2"
            icon={<DollarCircleFilled style={{ color: "#0C82B4" }} />}
            style={{ color: "#0C82B4" }}
          >
            <Link to="/balance-sheet-admin">Balance Sheet</Link>
          </Menu.Item>

          {/* Cash Flow Record SubMenu */}
          <SubMenu
            key="3"
            icon={<LineChartOutlined style={{ color: "#0C82B4" }} />}
            title={<span style={{ color: "#0C82B4" }}>Cash Flow Record</span>}
          >
            <Menu.Item key="3-1" style={{ color: "#0C82B4" }}>
              <Link to="/cash-flow-admin">Cashflow</Link>
            </Menu.Item>
            <Menu.Item key="3-1" style={{ color: "#0C82B4" }}>
              <Link to="/cash-flow-admin/pledges">Pledges</Link>
            </Menu.Item>
            <Menu.Item key="3-2" style={{ color: "#0C82B4" }}>
              <Link to="/cash-flow-admin/cash-paid-out">Cash Paid Out</Link>
            </Menu.Item>
          </SubMenu>

          {/* Income Statement SubMenu */}
          <SubMenu
            key="4"
            icon={<ContainerFilled style={{ color: "#0C82B4" }} />}
            title={<span style={{ color: "#0C82B4" }}>Income Statement</span>}
          >
            <Menu.Item key="4-1" style={{ color: "#0C82B4" }}>
              <Link to="/income-state-admin">Income Statement</Link>
            </Menu.Item>
            <Menu.Item key="4-1" style={{ color: "#0C82B4" }}>
              <Link to="/income-state-admin/revenue">Revenue</Link>
            </Menu.Item>
            <Menu.Item key="4-2" style={{ color: "#0C82B4" }}>
              <Link to="/income-state-admin/expenses">Expenses</Link>
            </Menu.Item>
          </SubMenu>

          <Menu.Item
            key="5"
            icon={<NotificationFilled style={{ color: "#0C82B4" }} />}
            style={{ color: "#0C82B4" }}
          >
            <Link to="/announcement-admin">Announcement</Link>
          </Menu.Item>
          <Menu.Item
            key="6"
            icon={<CalendarFilled style={{ color: "#0C82B4" }} />}
            style={{ color: "#0C82B4" }}
          >
            <Link to="/events-admin">Events</Link>
          </Menu.Item>
        </Menu>
        <div className="bg-slate-100 w-full rounded-lg shadow-lg flex items-center p-4 space-x-4 mt-4">
          <div className="rounded-full w-20 h-20">
            <img
              src={photoURL}
              alt="Profile Picture"
              className={`h-full w-full rounded-full ${loading ? "animate-pulse" : ""}`}
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className={`text-lg font-semibold ${loading ? "animate-pulse" : ""}`}>
              {displayName}
            </div>
            <Dropdown overlay={profileMenu} trigger={["click"]}>
              <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                Actions
              </a>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
}
