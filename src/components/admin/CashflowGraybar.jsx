import React, { useState, useEffect } from "react";
import cashflowLogo from "../../assets/icons/cash-flow-logo.svg";
import Modal from "./Modal";
import closeIcon from "../../assets/icons/close-icon.svg";
import {
  addCashFlowRecord,
  fetchCashFlowDates,
  fetchCashFlowRecord,
} from "../../firebases/firebaseFunctions";

const CashflowGraybar = ({ cashFlow, setCashFlow }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setCashFlow({
      date: "",
      openingBalance: [{ description: "", amount: "" }],
      cashReceipts: [{ description: "", amount: "" }],
      cashPaidOut: [{ description: "", amount: "" }],
      totalCashAvailable: { description: "Total Cash Available", amount: "" },
      totalCashPaidOut: { description: "Total Cash Paid-out", amount: "" },
      endingBalance: { description: "Ending Balance", amount: "" },
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddInput = (section) => {
    setCashFlow((prevCashFlow) => ({
      ...prevCashFlow,
      [section]: [...prevCashFlow[section], { description: "", amount: "" }],
    }));
  };

  const handleRemoveInput = (section) => {
    setCashFlow((prevCashFlow) => ({
      ...prevCashFlow,
      [section]: prevCashFlow[section].slice(0, -1),
    }));
  };

  const handleChangeInput = (section, index, event) => {
    const { name, value } = event.target;
    setCashFlow((prevCashFlow) => {
      const newSection = [...prevCashFlow[section]];
      newSection[index][name] = value;
      return {
        ...prevCashFlow,
        [section]: newSection,
      };
    });
  };

  const handleDateChange = (event) => {
    const date = new Date(event.target.value);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCashFlow((prevCashFlow) => ({
      ...prevCashFlow,
      date: formattedDate,
    }));

    // Update the existing dates list if the new date doesn't already exist
    if (!existingDates.includes(formattedDate)) {
      setExistingDates((prevDates) => [...prevDates, formattedDate]);
    }
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

  const calculateTotal = (section) => {
    return cashFlow[section]
      .reduce((total, item) => total + parseFloat(item.amount || 0), 0)
      .toFixed(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const totalOpeningBalance = calculateTotal("openingBalance");
    const totalCashReceipts = calculateTotal("cashReceipts");
    const totalCashPaidOut = calculateTotal("cashPaidOut");
    const totalCashAvailable = (
      parseFloat(totalOpeningBalance) + parseFloat(totalCashReceipts)
    ).toFixed(2);
    const endingBalance = (
      parseFloat(totalCashAvailable) - parseFloat(totalCashPaidOut)
    ).toFixed(2);

    const updatedCashFlow = {
      ...cashFlow,
      totalCashAvailable: {
        description: "Total Cash Available",
        amount: totalCashAvailable,
      },
      totalCashPaidOut: {
        description: "Total Cash Paid-out",
        amount: totalCashPaidOut,
      },
      endingBalance: { description: "Ending Balance", amount: endingBalance },
    };

    setCashFlow(updatedCashFlow);

    // Save to Firebase
    try {
      await addCashFlowRecord(updatedCashFlow);
      console.log("Data saved to Firebase:", updatedCashFlow);
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
    }

    handleCloseModal();
  };

  const renderInputs = (section) => {
    return cashFlow[section].map((input, index) => (
      <div key={index} className="flex space-x-2 mb-2">
        <input
          type="text"
          name="description"
          value={input.description}
          onChange={(e) => handleChangeInput(section, index, e)}
          className="flex-1 border border-gray-300 p-2 rounded"
          placeholder="Description"
        />
        <input
          type="number"
          name="amount"
          value={input.amount}
          onChange={(e) => handleChangeInput(section, index, e)}
          className="w-32 border border-gray-300 p-2 rounded"
          placeholder="Amount"
        />
      </div>
    ));
  };

  const printTable = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(
      "<html><head><title>Print Cash Flow Record</title>"
    );
    printWindow.document.write(
      "<style>table { width: 100%; border-collapse: collapse; }"
    );
    printWindow.document.write(
      "th, td { border: 1px solid black; padding: 8px; text-align: left; }</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h1>Cash Flow Record</h1>");
    printWindow.document.write("<h2>Date: " + cashFlow.date + "</h2>");

    ["openingBalance", "cashReceipts", "cashPaidOut"].forEach((section) => {
      printWindow.document.write(
        "<h3>" + section.replace(/([A-Z])/g, " $1").trim() + "</h3>"
      );
      printWindow.document.write("<table>");
      printWindow.document.write(
        "<thead><tr><th>Description</th><th>Amount</th></tr></thead>"
      );
      printWindow.document.write("<tbody>");
      cashFlow[section].forEach((item) => {
        printWindow.document.write("<tr>");
        printWindow.document.write("<td>" + item.description + "</td>");
        printWindow.document.write(
          "<td>₱" +
            parseFloat(item.amount || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) +
            "</td>"
        );
        printWindow.document.write("</tr>");
      });
      printWindow.document.write("</tbody>");
      printWindow.document.write("</table>");
    });

    printWindow.document.write(
      "<h3>Total Cash Available: ₱" +
        parseFloat(cashFlow.totalCashAvailable.amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) +
        "</h3>"
    );
    printWindow.document.write(
      "<h3>Total Cash Paid-out: ₱" +
        parseFloat(cashFlow.totalCashPaidOut.amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) +
        "</h3>"
    );
    printWindow.document.write(
      "<h3>Ending Balance: ₱" +
        parseFloat(cashFlow.endingBalance.amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) +
        "</h3>"
    );

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
          <button
            className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 mr-1 rounded flex items-center"
            onClick={handleOpenModal}
          >
            Add new
          </button>
          <select
            className="bg-[#5D7285] font-poppins desktop:h-10 desktop:w-[8rem] laptop:h-10 laptop:w-[7.5rem] tablet:h-6 tablet:w-[5.5rem] phone:h-5 phone:w-[4.5rem] desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded phone:mr-1 flex items-center"
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

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto mt-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold mb-4">
                Add New Cash Flow Record
              </h2>
              <button
                className="absolute top-2 right-2 text-right"
                onClick={handleCloseModal}
              >
                <img src={closeIcon} alt="Close Icon" className="h-5 w-5" />
              </button>
            </div>
            <input
              type="date"
              className="border border-gray-300 p-2 rounded-lg w-full"
              value={cashFlow.date}
              onChange={handleDateChange}
            />
            <div className="border border-gray-300 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Opening Balance</h3>
              {renderInputs("openingBalance")}
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                  onClick={() => handleAddInput("openingBalance")}
                >
                  Add New
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleRemoveInput("openingBalance")}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="border border-gray-300 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Add: Cash Receipts</h3>
              {renderInputs("cashReceipts")}
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                  onClick={() => handleAddInput("cashReceipts")}
                >
                  Add New
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleRemoveInput("cashReceipts")}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="border border-gray-300 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Less: Cash Paid-out</h3>
              {renderInputs("cashPaidOut")}
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                  onClick={() => handleAddInput("cashPaidOut")}
                >
                  Add New
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleRemoveInput("cashPaidOut")}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Compute
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default CashflowGraybar;
