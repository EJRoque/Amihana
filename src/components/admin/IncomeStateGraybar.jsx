import React, { useState, useEffect } from "react";
import incomestatementLogo from "../../assets/icons/income-statement-logo.svg";
import { FaPlus, FaPrint, FaTrash } from "react-icons/fa";
import { Dropdown, Button, Menu, Modal as AntModal, Input, notification } from "antd";
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
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (!incomeStatement) {
      setIncomeStatement({
        date: "",
        incomeRevenue: [{ description: "", amount: "" }],
        incomeExpenses: [{ description: "", amount: "" }],
        totalRevenue: { description: "Total Revenue", amount: "" },
        totalExpenses: { description: "Total Expenses", amount: "" },
        netIncome: { description: "Net Income", amount: "" },
      });
    }
  }, [incomeStatement, setIncomeStatement]);

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

  useEffect(() => {
    validateForm();
  }, [incomeStatement]);

  const validateForm = () => {
    const hasRevenue = incomeStatement.incomeRevenue.some(item => item.description && item.amount);
    const hasExpenses = incomeStatement.incomeExpenses.some(item => item.description && item.amount);
    setIsFormValid(hasRevenue && hasExpenses);
  };

  const handleSelectDate = async (date, dateString) => {
    const selectedDate = dateString;
    setIncomeStatement((prevIncomeStatement) => ({
      ...prevIncomeStatement,
      date: selectedDate,
    }));

    try {
      const incomeStateData = await fetchIncomeStateRecord(selectedDate);
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

  const calculateTotal = (type) => {
    return incomeStatement[type]
      .reduce((acc, item) => acc + parseFloat(item.amount || 0), 0)
      .toFixed(2);
  };

  const renderInputs = (type) => {
    if (!incomeStatement || !incomeStatement[type]) {
      return null;
    }
    return incomeStatement[type].map((item, index) => (
      <div key={index} className="flex items-center space-x-2 mb-2">
        <Input
          placeholder="Description"
          value={item.description}
          onChange={(e) => handleChange(type, index, "description", e.target.value)}
          className="border border-gray-300 p-2 rounded-lg flex-1"
        />
        <Input
          placeholder="Amount"
          value={item.amount}
          onChange={(e) => handleChange(type, index, "amount", e.target.value)}
          className="border border-gray-300 p-2 rounded-lg flex-1"
        />
        {index >= 1 && ( // Show trash icon only for items added after the first one
          <button
            type="button"
            className="text-red-500 ml-2"
            onClick={() => handleRemoveInput(type, index)}
          >
            <FaTrash />
          </button>
        )}
      </div>
    ));
  };

  const handleChange = (type, index, field, value) => {
    const updatedItems = [...incomeStatement[type]];
    updatedItems[index][field] = value;
    setIncomeStatement((prev) => ({ ...prev, [type]: updatedItems }));
  };

  const handleAddInput = (type) => {
    const newInput = { description: "", amount: "" };
    setIncomeStatement((prev) => ({
      ...prev,
      [type]: [...prev[type], newInput],
    }));
  };

  const handleRemoveInput = (type, index) => {
    if (incomeStatement[type].length > 1) {
      setIncomeStatement((prev) => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index),
      }));
    }
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

  const handlePrint = () => {
    window.print();
  };

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
            className={`bg-[#0C82B4] font-poppins ${sidebarOpen ? 'desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5' : 'desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5'} desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
            onClick={handleOpenModal}
          >
            <FaPlus className="phone:inline desktop:inline desktop:mr-2" /> {/* Show icon on mobile */}
            <span className="phone:hidden tablet:inline">Add new</span> {/* Hide text on mobile */}
          </button>

          {/* Date Dropdown */}
          <Dropdown overlay={dateMenu} trigger={['click']}>
            <Button
              className={`bg-[#0C82B4] font-poppins ${sidebarOpen ? 'desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5' : 'desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5'} desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}>
              <span className="phone:hidden tablet:inline">Select Date</span>
              <DownOutlined className="phone:inline tablet:hidden" />
            </Button>
          </Dropdown>

          {/* Print Button */}
          <button
            className={`bg-[#5D7285] font-poppins ${sidebarOpen ? 'desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5' : 'desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5'} desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
            onClick={handlePrint}
          >
            <FaPrint className="phone:inline desktop:inline desktop:mr-2" /> {/* Show icon on mobile */}
            <span className="phone:hidden tablet:inline">Print</span> {/* Hide text on mobile */}
          </button>
        </div>
      </div>

      {/* Add Income Statement Modal */}
      <AntModal
        title="Add Income Statement"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Income Revenue</h3>
            {renderInputs("incomeRevenue")}
            <button
              type="button"
              className="bg-green-500 text-white px-3 py-1 rounded mt-2"
              onClick={() => handleAddInput("incomeRevenue")}
            >
              Add Revenue
            </button>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Income Expenses</h3>
            {renderInputs("incomeExpenses")}
            <button
              type="button"
              className="bg-green-500 text-white px-3 py-1 rounded mt-2"
              onClick={() => handleAddInput("incomeExpenses")}
            >
              Add Expense
            </button>
          </div>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-500"
            disabled={!isFormValid}
          >
            Save
          </Button>
        </form>
      </AntModal>
    </div>
  );
};

export default IncomeStatementGraybar;
