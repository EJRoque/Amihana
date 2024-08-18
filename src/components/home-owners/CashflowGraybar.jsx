import React, { useState, useEffect } from "react";
import cashflowLogo from "../../assets/icons/cash-flow-logo.svg";
import {
  fetchCashFlowDates,
  fetchCashFlowRecord,
} from "../../firebases/firebaseFunctions";

const CashflowGraybar = ({ cashFlow, setCashFlow }) => {
  const [existingDates, setExistingDates] = useState([]);

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

  const handleSelectDate = async (event) => {
    const selectedDate = event.target.value;
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

  return (
    <div className="bg-[#EAEBEF] flex items-center desktop:h-16 laptop:h-16 phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 border-2 border-slate-400 rounded-md shadow-xl">
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1 className="text-[#0C82B4] font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
            Cash flow record
          </h1>
          <img
            src={cashflowLogo}
            alt="Cash flow Logo"
            className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
          />
        </div>
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2">
          <select
            className="bg-[#5D7285] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded phone:mr-1 flex items-center"
            onChange={handleSelectDate}
            value={cashFlow.date}
          >
            <option value="" disabled>
              Select date
            </option>
            {existingDates.map((date, index) => (
              <option key={index} value={date}>
                {date}
              </option>
            ))}
          </select>

          <button
            className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded flex items-center"
            onClick={printTable}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashflowGraybar;
