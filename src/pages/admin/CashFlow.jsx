import React, { useState } from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/admin/Sidebar";
import CashflowGraybar from "../../components/admin/CashflowGraybar";
import CashflowRecord from "../../components/CashflowRecord";

const CashFlow = ({ cashFlow, setCashFlow }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        <SidebarAdmin />
        <div className="flex-grow flex flex-col ml-2">
          <CashflowGraybar cashFlow={cashFlow} setCashFlow={setCashFlow} />
          <CashflowRecord cashFlow={cashFlow} setCashFlow={setCashFlow} />
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
