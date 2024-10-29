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

export default function Dashboard_Graph() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [paidTotal, setPaidTotal] = useState(0);
  const [unpaidTotal, setUnpaidTotal] = useState(0);
  const [viewMode, setViewMode] = useState("Yearly");

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await getYearDocuments();
        if (years.length > 0) {
          const sortedYears = years.sort((a, b) => b - a);
          setAvailableYears(sortedYears);
          setSelectedYear(sortedYears[0]);
        }
      } catch (error) {
        console.error("Error fetching years: ", error);
      }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      const fetchData = async () => {
        try {
          const data = await balanceSheetData(selectedYear);

          if (data && data.Name) {
            const months = [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            const paidCount = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});
            const unpaidCount = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

            Object.entries(data.Name).forEach(([user, userData]) => {
              if (typeof userData === "object") {
                months.forEach((month) => {
                  if (userData[month] === true) {
                    paidCount[month]++;
                  } else if (userData[month] === false) {
                    unpaidCount[month]++;
                  }
                });
              }
            });

            if (viewMode === "Monthly" && selectedMonth) {
              // Compute totals for selected month
              setPaidTotal(paidCount[selectedMonth]);
              setUnpaidTotal(unpaidCount[selectedMonth]);
            } else {
              // Compute yearly totals
              const totalPaid = Object.values(paidCount).reduce((sum, count) => sum + count, 0);
              const totalUnpaid = Object.values(unpaidCount).reduce((sum, count) => sum + count, 0);
              setPaidTotal(totalPaid);
              setUnpaidTotal(totalUnpaid);
            }

            const formattedData = months.map((month) => ({
              month,
              Paid: paidCount[month],
              Unpaid: unpaidCount[month],
            }));
            setChartData(formattedData);

          } else {
            console.log("No data found for the selected year");
          }
        } catch (error) {
          console.error("Error fetching balance sheet data: ", error);
        }
      };
      fetchData();
    }
  }, [selectedYear, selectedMonth, viewMode]);

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const handleViewModeChange = (value) => {
    setViewMode(value);
    if (value === "Yearly") {
      setSelectedMonth(null);
    }
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  const dataFormatter = (number) => `${number} users`;

  return (
    <div>
      <h3 className="desktop:text-lg laptop:text-lg tablet:text-base phone:text-xs flex justify-center font-poppins">
        Butaw Collection Data for {selectedYear}
      </h3>

      {/* Year Selection */}
      <div className="flex m-4">
        <Select
          value={selectedYear}
          onChange={handleYearChange}
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
      <div className="bg-[#FEFEFA] w-[20rem] h-[10rem] m-4 rounded-lg p-3 shadow-md">
        <div className="responsive flex my-4 justify-between ">
          <Segmented
            className="bg-[#B9D9EB]"
            options={['Monthly', 'Yearly']}
            value={viewMode}
            onChange={handleViewModeChange}
          />

          {viewMode === "Monthly" && (
            <Select
              
              placeholder="Select a month"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                .map((month, index) => (
                  <Option key={index} value={month}>
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
      </div>

      {/* Display the LineChart */}
      {chartData.length > 0 ? (
        <div className="w-full h-[18rem]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={500}
              height={300}
              data={chartData}
              margin={{
                top: 5,
                right: 40,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={dataFormatter} />
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
    </div>
  );
}
