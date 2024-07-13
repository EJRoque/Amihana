import React, { useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import CashflowGraybar from "../../components/CashflowGraybar";
import CashflowRecord from "../../components/CashflowRecord";

const CashFlow = () => {
  const [cashFlow, setCashFlow] = useState({
    date: "",
    openingBalance: [{ description: "", amount: "" }],
    cashReceipts: [{ description: "", amount: "" }],
    cashPaidOut: [{ description: "", amount: "" }],
    totalCashAvailable: { description: "Total Cash Available", amount: "" },
    totalCashPaidOut: { description: "Total Cash Paid-out", amount: "" },
    endingBalance: { description: "Ending Balance", amount: "" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-grow flex flex-col ml-2">
          <CashflowGraybar cashFlow={cashFlow} setCashFlow={setCashFlow} />
          <CashflowRecord cashFlow={cashFlow} />
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
