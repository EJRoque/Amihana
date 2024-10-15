import { useEffect, useState } from "react";
import { fetchIncomeStatementData } from "../../../firebases/firebaseFunctions"; // Adjust the path as necessary
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

const BarChartIncomeState = () => {
  const [data, setData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const monthOrder = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  useEffect(() => {
    // Fetch data when component mounts
    const fetchData = async () => {
      const incomeRecords = await fetchIncomeStatementData();

      if (incomeRecords.length > 0) {
        // Extract available years from the Firestore records
        const years = [
          ...new Set(
            incomeRecords.map((record) => {
              const recordDate = new Date(record.id); // Assuming record.id is the date
              return recordDate.getFullYear();
            })
          ),
        ];

        setAvailableYears(years);

        // Default to the first year
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }

        // Set the fetched data
        setData(incomeRecords);
      }
    };

    fetchData();
  }, []);

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  // Filter data for the selected year
  const filteredData = data
  .filter((record) => {
    const recordDate = new Date(record.id); // Assuming record.id is the date
    return recordDate.getFullYear() === selectedYear;
  })
  .map((record) => {
    const recordDate = new Date(record.id); // Get the month for the bar chart labels
    const monthName = recordDate.toLocaleString("default", { month: "short" });

    // Ensure netIncome is a number, parsing it if necessary
    const netIncomeAmount = parseFloat(record.netIncome?.amount || 0);

    return {
      name: monthName,
      net_income: netIncomeAmount, // Use the parsed net income
      month: recordDate.getMonth(), // Store the numeric month for sorting
    };
  })
  .sort((a, b) => a.month - b.month); // Sort by the numeric month

  return (
    <div>
      <h3 className="desktop:text-lg laptop:text-lg tablet:text-base phone:text-xs flex justify-center font-poppins">
        Income Statement Data for {selectedYear}
      </h3>

      {/* Dropdown to select the year */}
      <div className="flex justify-center my-2">
        <select
          className="p-2 border border-gray-300 rounded-md text-sm"
          value={selectedYear || ""}
          onChange={handleYearChange}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Display the BarChart */}
      {filteredData.length > 0 ? (
        <div className="w-full h-[18rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={filteredData} // Use filtered data for the chart
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
              <Tooltip />
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
