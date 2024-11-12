import React, { useState, useEffect } from "react";
import balanceSheetLogo from "../../assets/icons/balance-sheet-logo.svg";
import { db } from "../../firebases/FirebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import amihanaLogo from "../../assets/images/amihana-logo.png"; // Your imported log

const BalanceSheetGraybarAdmin = ({ selectedYear, setSelectedYear }) => {
  const [years, setYears] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "balanceSheetRecord"));
        const availableYears = querySnapshot.docs.map(doc => doc.id);
        setYears(availableYears);
      } catch (error) {
        console.error("Error fetching years from Firestore:", error);
      }
    };

    fetchYears();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserName(userDocSnap.data().fullName);
        } else {
          console.error("User document does not exist.");
          setUserName("Guest");
        }
      } else {
        console.error("No user is logged in.");
        setUserName("Guest");
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  const handlePrint = () => {
    const printContents = document.getElementById("printable-area").innerHTML;
    const userPrintInfo = `<div style="margin-top: 40px; text-align: right; font-size: 14px; color: #666;">Printed by: ${userName || "Guest"}</div>`;
  
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Balance Sheet</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              background-color: #fff;
            }
            .report-header {
              position: relative;
              text-align: center;
              color: #0C82B4;
              margin-bottom: 20px;
            }
            .report-logo {
              position: absolute;
              top: 0;
              left: 10px;
              width: 100px;
              height: auto;
            }
            .report-title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .report-subtitle {
              font-size: 10px;
              font-weight: normal;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: center;
            }
            th {
              background-color: #0C82B4;
              color: #fff;
              font-weight: bold;
            }
            td {
              background-color: #f9f9f9;
            }
            .totals {
              font-weight: bold;
              color: #0C82B4;
            }
            .footer {
              margin-top: 40px;
              text-align: right;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <img src="${amihanaLogo}" class="report-logo" alt="Amihana Logo" />
            <div class="report-title">Balance Sheet Report</div>
            <div class="report-subtitle">Butaw Collection and HOA Membership</div>
          </div>
          <div>${printContents}</div>
          ${userPrintInfo}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  

  return (
    <div className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1 className={`text-[#0C82B4] my-auto font-poppins ${sidebarOpen ? "desktop:text-sm laptop:text-sm tablet:text-xs phone:text-[8px]" : "desktop:text-base laptop:text-base tablet:text-sm phone:text-[10px]"} phone:ml-1 capitalize`}>
            Balance Sheet
          </h1>
          <img
            src={balanceSheetLogo}
            className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
          />
        </div>

        <div className="flex items-center">
          <select
            id="year-select"
            className="bg-[#5D7285] font-poppins desktop:h-10 desktop:w-[8rem] laptop:h-10 laptop:w-[7.5rem] tablet:h-6 tablet:w-[5.5rem] phone:h-5 phone:w-[4.5rem] desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded phone:mr-1 flex items-center"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="" disabled>Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded flex items-center"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetGraybarAdmin;
