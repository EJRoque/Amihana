import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Statistic, Modal, Button } from "antd"; // Import Modal and Button from Ant Design
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
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [isDetailedView, setIsDetailedView] = useState(false); // State to determine which stats to show

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

  // Calculate total values for statistics display
  const calculateTotalStatistics = (data) => {
    return data.reduce((acc, item) => acc + item.value, 0);
  };

  const totalAvailable = calculateTotalStatistics(cashFlowData.totalData);
  const totalDetailed = calculateTotalStatistics(cashFlowData.detailedData);

  const showModal = (isDetailed) => {
    setIsDetailedView(isDetailed);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const isMobileOrTablet = window.innerWidth <= 768; // Check if the screen size is mobile or tablet

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
        <div className="flex flex-col items-center w-full">
          <div className={`flex ${isMobileOrTablet ? "flex-col" : "flex-row"} w-full space-y-8 tablet:space-y-0 tablet:space-x-8`}>
            {/* First Pie Chart: Total Data */}
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
                    onClick={() => {
                      if (isMobileOrTablet) showModal(false); // Show modal for total data only on mobile/tablet
                    }} 
                  >
                    {cashFlowData.totalData.map((entry, index) => (
                      <Cell
                        key={`total-cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Second Pie Chart: Detailed Data */}
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
                    onClick={() => {
                      if (isMobileOrTablet) showModal(true); // Show modal for detailed data only on mobile/tablet
                    }} 
                  >
                    {cashFlowData.detailedData.map((entry, index) => (
                      <Cell
                        key={`detailed-cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistics displayed below pie charts in desktop and laptop view */}
          {!isMobileOrTablet && (
            <div className="flex flex-row justify-between w-full mt-4">
              <div className="border mx-48 rounded-md p-4 bg-gray-50 shadow-md h-[13rem] w-[20rem] mb-4">
                <Statistic
                  title="Total Cash Available"
                  value={cashFlowData.totalData[0]?.value || 0}
                  valueStyle={{ fontSize: '0.9rem' }} // Small font size
                  prefix="₱"
                />
                <Statistic
                  title="Total Cash Paid-out"
                  value={cashFlowData.totalData[1]?.value || 0}
                  valueStyle={{ fontSize: '0.9rem' }} // Small font size
                  prefix="₱"
                />
                <Statistic
                  title="Ending Balance"
                  value={cashFlowData.totalData[2]?.value || 0}
                  valueStyle={{ fontSize: '0.9rem' }} // Small font size
                  prefix="₱"
                />
              </div>
              <div className="border rounded-md mx-48 p-4 h-[13rem] w-[20rem] bg-gray-50 shadow-md">
                <Statistic
                  title="Total Opening Balance"
                  value={totalDetailed} // Total from detailed data
                  valueStyle={{ fontSize: '0.9rem' }} // Small font size
                  prefix="₱"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center">Loading data...</p>
      )}

      {/* Modal for displaying statistics (only visible in mobile/tablet view) */}
      {isMobileOrTablet && (
        <Modal
          title={isDetailedView ? "Detailed Cash Flow Statistics" : "Summary Cash Flow Statistics"}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Close
            </Button>,
          ]}
        >
          {isDetailedView ? (
            <div>
              <Statistic
                title="Total Opening Balance"
                value={totalDetailed} // Total from detailed data
                valueStyle={{ fontSize: '0.9rem' }} // Small font size
                prefix="₱"
              />
            </div>
          ) : (
            <div>
              <Statistic
                title="Total Cash Available"
                value={cashFlowData.totalData[0]?.value || 0}
                valueStyle={{ fontSize: '0.9rem' }} // Small font size
                prefix="₱"
              />
              <Statistic
                title="Total Cash Paid-out"
                value={cashFlowData.totalData[1]?.value || 0}
                valueStyle={{ fontSize: '0.9rem' }} // Small font size
                prefix="₱"
              />
              <Statistic
                title="Ending Balance"
                value={cashFlowData.totalData[2]?.value || 0}
                valueStyle={{ fontSize: '0.9rem' }} // Small font size
                prefix="₱"
              />
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default PieChartCashflow;
