import React from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/admin/Sidebar";
import IncomeStatementGraybar from "../../components/admin/IncomeStateGraybar";
import IncomeStateReocrd from "../../components/IncomeStateRecord";

const IncomeStatement = ({ incomeStatement, setIncomeStatement }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        <SidebarAdmin />
        <div className="flex-grow flex flex-col ml-2">
          <IncomeStatementGraybar
            incomeStatement={incomeStatement}
            setIncomeStatement={setIncomeStatement}
          />
          <IncomeStateReocrd
            incomeStatement={incomeStatement}
            setIncomeStatement={setIncomeStatement}
          />
        </div>
      </div>
    </div>
  );
};

export default IncomeStatement;
