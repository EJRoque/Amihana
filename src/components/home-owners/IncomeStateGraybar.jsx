import React, { useState, useEffect } from "react";
import incomestatementLogo from "../../assets/icons/income-statement-logo.svg";
import { LineChartOutlined, DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Button } from 'antd';
import {
  fetchIncomeStateDates,
  fetchIncomeStateRecord,
} from "../../firebases/firebaseFunctions";

//Under development


const IncomeStatementGraybar = ({ incomeStatement = {}, setIncomeStatement }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [existingDates, setExistingDates] = useState([]);

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

  const formatAmount = (amount) => {
    if (!amount) return "₱0.00";
    const formattedAmount = parseFloat(amount).toFixed(2);
    return `₱${formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const handleMenuClick = async ({ key }) => {
    const selectedDate = key;
    console.log("Selected date: ", selectedDate); // Debugging the selected date
  
    setIncomeStatement((prevIncomeStatement) => ({
      ...prevIncomeStatement,
      date: selectedDate,
    }));
  
    try {
      const IncomestateData = await fetchIncomeStateRecord(selectedDate);
      console.log("Fetched income statement data: ", IncomestateData); // Debugging fetched data
  
      setIncomeStatement((prevIncomeStatement) => ({
        ...prevIncomeStatement,
        ...IncomestateData,
      }));
  
    } catch (error) {
      console.error("Error fetching income statement record:", error);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {existingDates.map((date, index) => (
        <Menu.Item key={date}>
          {date}
        </Menu.Item>
      ))}
    </Menu>
  );



  return (
    <div className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1"> 
          <h1 className="text-[#0C82B4] my-auto font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
            Income Statement
          </h1>
          <LineChartOutlined
            className="flex m-2 desktop:h-10 desktop:w-10 laptop:h-8 laptop:w-8 phone:h-6 phone:w-6 text-[#0C82B4]"
          />
        </div>
        <div className="flex items-center desktop:space-x-4 laptop:space-x-3 phone:space-x-2">
          <Dropdown overlay={menu} trigger={['click']}>
            <Button className="bg-[#0C82B4] text-white flex items-center desktop:h-8 laptop:h-8 phone:h-6 desktop:text-base laptop:text-base phone:text-sm desktop:px-4 laptop:px-3 phone:px-2 rounded-lg">
              {incomeStatement.date || "Select date"} <DownOutlined />
            </Button>
          </Dropdown>

          <Button
            className="bg-[#0C82B4] text-white flex items-center desktop:h-8 laptop:h-8 phone:h-6 desktop:text-base laptop:text-base phone:text-sm desktop:px-4 laptop:px-3 phone:px-2 rounded-lg"
            onClick={"printTable"}
          >
            Print
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatementGraybar;
