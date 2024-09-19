import { useState, useEffect } from "react";
import balanceSheetLogo from "../../assets/icons/balance-sheet-logo.svg";
import { FaPlus, FaPrint } from "react-icons/fa";
import { db, auth } from "../../firebases/FirebaseConfig";
import { collection, doc, setDoc, getDocs, getDoc, getFirestore } from "firebase/firestore";
import { Dropdown, Button, Menu, Space, Modal as AntModal, Input } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import { ClipLoader } from "react-spinners"; // Import the spinner
import amihanaLogo from "../../assets/images/amihana-logo.png";
import { getAuth } from "firebase/auth";

const BalanceSheetGraybarAdmin = ({ setSelectedYear, setData }) => {
  const [existingDates, setExistingDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [yearInput, setYearInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [selectedYearp,setSelectedYearp] = useState("");

  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "balanceSheetRecord")
        );
        const dates = querySnapshot.docs.map((doc) => doc.id);
        setExistingDates(dates);
      } catch (error) {
        console.error("Error fetching existing dates:", error);
      }
    };

    getExistingDates();
  }, []);

  const transferPreviousYearData = async (newYear) => {
    const previousYear = (parseInt(newYear) - 1).toString();
    const prevYearDocRef = doc(db, "balanceSheetRecord", previousYear);
    const prevYearDoc = await getDoc(prevYearDocRef);

    if (prevYearDoc.exists()) {
      const previousData = prevYearDoc.data().Name || {};

      const resetData = Object.keys(previousData).reduce((acc, name) => {
        acc[name] = {
          Jan: false,
          Feb: false,
          Mar: false,
          Apr: false,
          May: false,
          Jun: false,
          Jul: false,
          Aug: false,
          Sep: false,
          Oct: false,
          Nov: false,
          Dec: false,
          Hoa: false,
        };
        return acc;
      }, {});

      const newYearDocRef = doc(db, "balanceSheetRecord", newYear);

      await setDoc(newYearDocRef, { Name: resetData }, { merge: true });

      if (setData) {
        setData(resetData);
      }
    }
  };

  const handleAddNewYear = async (e) => {
    e.preventDefault();
    if (!yearInput.trim()) return;
    setIsLoading(true); // Start loading
    try {
      const yearDocRef = doc(db, "balanceSheetRecord", yearInput);
      await setDoc(yearDocRef, {});

      await transferPreviousYearData(yearInput);

      setExistingDates((prevDates) => [...prevDates, yearInput]);
      setIsLoading(false); // Stop loading
      setIsModalOpen(false);
      setYearInput("");
    } catch (error) {
      console.error("Error adding new year:", error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.key);
    setSelectedYearp(e.key);
  };

  const menu = (
    <Menu onClick={handleYearChange}>
      <Menu.Item key="" disabled>
        Select year
      </Menu.Item>
      {existingDates.map((date, index) => (
        <Menu.Item key={date}>{date}</Menu.Item>
      ))}
    </Menu>
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to fetch the user's full name from Firestore
const fetchUserFullName = async () => {
  const auth = getAuth(); // Get the Auth instance
  const currentUser = auth.currentUser; // Get the currently logged-in user

  if (!currentUser) {
    console.error("No user is logged in.");
    return "";
  }

  // Initialize Firestore and reference the user document
  const db = getFirestore(); // Make sure Firestore is initialized properly
  const userDocRef = doc(db, "users", currentUser.uid); // Reference to the user document in Firestore

  try {
    const userDocSnap = await getDoc(userDocRef); // Get the user's document from Firestore

    if (userDocSnap.exists()) {
      return userDocSnap.data().fullName || "Unknown User"; // Return fullName or "Unknown User" if field is missing
    } else {
      console.error("User document does not exist.");
      return "Unknown User";
    }
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
    return "Unknown User";
  }
};



const printBalanceSheet = async () => {
  if (!selectedYearp) {
    console.error("No year selected for printing.");
    return;
  }

  const userName = await fetchUserFullName(); // Fetch the user's full name
  const balanceSheetSection = document.getElementById("balance-sheet-section");

  // Use the base64 string for the Amihana logo
  const amihanaLogoBase64 = "data:image/png;base64,amihana-logo.png"; 

  // Open a new window for the print job
  const printWindow = window.open("", "", "height=600,width=800");

  // Write the HTML content to the new window
  printWindow.document.write(`
    <html>
      <head>
        <title>Balance Sheet</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            position: relative;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          .balance-sheet-title {
            text-align: center;
            font-size: 20px;
            margin-bottom: 20px;
          }
          .balance-sheet-title-butaw {
            text-align: center;
            font-size: 20px;
            margin-bottom: 20px;
          }
          .logo {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 100px;
            height: auto;
          }
          .printed-by {
            margin-top: 20px;
            font-size: 14px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <img src="${amihanaLogoBase64}" class="logo" alt="Amihana Logo" style="height: 50px; width: auto; margin-right: 20px;" />
        <h1 class="balance-sheet-title">AMIHANA HOA FINANCIAL RECORD - ${selectedYearp}</h1>
        <h3 class="balance-sheet-title-butaw">Butaw Collection and HOA Membership</h3>
        ${balanceSheetSection.innerHTML}
        <div class="printed-by">
          Printed by: ${userName}
        </div>
      </body>
    </html>
  `);

  // Wait until the content is fully loaded, then trigger the print
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};



  return (
    <div
      className={`bg-white shadow-md flex items-center my-3 rounded-md overflow-hidden ${
        sidebarOpen
          ? "desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10"
          : "desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12"
      } desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}
    >
      <div
        className={`flex items-center justify-between w-full px-2 ${
          sidebarOpen
            ? "desktop:px-1 laptop:px-1 tablet:px-1 phone:px-1"
            : "desktop:px-2 laptop:px-2 tablet:px-2 phone:px-1"
        }`}
      >
        <div className="flex items-center justify-between w-full space-x-2 phone:space-x-1">
          {/* Left Side */}
          <div className="flex items-center gap-2">
            <h1
              className={`text-[#0C82B4] my-auto font-poppins ${
                sidebarOpen
                  ? "desktop:text-sm laptop:text-sm tablet:text-xs phone:text-[8px]"
                  : "desktop:text-base laptop:text-base tablet:text-sm phone:text-[10px]"
              } phone:ml-1 capitalize`}
            >
              Balance Sheet
            </h1>
            <img
              src={balanceSheetLogo}
              className={`desktop:h-4 desktop:w-4 laptop:h-4 laptop:w-4 tablet:h-3 tablet:w-3 phone:h-2 phone:w-2`}
              alt="Balance Sheet Logo"
            />
          </div>

          {/* Right Side */}
          <div
            className={`flex items-center space-x-2 ${
              sidebarOpen
                ? "desktop:space-x-1 laptop:space-x-1 tablet:space-x-1 phone:space-x-0"
                : "desktop:space-x-2 laptop:space-x-2 tablet:space-x-2 phone:space-x-1"
            }`}
          >
            {/* Add New Year Button */}
            <button
              className={`bg-[#0C82B4] font-poppins ${
                sidebarOpen
                  ? "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
                  : "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
              } desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
              onClick={handleOpenModal}
            >
              <FaPlus
                className={`text-sm phone:inline desktop:inline desktop:mr-2 tablet:mr-2 laptop:mr-2 ${
                  sidebarOpen
                    ? "desktop:text-xs laptop:text-xs tablet:text-xs phone:text-[7px]"
                    : "desktop:text-base laptop:text-base tablet:text-xs phone:text-[8px]"
                }`}
              />
              <span
                className={`hidden tablet:inline phone:hidden ${
                  sidebarOpen ? "text-xs" : "text-xs"
                }`}
              >
                Add new
              </span>
            </button>

            {/* Year Selector */}
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              className={`bg-[#5D7285] font-poppins ${
                sidebarOpen
                  ? "desktop:h-8 laptop:h-8 tablet:h-6 phone:h-5"
                  : "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
              } desktop:w-[7rem] laptop:w-[6.5rem] tablet:w-[5rem] phone:w-[4.5rem] desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 py-1 rounded flex items-center`}
            >
              <Button>
                <Space>
                  Select year
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>

            {/* Print Button */}
            <button
              className={`bg-[#0C82B4] font-poppins ${
                sidebarOpen
                  ? "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
                  : "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
              } desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
              onClick={printBalanceSheet}
            >
              <FaPrint
                className={`text-xs phone:inline desktop:inline desktop:mr-2 tablet:mr-2 laptop:mr-2 ${
                  sidebarOpen
                    ? "desktop:text-xs laptop:text-xs tablet:text-xs phone:text-[7px]"
                    : "desktop:text-base laptop:text-base tablet:text-xs phone:text-[8px]"
                }`}
              />
              <span
                className={`hidden tablet:inline ${
                  sidebarOpen ? "text-xs" : "text-xs"
                }`}
              >
                Print
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal for adding a new balance sheet */}
      <AntModal
        title="Create New Balance Sheet"
        visible={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        className="responsive-modal"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <ClipLoader color="#0C82B4" loading={isLoading} size={50} />
          </div>
        ) : (
          <form className="flex flex-col space-y-2" onSubmit={handleAddNewYear}>
            <label htmlFor="year" className="text-sm font-semibold">
              Enter year
            </label>
            <Input
              type="text"
              id="year"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="flex-1 border border-gray-300 p-2 rounded"
            />
            <div className="flex justify-end mt-4">
              <Button
                type="primary"
                htmlType="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </Button>
            </div>
          </form>
        )}
      </AntModal>
    </div>
  );
};

export default BalanceSheetGraybarAdmin;
