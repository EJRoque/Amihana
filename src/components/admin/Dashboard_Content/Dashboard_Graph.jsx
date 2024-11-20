import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
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
import { Select, Statistic, Segmented, Modal, List } from "antd";

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

  return (
    <div>
       <h3 className="mt-4 font-medium desktop:text-lg laptop:text-lg tablet:text-base phone:text-md flex justify-center font-poppins">
        Butaw Collection Data for {selectedYear}
      </h3>

      <div className="flex m-4">
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
      </div>

      <div className="bg-[#FEFEFA] w-auto h-auto m-4 rounded-lg p-3 shadow-md">
        <div className="responsive flex my-4 justify-between">
          <Segmented
            className="bg-[#d5eaf5]"
            options={["Monthly", "Yearly"]}
            value={viewMode}
            onChange={setViewMode}
          />

          {viewMode === "Monthly" && (
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      }
      value={unpaidTotal}
      valueStyle={{ 
        color: unpaidTotal > 0 ? '#D32F2F' : '#52c41a', 
        fontWeight: 'bold' 
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} users`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Paid"
                stroke="#1A659E"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="Unpaid" stroke="red" />
            </LineChart>
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
        style={{ maxWidth: "80%" }} // Optional: To ensure modal does not stretch too wide
        styles={{ maxHeight: "400px", overflowY: "auto" }} // Limit the height and make it scrollable
      >
        <List
          dataSource={unpaidData}
          renderItem={(item) => {
            // For each user, check if they have unpaid months for the selected month
            const unpaidMonths = item.months.filter((month) => {
              if (viewMode === "Monthly" && month === selectedMonth) {
                return true; // Only show the selected month if it's unpaid
              } else if (viewMode === "Yearly") {
                return true; // Show all unpaid months if "Yearly" view
              }
              return false;
            });

            // If there are unpaid months to display, render the item
            if (unpaidMonths.length > 0) {
              return (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={
                      viewMode === "Yearly"
                        ? `Unpaid months: ${unpaidMonths.join(", ")}`
                        : null
                    } // Only show months in "Yearly" view
                  />
                </List.Item>
              );
            }
            return null; // Skip the item if no unpaid months match the criteria
          }}
        />
      </Modal>
    </div>
  );
}
