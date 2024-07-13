import React, { useState } from "react";
import cashflowLogo from "../assets/icons/cash-flow-logo.svg";
import arrowDown from "../assets/icons/arrow-down.svg";
import CashflowModal from "./CashflowModal";
import closeIcon from "../assets/icons/close-icon.svg";

const CashflowGraybar = ({ cashFlow, setCashFlow }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddInput = (section) => {
    setCashFlow((prevCashFlow) => ({
      ...prevCashFlow,
      [section]: [...prevCashFlow[section], { description: "", amount: "" }],
    }));
  };

  const handleRemoveInput = (section) => {
    setCashFlow((prevCashFlow) => ({
      ...prevCashFlow,
      [section]: prevCashFlow[section].slice(0, -1),
    }));
  };

  const handleChangeInput = (section, index, event) => {
    const { name, value } = event.target;
    setCashFlow((prevCashFlow) => {
      const newSection = [...prevCashFlow[section]];
      newSection[index][name] = value;
      return {
        ...prevCashFlow,
        [section]: newSection,
      };
    });
  };

  const handleDateChange = (event) => {
    setCashFlow((prevCashFlow) => ({
      ...prevCashFlow,
      date: event.target.value,
    }));
  };

  const calculateTotal = (section) => {
    return cashFlow[section]
      .reduce((total, item) => total + parseFloat(item.amount || 0), 0)
      .toFixed(2);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const totalOpeningBalance = calculateTotal("openingBalance");
    const totalCashReceipts = calculateTotal("cashReceipts");
    const totalCashPaidOut = calculateTotal("cashPaidOut");
    const totalCashAvailable = (
      parseFloat(totalOpeningBalance) + parseFloat(totalCashReceipts)
    ).toFixed(2);
    const endingBalance = (
      parseFloat(totalCashAvailable) - parseFloat(totalCashPaidOut)
    ).toFixed(2);

    setCashFlow((prevCashFlow) => ({
      ...prevCashFlow,
      totalCashAvailable: {
        description: "Total Cash Available",
        amount: totalCashAvailable,
      },
      totalCashPaidOut: {
        description: "Total Cash Paid-out",
        amount: totalCashPaidOut,
      },
      endingBalance: { description: "Ending Balance", amount: endingBalance },
    }));

    console.log({
      ...cashFlow,
      totalCashAvailable: {
        description: "Total Cash Available",
        amount: totalCashAvailable,
      },
      totalCashPaidOut: {
        description: "Total Cash Paid-out",
        amount: totalCashPaidOut,
      },
      endingBalance: { description: "Ending Balance", amount: endingBalance },
    });
    handleCloseModal();
  };

  const renderInputs = (section) => {
    return cashFlow[section].map((input, index) => (
      <div key={index} className="flex space-x-2 mb-2">
        <input
          type="text"
          name="description"
          value={input.description}
          onChange={(e) => handleChangeInput(section, index, e)}
          className="flex-1 border border-gray-300 p-2 rounded"
          placeholder="Description"
        />
        <input
          type="number"
          name="amount"
          value={input.amount}
          onChange={(e) => handleChangeInput(section, index, e)}
          className="w-32 border border-gray-300 p-2 rounded"
          placeholder="Amount"
        />
      </div>
    ));
  };

  return (
    <div className="bg-[#EAEBEF] flex items-center desktop:h-16 laptop:h-16 phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 border-2 border-slate-400 rounded-md shadow-xl">
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1 className="text-[#0C82B4] font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
            Cash flow record
          </h1>
          <img
            src={cashflowLogo}
            alt="Cash flow Logo"
            className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
          />
        </div>
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2">
          <button
            className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 mr-1 rounded flex items-center"
            onClick={handleOpenModal}
          >
            Add new
          </button>
          <button className="bg-[#5D7285] font-poppins desktop:h-10 laptop:h-10 tablet:h-6  phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded phone:mr-1 flex items-center">
            Select date
            <img
              src={arrowDown}
              alt="Arrow down Logo"
              className="desktop:h-4 desktop:w-4 laptop:h-4 laptop:w-4 phone:h-2 phone:w-2 desktop:ml-2 laptop:ml-2 phone:ml-1"
            />
          </button>
        </div>
      </div>

      {/* Modal */}
      <CashflowModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
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

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#0C82B4] text-white px-4 py-2 rounded"
              >
                Compute
              </button>
            </div>
          </form>
        </div>
      </CashflowModal>
    </div>
  );
};

export default CashflowGraybar;
