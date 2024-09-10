import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/admin/Sidebar";
import BalanceSheetGraybarAdmin from "../../components/admin/BalanceSheetGraybarAdmin";
import BalanceSheetSection from "../../components/admin/BalanceSheetSection";

const BalanceSheet = ({ data, setData }) => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    // Simulate data fetch or processing
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  console.log("BalanceSheet data:", data); // Debugging line

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        {/* Sidebar */}
        <SidebarAdmin />

        {/* Main Content */}
        <div className="flex-1 flex flex-col mx-4 phone:mx-2 laptop:mx-4 desktop:mx-6 overflow-hidden">
          {/* Gray bar */}
          <BalanceSheetGraybarAdmin
            data={data}
            setData={setData}
            loading={loading}
            setLoading={setLoading}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />

          {/* Main Section */}
          {!loading && (
            <div className="flex-grow flex flex-col my-2 items-center mx-4 phone:mx-2 laptop:mx-4 desktop:mx-6 overflow-hidden">
              <BalanceSheetSection
                data={data}
                setData={setData}
                selectedYear={selectedYear}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
