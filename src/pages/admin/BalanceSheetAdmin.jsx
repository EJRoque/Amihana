import { useState } from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/admin/Sidebar";
import BalanceSheetGraybarAdmin from "../../components/admin/BalanceSheetGraybarAdmin";
import BalanceSheetSection from "../../components/admin/BalanceSheetSection";

const BalanceSheet = ({ data, setData, cashFlow, setCashFlow }) => {
  // pagawa po functional date ng balance sheet ty 💓
  const [loading, setLoading] = useState(true);
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        <SidebarAdmin />
        <div className="flex-grow flex flex-col ml-1">
          <BalanceSheetGraybarAdmin
            cashFlow={cashFlow}
            setCashFlow={setCashFlow}
            loading={loading}
            setLoading={setLoading}
          />

          {!loading && (
            <div className="flex justify-center">
              <BalanceSheetSection data={data} setData={setData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
