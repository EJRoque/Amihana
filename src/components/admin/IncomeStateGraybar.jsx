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
import { DownOutlined, ContainerFilled, ExportOutlined, UploadOutlined } from "@ant-design/icons"; // Import Ant Design icons
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
import { toast } from "react-toastify";

const IncomeStatementGraybar = ({ incomeStatement, setIncomeStatement }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingDates, setExistingDates] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [availableYears, setAvailableYears] = useState([]);
  const [filteredDates, setFilteredDates] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  
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

  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const dates = await fetchIncomeStateDates();
        setExistingDates(dates);
        
        // Extract unique years from dates
        const years = [...new Set(dates.map(date => 
          spacetime(date).year()
        ))].sort((a, b) => b - a); // Sort years in descending order
        
        setAvailableYears(years);
        
        // Set default year to latest year if available
        if (years.length > 0 && !selectedYear) {
          setSelectedYear(years[0]);
          filterDatesByYear(years[0], dates);
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    };
    getExistingDates();
  }, []);

// Function to filter dates by selected year
  const filterDatesByYear = (year, dates = existingDates) => {
    const filtered = dates.filter(date => 
      spacetime(date).year() === parseInt(year)
    );
    setFilteredDates(filtered);
  };

    // Handler for year selection
    const handleYearSelect = (e) => {
      const year = parseInt(e.key);
      setSelectedYear(year);
      filterDatesByYear(year);
      setSelectedDate(null); // Reset selected date when year changes
    };

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

  // Modified handleSelectDate to use filteredDates
  const handleSelectDate = async (e) => {
    const selectedDate = e.key;
    const formattedDate = spacetime(selectedDate).format("{month} {date}, {year}");
    setIncomeStatement((prevIncomeStatement) => ({
      ...prevIncomeStatement,
      date: formattedDate,
    }));
  
    try {
      const incomeStateData = await fetchIncomeStateRecord(formattedDate);
      setIncomeStatement((prevIncomeStatement) => ({
        ...prevIncomeStatement,
        ...incomeStateData,
      }));
    } catch (error) {
      console.error("Error fetching income statement record:", error);
    }
  };

   // Year selection menu
   const yearMenu = (
    <Menu onClick={handleYearSelect}>
      {availableYears.map((year) => (
        <Menu.Item key={year}>{year}</Menu.Item>
      ))}
    </Menu>
  );


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
    const today = spacetime().format("{month} {date}, {year}");
    setIncomeStatement({
      date: "",
      incomeRevenue: [{ description: "", amount: "" }],
      incomeExpenses: [{ description: "", amount: "" }],
      totalRevenue: { description: "Total Revenue", amount: "" },
      totalExpenses: { description: "Total Expenses", amount: "" },
      netIncome: { description: "Net Income", amount: "" },
    });
    setSelectedDate(spacetime().format("yyyy-MM-dd"));
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
        ? spacetime(selectedDate).format("{month} {date}, {year}")
        : incomeStatement.date, // Format selected date before saving
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
  
    try {
      await addIncomeStatementRecord(updatedIncomeStatement);
      console.log("Data saved to Firebase:", updatedIncomeStatement);
      toast.success("Successfully added income statement data. Please refresh the page.");
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

  // Modified date menu to use filtered dates
  const dateMenu = (
    <Menu onClick={handleSelectDate}>
      <Menu.Item key="" disabled>
        Select date
      </Menu.Item>
      {filteredDates.map((date) => (
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
    const accountName = await fetchUserFullName();

    if (!accountName) {
      console.error("Failed to retrieve the user's full name.");
      return;
    }

    const printWindow = window.open("", "", "width=800,height=1000");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Income Statement Record</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              margin: 20px;
            }
            @media print {
              @page {
                size: A4;
                margin: 15mm;
              }
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0C82B4;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header img {
              height: 50px;
              width: auto;
            }
            .header h1 {
              font-size: 22px;
              color: #0C82B4;
              margin: 0;
            }
            .report-info {
              margin-bottom: 20px;
              font-size: 14px;
              color: #555;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #0C82B4;
              margin: 15px 0 5px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 12px;
              color: #333;
            }
            th, td {
              padding: 8px;
              border: 1px solid #ddd;
            }
            th {
              background-color: #0C82B4;
              color: white;
              text-align: center;
            }
            .description-column {
              width: 70%;
            }
            .amount-column {
              width: 30%;
              text-align: right;
              color: #333;
            }
            tbody tr:nth-child(odd) {
              background-color: #f5f5f5;
            }
            .summary {
              margin-top: 20px;
              text-align: right;
              font-size: 14px;
              color: #333;
            }
            .summary p {
              margin: 5px 0;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 30px;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${amihanaLogo}" alt="Amihana Logo" />
            <h1>Amihana Income Statement</h1>
          </div>
          <div class="report-info">
            <p>Date: <strong>${incomeStatement.date}</strong></p>
            <p>Printed by: <strong>${accountName}</strong></p>
          </div>
    `);

    const sectionLabels = {
      incomeRevenue: "Revenue",
      incomeExpenses: "Expenses",
    };

    Object.keys(sectionLabels).forEach((section) => {
      printWindow.document.write(`
        <div class="section-title">${sectionLabels[section]}</div>
        <table>
          <thead>
            <tr>
              <th class="description-column">Description</th>
              <th class="amount-column">Amount (₱)</th>
            </tr>
          </thead>
          <tbody>
      `);

      incomeStatement[section].forEach((item) => {
        printWindow.document.write(`
          <tr>
            <td class="description-column">${item.description}</td>
            <td class="amount-column">₱${parseFloat(item.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        `);
      });

      printWindow.document.write(`
          </tbody>
        </table>
      `);
    });

    printWindow.document.write(`
        <div class="summary">
          <p>Total Revenue: <strong>₱${parseFloat(incomeStatement.totalRevenue.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
          <p>Total Expenses: <strong>₱${parseFloat(incomeStatement.totalExpenses.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
          <p>Net Income: <strong>₱${parseFloat(incomeStatement.netIncome.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
        </div>

        <div class="footer">
          <p>&copy; Amihana - Confidential Report</p>
        </div>
      </body>
    </html>
    `);

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

   // New method to handle Excel file import
   const handleFileImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Process imported data
      const processedData = parseImportedIncomeStatementData(data);
      setImportedData(processedData);
    };

    reader.readAsBinaryString(file);
  };

  // Helper function to parse imported Excel data
  const parseImportedIncomeStatementData = (data) => {
    const parsedData = {
      date: '',
      incomeRevenue: [],
      incomeExpenses: [],
      totalRevenue: { description: "Total Revenue", amount: "" },
      totalExpenses: { description: "Total Expenses", amount: "" },
      netIncome: { description: "Net Income", amount: "" }
    };

    let currentSection = null;

    data.forEach((row) => {
      // Detect section headers
      if (row[0] === 'Income Statment') {
        parsedData.date = row[1] || '';
      } else if (row[0] === 'Revenue') {
        currentSection = 'incomeRevenue';
      } else if (row[0] === 'Expenses') {
        currentSection = 'incomeExpenses';
      }

      // Parse data rows
      if (currentSection && row[0] !== 'Description' && row[0] !== '' && row[0] !== currentSection) {
        if (row[0] === 'Total Revenue') {
          parsedData.totalRevenue.amount = row[1] || '';
        } else if (row[0] === 'Total Expenses') {
          parsedData.totalExpenses.amount = row[1] || '';
        } else if (row[0] === 'Net Income') {
          parsedData.netIncome.amount = row[1] || '';
        } else if (row[0] && row[1]) {
          parsedData[currentSection].push({
            description: row[0],
            amount: row[1]
          });
        }
      }
    });

    return parsedData;
  };

  // Method to handle importing the parsed data
  const handleImportSubmit = async () => {
    if (importedData) {
      setIsLoading(true);
      try {
        // First, properly format the date
        let formattedDate;
        
        if (importedData.date) {
          // Check if the date is a number (Excel serial date)
          if (!isNaN(importedData.date)) {
            // Convert Excel serial date to JS Date
            // Excel dates are counted from 1900-01-01
            const excelEpoch = new Date(1900, 0, 1);
            const millisecondsPerDay = 24 * 60 * 60 * 1000;
            const jsDate = new Date(excelEpoch.getTime() + (importedData.date - 1) * millisecondsPerDay);
            formattedDate = spacetime(jsDate).format("{month} {date}, {year}");
          } else {
            // If it's already a date string, just format it
            formattedDate = spacetime(importedData.date).format("{month} {date}, {year}");
          }
        } else {
          // If no date provided, use current date
          formattedDate = spacetime().format("{month} {date}, {year}");
        }
  
        // Create the formatted data object
        const formattedData = {
          ...importedData,
          date: formattedDate
        };
  
        // Clean up the data
        Object.keys(formattedData).forEach(key => {
          if (Array.isArray(formattedData[key])) {
            formattedData[key] = formattedData[key].filter(item => 
              item && item.description && item.amount && 
              item.description.trim() !== "" && 
              !isNaN(parseFloat(item.amount))
            );
          }
        });
  
        // Convert amount strings to numbers
        ['revenue', 'expenses'].forEach(section => {
          if (Array.isArray(formattedData[section])) {
            formattedData[section] = formattedData[section].map(item => ({
              ...item,
              amount: parseFloat(item.amount)
            }));
          }
        });
  
        // Convert totals to numbers
        if (formattedData.totalRevenue) {
          formattedData.totalRevenue.amount = parseFloat(formattedData.totalRevenue.amount);
        }
        if (formattedData.totalExpenses) {
          formattedData.totalExpenses.amount = parseFloat(formattedData.totalExpenses.amount);
        }
        if (formattedData.netIncome) {
          formattedData.netIncome.amount = parseFloat(formattedData.netIncome.amount);
        }
  
        // Validate the date format before saving
        if (!formattedData.date || formattedData.date === "Invalid date") {
          throw new Error("Invalid date format in the imported file");
        }
  
        await addIncomeStatementRecord(formattedData);
        toast.success("Successfully imported cashflow data. Please refresh the page.");
        setIsImportModalOpen(false);
        setImportedData(null);
      } catch (error) {
        console.error("Error importing data to Firebase:", error);
        toast.error("Failed to import cash flow data: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div  className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden 
        ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' :
                        'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} 
                        desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
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

           {/* Year Dropdown */}
           <Dropdown
            overlay={yearMenu}
            trigger={["click"]}
            className={`bg-[#5D7285] font-poppins ${
              sidebarOpen
                ? "desktop:h-8 laptop:h-8 tablet:h-6 phone:h-5"
                : "desktop:h-8 laptop:h-8 tablet:h-8 phone:h-5"
            } desktop:w-[6rem] laptop:w-[5.5rem] tablet:w-[4.5rem] phone:w-[4rem] desktop:text-xs laptop:text-xs tablet:text-[10px] phone:text-[8px] text-white px-2 py-1 rounded flex items-center`}
          >
            <Button className="flex items-center">
              <Space>
                {selectedYear || "Year"}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

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

                  {/* Import Excel Button */}
        <button
          className="flex items-center w-full p-2 hover:bg-gray-100"
          onClick={() => {
            setIsExportPopupOpen(false);
            setIsImportModalOpen(true);
          }}
        >
          <UploadOutlined className="mr-2 text-blue-500" /> Import Excel
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
        <h2 className="text-lg font-semibold">Report Generation Date</h2>
        <Input
          type="date"
          value={selectedDate || spacetime().format("yyyy-MM-dd")}
          disabled={true} // Disable the date input
          className="w-full bg-gray-100" // Added bg-gray-100 to visually indicate it's disabled
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

      
  <AntModal
    title="Import Cash Flow Excel"
    visible={isImportModalOpen}
    onOk={handleImportSubmit}
    onCancel={() => {
      setIsImportModalOpen(false);
      setImportedData(null);
    }}
    okButtonProps={{ disabled: !importedData }}
  >
    <div className="mb-4">
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileImport}
        className="w-full"
      />
    </div>

    {importedData && (
      <div className="mt-4">
        <h4 className="font-semibold">Imported Data Preview:</h4>
        <p>Date: {importedData.date}</p>
        <p>Total Revenue: {importedData.totalRevenue.amount}</p>
        <p>Net Income: {importedData.netIncome.amount}</p>
      </div>
    )}
  </AntModal>
    </div>
  );
};

export default IncomeStatementGraybar;
