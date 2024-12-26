import React, { useState, useEffect } from "react";
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
import { doc, getDoc,collection, getDocs, query, where,updateDoc, arrayUnion, writeBatch  } from "firebase/firestore";
import { FaPlus, FaTrash, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { Dropdown, Button, Menu, Modal as AntModal, Input, Space, Select,Spin } from "antd";
import { DownOutlined, ExportOutlined, LineChartOutlined,UploadOutlined } from "@ant-design/icons"; // Import Ant Design icons
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
  const [cashReceipts, setCashReceipts] = useState({
    totalHoaMembershipPaid: 0,
    totalMonthPaid: 0,
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [netIncome, setNetIncome] = useState(0);
  const [availableItems, setAvailableItems] = useState({
    openingBalance: [],
    cashReceipts: [],
    pledges: [],
    cashPaidOut: []
  });
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
  const [newRevenueItems, setNewRevenueItems] = useState([]);
  const [newExpensesItems, setNewExpensesItems] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchAvailableItems = async () => {
      try {
        const itemsRef = doc(db, 'cashFlowed', 'cashPaidOutdoc');
        const openingBalanceRef = doc(db, 'cashFlowed', 'openingBalancedoc');
        const pledgesRef = doc(db, 'cashFlowed', 'pledgesItemdoc');
  
        const [cashPaidOutSnap, openingBalanceSnap, pledgesSnap] = await Promise.all([
          getDoc(itemsRef),
          getDoc(openingBalanceRef),
          getDoc(pledgesRef)
        ]);
  
        const transformedItems = {
          openingBalance: openingBalanceSnap.exists() ? openingBalanceSnap.data().openingBalance || [] : [],
          cashReceipts: [], // You might want to add a separate document for cash receipts
          pledges: pledgesSnap.exists() ? pledgesSnap.data().pledgesItem || [] : [],
          cashPaidOut: cashPaidOutSnap.exists() ? cashPaidOutSnap.data().cashPaidOut || [] : []
        };
  
        setAvailableItems(transformedItems);
        console.log('Fetched Available Items:', transformedItems);
      } catch (error) {
        console.error('Error fetching available items:', error);
      }
    };
  
    fetchAvailableItems();
  }, []);
  
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

  const fetchAvailableItems = async () => {
    try {
      const itemsRef = doc(db, 'cashFlowed', 'cashPaidOutdoc');
      const openingBalanceRef = doc(db, 'cashFlowed', 'openingBalancedoc');
      const pledgesRef = doc(db, 'cashFlowed', 'pledgesItemdoc');

      const [cashPaidOutSnap, openingBalanceSnap, pledgesSnap] = await Promise.all([
        getDoc(itemsRef),
        getDoc(openingBalanceRef),
        getDoc(pledgesRef)
      ]);

      const transformedItems = {
        openingBalance: openingBalanceSnap.exists() ? openingBalanceSnap.data().openingBalance || [] : [],
        cashReceipts: [], // You might want to add a separate document for cash receipts
        pledges: pledgesSnap.exists() ? pledgesSnap.data().pledgesItem || [] : [],
        cashPaidOut: cashPaidOutSnap.exists() ? cashPaidOutSnap.data().cashPaidOut || [] : []
      };

      setAvailableItems(transformedItems);
      console.log('Fetched Available Items:', transformedItems);
      return transformedItems;
    } catch (error) {
      console.error('Error fetching available items:', error);
      return {
        openingBalance: [],
        cashReceipts: [],
        pledges: [],
        cashPaidOut: []
      };
    }
  };

  // Existing useEffect to fetch items on component mount
  useEffect(() => {
    fetchAvailableItems();
  }, []);


  const validateForm = () => {
    console.log("Running form validation...");
  
    if (!cashFlow || !cashFlow.openingBalance || !cashFlow.cashReceipts || !cashFlow.pledges || !cashFlow.cashPaidOut) {
      setIsFormValid(false);
      console.log("Missing sections in cashFlow data.");
      return;
    }
  
    // Check for values in each section
    const hasOpening = cashFlow.openingBalance.some(
      (item) => item.description && item.amount
    );
  
    // Check if default cashReceipts values are non-zero or if there are additional entries
    const hasReceipts = 
      (cashReceipts.totalHoaMembershipPaid || 0) > 0 || 
      (cashReceipts.totalMonthPaid || 0) > 0 || 
      cashFlow.cashReceipts.some((item) => item.description && item.amount);
  
    const hasPledges = cashFlow.pledges.some(
      (item) => item.description && item.amount
    );
  
    const hasPaidOut = cashFlow.cashPaidOut.some(
      (item) => item.description && item.amount
    );
  
    // Log each section's validation
    console.log("hasOpening:", hasOpening);
    console.log("hasReceipts:", hasReceipts);
    console.log("hasPledges:", hasPledges);
    console.log("hasPaidOut:", hasPaidOut);
  
    // Update form validity
    const isValid = hasOpening && hasReceipts && hasPledges && hasPaidOut;
    setIsFormValid(isValid);
    console.log("isFormValid:", isValid);
  };
  
  // Run validateForm whenever cashFlow or selectedDate changes
  useEffect(() => {
    validateForm();
  }, [cashFlow, selectedDate]);
  
  // UseEffect to call validateForm whenever relevant dependencies change
  useEffect(() => {
    validateForm();
  }, [cashFlow, selectedDate]); // Track selectedDate in case it affects default values
  
  
  // Call validateForm whenever cashFlow values change
  useEffect(() => {
    validateForm();
  }, [cashFlow]); // Add cashFlow or its specific fields as dependencies
  
  //Export pop up
  const handleExportClick = () => {
    setIsExportPopupOpen(!isExportPopupOpen);
  };

  // Modify the handleDateChange function to include net income calculation
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    const year = spacetime(date).year();
    
    if (year) {
      setIsLoading(true);
      try {
        // Fetch balance sheet data
        const docRef = doc(db, `balanceSheetRecord/${year}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCashReceipts({
            totalHoaMembershipPaid: data.totalHoaMembershipPaid || 0,
            totalMonthPaid: data.totalMonthPaid || 0,
          });
        } else {
          setCashReceipts({
            totalHoaMembershipPaid: 0,
            totalMonthPaid: 0,
          });
        }
        
        // Fetch net income for the year
        await fetchNetIncome(year);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
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
    // Get today's date in the required format
    const today = spacetime.now();
    const formattedToday = today.format("yyyy-MM-dd");
    
    setIsModalOpen(true);
    setCashFlow({
      date: today.format("{month} {date}, {year}"), // Set formatted date for display
      openingBalance: [{ description: "", amount: "" }],
      cashReceipts: [{ description: "", amount: "" }],
      pledges: [{ description: "", amount: "" }],
      cashPaidOut: [{ description: "", amount: "" }],
      totalCashAvailable: { description: "Total Cash Available", amount: "" },
      totalCashPaidOut: { description: "Total Cash Paid-out", amount: "" },
      endingBalance: { description: "Ending Balance", amount: "" },
    });
    setSelectedDate(formattedToday); // Set the date input value
    handleDateChange(formattedToday); // Trigger date change handler to load relevant data
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
  
    try {
      // Get existing values or defaults
      const totalOpeningBalance = parseFloat(calculateTotal("openingBalance") || 0);
      const totalCashReceipts = parseFloat(calculateTotal("cashReceipts") || 0);
      const totalPledges = parseFloat(calculateTotal("pledges") || 0);
      const totalCashPaidOut = parseFloat(calculateTotal("cashPaidOut") || 0);
      const { revenue, expenses } = collectNewItems();
  
      // Explicitly add the default values for HOA Membership and Butaw Collection
      const hoaMembership = cashReceipts.totalHoaMembershipPaid || 0;
      const butawCollection = cashReceipts.totalMonthPaid || 0;
  
      console.log('Debug - Default Values:', {
        hoaMembership,
        butawCollection,
        netIncome,
        existingCashReceipts: cashFlow.cashReceipts
      });
  
      // Prepare comprehensive cashReceipts
      const comprehensiveCashReceipts = [
        // Spread existing cash receipts from the form
        ...cashFlow.cashReceipts.filter(item => 
          item.description && 
          item.description.trim() !== '' && 
          parseFloat(item.amount) !== 0
        ),
        
        // Add HOA Membership if it has a value
        ...(hoaMembership > 0 ? [{
          description: `HOA Membership (${spacetime(selectedDate).year()})`,
          amount: hoaMembership
        }] : []),
        
        // Add Butaw Collection if it has a value
        ...(butawCollection > 0 ? [{
          description: `Butaw Collection (${spacetime(selectedDate).year()})`,
          amount: butawCollection
        }] : []),
        
        // Add Net Income if it has a value
        ...(netIncome > 0 ? [{
          description: `Net Income (${spacetime(selectedDate).year()})`,
          amount: netIncome
        }] : [])
      ];
  
      console.log('Debug - Comprehensive Cash Receipts:', comprehensiveCashReceipts);
  
      // Compute the total cash receipts
      const totalCashReceiptsWithDefaults = comprehensiveCashReceipts.reduce(
        (total, item) => total + parseFloat(item.amount || 0), 0
      );
  
      // Compute totals
      const totalCashAvailable = (
        totalOpeningBalance + totalCashReceiptsWithDefaults + totalPledges
      ).toFixed(2);
      const endingBalance = (
        parseFloat(totalCashAvailable) - totalCashPaidOut
      ).toFixed(2);
  
      const updatedCashFlow = {
        ...cashFlow,
        date: selectedDate
          ? spacetime(selectedDate).format("{month} {date}, {year}")
          : cashFlow.date,
        cashReceipts: comprehensiveCashReceipts, // Use the comprehensive cash receipts
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
  
      // If there are new items, show confirmation modal
      if (revenue.length > 0 || expenses.length > 0) {
        setNewRevenueItems(revenue);
        setNewExpensesItems(expenses);
        setIsConfirmationModalVisible(true);
        setIsLoading(false);
      } else {
        // Proceed with normal submission
        try {
          const year = spacetime(selectedDate).year().toString();
          await addCashFlowRecord(updatedCashFlow, year);
          
          toast.success("Successfully added cashflow data.");
          setIsModalOpen(false); // Close the modal after successful submission
        } catch (error) {
          console.error("Error saving data to Firebase:", error);
          toast.error("Failed to save cash flow data");
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred during submission");
      setIsLoading(false);
    }
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
        <Select
          style={{ width: "100%" }}
          placeholder={`Select or Enter ${type} Item`}
          value={item.description}
          onChange={(value) => handleChange(type, index, "description", value)}
          className="border border-gray-300 rounded-lg flex-1"
          mode="tags"
          onSelect={(value) => handleChange(type, index, "description", value)}
        >
          {/* Conditionally render options based on the current section */}
          {type === 'openingBalance' && availableItems.openingBalance?.map((availableItem, idx) => (
            <Select.Option key={idx} value={availableItem}>
              {availableItem}
            </Select.Option>
          ))}
          
          {type === 'cashReceipts' && availableItems.cashReceipts?.map((availableItem, idx) => (
            <Select.Option key={idx} value={availableItem}>
              {availableItem}
            </Select.Option>
          ))}
          
          {type === 'pledges' && availableItems.pledges?.map((availableItem, idx) => (
            <Select.Option key={idx} value={availableItem}>
              {availableItem}
            </Select.Option>
          ))}
          
          {type === 'cashPaidOut' && availableItems.cashPaidOut?.map((availableItem, idx) => (
            <Select.Option key={idx} value={availableItem}>
              {availableItem}
            </Select.Option>
          ))}
        </Select>
  
        <Input
          placeholder="Amount"
          type="number"
          value={item.amount}
          onChange={(e) => handleChange(type, index, "amount", e.target.value)}
          className="border border-gray-300 p-2 rounded-lg flex-1"
        />
  
        {index >= 1 && (
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
    const accountName = await fetchUserFullName();
  
    if (!accountName) {
      console.error("Failed to retrieve the user's full name.");
      return;
    }
  
    const printWindow = window.open("", "", "width=800,height=1000");
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Cash Flow Report</title>
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
            <h1>Amihana Cash Flow Report</h1>
          </div>
          <div class="report-info">
            <p>Report Date: <strong>${cashFlow.date}</strong></p>
            <p>Generated by: <strong>${accountName}</strong></p>
          </div>
    `);
  
    const sectionLabels = {
      openingBalance: "Opening Balance",
      cashReceipts: "Butaw Collection",
      pledges: "Pledges",
      cashPaidOut: "Less: Cash Paid-out",
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
  
      cashFlow[section].forEach((item) => {
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
          <p>Total Cash Available: <strong>₱${parseFloat(cashFlow.totalCashAvailable.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
          <p>Total Cash Paid-out: <strong>₱${parseFloat(cashFlow.totalCashPaidOut.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
          <p>Ending Balance: <strong>₱${parseFloat(cashFlow.endingBalance.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
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
  
  

  // Function to export data to Excel
  const exportToExcel = () => {
    const worksheetData = [];

    // Add the Date of the cash flow
    worksheetData.push(["Cash Flow"]);
    worksheetData.push(["Report Generation Date", cashFlow.date]);

    // Add Opening Balance section
    worksheetData.push([]);
    worksheetData.push(["Opening Balance"]);
    worksheetData.push(["Description", "Amount"]);
    cashFlow.openingBalance.forEach((item) => {
      worksheetData.push([item.description, item.amount]);
    });

    // Add Cash Receipts section
    worksheetData.push([]);
    worksheetData.push(["Butaw"]);
    worksheetData.push(["Description", "Amount"]);
    cashFlow.cashReceipts.forEach((item) => {
      worksheetData.push([item.description, item.amount]);
    });

    // Add pledges section
    worksheetData.push([]);
    worksheetData.push(["Pledges"]);
    worksheetData.push(["Description", "Amount"]);
    cashFlow.pledges.forEach((item) => {
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
      const processedData = parseImportedCashFlowData(data);
      setImportedData(processedData);
    };

    reader.readAsBinaryString(file);
  };

  // Helper function to parse imported Excel data
  const parseImportedCashFlowData = (data) => {
    const parsedData = {
      date: '',
      openingBalance: [],
      cashReceipts: [],
      pledges: [],
      cashPaidOut: [],
      totalCashAvailable: { description: "Total Cash Available", amount: "" },
      totalCashPaidOut: { description: "Total Cash Paid-out", amount: "" },
      endingBalance: { description: "Ending Balance", amount: "" }
    };

    let currentSection = null;

    data.forEach((row) => {
      // Detect section headers
      if (row[0] === 'Cash Flow') {
        parsedData.date = row[1] || '';
      } else if (row[0] === 'Opening Balance') {
        currentSection = 'openingBalance';
      } else if (row[0] === 'Butaw') {
        currentSection = 'cashReceipts';
      } else if (row[0] === 'Pledges') {
        currentSection = 'pledges';
      } else if (row[0] === 'Less: Cash Paid-out') {
        currentSection = 'cashPaidOut';
      }

      // Parse data rows
      if (currentSection && row[0] !== 'Description' && row[0] !== '' && row[0] !== currentSection) {
        if (row[0] === 'Total Cash Available') {
          parsedData.totalCashAvailable.amount = row[1] || '';
        } else if (row[0] === 'Total Cash Paid-out') {
          parsedData.totalCashPaidOut.amount = row[1] || '';
        } else if (row[0] === 'Ending Balance') {
          parsedData.endingBalance.amount = row[1] || '';
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
        ['openingBalance', 'cashReceipts', 'pledges', 'cashPaidOut'].forEach(section => {
          if (Array.isArray(formattedData[section])) {
            formattedData[section] = formattedData[section].map(item => ({
              ...item,
              amount: parseFloat(item.amount)
            }));
          }
        });
  
        // Convert totals to numbers
        if (formattedData.totalCashAvailable) {
          formattedData.totalCashAvailable.amount = parseFloat(formattedData.totalCashAvailable.amount);
        }
        if (formattedData.totalCashPaidOut) {
          formattedData.totalCashPaidOut.amount = parseFloat(formattedData.totalCashPaidOut.amount);
        }
        if (formattedData.endingBalance) {
          formattedData.endingBalance.amount = parseFloat(formattedData.endingBalance.amount);
        }
  
        // Validate the date format before saving
        if (!formattedData.date || formattedData.date === "Invalid date") {
          throw new Error("Invalid date format in the imported file");
        }
  
        await addCashFlowRecord(formattedData);
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

  // Add this new function to fetch and calculate net income
  const fetchNetIncome = async (year) => {
    try {
      console.log(`Fetching net income for year: ${year}`);
      const incomeStatementsRef = collection(db, "incomeStatementRecords");
      
      // First let's check what documents exist without date filtering
      const allDocs = await getDocs(incomeStatementsRef);
      console.log(`Total documents in collection: ${allDocs.size}`);
      
      // Log the first few documents to see their structure
      allDocs.forEach((doc) => {
        const data = doc.data();
        console.log('Document ID:', doc.id);
        console.log('Document data:', {
          date: data.date,
          netIncome: data.netIncome,
          // Log the type of the date field
          dateType: typeof data.date
        });
      });
  
      // Now try to match documents for the year without exact format matching
      let totalNetIncome = 0;
      allDocs.forEach((doc) => {
        const data = doc.data();
        // Parse the date string to check if it's in the correct year
        const docDate = spacetime(data.date);
        const docYear = docDate.year();
        
        console.log(`Document date: ${data.date}, parsed year: ${docYear}`);
        
        if (docYear === parseInt(year) && data.netIncome && data.netIncome.amount) {
          const amount = parseFloat(data.netIncome.amount) || 0;
          console.log(`Adding net income amount: ${amount} from date: ${data.date}`);
          totalNetIncome += amount;
        }
      });
      
      console.log(`Final total net income: ${totalNetIncome}`);
      setNetIncome(totalNetIncome);
    } catch (error) {
      console.error("Error fetching net income:", error);
      console.error("Error stack:", error.stack);
      setNetIncome(0);
    }
  };

  // Function to check and collect new items
  const collectNewItems = () => {
    const revenue = [];
    const expenses = [];

    // Check each section for new items
    ['openingBalance', 'cashReceipts', 'pledges', 'cashPaidOut'].forEach(section => {
      cashFlow[section].forEach(item => {
        const description = item.description.trim();
        
        // Check if the item is not in the existing lists
        if (description && 
            !availableItems[section].includes(description)) {
          
          // Categorize as revenue or expense based on the section
          if (section === 'cashReceipts' || section === 'pledges') {
            revenue.push(description);
          } else if (section === 'cashPaidOut') {
            expenses.push(description);
          }
        }
      });
    });

    return { revenue, expenses };
  };

  // Function to add new items to Firestore
  const handleConfirmNewItems = async () => {
    setIsConfirming(true);

    try {
      // Prepare batch write
      const batch = writeBatch(db);

      // Update Opening Balance items
      const openingBalanceRef = doc(db, 'cashFlowed', 'openingBalancedoc');
      const openingBalanceNewItems = cashFlow.openingBalance
        .filter(item => item.description.trim() && 
                !availableItems.openingBalance.includes(item.description.trim()))
        .map(item => item.description.trim());
  
      // Update Pledges items (Revenue)
      const pledgesRef = doc(db, 'cashFlowed', 'pledgesItemdoc');
      const pledgesNewItems = cashFlow.pledges
        .filter(item => item.description.trim() && 
                !availableItems.pledges.includes(item.description.trim()))
        .map(item => item.description.trim());
  
      // Update Cash Paid Out items (Expenses)
      const cashPaidOutRef = doc(db, 'cashFlowed', 'cashPaidOutdoc');
      const cashPaidOutNewItems = cashFlow.cashPaidOut
        .filter(item => item.description.trim() && 
                !availableItems.cashPaidOut.includes(item.description.trim()))
        .map(item => item.description.trim());
  
      // Update documents with new items
      if (openingBalanceNewItems.length > 0) {
        batch.update(openingBalanceRef, {
          openingBalance: arrayUnion(...openingBalanceNewItems)
        });
      }
  
      if (pledgesNewItems.length > 0) {
        batch.update(pledgesRef, {
          pledgesItem: arrayUnion(...pledgesNewItems)
        });
      }
  
      if (cashPaidOutNewItems.length > 0) {
        batch.update(cashPaidOutRef, {
          cashPaidOut: arrayUnion(...cashPaidOutNewItems)
        });
      }
  
      // Commit the batch
      await batch.commit();
  
      // Refresh available items
      await fetchAvailableItems(); // Assuming this is a method to update availableItems
  
      // Now proceed with the full submission
      try {
        const year = spacetime(selectedDate).year().toString();
        await addCashFlowRecord(cashFlow, year);
        
        toast.success("Successfully added cashflow data.");
        setIsModalOpen(false); // Close the modal after successful submission
      } catch (error) {
        console.error("Error saving data to Firebase:", error);
        toast.error("Failed to save cash flow data");
      }
  
      // Reset confirmation modal states
      setIsConfirmationModalVisible(false);
      setNewRevenueItems([]);
      setNewExpensesItems([]);
      
      
    } catch (error) {
      console.error("Error adding new items:", error);
      toast.error("Failed to add new items");
    } finally {
      setIsConfirming(false);
    }
  };
  

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
          <h1 className={`text-[#0C82B4] my-auto font-poppins ${
                sidebarOpen
                  ? "desktop:text-sm laptop:text-sm tablet:text-xs phone:text-[8px]"
                  : "desktop:text-base laptop:text-base tablet:text-sm phone:text-[10px]"
              } phone:ml-1 capitalize`}>
            Cash flow Management
          </h1>
          <LineChartOutlined style={{color:'#0C82B4'}}/>
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
                {selectedDate || "Select Year"}
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
          {/* Date Selection */}
          <div className="mb-4">
              <h2 className="text-lg font-semibold">Report Generation Date</h2>
              <Input
                type="date"
                value={selectedDate}
                disabled // Make the input disabled since it's auto-generated
                className="w-full bg-gray-100" // Add background color to indicate it's disabled
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

         {/* Cash Receipts */}
<div className="mb-4">
  <h2 className="text-lg font-semibold">Butaw</h2>
  
  {/* Display HOA Membership (Year) */}
  <div>
    <h3>HOA Membership ({spacetime(selectedDate).year()})</h3>
    <Input
      value={`₱${cashReceipts.totalHoaMembershipPaid || 0}`}
      disabled
      className="w-full mb-2"
    />
  </div>

  {/* Display Butaw Collection (Year) */}
  <div>
    <h3>Butaw Collection ({spacetime(selectedDate).year()})</h3>
    <Input
      value={`₱${cashReceipts.totalMonthPaid || 0}`}
      disabled
      className="w-full mb-2"
    />
  </div>
</div>

 {/* Display Net Income */}
 <div>
        <h3>Net Income ({spacetime(selectedDate).year()})</h3>
        <Input
          value={`₱${netIncome.toFixed(2)}`}
          disabled
          className="w-full mb-2"
        />
      </div>

          {/* Other sections (Opening Balance, Pledges, Cash Paid-Out) */}

          <div className="mb-4">
            <h2 className="text-lg font-semibold">Pledges</h2>
            {renderInputs("pledges")}
            <button
              type="button"
              className="bg-green-400 text-white mt-2 rounded-md flex justify-center items-center p-2"
              onClick={() => handleAddInput("pledges")}
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

    <AntModal
  title="Import Cash Flow Excel"
  visible={isImportModalOpen}
  onOk={handleImportSubmit}
  onCancel={() => {
    setIsImportModalOpen(false);
    setImportedData(null);
  }}
  okButtonProps={{ disabled: !importedData || isLoading }}
>
  {isLoading ? (
    <div className="flex justify-center items-center h-full">
      <ClipLoader color="#0C82B4" loading={isLoading} size={50} />
    </div>
  ) : (
    <>
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
          <p>Number of Opening Balance Items: {importedData.openingBalance?.length || 0}</p>
          <p>Number of Cash Receipts: {importedData.cashReceipts?.length || 0}</p>
          <p>Number of Pledges: {importedData.pledges?.length || 0}</p>
          <p>Number of Cash Paid Out Items: {importedData.cashPaidOut?.length || 0}</p>
          <p>Total Cash Available: {importedData.totalCashAvailable?.amount || 0}</p>
          <p>Ending Balance: {importedData.endingBalance?.amount || 0}</p>
        </div>
      )}
    </>
  )}
</AntModal>
<AntModal
  title="Confirm New Revenue and Expenses Items"
  open={isConfirmationModalVisible}
  onOk={handleConfirmNewItems}
  onCancel={() => {
    setIsConfirmationModalVisible(false);
    setIsModalOpen(false); // Option to close both modals if user cancels
  }}
>
        <p>The following new revenue items will be added:</p>
        <ul>
          {newRevenueItems.map((item, index) => (
            <li className="font-bold" key={`revenue-${index}`}>
              {item}
            </li>
          ))}
        </ul>

        <p>The following new expenses items will be added:</p>
        <ul>
          {newExpensesItems.map((item, index) => (
            <li className="font-bold" key={`expense-${index}`}>
              {item}
            </li>
          ))}
        </ul>

        <p>Do you want to add these items to your lists?</p>

        {/* Show spinner while confirming items */}
        {isConfirming && (
          <div className="flex justify-center mt-4">
            <Spin size="large" />
          </div>
        )}
      </AntModal>
    </div>
  );
};

export default CashflowGraybar;
