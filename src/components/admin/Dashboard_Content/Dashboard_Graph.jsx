import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { balanceSheetData, getYearDocuments } from "../../../firebases/firebaseFunctions"; // Assume you have a function to fetch year documents
import { Select } from "antd";

export default function Dashboard_Graph() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]); // State to store fetched years

  useEffect(() => {
    // Fetch available years from Firestore
    const fetchYears = async () => {
      try {
        const years = await getYearDocuments(); // Assuming this function fetches all year documents
        setAvailableYears(years); // Set the years fetched from Firestore
      } catch (error) {
        console.error("Error fetching years: ", error);
      }
    };

    fetchYears();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await balanceSheetData(selectedYear);
        console.log("Fetched Data: ", data);

        if (data && data.Name) {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const paidCount = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});
          const unpaidCount = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

          Object.entries(data.Name).forEach(([user, userData]) => {
            if (typeof userData === 'object') {
              months.forEach(month => {
                if (userData[month] === true) {
                  paidCount[month]++;
                } else if (userData[month] === false) {
                  unpaidCount[month]++;
                }
              });
            }
          });

          const formattedData = months.map(month => ({
            month,
            Paid: paidCount[month],
            Unpaid: unpaidCount[month]
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
  }, [selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const dataFormatter = (number) => `${number} users`;

  return (
    <div>
      <h3 className="text-lg flex justify-center font-poppins">
        Balance Sheet Data for {selectedYear}
      </h3>

      {/* Dropdown to select the year */}
      <div className="flex justify-center my-4">
        <select
          className="p-2 border border-gray-300 rounded-md"
          value={selectedYear}
          onChange={handleYearChange}
        >
          {availableYears.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Display the LineChart */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 40,
              left: 10,
              bottom: 120,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={dataFormatter} />
            <Legend />
            <Line type="monotone" dataKey="Paid" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Unpaid" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center">Loading data...</p>
      )}
    </div>
  );
}
