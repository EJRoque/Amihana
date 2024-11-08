import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/admin/Sidebar";
import IncomeStatementGraybar from "../../components/admin/IncomeStateGraybar";
import IncomeStateRecord from "../../components/IncomeStateRecord";
import MobileSidebar from "../../components/admin/MobileSidebar";

function useMobileView() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
const IncomeStatement = ({ incomeStatement, setIncomeStatement }) => {
  const isMobile = useMobileView();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        {isMobile ? ( 
          <div className="fixed top-0 right-0 z-50 m-2 ">
            <MobileSidebar />
          </div>
          
        ) : ( 
          <SidebarAdmin />  
        )}
        <div className="flex-1 flex flex-col mx-4 phone:mx-2 laptop:mx-4 desktop:mx-6 overflow-hidden">
          <IncomeStatementGraybar
            incomeStatement={incomeStatement}
            setIncomeStatement={setIncomeStatement}
          />
          <IncomeStateRecord
            incomeStatement={incomeStatement}
            setIncomeStatement={setIncomeStatement}
          />
        </div>
      </div>
    </div>
  );
};

export default IncomeStatement;
