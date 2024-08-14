import React from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/admin/Sidebar";
import BalanceSheetGraybarAdmin from "../../components/admin/BalanceSheetGraybarAdmin";
const BalanceSheet = () => {
      return (
            // Under development ... wait lang po 😺
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
                  <Header />
                  <div className="flex flex-grow">
                        <SidebarAdmin />
                        <div className="flex-grow flex flex-col ml-1">
                              <BalanceSheetGraybarAdmin />

                        </div>
                  </div>
            </div>
      );
};

export default BalanceSheet