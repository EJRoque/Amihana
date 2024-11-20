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

const COLORS = ["#0C82B4"];

const FILTER_OPTIONS = [
  { label: "All", key: "all" },
  { label: "Opening Balance", key: "openingBalance" },
  { label: "Butaw", key: "cashReceipts" },
  { label: "Pledges", key: "pledges" },
  { label: "Less: Cash Paid-out", key: "cashPaidOut" },
  { label: "Ending Balance", key: "endingBalance" },
];

const CashflowBarChart = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [existingDates, setExistingDates] = useState([]);
  const [cashFlowData, setCashFlowData] = useState({});
  const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS[0].key);

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

          const processedData = {
            openingBalance: record.openingBalance.map((item) => ({
              name: item.description,
              value: parseFloat(item.amount) || 0,
            })),
            cashReceipts: record.cashReceipts.map((item) => ({
              name: item.description,
              value: parseFloat(item.amount) || 0,
            })),
            pledges: record.pledges.map((item) => ({
              name: item.description,
              value: parseFloat(item.amount) || 0,
            })),
            cashPaidOut: record.cashPaidOut.map((item) => ({
              name: item.description,
              value: parseFloat(item.amount) || 0,
            })),
            endingBalance: [
              {
                name: record.endingBalance.description,
                value: parseFloat(record.endingBalance.amount) || 0,
              },
            ],
          };

          // Combine all categories for the "All" option
          const allData = [
            ...processedData.openingBalance,
            ...processedData.cashReceipts,
            ...processedData.pledges,
            ...processedData.cashPaidOut,
            ...processedData.endingBalance,
          ];

          setCashFlowData({ ...processedData, all: allData });
        } catch (error) {
          console.error("Error fetching cash flow record:", error);
        }
      }
    };
    getCashFlowRecord();
  }, [selectedDate]);

  const filteredData = cashFlowData[selectedFilter] || [];

  return (
    <div>
      <h3 className="mt-4 font-medium desktop:text-lg laptop:text-lg tablet:text-base phone:text-sm flex justify-center font-poppins">
        Cashflow Data for{" "}
        {selectedDate ? new Date(selectedDate).getFullYear() : "Select Year"}
      </h3>

      {/* Dropdowns for year and filter selection */}
      <div className="flex justify-between my-4 mx-4 gap-4">
        <Select
          value={selectedDate || ""}
          onChange={(value) => setSelectedDate(value)}
          className="desktop:w-1/3 laptop:w-1/2 phone:w-1/2"
        >
          {existingDates.map((date) => {
            const year = new Date(date).getFullYear(); // Extract the year from the date
            return (
              <Option key={date} value={date}>
                {year} {/* Display only the year */}
              </Option>
            );
          })}
        </Select>

        <Select
          value={selectedFilter}
          onChange={(value) => setSelectedFilter(value)}
          className="desktop:w-1/3 laptop:w-1/2 phone:w-1/2"
        >
          {FILTER_OPTIONS.map((filter) => (
            <Option key={filter.key} value={filter.key}>
              {filter.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* Display the bar chart */}
      {filteredData.length > 0 ? (
        <div className="w-full mx-4 desktop:h-[18rem] laptop:h-[20rem] tablet:h-[18rem] phone:h-[18rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
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
                {filteredData.map((entry, index) => (
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
