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
import {
  Dropdown,
  Button,
  Menu,
  Space,
  Modal as AntModal,
  Input,
  Select,
  Spin,
} from "antd";
import {
  DownOutlined,
  ScheduleFilled,
  ExportOutlined,
  UploadOutlined,
} from "@ant-design/icons"; // Import Ant Design icons
import {
  addItemReportRecord,
  fetchItemReportDates,
  fetchItemReportRecord,
} from "../../firebases/firebaseFunctions";
import amihanaLogo from "../../assets/images/amihana-logo.png";
import { db } from "../../firebases/FirebaseConfig";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import * as XLSX from "xlsx"; // Import xlsx for Excel export
import { toast } from "react-toastify";

const VenueManagementGraybar = ({ itemReport, setItemReport }) => {
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
  const [revenueItems, setRevenueItems] = useState([]); // Restored state setter
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const [newRevenueItems, setNewRevenueItems] = useState([]);
  const [expensesItems, setExpensesItems] = useState([]);
  const [newExpensesItems, setNewExpensesItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // For handling loading state in the first modal
  const [isConfirming, setIsConfirming] = useState(false); // For handling loading state in the second modal
  

  // Fetch all Items during initialization
  useEffect(() => {
    if (itemReport) {
      fetchRevenueItems();
      fetchExpensesItems(); // Fetch expenses items as well
    }
  }, [itemReport]);

  // Fetch revenueItems from Firebase
  const fetchRevenueItems = async () => {
    try {
      const incomeRef = collection(db, "Incomes");
      const snapshot = await getDocs(incomeRef);
      const items = snapshot.docs.flatMap((doc) => {
        const revenueItems = doc.data().revenueItem || [];
        return revenueItems.map((item) => item);
      });
      setRevenueItems(items);
    } catch (error) {
      console.error("Error fetching revenue items:", error);
      toast.error("Failed to fetch revenue items");
    }
  };

  // Fetch expensesItems from Firebase
  const fetchExpensesItems = async () => {
    try {
      const expensesRef = collection(db, "Incomes");
      const snapshot = await getDocs(expensesRef);
      const items = snapshot.docs.flatMap((doc) => {
        const expensesItems = doc.data().expensesItem || [];
        return expensesItems.map((item) => item);
      });
      setExpensesItems(items);
    } catch (error) {
      console.error("Error fetching expenses items:", error);
      toast.error("Failed to fetch expenses items");
    }
  };

  // Get available revenue items
  const getAvailableRevenueItems = () => {
    // Get all currently selected revenue items
    const selectedItems = itemReport.incomeRevenue
      .map((item) => item.description)
      .filter((desc) => desc);

    // Filter out already selected items
    return revenueItems.filter((item) => !selectedItems.includes(item));
  };

  // Get available expenses items
  const getAvailableExpensesItems = () => {
    const selectedItems = itemReport.incomeExpenses
      .map((item) => item.description)
      .filter((desc) => desc);

    return expensesItems.filter((item) => !selectedItems.includes(item));
  };

  const handleTransferChange = (newTargetKeys) => {
    // Filter out items already in the input fields
    const existingDescriptions = itemReport.incomeRevenue
      .map((item) => item.description)
      .filter((desc) => desc !== "");

    const filteredTargetKeys = newTargetKeys.filter((key) => {
      const item = revenueItems.find((r) => r.key === key);
      return !existingDescriptions.includes(item.title);
    });

    setSelectedRevenueItems(filteredTargetKeys);
  };

  useEffect(() => {
    if (!itemReport) {
      setItemReport({
        date: "",
        incomeRevenue: [{ description: "", amount: "" }],
        incomeExpenses: [{ description: "", amount: "" }],
        totalRevenue: { description: "Total Revenue", amount: "" },
        totalExpenses: { description: "Total Expenses", amount: "" },
        netIncome: { description: "Net Income", amount: "" },
      });
    }
  }, [itemReport, setItemReport]);

  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const dates = await fetchItemReportDates();
        setExistingDates(dates);
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    };
    getExistingDates();
  }, []);

  useEffect(() => {
    validateForm();
  }, [itemReport]);

  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const dates = await fetchItemReportDates();
        setExistingDates(dates);

        // Extract unique years from dates
        const years = [
          ...new Set(dates.map((date) => spacetime(date).year())),
        ].sort((a, b) => b - a); // Sort years in descending order

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
    const filtered = dates.filter(
      (date) => spacetime(date).year() === parseInt(year)
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
      !itemReport ||
      !itemReport.incomeRevenue ||
      !itemReport.incomeExpenses
    ) {
      setIsFormValid(false);
      return;
    }
    const hasRevenue = itemReport.incomeRevenue.some(
      (item) => item.description && item.amount
    );
    const hasExpenses = itemReport.incomeExpenses.some(
      (item) => item.description && item.amount
    );
    setIsFormValid(hasRevenue && hasExpenses);
  };

  // Modified handleSelectDate to use filteredDates
  const handleSelectDate = async (e) => {
    const selectedDate = e.key;
    const formattedDate = spacetime(selectedDate).format(
      "{month} {date}, {year}"
    );
    setItemReport((prevItemReport) => ({
      ...prevItemReport,
      date: formattedDate,
    }));

    try {
      const itemReportData = await fetchItemReportRecord(formattedDate);
      setItemReport((prevItemReport) => ({
        ...prevItemReport,
        ...itemReportData,
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
    setItemReport({
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
    setIsSubmitting(true);

    const totalRevenue = calculateTotal("incomeRevenue");
    const totalExpenses = calculateTotal("incomeExpenses");
    const netIncome = (
      parseFloat(totalRevenue) - parseFloat(totalExpenses)
    ).toFixed(2);

    const updatedItemReport = {
      ...itemReport,
      date: selectedDate
        ? spacetime(selectedDate).format("{month} {date}, {year}")
        : itemReport.date,
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

    const newRevenueItems = updatedItemReport.incomeRevenue
      .filter(
        (item) => item.description && !revenueItems.includes(item.description)
      )
      .map((item) => item.description);

    const newExpensesItems = updatedItemReport.incomeExpenses
      .filter(
        (item) => item.description && !expensesItems.includes(item.description)
      )
      .map((item) => item.description);

    if (newRevenueItems.length > 0 || newExpensesItems.length > 0) {
      setNewRevenueItems(newRevenueItems);
      setNewExpensesItems(newExpensesItems);
      setIsConfirmationModalVisible(true);
      setIsSubmitting(false);
    } else {
      await saveItemReport(updatedItemReport);
    }
  };

  const saveItemReport = async (statement) => {
    try {
      await addItemReportRecord(statement);
      console.log("Data saved to Firebase:", statement);
      toast.success(
        "Successfully added Revenue and Expenses data. Please refresh the page."
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
    }
  };

  //Confirmation for adding new Items
  const handleConfirmNewItems = async () => {
    setIsConfirming(true);
    try {
      // References for Revenues and Expenses collections
      const incomesRef = collection(db, "Incomes");
      const expensesRef = collection(db, "Incomes");

      // References to specific documents
      const revenueDocRef = doc(incomesRef, "revenueItemsDoc");
      const expensesDocRef = doc(expensesRef, "expensesItemsDoc");

      // Handle Revenue Items
      const revenueDocSnap = await getDoc(revenueDocRef);
      if (revenueDocSnap.exists()) {
        await updateDoc(revenueDocRef, {
          revenueItem: arrayUnion(...newRevenueItems),
        });
      } else {
        await setDoc(revenueDocRef, {
          revenueItem: newRevenueItems,
        });
      }

      // Handle Expenses Items
      const expensesDocSnap = await getDoc(expensesDocRef);
      if (expensesDocSnap.exists()) {
        await updateDoc(expensesDocRef, {
          expensesItem: arrayUnion(...newExpensesItems),
        });
      } else {
        await setDoc(expensesDocRef, {
          expensesItem: newExpensesItems,
        });
      }

      // Fetch updated items and save the income statement
      await fetchRevenueItems();
      await fetchExpensesItems();
      await saveItemReport(itemReport);

      // Close modal and show success message
      setIsConfirmationModalVisible(false);
      toast.success("New revenue and expenses items added successfully");
    } catch (error) {
      console.error("Error adding new items:", error);
      toast.error("Failed to add new revenue and expenses items");
    } finally {
      setIsConfirming(false);
    }
  };

  const calculateTotal = (type) => {
    return itemReport[type]
      .reduce((acc, item) => acc + parseFloat(item.amount || 0), 0)
      .toFixed(2);
  };

  const renderInputs = (type) => {
    if (!itemReport || !itemReport[type]) {
      return null;
    }

    return itemReport[type].map((item, index) => {
      const isRevenueType = type === "incomeRevenue";

      return (
        <div key={index} className="flex items-center space-x-2 mb-2">
          {isRevenueType ? (
            <Select
              style={{ width: "100%" }}
              placeholder="Select or Enter Revenue Item"
              value={item.description}
              onChange={(value) =>
                handleChange(type, index, "description", value)
              }
              className="border border-gray-300 rounded-lg flex-1"
              mode="tags" // Change to 'tags' to allow free text input
              onSelect={(value) => {
                // Check if the value is not already in revenueItems
                if (!revenueItems.includes(value)) {
                  setRevenueItems([...revenueItems, value]);
                }
                handleChange(type, index, "description", value);
              }}
            >
              {getAvailableRevenueItems().map((revenueItem, idx) => (
                <Select.Option key={idx} value={revenueItem}>
                  {revenueItem}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <Select
              style={{ width: "100%" }}
              placeholder="Select or Enter Expense Item"
              value={item.description}
              onChange={(value) =>
                handleChange(type, index, "description", value)
              }
              className="border border-gray-300 rounded-lg flex-1"
              mode="tags" // Change to 'tags' to allow free text input
              onSelect={(value) => {
                // Check if the value is not already in expensesItems
                if (!expensesItems.includes(value)) {
                  setExpensesItems([...expensesItems, value]);
                }
                handleChange(type, index, "description", value);
              }}
            >
              {getAvailableExpensesItems().map((expenseItem, idx) => (
                <Select.Option key={idx} value={expenseItem}>
                  {expenseItem}
                </Select.Option>
              ))}
            </Select>
          )}

          <Input
            placeholder="Amount"
            type="number"
            value={item.amount}
            onChange={(e) =>
              handleChange(type, index, "amount", e.target.value)
            }
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
      );
    });
  };

  const handleChange = (type, index, field, value) => {
    const updatedItems = [...itemReport[type]];
    updatedItems[index][field] = value;
    setItemReport((prev) => ({ ...prev, [type]: updatedItems }));
  };

  const handleAddInput = (type) => {
    setItemReport((prev) => ({
      ...prev,
      [type]: [...prev[type], { description: "", amount: "" }],
    }));
  };

  const handleTransferSubmit = () => {
    const selectedItems = selectedRevenueItems.map((key) =>
      revenueItems.find((item) => item.key === key)
    );

    // Filter out items already in the input fields
    const existingDescriptions = itemReport.incomeRevenue
      .map((item) => item.description)
      .filter((desc) => desc !== "");

    const newRevenueItems = selectedItems
      .filter((item) => !existingDescriptions.includes(item.title))
      .map((item) => ({
        description: item.title,
        amount: "", // Admin will input amount
      }));

      setItemReport((prev) => ({
      ...prev,
      incomeRevenue: [
        ...prev.incomeRevenue.filter((item) => item.description),
        ...newRevenueItems,
      ],
    }));

    setIsTransferModalVisible(false);
    setSelectedRevenueItems([]);
  };

  const handleRemoveInput = (type, index) => {
    if (itemReport[type].length > 1) {
      setItemReport((prev) => ({
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

  return (
    <div
      className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden 
          ${
            sidebarOpen
              ? "desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10"
              : "desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12"
          } 
                          desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}
    >
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
            Revenue and Expenses Management
          </h1>
          <ScheduleFilled
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
        </div>
      </div>

      {/* Modal for Income Statement Form */}
      <AntModal
        title=""
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okButtonProps={{ disabled: !isFormValid }}
      >
        <form>
          {/* Modal Content */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Add Revenue Items</h2>
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
            <h2 className="text-lg font-semibold">Add Expenses Items</h2>
            {renderInputs("incomeExpenses")}
            <button
              type="button"
              className="bg-green-400 text-white mt-2 rounded-md flex justify-center items-center p-2"
              onClick={() => handleAddInput("incomeExpenses")}
            >
              <FaPlus className="mr-2" /> Add Expense
            </button>
          </div>

          {/* Show spinner when the form is being submitted */}
          {isSubmitting && (
            <div className="flex justify-center mt-4">
              <Spin size="large" />
            </div>
          )}
        </form>
      </AntModal>

      <AntModal
        title="Confirm New Revenue and Expenses Items"
        open={isConfirmationModalVisible}
        onOk={handleConfirmNewItems}
        onCancel={() => setIsConfirmationModalVisible(false)}
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

export default VenueManagementGraybar;
