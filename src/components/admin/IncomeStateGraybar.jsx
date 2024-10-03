import React, { useState, useEffect } from "react";
import spacetime from "spacetime";
import {
  FaPlus,
  FaPrint,
  FaTrash,
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";
import closeIcon from "../../assets/icons/close-icon.svg";
import { Dropdown, Button, Menu, Space, Modal as AntModal, Input } from "antd";
import { DownOutlined, ContainerFilled, ExportOutlined } from "@ant-design/icons"; // Import Ant Design icons
import {
  addIncomeStatementRecord,
  fetchIncomeStateDates,
  fetchIncomeStateRecord,
} from "../../firebases/firebaseFunctions";
import amihanaLogo from "../../assets/images/amihana-logo.png";
import { db } from "../../firebases/FirebaseConfig";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import * as XLSX from "xlsx"; // Import xlsx for Excel export

const IncomeStatementGraybar = ({ incomeStatement, setIncomeStatement }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingDates, setExistingDates] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);

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
    if (
      !incomeStatement ||
      !incomeStatement.incomeRevenue ||
      !incomeStatement.incomeExpenses
    ) {
      setIsFormValid(false);
      return;
    }
    const hasRevenue = incomeStatement.incomeRevenue.some(
      (item) => item.description && item.amount
    );
    const hasExpenses = incomeStatement.incomeExpenses.some(
      (item) => item.description && item.amount
    );
    setIsFormValid(hasRevenue && hasExpenses);
  };

  const handleSelectDate = async (e) => {
    const selectedDate = e.key;
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

  //Export pop up
  const handleExportClick = () => {
    setIsExportPopupOpen(!isExportPopupOpen); // Toggle the export options popup
  };

  const handleExportOptionClick = (option) => {
    setIsExportPopupOpen(false); // Close the popup
    if (option === "pdf") {
      handlePrint(); // Call the function for exporting as PDF
    } else if (option === "excel") {
      handleExportToExcel(); // Call the function for exporting as Excel
    }
  };

  const handleCloseExportModal = () => {
    setIsExportPopupOpen(false);
  };

  //--

  const handleOpenModal = () => {
    setIncomeStatement({
      date: "",
      incomeRevenue: [{ description: "", amount: "" }],
      incomeExpenses: [{ description: "", amount: "" }],
      totalRevenue: { description: "Total Revenue", amount: "" },
      totalExpenses: { description: "Total Expenses", amount: "" },
      netIncome: { description: "Net Income", amount: "" },
    });
    setSelectedDate(null); // Reset selected date when opening the modal
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
      date: selectedDate
        ? spacetime(selectedDate).format("yyyy-MM-dd")
        : incomeStatement.date, // Save selected date
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
      <Menu.Item key="" disabled>
        Select date
      </Menu.Item>
      {existingDates.map((date, index) => (
        <Menu.Item key={date}>{date}</Menu.Item>
      ))}
    </Menu>
  );

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

  const handlePrint = async () => {
    const accountName = await fetchUserFullName(); // Fetch the full name

    if (!accountName) {
      console.error("Failed to retrieve the user's full name.");
      return;
    }

    const printWindow = window.open("", "", "width=800,height=1000"); // Adjust height if needed

    printWindow.document.write(
      "<html><head><title>Print Income Statement Record</title>"
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
    printWindow.document.write("<h1>Amihana Income Statement</h1>");
    printWindow.document.write(
      "<img src='" +
        amihanaLogo +
        "' alt='Amihana Logo' style='height: 50px; width: auto; margin-right: 20px;'/>"
    );
    printWindow.document.write("</div>");

    // Add the date and the account name
    printWindow.document.write("<h2>Date: " + incomeStatement.date + "</h2>");
    printWindow.document.write("<h3>Printed by: " + accountName + "</h3>"); // Print the account name

    // Update section labels
    const sectionLabels = {
      incomeRevenue: "Revenue",
      incomeExpenses: "Expenses",
    };

    Object.keys(sectionLabels).forEach((section) => {
      printWindow.document.write("<h3>" + sectionLabels[section] + "</h3>");
      printWindow.document.write("<table>");
      printWindow.document.write(
        "<thead><tr><th>Description</th><th>Amount</th></tr></thead>"
      );
      printWindow.document.write("<tbody>");
      incomeStatement[section].forEach((item) => {
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
      "<h3>Total Revenue: ₱" +
        parseFloat(incomeStatement.totalRevenue.amount).toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ) +
        "</h3>"
    );
    printWindow.document.write(
      "<h3>Total Expenses: ₱" +
        parseFloat(incomeStatement.totalExpenses.amount).toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ) +
        "</h3>"
    );
    printWindow.document.write(
      "<h3>Net Income: ₱" +
        parseFloat(incomeStatement.netIncome.amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) +
        "</h3>"
    );

    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportToExcel = () => {
    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();

    // Format the income statement data into a 2D array for Excel
    const worksheetData = [];

    // Add the Date of the income statement
    worksheetData.push(["Income Statement"]);
    worksheetData.push(["Date Created", incomeStatement.date]);

    // Add Revenue section
    worksheetData.push([]);
    worksheetData.push(["Revenue"]);
    worksheetData.push(["Description", "Amount"]);
    incomeStatement.incomeRevenue.forEach((item) => {
      worksheetData.push([item.description, item.amount]);
    });
    worksheetData.push(["Total Revenue", incomeStatement.totalRevenue.amount]);

    // Add Expenses section
    worksheetData.push([]);
    worksheetData.push(["Expenses"]);
    worksheetData.push(["Description", "Amount"]);
    incomeStatement.incomeExpenses.forEach((item) => {
      worksheetData.push([item.description, item.amount]);
    });
    worksheetData.push([
      "Total Expenses",
      incomeStatement.totalExpenses.amount,
    ]);

    // Add Net Income section
    worksheetData.push([]);
    worksheetData.push(["Net Income", incomeStatement.netIncome.amount]);

    // Convert the formatted data into a worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Income Statement");

    // Trigger a download for the Excel file
    XLSX.writeFile(wb, "Income_Statement.xlsx");
  };

  return (
    <div className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        {/* Income Statement Icon and Text */}
        <div className="flex items-center space-x-2">
          <h1
            className={`text-[#0C82B4] my-auto font-poppins ${
              sidebarOpen
                ? "desktop:text-sm laptop:text-sm tablet:text-xs phone:text-[8px]"
                : "desktop:text-base laptop:text-base tablet:text-sm phone:text-[10px]"
            } phone:ml-1 capitalize`}
          >
            Income Statement
          </h1>
          <ContainerFilled
            className={`text-[#0C82B4] desktop:h-4 desktop:w-4 laptop:h-4 laptop:w-4 tablet:h-3 tablet:w-3 phone:h-2 phone:w-2`}
          />{" "}
          {/* Ant Design Icon */}
        </div>

        <div className="flex items-center space-x-2 mx-2">
          {/* Add New Button */}
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

          {/* Date Dropdown */}
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

          {/* Print Button */}
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
            <span className="flex m-2 phone:hidden tablet:inline">Export</span>{<ExportOutlined />}
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

      {/* Modal for Income Statement Form */}
      <AntModal
        title="Add Income Statement"
        visible={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okButtonProps={{ disabled: !isFormValid }}
      >
        <form>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Date</h2>
            <Input
              type="date"
              value={
                selectedDate ? spacetime(selectedDate).format("yyyy-MM-dd") : ""
              }
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Revenue</h2>
            {renderInputs("incomeRevenue")}
            <button
              type="button"
              className="bg-green-400 text-white mt-2 rounded-md flex justify-center items-center p-2"
              onClick={() => handleAddInput("incomeRevenue")}
            >
              <FaPlus className="mr-2" /> Add Revenue
            </button>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Expenses</h2>
            {renderInputs("incomeExpenses")}
            <button
              type="button"
              className="bg-green-400 text-white mt-2 rounded-md flex justify-center items-center p-2"
              onClick={() => handleAddInput("incomeExpenses")}
            >
              <FaPlus className="mr-2" /> Add Expense
            </button>
          </div>
        </form>
      </AntModal>
    </div>
  );
};

export default IncomeStatementGraybar;
