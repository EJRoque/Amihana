import React, { useState, useEffect } from "react";
import balanceSheetLogo from "../../assets/icons/balance-sheet-logo.svg";
import { db } from "../../firebases/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const BalanceSheetGraybarAdmin = ({ selectedYear, setSelectedYear }) => {
  const [years, setYears] = useState([]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "balanceSheetRecord"));
        const availableYears = querySnapshot.docs.map(doc => doc.id); // Assuming year is stored as the document ID
        setYears(availableYears);
      } catch (error) {
        console.error("Error fetching years from Firestore:", error);
      }
    };

    fetchYears();
  }, []);

  return (
    <div className="bg-[#FFFF] flex items-center desktop:h-16 laptop:h-16 phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 rounded-lg shadow-xl">
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1 className="text-[#0C82B4] font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
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
            onClick={() => window.print()} // Add your print functionality here
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetGraybarAdmin;