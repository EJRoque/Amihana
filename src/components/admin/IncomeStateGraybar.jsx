import React, { useState, useEffect } from "react";
import incomestatementLogo from "../../assets/icons/income-statement-logo.svg";
import closeIcon from "../../assets/icons/close-icon.svg";
import { FaPlus, FaPrint } from "react-icons/fa";
import { Dropdown, Button, Menu, Modal as AntModal, Input } from "antd";
import { DownOutlined } from '@ant-design/icons';
import {
  addIncomeStatementRecord,
  fetchIncomeStateDates,
  fetchIncomeStateRecord,
} from "../../firebases/firebaseFunctions";

const IncomeStatementGraybar = ({ incomeStatement, setIncomeStatement }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingDates, setExistingDates] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const dates = await fetchIncomeStateDates();
        setExistingDates(dates);
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    };
    getExistingDates();
  }, []);

  const handleSelectDate = async (date) => {
    setIncomeStatement((prevIncomeStatement) => ({
      ...prevIncomeStatement,
      date: date.key,
    }));

    try {
      const incomeStateData = await fetchIncomeStateRecord(date.key);
      setIncomeStatement((prevIncomeStatement) => ({
        ...prevIncomeStatement,
        ...incomeStateData,
      }));
    } catch (error) {
      console.error("Error fetching income statement record:", error);
    }
  };

  const handleOpenModal = () => {
    setIncomeStatement({
      date: "",
      incomeRevenue: [{ description: "", amount: "" }],
      incomeExpenses: [{ description: "", amount: "" }],
      totalRevenue: { description: "Total Revenue", amount: "" },
      totalExpenses: { description: "Total Expenses", amount: "" },
      netIncome: { description: "Net Income", amount: "" },
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const totalRevenue = calculateTotal("incomeRevenue");
    const totalExpenses = calculateTotal("incomeExpenses");
    const netIncome = (
      parseFloat(totalRevenue) - parseFloat(totalExpenses)
    ).toFixed(2);

    const updatedIncomeStatement = {
      ...incomeStatement,
      totalRevenue: {
        description: "Total Revenue",
        amount: totalRevenue,
      },
      totalExpenses: {
        description: "Total Expenses",
        amount: totalExpenses,
      },
      netIncome: { description: "Net Income", amount: netIncome },
    };

    setIncomeStatement(updatedIncomeStatement);

    // Save to Firebase
    try {
      await addIncomeStatementRecord(updatedIncomeStatement);
      console.log("Data saved to Firebase:", updatedIncomeStatement);
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
    }

    handleCloseModal();
  };

  const dateMenu = (
    <Menu onClick={handleSelectDate}>
      <Menu.Item key="" disabled>Select date</Menu.Item>
      {existingDates.map((date, index) => (
        <Menu.Item key={date}>
          {date}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className={`bg-white shadow-md flex items-center my-3 rounded-md overflow-hidden ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1 className="text-[#0C82B4] my-auto font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
            Income Statement
          </h1>
          <img
            src={incomestatementLogo}
            alt="Income Statement Logo"
            className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
          />
        </div>
        <div className={`flex items-center space-x-2 ${sidebarOpen ? 'desktop:space-x-1 laptop:space-x-1 tablet:space-x-1 phone:space-x-0' : 'desktop:space-x-2 laptop:space-x-2 tablet:space-x-2 phone:space-x-1'}`}>
          {/* Add New Button */}
          <button
            className={`bg-[#0C82B4] font-poppins ${sidebarOpen ? 'desktop:h-8 laptop:h-8 tablet:h-6 phone:h-5' : 'desktop:h-10 laptop:h-10 tablet:h-8 phone:h-5'} desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
            onClick={handleOpenModal}
          >
            <FaPlus className="phone:inline desktop:inline desktop:mr-2" /> {/* Show icon on mobile */}
            <span className="phone:hidden tablet:inline">Add new</span> {/* Hide text on mobile */}
          </button>

          {/* Date Dropdown */}
          <Dropdown overlay={dateMenu} trigger={['click']}>
            <Button className="bg-[#5D7285] font-poppins desktop:h-10 desktop:w-[8rem] laptop:h-10 laptop:w-[7.5rem] tablet:h-6 tablet:w-[5.5rem] phone:h-5 phone:w-[4.5rem] desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded flex items-center">
              <span>Select date</span>
              <DownOutlined />
            </Button>
          </Dropdown>

          {/* Print Button */}
          <button
            className={`bg-[#0C82B4] font-poppins ${sidebarOpen ? 'desktop:h-8 laptop:h-8 tablet:h-6 phone:h-5' : 'desktop:h-10 laptop:h-10 tablet:h-8 phone:h-5'} desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
            onClick={() => console.log('Print')} // Add your print function here
          >
            <FaPrint className="phone:inline desktop:inline desktop:mr-2" /> {/* Show icon on mobile */}
            <span className="phone:hidden tablet:inline">Print</span> {/* Hide text on mobile */}
          </button>
        </div>
      </div>

      {/* Ant Modal for Adding New Record */}
      <AntModal
        title="Add New Income Statement Record"
        visible={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <form onSubmit={handleSubmit}>
          <Input
            type="date"
            className="border border-gray-300 p-2 rounded-lg w-auto mb-4"
            value={incomeStatement.date}
            onChange={(e) => setIncomeStatement({ ...incomeStatement, date: e.target.value })}
          />
          {/* Additional inputs for the form would go here */}
          <Button type="primary" htmlType="submit" className="bg-green-500 text-white">
            Save
          </Button>
        </form>
      </AntModal>
    </div>
  );
};

export default IncomeStatementGraybar;
