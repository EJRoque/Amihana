import React, { useState, useEffect } from "react";
import cashflowLogo from "../../assets/icons/cash-flow-logo.svg";
import Modal from "./Modal";
import closeIcon from "../../assets/icons/close-icon.svg";
import { ClipLoader } from "react-spinners"; // Import the spinner
import {
  addCashFlowRecord,
  fetchCashFlowDates,
  fetchCashFlowRecord,
} from "../../firebases/firebaseFunctions";
import amihanaLogo from "../../assets/images/amihana-logo.png";
import { db } from "../../firebases/FirebaseConfig";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FaPlus, FaTrash, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { Dropdown, Button, Menu, Modal as AntModal, Input, Space } from "antd";
import { DownOutlined, ExportOutlined } from "@ant-design/icons"; // Import Ant Design icons
import spacetime from "spacetime";
import * as XLSX from "xlsx"; // Import the XLSX library
import { toast } from "react-toastify";

const CashflowGraybar = ({ cashFlow, setCashFlow }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingDates, setExistingDates] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);

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

  useEffect(() => {
    validateForm();
  }, [cashFlow]);

  const validateForm = () => {
    if (
      !cashFlow ||
      !cashFlow.openingBalance ||
      !cashFlow.cashReceipts ||
      !cashFlow.cashPaidOut
    ) {
      setIsFormValid(false);
      return;
    }
    const hasOpening = cashFlow.openingBalance.some(
      (item) => item.description && item.amount
    );
    const hasReceipts = cashFlow.cashReceipts.some(
      (item) => item.description && item.amount
    );
    const hasPaidOut = cashFlow.cashPaidOut.some(
      (item) => item.description && item.amount
    );
    setIsFormValid(hasPaidOut && hasReceipts);
  };

  //Export pop up
  const handleExportClick = () => {
    setIsExportPopupOpen(!isExportPopupOpen); // Toggle the export options popup
  };

  const handleExportOptionClick = (option) => {
    setIsExportPopupOpen(false); // Close the popup
    if (option === "pdf") {
      printTable(); // Call the function for exporting as PDF
    } else if (option === "excel") {
      exportToExcel(); // Call the function for exporting as Excel
    }
  };

  const handleCloseExportModal = () => {
    setIsExportPopupOpen(false);
  };

  //--

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
    setSelectedDate(null); // Reset selected date when opening the modal
    setIsModalOpen(true);
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

  const handleSelectDate = async ({ key }) => {
    if (!key) {
      // If key is empty (e.g., "Select date" is clicked), do nothing or handle accordingly
      return;
    }

    const selectedDate = key;
    const formattedDate = spacetime(selectedDate).format(
      "{month} {date}, {year}"
    );
    setCashFlow((prevCashFlow) => ({
      ...prevCashFlow,
      date: formattedDate,
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
    setIsLoading(true); // Start loading

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
      date: selectedDate
        ? spacetime(selectedDate).format("{month} {date}, {year}")
        : cashFlow.date, // Format selected date before saving
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
      toast.success(
        "Successfully added cashflow data. Please refresh the page."
      );
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
    }

    setIsLoading(false); // Stop loading
    handleCloseModal();
  };

  const handleChange = (type, index, field, value) => {
    const updatedItems = [...cashFlow[type]];
    updatedItems[index][field] = value;
    setCashFlow((prev) => ({ ...prev, [type]: updatedItems }));
  };

  const renderInputs = (type) => {
    if (!cashFlow || !cashFlow[type]) {
      return null;
    }
    return cashFlow[type].map((item, index) => (
      <div key={index} className="flex items-center space-x-2 mb-2">
        <Input
          placeholder="Description"
          value={item.description}
          onChange={(e) =>
            handleChange(type, index, "description", e.target.value)
          }
          className="border border-gray-300 p-2 rounded-lg flex-1"
        />
        <Input
          placeholder="Amount"
          type="number"
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

  const fetchUserFullName = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser; // Get the currently logged-in user
    if (!currentUser) {
      console.error("No user is logged in.");
      return "";
    }

    // Reference to the user document in Firestore
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data().fullName; // Assuming fullName is a field in the user's document
    } else {
      console.error("User document does not exist.");
      return "";
    }
  };

  const printTable = async () => {
    const accountName = await fetchUserFullName(); // Fetch the full name

    if (!accountName) {
      console.error("Failed to retrieve the user's full name.");
      return;
    }

    const printWindow = window.open("", "", "width=800,height=1000"); // Adjust height if needed

    printWindow.document.write(
      "<html><head><title>Print Cash Flow Record</title>"
    );
    printWindow.document.write(
      "<style>body { font-family: Arial, sans-serif; margin: 0; padding: 0; }" +
        "@media print {" +
        "  @page { size: A4; margin: 10mm; }" +
        "  table { width: 100%; border-collapse: collapse; }" +
        "  th, td { border: 1px solid black; padding: 4px; text-align: left; font-size: 12px; }" +
        "  h1 { font-size: 16px; margin-bottom: 0; }" +
        "  h2 { font-size: 14px; margin-bottom: 0; }" +
        "  h3 { font-size: 12px; margin: 5px 0; }" +
        "  img { height: 40px; width: auto; }" +
        "  .amount { text-align: right; }" +
        "  .container { width: 100%; overflow: hidden; }" +
        "}</style></head><body>"
    );

    // Add logo and account name
    printWindow.document.write(
      "<div class='container' style='display: flex; justify-content: space-between; align-items: center;'>"
    );
    printWindow.document.write("<h1>Amihana Cash Flow Record</h1>");
    printWindow.document.write(
      "<img src='" +
        amihanaLogo +
        "' alt='Amihana Logo' style='height: 50px; width: auto; margin-right: 20px;'/>"
    );
    printWindow.document.write("</div>");

    // Add the date and the account name
    printWindow.document.write("<h2>Date: " + cashFlow.date + "</h2>");
    printWindow.document.write("<h3>Printed by: " + accountName + "</h3>"); // Print the account name

    // Update section labels
    const sectionLabels = {
      openingBalance: "Opening Balance",
      cashReceipts: "Add: Cash Receipts",
      cashPaidOut: "Less: Cash Paid-out",
    };

    Object.keys(sectionLabels).forEach((section) => {
      printWindow.document.write("<h3>" + sectionLabels[section] + "</h3>");
      printWindow.document.write("<table>");
      printWindow.document.write(
        "<thead><tr><th>Description</th><th>Amount</th></tr></thead>"
      );
      printWindow.document.write("<tbody>");
      cashFlow[section].forEach((item) => {
        printWindow.document.write("<tr>");
        printWindow.document.write("<td>" + item.description + "</td>");
        printWindow.document.write(
          "<td class='amount'>₱" +
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

  // Function to export data to Excel
  const exportToExcel = () => {
    const worksheetData = [];

    // Add the Date of the cash flow
    worksheetData.push(["Cash Flow"]);
    worksheetData.push(["Date Created", cashFlow.date]);

    // Add Opening Balance section
    worksheetData.push([]);
    worksheetData.push(["Opening Balance"]);
    worksheetData.push(["Description", "Amount"]);
    cashFlow.openingBalance.forEach((item) => {
      worksheetData.push([item.description, item.amount]);
    });

    // Add Cash Receipts section
    worksheetData.push([]);
    worksheetData.push(["Add: Cash Receipts"]);
    worksheetData.push(["Description", "Amount"]);
    cashFlow.cashReceipts.forEach((item) => {
      worksheetData.push([item.description, item.amount]);
    });

    worksheetData.push([
      "Total Cash Available",
      cashFlow.totalCashAvailable.amount,
    ]);

    // Add Cash Paid-out section
    worksheetData.push([]);
    worksheetData.push(["Less: Cash Paid-out"]);
    worksheetData.push(["Description", "Amount"]);
    cashFlow.cashPaidOut.forEach((item) => {
      worksheetData.push([item.description, item.amount]);
    });

    worksheetData.push([
      "Total Cash Paid-out",
      cashFlow.totalCashPaidOut.amount,
    ]);

    // Add Ending Balance section
    worksheetData.push([]);
    worksheetData.push(["Ending Balance", cashFlow.endingBalance.amount]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "CashFlow Data");

    // Export the workbook to an Excel file
    XLSX.writeFile(workbook, "cashflow_data.xlsx");
  };

  const dateMenu = (
    <Menu onClick={handleSelectDate}>
      <Menu.Item key="" disabled>
        Select date
      </Menu.Item>
      {existingDates.map((date, index) => (
        <Menu.Item key={date}>{date}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div
      className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden ${
        sidebarOpen
          ? "desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10"
          : "desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12"
      } desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}
    >
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1 className="text-[#0C82B4] my-auto font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
            Cash flow record
          </h1>
          <img
            src={cashflowLogo}
            alt="Cash flow Logo"
            className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
          />
        </div>
        <div className="flex items-center space-x-2 mx-2">
          <button
            className={`bg-[#0C82B4] font-poppins ${
              sidebarOpen
                ? "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
                : "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
            } desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
            onClick={handleOpenModal}
          >
            <FaPlus className="phone:inline desktop:inline desktop:mr-2 tablet:mr-2 laptop:mr-2" />{" "}
            {/* Show icon on mobile */}
            <span className="phone:hidden tablet:inline">Add New</span>{" "}
            {/* Hide text on mobile */}
          </button>
          <Dropdown
            overlay={dateMenu}
            trigger={["click"]}
            className={`bg-[#5D7285] font-poppins ${
              sidebarOpen
                ? "desktop:h-8 laptop:h-8 tablet:h-6 phone:h-5"
                : "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
            } desktop:w-[7rem] laptop:w-[6.5rem] tablet:w-[5rem] phone:w-[4.5rem] desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 py-1 rounded flex items-center`}
          >
            <Button className="flex items-center">
              <Space>
                {selectedDate || "Select Date"}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
          <div className="relative">
            {/* Export Button */}
            <button
              className={`bg-[#0C82B4] font-poppins ${
                sidebarOpen
                  ? "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
                  : "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
              } desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 rounded flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
              onClick={handleExportClick}
            >
              {/* Show icon on mobile */}
              <span className="flex m-2 phone:hidden tablet:inline">
                Export
              </span>
              {<ExportOutlined />}
              {/* Hide text on mobile */}
            </button>

            {/* Export Options Popup */}
            {isExportPopupOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="relative bg-white p-4 rounded shadow-lg w-80">
                  {/* Close Button with the Imported SVG Icon */}
                  <button
                    className="absolute top-2 right-2"
                    onClick={handleCloseExportModal}
                  >
                    <img src={closeIcon} alt="Close" className="h-6 w-6" />
                  </button>

                  <h3 className="text-lg font-semibold mb-4">Export Options</h3>

                  {/* Export as PDF Button */}
                  <button
                    className="flex items-center w-full p-2 hover:bg-gray-100"
                    onClick={() => handleExportOptionClick("pdf")}
                  >
                    <FaFilePdf className="mr-2 text-red-500" /> Export as PDF
                  </button>

                  {/* Export as Excel Button */}
                  <button
                    className="flex items-center w-full p-2 hover:bg-gray-100"
                    onClick={() => handleExportOptionClick("excel")}
                  >
                    <FaFileExcel className="mr-2 text-green-500" /> Export as
                    Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AntModal
        title="Add Cash Flow"
        visible={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okButtonProps={{ disabled: !isFormValid }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <ClipLoader color="#0C82B4" loading={isLoading} size={50} />
          </div>
        ) : (
          <form>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Date</h2>
              <Input
                type="date"
                value={
                  selectedDate
                    ? spacetime(selectedDate).format("yyyy-MM-dd")
                    : ""
                }
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold">Opening Balance</h2>
              {renderInputs("openingBalance")}
              <button
                type="button"
                className="bg-green-400 text-white mt-2 rounded-md flex justify-center items-center p-2"
                onClick={() => handleAddInput("openingBalance")}
              >
                <FaPlus className="mr-2" /> Add new item
              </button>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold">Add: Cash Receipts</h2>
              {renderInputs("cashReceipts")}
              <button
                type="button"
                className="bg-green-400 text-white mt-2 rounded-md flex justify-center items-center p-2"
                onClick={() => handleAddInput("cashReceipts")}
              >
                <FaPlus className="mr-2" /> Add new item
              </button>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold">Pledges</h2>
              {renderInputs("cashReceipts")}
              <button
                type="button"
                className="bg-green-400 text-white mt-2 rounded-md flex justify-center items-center p-2"
                onClick={() => handleAddInput("cashReceipts")}
              >
                <FaPlus className="mr-2" /> Add new item
              </button>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold">Less: Cash Paid-out</h2>
              {renderInputs("cashPaidOut")}
              <button
                type="button"
                className="bg-green-400 text-white mt-2 rounded-md flex justify-center items-center p-2"
                onClick={() => handleAddInput("cashPaidOut")}
              >
                <FaPlus className="mr-2" /> Add new item
              </button>
            </div>
          </form>
        )}
      </AntModal>
    </div>
  );
};

export default CashflowGraybar;
