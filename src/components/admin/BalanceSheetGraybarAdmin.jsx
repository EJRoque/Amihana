import { useState, useEffect } from "react";
import balanceSheetLogo from "../../assets/icons/balance-sheet-logo.svg";
import { FaPlus, FaPrint } from "react-icons/fa";
import { db } from "../../firebases/FirebaseConfig";
import { collection, doc, setDoc, getDocs, getDoc } from "firebase/firestore";
import { Dropdown, Button, Menu, Space, Modal as AntModal, Input } from "antd";
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const BalanceSheetGraybarAdmin = ({ setSelectedYear, setData }) => {
  const [existingDates, setExistingDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [yearInput, setYearInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleAddNewYear = async () => {
    if (!yearInput.trim()) return;

    try {
      const yearDocRef = doc(db, "balanceSheetRecord", yearInput);
      await setDoc(yearDocRef, {});

      await transferPreviousYearData(yearInput);

      setExistingDates((prevDates) => [...prevDates, yearInput]);
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
  };

  const menu = (
    <Menu onClick={handleYearChange}>
      <Menu.Item key="" disabled>Select year</Menu.Item>
      {existingDates.map((date, index) => (
        <Menu.Item key={date}>
          {date}
        </Menu.Item>
      ))}
    </Menu>
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`bg-white shadow-md flex items-center rounded-md overflow-hidden ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
      <div className={`flex items-center justify-between w-full px-2 ${sidebarOpen ? 'desktop:px-1 laptop:px-1 tablet:px-1 phone:px-1' : 'desktop:px-2 laptop:px-2 tablet:px-2 phone:px-1'}`}>
        <div className="flex items-center justify-between w-full space-x-2 phone:space-x-1">
          {/* Left Side */}
          <div className="flex items-center gap-1">
            <h1 className={`text-[#0C82B4] my-auto font-poppins ${sidebarOpen ? 'desktop:text-sm laptop:text-sm tablet:text-xs phone:text-[8px]' : 'desktop:text-base laptop:text-base tablet:text-sm phone:text-[10px]'} phone:ml-1 capitalize`}>
              Balance Sheet
            </h1>
            <img
              src={balanceSheetLogo}
              className={`desktop:h-4 desktop:w-4 laptop:h-4 laptop:w-4 tablet:h-3 tablet:w-3 phone:h-2 phone:w-2`}
              alt="Balance Sheet Logo"
            />
          </div>

          {/* Right Side */}
          <div className={`flex items-center space-x-2 ${sidebarOpen ? 'desktop:space-x-1 laptop:space-x-1 tablet:space-x-1 phone:space-x-0' : 'desktop:space-x-2 laptop:space-x-2 tablet:space-x-2 phone:space-x-1'}`}>
            {/* Add New Year Button */}
            <button
              className={`bg-[#0C82B4] font-poppins ${sidebarOpen ? 'desktop:h-8 laptop:h-8 tablet:h-6 phone:h-4' : 'desktop:h-10 laptop:h-10 tablet:h-8 phone:h-5'} desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[6px] text-white p-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
              onClick={handleOpenModal}
            >
              <FaPlus className={`text-sm ${sidebarOpen ? 'desktop:text-xs laptop:text-xs tablet:text-xs phone:text-[5px]' : 'desktop:text-base laptop:text-base tablet:text-xs phone:text-[6px]'}`} />
              <span className={`hidden tablet:inline ${sidebarOpen ? 'text-xs' : 'text-xs'}`}>Add new</span>
            </button>

            {/* Year Selector */}
            <Dropdown overlay={menu} trigger={['click']} className={`bg-[#5D7285] ${sidebarOpen ? 'desktop:h-8 laptop:h-8 tablet:h-6 phone:h-4' : 'desktop:h-10 laptop:h-10 tablet:h-8 phone:h-5'} desktop:w-[7rem] laptop:w-[6.5rem] tablet:w-[5rem] phone:w-[4rem] desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[7px] text-white p-2 rounded flex items-center`}>
              <Button>
                <Space>
                  Select year
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>

            {/* Print Button */}
            <button
              className={`bg-[#0C82B4] font-poppins ${sidebarOpen ? 'desktop:h-8 laptop:h-8 tablet:h-6 phone:h-4' : 'desktop:h-10 laptop:h-10 tablet:h-8 phone:h-5'} desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[6px] text-white p-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
              onClick={() => console.log('Print functionality here')}
            >
              <FaPrint className={`text-sm ${sidebarOpen ? 'desktop:text-xs laptop:text-xs tablet:text-xs phone:text-[5px]' : 'desktop:text-base laptop:text-base tablet:text-xs phone:text-[6px]'}`} />
              <span className={`hidden tablet:inline ${sidebarOpen ? 'text-xs' : 'text-xs'}`}>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal for adding a new balance sheet */}
      <AntModal
        title="Create new balance sheet"
        visible={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleAddNewYear}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter year"
          value={yearInput}
          onChange={(e) => setYearInput(e.target.value)}
        />
      </AntModal>
    </div>
  );
};

export default BalanceSheetGraybarAdmin;
