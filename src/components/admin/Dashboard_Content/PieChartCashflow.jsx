import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  fetchCashFlowDates,
  fetchCashFlowRecord,
} from "../../../firebases/firebaseFunctions";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const PieChartCashflow = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [existingDates, setExistingDates] = useState([]);
  const [cashFlowData, setCashFlowData] = useState({
    totalData: [],
    detailedData: [],
  });

  // Fetch existing dates
  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const dates = await fetchCashFlowDates();
        setExistingDates(dates);
        // Automatically select the first date if available
        if (dates.length > 0 && !selectedDate) {
          setSelectedDate(dates[0]);
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    };
    getExistingDates();
  }, [selectedDate]);

  // Fetch cash flow record when a date is selected
  useEffect(() => {
    const getCashFlowRecord = async () => {
      if (selectedDate) {
        try {
          const record = await fetchCashFlowRecord(selectedDate);

          // Data for the first pie (totalData)
          const totalData = [
            {
              name: "Total Cash Available",
              value: parseFloat(record.totalCashAvailable.amount) || 0,
            },
            {
              name: "Total Cash Paid-out",
              value: parseFloat(record.totalCashPaidOut.amount) || 0,
            },
            {
              name: "Ending Balance",
              value: parseFloat(record.endingBalance.amount) || 0,
            },
          ];

          // Data for the second pie (detailedData)
          const detailedData = [
            ...record.openingBalance.map((item) => ({
              name: item.description,
              value: parseFloat(item.amount) || 0,
            })),
            ...record.cashReceipts.map((item) => ({
              name: item.description,
              value: parseFloat(item.amount) || 0,
            })),
            ...record.cashPaidOut.map((item) => ({
              name: item.description,
              value: parseFloat(item.amount) || 0,
            })),
          ];

          setCashFlowData({ totalData, detailedData });
        } catch (error) {
          console.error("Error fetching cash flow record:", error);
        }
      }
    };
    getCashFlowRecord();
  }, [selectedDate]);

  return (
    <div>
      <h3 className="desktop:text-lg laptop:text-lg tablet:text-base phone:text-xs flex justify-center font-poppins">
        Cashflow Data for {selectedDate || "Select Date"}
      </h3>

      {/* Dropdown to select the date */}
      <div className="flex justify-center my-2">
        <select
          className="p-2 border border-gray-300 rounded-md text-sm"
          value={selectedDate || ""}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          {existingDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {/* Align the two pie charts */}
      {cashFlowData.totalData.length > 0 ? (
        <div className="flex flex-col tablet:flex-row justify-center items-center w-full space-x-0 tablet:space-x-8 space-y-8 tablet:space-y-0">
          {/* First Pie Chart: Total Data (Total Cash Available, Total Cash Paid-out, Ending Balance) */}
          <div className="w-full desktop:h-[15rem] laptop:h-[15rem] tablet:h-[14rem] phone:h-[13rem]">
            <h4 className="text-center">Summary Cash Flow</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={200} height={200}>
                <Pie
                  data={cashFlowData.totalData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#82ca9d"
                  label
                >
                  {cashFlowData.totalData.map((entry, index) => (
                    <Cell
                      key={`total-cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Second Pie Chart: Detailed Data (Opening Balance, Cash Receipts, Cash Paid Out) */}
          <div className="w-full desktop:h-[15rem] laptop:h-[15rem] tablet:h-[14rem] phone:h-[13rem]">
            <h4 className="text-center">Detailed Cash Flow</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={200} height={200}>
                <Pie
                  data={cashFlowData.detailedData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  label
                >
                  {cashFlowData.detailedData.map((entry, index) => (
                    <Cell
                      key={`detailed-cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="text-center">Loading data...</p>
      )}
    </div>
  );
};

export default PieChartCashflow;
