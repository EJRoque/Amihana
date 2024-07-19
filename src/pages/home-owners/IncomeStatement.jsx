import React from "react";
import Header from "../../components/Header";
import SidebarHomeOwner from "../../components/home-owners/Sidebar";
import IncomeStatementGraybar from "../../components/home-owners/IncomeStateGraybar";
//Under development
const IncomeStatement = ({ incomeState, setIncomeState }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        <SidebarHomeOwner />
        <div className="flex-grow flex flex-col ml-2">
          <IncomeStatementGraybar incomeState={incomeState} setIncomeState={setIncomeState} />
        </div>
      </div>
    </div>
  );
};

export default IncomeStatement;
