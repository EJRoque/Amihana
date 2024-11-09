import React, { useState, useEffect } from "react";
import incomestatementLogo from "../../assets/icons/income-statement-logo.svg";
import { LineChartOutlined, DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Button } from "antd";
import {
  fetchIncomeStateDates,
  fetchIncomeStateRecord,
} from "../../firebases/firebaseFunctions";
import { db } from "../../firebases/FirebaseConfig";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import amihanaLogo from "../../assets/images/amihana-logo.png";

//Under development

const IncomeStatementGraybar = ({
  incomeStatement = {},
  setIncomeStatement,
}) => {
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
              } phone:ml-1 capitalize`}>            Income Statement
          </h1>
          <LineChartOutlined className="flex m-2 desktop:h-10 desktop:w-10 laptop:h-8 laptop:w-8 phone:h-6 phone:w-6 text-[#0C82B4]" />
        </div>
        <div className="flex items-center desktop:space-x-4 laptop:space-x-3 phone:space-x-2">
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button className="bg-[#0C82B4] text-white flex items-center desktop:h-8 laptop:h-8 phone:h-6 desktop:text-base laptop:text-base tablet:text-base  phone:text-[0.45rem] desktop:px-4 laptop:px-3 phone:px-2 rounded-lg">
              {incomeStatement.date || "Select date"} <DownOutlined />
            </Button>
          </Dropdown>

          <Button
            className="bg-[#0C82B4] text-white flex items-center desktop:h-8 laptop:h-8 phone:h-6 desktop:text-base laptop:text-base tablet:text-base  phone:text-[0.75rem] desktop:px-4 laptop:px-3 phone:px-2 rounded-lg"
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatementGraybar;
