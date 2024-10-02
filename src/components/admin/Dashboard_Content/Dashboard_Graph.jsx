import React, { useState, useEffect } from 'react';
import { LineChart } from '@tremor/react';
import { getCurrentUserId, fetchUserFullName, fetchBalanceSheetRecord } from '../../../firebases/firebaseFunctions'; // Adjust the path accordingly

export default function Dashboard_Graph() {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May",
    "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];

  const [dataState, setDataState] = useState({});
  const [fullName, setFullName] = useState('');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchFullName = async () => {
      const userId = getCurrentUserId();
      if (userId) {
        try {
          const name = await fetchUserFullName(userId);
          setFullName(name);
        } catch (error) {
          console.error("Error fetching user's full name:", error);
        }
      }
    };

    fetchFullName();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (fullName) {
        try {
          const record = await fetchBalanceSheetRecord(fullName, new Date().getFullYear()); // Fetch for the current year
          console.log("Fetched record:", record); // Check what the fetched record looks like
          setDataState(record);
        } catch (error) {
          console.error("Error fetching data from Firestore:", error);
        }
      }
    };

    fetchData();
  }, [fullName]);

  useEffect(() => {
    if (dataState) {
      const mappedData = months.map(month => ({
        month,
        'Paid Users': dataState[month] === true ? 1 : 0,  // Translate boolean to 1 (paid) or 0 (unpaid)
        'Unpaid Users': dataState[month] === false ? 1 : 0 // Count unpaid users as 1 and paid as 0
      }));

      setChartData(mappedData);
    }
  }, [dataState]);

  return (
    <>
      <h3 className="text-lg flex justify-center font-poppins">
        Chart
      </h3>
      <div className="mt-4 w-full h-72 md:h-96 lg:h-[30rem]"> 
        <LineChart
          className="h-full"
          data={chartData}
          index="month"
          yAxisWidth={20}
          categories={['Paid Users', 'Unpaid Users']}
          colors={['blue', 'red']}
          valueFormatter={(number) => `${new Intl.NumberFormat('us').format(number)}`}
        />
      </div>
    </>
  );
}
