import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  balanceSheetData,
  getYearDocuments,
} from "../../../firebases/firebaseFunctions";
import { Select, Statistic, Segmented, Modal, List, Button, message } from "antd";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebases/FirebaseConfig";
import * as emailjs from '@emailjs/browser';
import amihanaLogo from "../../../assets/images/amihana-logo.png";

const { Option } = Select;
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function Dashboard_Graph() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [paidTotal, setPaidTotal] = useState(0);
  const [unpaidTotal, setUnpaidTotal] = useState(0);
  const [paidAmountTotal, setPaidAmountTotal] = useState(0);
  const [unpaidAmountTotal, setUnpaidAmountTotal] = useState(0);
  const [viewMode, setViewMode] = useState("Yearly");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [unpaidData, setUnpaidData] = useState([]);
  const [selectedUnpaidUser, setSelectedUnpaidUser] = useState(null);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await getYearDocuments();
        if (years.length) {
          const sortedYears = years.sort((a, b) => b - a);
          setAvailableYears(sortedYears);
          setSelectedYear(sortedYears[0]);
        }
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    if (!selectedYear) return;

    const fetchData = async () => {
      try {
        const data = await balanceSheetData(selectedYear);
        if (data && data.Name) {
          const unpaidInfo = [];
          const paidCount = {};
          const unpaidCount = {};
          const paidAmount = {};
          const unpaidAmount = {};

          months.forEach((month) => {
            paidCount[month] = 0;
            unpaidCount[month] = 0;
            paidAmount[month] = 0;
            unpaidAmount[month] = 0;
          });

          Object.entries(data.Name).forEach(([name, userData]) => {
            const unpaidMonths = [];
            months.forEach((month) => {
              if (userData[month]?.paid === false) {
                unpaidCount[month] += 1;
                unpaidAmount[month] += userData[month].amount || 0;
                unpaidMonths.push(month);
              } else if (userData[month]?.paid === true) {
                paidCount[month] += 1;
                paidAmount[month] += userData[month].amount || 0;
              }
            });
            if (unpaidMonths.length) {
              unpaidInfo.push({ name, months: unpaidMonths });
            }
          });

          setUnpaidData(unpaidInfo);

          const totalPaid = Object.values(paidCount).reduce(
            (sum, count) => sum + count,
            0
          );
          const totalUnpaid = Object.values(unpaidCount).reduce(
            (sum, count) => sum + count,
            0
          );
          const totalPaidAmount = Object.values(paidAmount).reduce(
            (sum, amount) => sum + amount,
            0
          );
          const totalUnpaidAmount = Object.values(unpaidAmount).reduce(
            (sum, amount) => sum + amount,
            0
          );

          setPaidTotal(
            viewMode === "Monthly" && selectedMonth
              ? paidCount[selectedMonth]
              : totalPaid
          );
          setUnpaidTotal(
            viewMode === "Monthly" && selectedMonth
              ? unpaidCount[selectedMonth]
              : totalUnpaid
          );
          setPaidAmountTotal(
            viewMode === "Monthly" && selectedMonth
              ? paidAmount[selectedMonth]
              : totalPaidAmount
          );
          setUnpaidAmountTotal(
            viewMode === "Monthly" && selectedMonth
              ? unpaidAmount[selectedMonth]
              : totalUnpaidAmount
          );

          const chartDataForMonths = months.map((month) => ({
            month,
            Paid: paidCount[month],
            Unpaid: unpaidCount[month],
          }));
          setChartData(chartDataForMonths);
        } else {
          console.log("No 'Name' field in the data:", data);
        }
      } catch (error) {
        console.error("Error fetching balance sheet data:", error);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth, viewMode]);


  useEffect(() => {
    if (viewMode === "Yearly") {
      setSelectedMonth(null);
    }
  }, [viewMode]);

  const handleUncollectedMonthsClick = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const getCurrentMonthIndex = () => {
    return new Date().getMonth();
  };

  const filterUncollectedMonths = (unpaidMonths) => {
    const currentMonthIndex = getCurrentMonthIndex();
    return unpaidMonths.filter((month) => {
      const monthIndex = months.indexOf(month);
      return monthIndex <= currentMonthIndex;
    });
  };

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await getYearDocuments();
        if (years.length) {
          const sortedYears = years.sort((a, b) => b - a);
          setAvailableYears(sortedYears);
          setSelectedYear(sortedYears[0]);
        }
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };
    fetchYears();
  }, []);
  // Function to fetch user email from Firestore
  const fetchUserEmail = async (userName) => {
    try {
      // Create a query to find the user by full name
      const userQuery = query(
        collection(db, "users"), // Note: "user" collection based on your description
        where("fullName", "==", userName)
      );

      // Execute the query
      const querySnapshot = await getDocs(userQuery);

      // Check if we found any matching users
      if (!querySnapshot.empty) {
        // Get the first matching user's email
        const userData = querySnapshot.docs[0].data();
        return userData.email;
      }

      // If no user found, log and return null
      console.warn(`No user found with name: ${userName}`);
      return null;
    } catch (error) {
      console.error("Error fetching user email:", error);
      message.error(`Failed to retrieve email for ${userName}`);
      return null;
    }
  };

  const generatePrintNotice = (userName, unpaidMonths) => {
    const currentDate = new Date().toLocaleDateString('en-PH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  
    // Create a new window
    const printWindow = window.open("", "", "width=800,height=1000");
    
    if (!printWindow) {
      alert('Please allow pop-ups for this site to generate the print notice.');
      return;
    }
  
    // Write content to the new window with a professional design
    printWindow.document.write(`
      <html>
        <head>
          <title>Butaw Payment Notice</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              margin: 20px;
              line-height: 1.6;
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
              text-transform: uppercase;
            }
            .notice-content {
              background-color: #f9f9f9;
              border: 1px solid #e0e0e0;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .unpaid-months {
              background-color: #fff3f3;
              border: 1px solid #ffcccb;
              color: #D32F2F;
              padding: 15px;
              margin: 15px 0;
              text-align: center;
              font-weight: bold;
              border-radius: 5px;
            }
            .salutation {
              margin-bottom: 15px;
            }
            .body-text {
              margin-bottom: 15px;
            }
            .signature {
              margin-top: 30px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 30px;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            .report-info {
              margin-bottom: 20px;
              font-size: 14px;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${amihanaLogo}" alt="Amihana Logo" />
            <h1>Unpaid Butaw Notice</h1>
          </div>
  
          <div class="report-info">
            <p>Date: <strong>${currentDate}</strong></p>
          </div>
  
          <div class="notice-content">
            <div class="salutation">
              <p>Dear ${userName},</p>
            </div>
  
            <div class="body-text">
              <p>We are writing to bring to your attention that you have outstanding Butaw payments for the following month(s):</p>
  
              <div class="unpaid-months">
                ${unpaidMonths.join(", ")}
              </div>
  
              <p>As a valued member of the Amihana Homeowners Association (HOA), we kindly request that you settle these outstanding payments at your earliest convenience. Timely payment is crucial for maintaining the financial stability of our community.</p>
  
              <p>If you have any questions or require clarification regarding these outstanding payments, please do not hesitate to contact the HOA management.</p>
            </div>
  
            <div class="signature">
              <p>Sincerely,</p>
              <p>Amihana Homeowners Association Management</p>
            </div>
          </div>
  
          <div class="footer">
            <p>&copy; Amihana HOA - Confidential Communication</p>
          </div>
        </body>
      </html>
    `);
    
    // Close the document writing
    printWindow.document.close();
    
    // Trigger print
    printWindow.print();
  };

  const sendEmailNotice = async (userName, userEmail, unpaidMonths, unpaidAmounts) => {
    try {
      // Validate email
      if (!userEmail) {
        message.error(`No email found for ${userName}`);
        return;
      }
  
      // Calculate total unpaid amount
      const totalUnpaidAmount = unpaidAmounts.reduce((sum, amount) => sum + amount, 0);
  
      // Replace these with your actual EmailJS credentials
      const EMAILJS_USER_ID = 'EwNrTcnLwRaP6BKgt';
      const EMAILJS_SERVICE_ID = 'service_sh90mdl';
      const EMAILJS_TEMPLATE_ID = 'template_sflfxqt';
  
      // Initialize EmailJS with your User ID
      emailjs.init(EMAILJS_USER_ID);
  
      const templateParams = {
        to_name: userName,
        to_email: userEmail,
        unpaid_months: unpaidMonths.join(", "),
        total_unpaid_amount: totalUnpaidAmount.toLocaleString('en-PH', {
          style: 'currency',
          currency: 'PHP'
        }),
        subject: "Unpaid Butaw Payment Notice"
      };
  
      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );
  
      message.success(`Notice sent successfully to ${userName}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      message.error(`Failed to send notice to ${userName}`);
    }
  };

  return (
    <div>
      <h3 className="mt-4 font-medium desktop:text-lg laptop:text-lg tablet:text-base phone:text-md flex justify-center font-poppins">
        Butaw Collection Data for {selectedYear}
      </h3>

      <div className="bg-[#FEFEFA] w-auto h-auto m-4 rounded-lg p-3 shadow-md">
        <div className="responsive flex my-4 justify-between">
          <Segmented
            className="bg-[#d5eaf5]"
            options={["Monthly", "Yearly"]}
            value={viewMode}
            onChange={setViewMode}
          />

          {viewMode === "Monthly" ? (
            <Select
              placeholder="Select a month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              className="desktop:w-[14.5vh] Laptop:w-[18vh] phone:w-[10vh]"
            >
              {months.map((month) => (
                <Option key={month} value={month}>
                  {month}
                </Option>
              ))}
            </Select>
          ) : (
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              placeholder="Select a year"
            >
              {availableYears.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          )}
        </div>

        <div
          className="flex items-center bg-blue-50 border-2 border-blue-100 rounded-xl p-3 cursor-pointer hover:bg-blue-100 hover:border-blue-200 transition-all group shadow-sm hover:shadow-md"
          onClick={handleUncollectedMonthsClick}
        >
          <div className="flex-grow">
            <Statistic
              className="font-poppins font-normal"
              title={
                <div className="flex items-center text-blue-800">
                  <span className="mr-2">Uncollected Months</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 group-hover:text-blue-700 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              }
              value={unpaidTotal}
              valueStyle={{
                color: unpaidTotal > 0 ? "#D32F2F" : "#52c41a",
                fontWeight: "bold",
              }}
            />
          </div>
          <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600 group-hover:text-blue-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
        <div className="flex justify-between">
          <Statistic
            className="font-poppins font-normal"
            title="Total Butaw Collection"
            value={paidAmountTotal}
            valueStyle={{ color: "#3f8600" }}
            prefix="₱"
            formatter={(value) => value.toLocaleString()}
          />
        </div>
      </div>

      {chartData.length ? (
        <div className="w-full h-[18rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={chartData}
              margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
              barCategoryGap={0} // No padding between bars
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} users`} />
              <Legend />
              <Bar
                dataKey="Paid"
                fill="#1A659E"
                background={{ fill: "#eee" }}
              />
              <Bar
                dataKey="Unpaid"
                fill="#f04646"
                background={{ fill: "#eee" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center">Loading data...</p>
      )}

      {/* Modal for unpaid months */}
      <Modal
        title={
          viewMode === "Monthly"
            ? `List of Uncollected Month for ${selectedMonth}`
            : "List of Uncollected Months"
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        style={{ maxWidth: "80%" }}
        styles={{ maxHeight: "400px", overflowY: "auto" }}
      >
        <List
          dataSource={unpaidData}
          renderItem={(item) => {
            // Filter uncollected months based on current month
            const unpaidMonths = filterUncollectedMonths(item.months).filter((month) => {
              if (viewMode === "Monthly" && month === selectedMonth) {
                return true;
              } else if (viewMode === "Yearly") {
                return true;
              }
              return false;
            });

            // If there are uncollected months to display, render the item
            if (unpaidMonths.length > 0) {
              return (
                <List.Item
                  actions={[
                    <Button 
                      type="default" 
                      onClick={() => generatePrintNotice(item.name, unpaidMonths)}
                    >
                      Print Notice
                    </Button>,
                   <Button 
                   type="primary" 
                   onClick={async () => {
                     // Fetch user email dynamically
                     const userEmail = await fetchUserEmail(item.name);
                     
                     // Get the full balance sheet data from the existing state or re-fetch if necessary
                     const fetchCurrentData = async () => {
                       try {
                         const currentData = await balanceSheetData(selectedYear);
                         return currentData;
                       } catch (error) {
                         console.error("Error fetching current data:", error);
                         return null;
                       }
                     };
                 
                     const currentData = await fetchCurrentData();
                 
                     if (currentData && currentData.Name) {
                       // Collect unpaid amounts for the specific user's months
                       const unpaidAmounts = unpaidMonths.map(month => {
                         const userData = currentData.Name[item.name];
                         return userData?.[month]?.amount || 0;
                       });
                 
                       if (userEmail) {
                         sendEmailNotice(item.name, userEmail, unpaidMonths, unpaidAmounts);
                       }
                     } else {
                       message.error("Unable to retrieve user payment data");
                     }
                   }}
                 >
                   Send Email Notice
                 </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={
                      viewMode === "Yearly"
                        ? `Uncollected months: ${unpaidMonths.join(", ")}`
                        : null
                    }
                  />
                </List.Item>
              );
            }
            return null;
          }}
        />
      </Modal>
    </div>
  );
}
