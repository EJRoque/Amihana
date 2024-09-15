import React, { useState, useEffect } from "react";
import { LineChartOutlined, DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Button } from 'antd';
import {
  fetchCashFlowDates,
  fetchCashFlowRecord,
} from "../../firebases/firebaseFunctions";

const CashflowGraybar = ({ cashFlow, setCashFlow }) => {
  const [existingDates, setExistingDates] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const dates = await fetchCashFlowDates();
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
    setCashFlow((prevCashFlow) => ({
      ...prevCashFlow,
      date: selectedDate,
    }));

    try {
      const cashFlowData = await fetchCashFlowRecord(selectedDate);
      setCashFlow((prevCashFlow) => ({
        ...prevCashFlow,
        ...cashFlowData,
      }));
    } catch (error) {
      console.error("Error fetching cash flow record:", error);
    }
  };

  const printTable = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Print Cash Flow Record</title>");
    printWindow.document.write("<style>table { width: 100%; border-collapse: collapse; }");
    printWindow.document.write("th, td { border: 1px solid black; padding: 8px; text-align: left; }</style>");
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h1>Cash Flow Record</h1>");
    printWindow.document.write("<h2>Date: " + cashFlow.date + "</h2>");

    ["openingBalance", "cashReceipts", "cashPaidOut"].forEach((section) => {
      printWindow.document.write("<h3>" + section.replace(/([A-Z])/g, " $1").trim() + "</h3>");
      printWindow.document.write("<table>");
      printWindow.document.write("<thead><tr><th>Description</th><th>Amount</th></tr></thead>");
      printWindow.document.write("<tbody>");
      cashFlow[section].forEach((item, index) => {
        printWindow.document.write("<tr>");
        printWindow.document.write("<td>" + item.description + "</td>");
        printWindow.document.write("<td>" + formatAmount(item.amount) + "</td>");
        printWindow.document.write("</tr>");
      });
      printWindow.document.write("</tbody>");
      printWindow.document.write("</table>");
    });

    printWindow.document.write("<h3>Total Cash Available: " + formatAmount(cashFlow.totalCashAvailable.amount) + "</h3>");
    printWindow.document.write("<h3>Total Cash Paid-out: " + formatAmount(cashFlow.totalCashPaidOut.amount) + "</h3>");
    printWindow.document.write("<h3>Ending Balance: " + formatAmount(cashFlow.endingBalance.amount) + "</h3>");

    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
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
            Cash flow record
          </h1>
          <LineChartOutlined
            className="flex mb-2 desktop:h-10 desktop:w-10 laptop:h-8 laptop:w-8 phone:h-6 phone:w-6 text-[#0C82B4]"
          />
        </div>
        <div className="flex items-center desktop:space-x-4 laptop:space-x-3 phone:space-x-2">
          <Dropdown overlay={menu} trigger={['click']}>
            <Button className="bg-[#0C82B4] text-white flex items-center desktop:h-8 laptop:h-8 phone:h-6 desktop:text-base laptop:text-base phone:text-sm desktop:px-4 laptop:px-3 phone:px-2 rounded-lg">
              {cashFlow.date || "Select date"} <DownOutlined />
            </Button>
          </Dropdown>

          <Button
            className="bg-[#0C82B4] text-white flex items-center desktop:h-8 laptop:h-8 phone:h-6 desktop:text-base laptop:text-base phone:text-sm desktop:px-4 laptop:px-3 phone:px-2 rounded-lg"
            onClick={printTable}
          >
            Print
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CashflowGraybar;
