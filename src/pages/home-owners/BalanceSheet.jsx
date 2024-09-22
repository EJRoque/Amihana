import React, { useState, useEffect } from "react";
import { fetchUserFullName, fetchBalanceSheetRecord } from "../../firebases/firebaseFunctions";
import { getAuth } from "firebase/auth";
import Header from "../../components/Header";
import SidebarHomeOwner from "../../components/home-owners/Sidebar";
import BalanceSheetGraybarAdmin from "../../components/home-owners/BalanceSheetGraybar";
import BalanceSheetSection from "../../components/home-owners/BalanceSheetSection";
import MobileSidebar from "../../components/home-owners/MobileSidebarHOA";

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

const BalanceSheet = () => {
  const [fullName, setFullName] = useState('');
  const [balanceSheetRecord, setBalanceSheetRecord] = useState({});
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const isMobile = useMobileView();

  useEffect(() => {
    console.log('Selected year:', selectedYear); // Log selectedYear
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const fullName = await fetchUserFullName(user.uid);
          setFullName(fullName);

          // Fetch balance sheet record for the selected year
          const record = await fetchBalanceSheetRecord(fullName, selectedYear);
          setBalanceSheetRecord(record);
        }
      } catch (error) {
        setError('Error fetching user data');
        console.error('Error:', error);
      }
    };
  
    fetchUserData();
  }, [selectedYear]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
      {isMobile ? ( 
          <div className="fixed top-0 right-0 z-50 m-2 ">
            <MobileSidebar />
          </div>
          
        ) : (
            <SidebarHomeOwner />
        )}
        <div className="flex-grow flex flex-col gap-5 ml-1">
          <BalanceSheetGraybarAdmin 
          selectedYear={selectedYear} 
          setSelectedYear={setSelectedYear} />
          <div className="flex justify-center">
            <BalanceSheetSection balanceSheetRecord={balanceSheetRecord}  selectedYear={selectedYear}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;