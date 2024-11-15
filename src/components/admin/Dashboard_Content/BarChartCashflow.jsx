import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  fetchCashFlowDates,
  fetchCashFlowRecord,
} from "../../../firebases/firebaseFunctions";
import { Select } from "antd";

const { Option } = Select;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const CashflowBarChart = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [existingDates, setExistingDates] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);

  // Formatter for currency values with peso sign
  const pesoFormatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });

  // Fetch existing dates
  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const dates = await fetchCashFlowDates();
        setExistingDates(dates);
        if (dates.length > 0 && !selectedDate) {
          setSelectedDate(dates[0]);
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    };
    getExistingDates();
  }, [selectedDate]);

  // Fetch cash flow data when a date is selected
  useEffect(() => {
    const getCashFlowRecord = async () => {
      if (selectedDate) {
        try {
          const record = await fetchCashFlowRecord(selectedDate);

          const barData = [
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
            ...record.openingBalance.map((item) => ({
              name: item.description,
              value: parseFloat(item.amount) || 0,
            })),
            ...record.pledges.map((item) => ({
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

          setCashFlowData(barData);
        } catch (error) {
          console.error("Error fetching cash flow record:", error);
        }
      }
    };
    getCashFlowRecord();
  }, [selectedDate]);

  return (
    <div>
        <h3 className="mt-4 font-medium desktop:text-lg laptop:text-lg tablet:text-base phone:text-sm flex justify-center font-poppins">
        Cashflow Data for {selectedDate || "Select Date"}
      </h3>

      {/* Dropdown to select the date */}
      <div className="flex justify-start my-4 mx-4">
        <Select
          value={selectedDate || ""}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          {existingDates.map((date) => (
            <Option key={date} value={date}>
              {date}
            </Option>
          ))}
        </Select>
      </div>

      {/* Display the bar chart */}
      {cashFlowData.length > 0 ? (
        <div className="w-full mx-4 desktop:h-[18rem] laptop:h-[20rem] tablet:h-[18rem] phone:h-[18rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cashFlowData}
              width={500}
              height={300}
              margin={{
                top: 5,
                right: 40,
                left: 10,
                bottom: 5,
              }}
              barSize={20}
            >
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [pesoFormatter.format(value), name]}
                cursor={{ fill: "transparent" }}
              />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="value" fill="#82ca9d" background={{ fill: "#eee" }}>
                {cashFlowData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center">Loading data...</p>
      )}
    </div>
  );
};

export default CashflowBarChart;
