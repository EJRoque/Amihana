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
import { Select, Statistic, Segmented } from "antd";

const { Option } = Select;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Dashboard_Graph() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [paidTotal, setPaidTotal] = useState(0);
  const [unpaidTotal, setUnpaidTotal] = useState(0);
  const [paidAmountTotal, setPaidAmountTotal] = useState(0); // To store total paid amount
  const [unpaidAmountTotal, setUnpaidAmountTotal] = useState(0); // To store total unpaid amount
  const [viewMode, setViewMode] = useState("Yearly");

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
        console.log("Fetched data:", data); // Log the fetched data
  
        if (data && data.Name) {
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

          // Iterate through each homeowner and their monthly payment data
          Object.values(data.Name).forEach((userData) => {
            if (typeof userData === "object") {
              months.forEach((month) => {
                if (userData[month]?.paid === true) {
                  paidCount[month] += 1;
                  paidAmount[month] += userData[month].amount || 0; // Add the amount for paid users
                }
                if (userData[month]?.paid === false) {
                  unpaidCount[month] += 1;
                  unpaidAmount[month] += userData[month].amount || 0; // Add the amount for unpaid users
                }
              });
            }
          });

          // Calculate total paid and unpaid counts
          const totalPaid = Object.values(paidCount).reduce((sum, count) => sum + count, 0);
          const totalUnpaid = Object.values(unpaidCount).reduce((sum, count) => sum + count, 0);

          // Calculate total amount for paid and unpaid users
          const totalPaidAmount = Object.values(paidAmount).reduce((sum, amount) => sum + amount, 0);
          const totalUnpaidAmount = Object.values(unpaidAmount).reduce((sum, amount) => sum + amount, 0);

          // Set totals based on view mode
          setPaidTotal(viewMode === "Monthly" && selectedMonth ? paidCount[selectedMonth] : totalPaid);
          setUnpaidTotal(viewMode === "Monthly" && selectedMonth ? unpaidCount[selectedMonth] : totalUnpaid);
          setPaidAmountTotal(viewMode === "Monthly" && selectedMonth ? paidAmount[selectedMonth] : totalPaidAmount);
          setUnpaidAmountTotal(viewMode === "Monthly" && selectedMonth ? unpaidAmount[selectedMonth] : totalUnpaidAmount);

          // Prepare data for chart
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
  

  // Reset selectedMonth when switching to "Yearly" view
  useEffect(() => {
    if (viewMode === "Yearly") {
      setSelectedMonth(null);
    }
  }, [viewMode]);

  return (
    <div>
      <h3 className="desktop:text-lg laptop:text-lg tablet:text-base phone:text-xs flex justify-center font-poppins">
        Butaw Collection Data for {selectedYear}
      </h3>

      {/* Year Selection */}
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

      {/* View Mode Selection */}
      <div className="bg-[#FEFEFA] w-auto h-auto m-4 rounded-lg p-3 shadow-md">
        <div className="responsive flex my-4 justify-between">
          <Segmented
            className="bg-[#B9D9EB]"
            options={["Monthly", "Yearly"]}
            value={viewMode}
            onChange={setViewMode}
          />

          {viewMode === "Monthly" && (
            <Select
              placeholder="Select a month"
              value={selectedMonth}
              onChange={setSelectedMonth}
            >
              {months.map((month) => (
                <Option key={month} value={month}>
                  {month}
                </Option>
              ))}
            </Select>
          )}
        </div>

        <div className="flex justify-between">
          <Statistic className="font-poppins font-normal" title="Paid Users" value={paidTotal} />
          <Statistic className="font-poppins font-normal" title="Unpaid Users" value={unpaidTotal} />
        </div>
        <div className="flex justify-between">
          <Statistic 
            className="font-poppins font-normal" 
            title="Total Paid Amount" 
            value={paidAmountTotal} 
            valueStyle={{ color: '#3f8600' }}
            prefix="₱"
            formatter={(value) => value.toLocaleString()}/>
        </div>
      </div>

      {/* Display the LineChart */}
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
              <Line type="monotone" dataKey="Paid" stroke="#1A659E" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Unpaid" stroke="red" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center">Loading data...</p>
      )}
    </div>
  );
}
