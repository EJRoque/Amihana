import React from "react";
import Dashboard_Graph from "./Dashboard_Graph";
import BarChartIncomeState from "./BarChartIncomeState";
import PieChartCashflow from "./PieChartCashflow";

export default function DashboardSection() {
  return (
    <>
      <div
        className="
          grid 
          desktop:grid-cols-2 laptop:grid-cols-2 tablet:grid-cols-1 phone:grid-cols-1 
          gap-4
          desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1
        "
      >
        {/* First box */}
        <div className="bg-gray-100 shadow-md w-auto h-auto rounded-lg">
          
          <Dashboard_Graph />
        </div>

        {/* Second box */}
        <div className="bg-gray-100 shadow-md w-auto h-auto rounded-lg">
          <BarChartIncomeState />
        </div>

        {/* Third box: spans both columns on larger screens, adjusts height on smaller screens */}
        <div
          className="
          bg-gray-100 shadow-md w-full rounded-lg 
          desktop:col-span-2 laptop:col-span-2
          desktop:h-[35rem] laptop:h-[32rem] tablet:h-auto tablet:py-6 phone:h-auto phone:py-4
        "
        >
          <PieChartCashflow />
        </div>
      </div>
    </>
  );
}
