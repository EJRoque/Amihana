import React from "react";
import Header from "../../components/Header";
import SidebarHomeOwners from "../../components/home-owners/Sidebar";
import BalanceSheetGraybar from "../../components/home-owners/BalanceSheetGraybar";
import BalanceSheetSection from "../../components/home-owners/BalanceSheetSection";
const BalanceSheet = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        <SidebarHomeOwners />
        <div className="flex-grow flex flex-col gap-5 ml-1">
          <BalanceSheetGraybar />
          <div className="flex justify-center">
            <BalanceSheetSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
