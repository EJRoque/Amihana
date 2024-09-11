import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import incomestatementLogo from "../../assets/icons/income-statement-logo.svg";

//Under development

const IncomeStatementGraybar = ({ incomeStatement, setIncomeStatement }) => {
  return (
    <div className="bg-[#EAEBEF] flex items-center desktop:h-16 laptop:h-16 phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 border-2 border-slate-400 rounded-md shadow-xl">
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1 className="text-[#0C82B4] my-auto font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
            Income Statement
          </h1>
          <img
            src={incomestatementLogo}
            alt="Income Statement Logo"
            className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
          />
        </div>
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2">
          <button
            className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 mr-1 rounded flex items-center"
            onClick={"handleOpenModal"}
          >
            Add new
          </button>
          <select
            className="bg-[#5D7285] font-poppins desktop:h-10 desktop:w-[8rem] laptop:h-10 laptop:w-[7.5rem] tablet:h-6 tablet:w-[5.5rem] phone:h-5 phone:w-[4.5rem] desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded phone:mr-1 flex items-center"
            onChange={"handleSelectDate"}
            value={incomeStatement.date}
          >
            <option value="" disabled>
              Select date
            </option>
            {/* {existingDates.map((date, index) => (
              <option key={index} value={date}>
                {date}
              </option>
            ))} */}
          </select>
          <button
            className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded flex items-center"
            onClick={"printTable"}
          >
            Print
          </button>
        </div>
      </div>

      {/* Modal */}
      {/* <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto mt-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold mb-4">
                Add New Cash Flow Record
              </h2>
              <button
                className="absolute top-2 right-2 text-right"
                onClick={handleCloseModal}
              >
                <img src={closeIcon} alt="Close Icon" className="h-5 w-5" />
              </button>
            </div>
            <input
              type="date"
              className="border border-gray-300 p-2 rounded-lg w-full"
              value={cashFlow.date}
              onChange={handleDateChange}
            />
            <div className="border border-gray-300 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Opening Balance</h3>
              {renderInputs("openingBalance")}
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                  onClick={() => handleAddInput("openingBalance")}
                >
                  Add New
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleRemoveInput("openingBalance")}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="border border-gray-300 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Add: Cash Receipts</h3>
              {renderInputs("cashReceipts")}
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                  onClick={() => handleAddInput("cashReceipts")}
                >
                  Add New
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleRemoveInput("cashReceipts")}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="border border-gray-300 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Less: Cash Paid-out</h3>
              {renderInputs("cashPaidOut")}
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                  onClick={() => handleAddInput("cashPaidOut")}
                >
                  Add New
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleRemoveInput("cashPaidOut")}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Compute
              </button>
            </div>
          </form>
        </div>
      </Modal> */}
    </div>
  );
};

export default IncomeStatementGraybar;
