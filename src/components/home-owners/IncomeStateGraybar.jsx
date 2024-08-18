import React from "react";
import incomestatementLogo from "../../assets/icons/income-statement-logo.svg";

//Under development


const IncomeStatementGraybar = ({ incomeState, setIncomeState }) => {
  return (
    <div className="bg-[#FFFF] flex items-center desktop:h-16 laptop:h-16 phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 rounded-lg shadow-xl">
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center ml-3 desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1 className="text-[#0C82B4] font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
            Income Statement
          </h1>
          <img
            src={incomestatementLogo}
            alt="Income Statement Logo"
            className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
          />
        </div>
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2"></div>
      </div>
    </div>
  );
};

export default IncomeStatementGraybar;
