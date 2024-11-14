import { useEffect, useState } from "react";
import { fetchIncomeStatementData } from "../../../firebases/firebaseFunctions";
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
import { Select, Segmented, Statistic } from "antd"; // Import Statistic from Ant Design

const { Option } = Select;

const BarChartIncomeState = () => {
  const [data, setData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [viewMode, setViewMode] = useState("Yearly");
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Formatter for currency values with peso sign
  const pesoFormatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });

  useEffect(() => {
    const fetchData = async () => {
      const incomeRecords = await fetchIncomeStatementData();

      if (incomeRecords.length > 0) {
        const years = [
          ...new Set(
            incomeRecords.map((record) => {
              const recordDate = new Date(record.id);
              return recordDate.getFullYear();
            })
          ),
        ];

        setAvailableYears(years);

        if (years.length > 0) {
          setSelectedYear(years[0]);
        }

        setData(incomeRecords);
      }
    };

    fetchData();
  }, []);

  const handleYearChange = (value) => {
    setSelectedYear(value);
    setSelectedMonth(null); // Reset selected month when year changes
  };

  const handleViewModeChange = (value) => {
    setViewMode(value);
    setSelectedMonth(null); // Reset selected month when switching to "Yearly"
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  // Filter data based on selected year and month (if in Monthly mode)
  const filteredData = data
    .filter((record) => {
      const recordDate = new Date(record.id);
      return (
        recordDate.getFullYear() === selectedYear &&
        (viewMode === "Yearly" || recordDate.getMonth() === selectedMonth)
      );
    })
    .map((record) => {
      const recordDate = new Date(record.id);
      const monthName = recordDate.toLocaleString("default", {
        month: "short",
      });
      const netIncomeAmount = parseFloat(record.netIncome?.amount || 0);

      return {
        name: monthName,
        net_income: netIncomeAmount,
        month: recordDate.getMonth(),
      };
    })
    .sort((a, b) => a.month - b.month);

  // Get list of months for the dropdown when in Monthly view
  const months = [
    { label: "January", value: 0 },
    { label: "February", value: 1 },
    { label: "March", value: 2 },
    { label: "April", value: 3 },
    { label: "May", value: 4 },
    { label: "June", value: 5 },
    { label: "July", value: 6 },
    { label: "August", value: 7 },
    { label: "September", value: 8 },
    { label: "October", value: 9 },
    { label: "November", value: 10 },
    { label: "December", value: 11 },
  ];

  // Calculate statistics
  const calculateStatistics = (data) => {
    if (data.length === 0)
      return { total: 0, average: 0, highest: 0, lowest: 0 };

    const total = data.reduce((sum, record) => sum + record.net_income, 0);
    const average = total / data.length;
    const highest = Math.max(...data.map((record) => record.net_income));
    const lowest = Math.min(...data.map((record) => record.net_income));

    return { total, average, highest, lowest };
  };

  const stats = calculateStatistics(filteredData);

  return (
    <div>
      <h3 className="desktop:text-lg laptop:text-lg tablet:text-base phone:text-xs flex justify-center font-poppins">
        Income Statement Data for {selectedYear}
      </h3>

      {/* Year Selection */}
      <div className="flex m-4">
        <Select
          value={selectedYear || ""}
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

      <div className="bg-[#FEFEFA] w-[20rem] h-[10rem] m-4 rounded-lg p-3 shadow-md">
        <div className="responsive flex my-4 justify-between">
          {/* View Mode Segmented Control */}
          <Segmented
            className="bg-[#B9D9EB]"
            options={["Monthly", "Yearly"]}
            value={viewMode}
            onChange={handleViewModeChange}
          />

          {/* Month Dropdown (visible only when "Monthly" is selected) */}
          {viewMode === "Monthly" && (
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              placeholder="Select a month"
            >
              {months.map((month) => (
                <Option key={month.value} value={month.value}>
                  {month.label}
                </Option>
              ))}
            </Select>
          )}
        </div>

        {/* Display Statistics inside the box below the Segmented control and Dropdown */}
        {filteredData.length > 0 && (
          <div className="my-4">
            <Statistic
              title="Total Income"
              value={stats.total}
              valueStyle={{ color: "#3f8600" }}
              prefix="₱" // Peso sign
              formatter={(value) => value.toLocaleString()}
            />
          </div>
        )}
      </div>

      {/* Display the BarChart */}
      {filteredData.length > 0 ? (
        <div className="w-full h-[18rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={filteredData}
              margin={{
                top: 5,
                right: 40,
                left: 10,
                bottom: 5,
              }}
              barSize={20}
            >
              <XAxis
                dataKey="name"
                scale="point"
                padding={{ left: 10, right: 10 }}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [pesoFormatter.format(value), name]}
                cursor={{ fill: "transparent" }}
              />
              <Legend />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar
                dataKey="net_income"
                name="Net Income"
                fill="#085272"
                background={{ fill: "#eee" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center">Loading data...</p>
      )}
    </div>
  );
};

export default BarChartIncomeState;
