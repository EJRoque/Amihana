import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/admin/Sidebar";
import BalanceSheetGraybarAdmin from "../../components/admin/BalanceSheetGraybarAdmin";
import BalanceSheetSection from "../../components/admin/BalanceSheetSection";

const BalanceSheet = ({ data, setData }) => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(""); // Define selectedYear and setSelectedYear state

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
        <SidebarAdmin />
        <div className="flex-grow flex flex-col ml-1">
          <BalanceSheetGraybarAdmin
            data={data}
            setData={setData}
            loading={loading}
            setLoading={setLoading}
            selectedYear={selectedYear} // Pass selectedYear as a prop
            setSelectedYear={setSelectedYear} // Pass setSelectedYear as a prop
          />
          {!loading && (
            <div className="flex justify-center">
              <BalanceSheetSection data={data} setData={setData} selectedYear={selectedYear} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
