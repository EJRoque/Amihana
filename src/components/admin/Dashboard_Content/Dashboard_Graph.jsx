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
} from "../../../firebases/firebaseFunctions"; // Assume you have a function to fetch year documents
import { Select } from "antd";

export default function Dashboard_Graph() {
  const [selectedYear, setSelectedYear] = useState(null); // Initially set to null
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]); // State to store fetched years

  useEffect(() => {
    // Fetch available years from Firestore
    const fetchYears = async () => {
      try {
        const years = await getYearDocuments(); // Assuming this function fetches all year documents
        if (years.length > 0) {
          // Sort years in descending order and set the most recent year as selectedYear
          const sortedYears = years.sort((a, b) => b - a);
          setAvailableYears(sortedYears);
          setSelectedYear(sortedYears[0]); // Set the most recent year as default
        }
      } catch (error) {
        console.error("Error fetching years: ", error);
      }
    };

    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      // Only fetch data if a year is selected
      const fetchData = async () => {
        try {
          const data = await balanceSheetData(selectedYear);
          console.log("Fetched Data: ", data);

          if (data && data.Name) {
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
            const paidCount = months.reduce(
              (acc, month) => ({ ...acc, [month]: 0 }),
              {}
            );
            const unpaidCount = months.reduce(
              (acc, month) => ({ ...acc, [month]: 0 }),
              {}
            );

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
  }, [selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const dataFormatter = (number) => `${number} users`;

  return (
    <div>
      <h3 className="desktop:text-lg laptop:text-lg tablet:text-base phone:text-xs flex justify-center font-poppins">
        Butaw Collection Data for {selectedYear}
      </h3>

      {/* Dropdown to select the year */}
      <div className="flex justify-center my-2">
        <select
          className="p-2 border border-gray-300 rounded-md text-sm"
          value={selectedYear || ""} // If selectedYear is null, show an empty value
          onChange={handleYearChange}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
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
