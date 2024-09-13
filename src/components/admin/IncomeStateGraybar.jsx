import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import incomestatementLogo from "../../assets/icons/income-statement-logo.svg";
import closeIcon from "../../assets/icons/close-icon.svg";
import {
  addIncomeStatementRecord,
  fetchIncomeStateDates,
  fetchIncomeStateRecord,
} from "../../firebases/firebaseFunctions";

//Under development

const IncomeStatementGraybar = ({ incomeStatement, setIncomeStatement }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingDates, setExistingDates] = useState([]);

  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const dates = await fetchIncomeStateDates();
        setExistingDates(dates);
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    };
    getExistingDates();
  }, []);



  const handleSelectDate = async (event) => {
    const selectedDate = event.target.value;
    setIncomeStatement((prevIncomeStatement) => ({
      ...prevIncomeStatement,
      date: selectedDate,
    }));

    try {
      const incomeStateData = await fetchIncomeStateRecord(selectedDate);
      setIncomeStatement((prevIncomeStatement) => ({
        ...prevIncomeStatement,
        ...incomeStateData,
      }));
    } catch (error) {
      console.error("Error fetching cash flow record:", error);
    }
  };



  const handleOpenModal = () => {
    setIncomeStatement({
      date: "",
      incomeRevenue: [{ description: "", amount: "" }],
      incomeExpenses: [{ description: "", amount: "" }],
      totalRevenue: { description: "Total Revenue", amount: "" },
      totalExpenses: { description: "Total Expenses", amount: "" },
      netIncome: { description: "Net Income", amount: "" },
    });
    console.log(incomeStatement); // Ensure it's set correctly
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const totalRevenue = calculateTotal("incomeRevenue");
    const totalExpenses = calculateTotal("incomeExpenses");
    const netIncome = (
      parseFloat(totalRevenue) - parseFloat(totalExpenses)
    ).toFixed(2);

    const updatedIncomeStatement = {
      ...incomeStatement,
      totalRevenue: {
        description: "Total Revenue",
        amount: totalRevenue,
      },
      totalExpenses: {
        description: "Total Expenses",
        amount: totalExpenses,
      },
      netIncome: { description: "Net Income", amount: netIncome },
    };

    setIncomeStatement(updatedIncomeStatement);

    // Save to Firebase
    try {
      await addIncomeStatementRecord(updatedIncomeStatement);
      console.log("Data saved to Firebase:", updatedIncomeStatement);
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
    }

    handleCloseModal();
  };

  const handleAddNew = (section, newItem) => {
    setIncomeStatement(prevIncomeStatement => {
      return {
        ...prevIncomeStatement,
        [section]: [...(prevIncomeStatement[section] || []), newItem], // Default to an empty array if undefined
      };
    });
  };

  const handleDateChange = (event) => {
    const date = new Date(event.target.value);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setIncomeStatement((prevIncomeStatement) => ({
      ...prevIncomeStatement,
      date: formattedDate,
    }));

    // Update the existing dates list if the new date doesn't already exist
    if (!existingDates.includes(formattedDate)) {
      setExistingDates((prevDates) => [...prevDates, formattedDate]);
    }
  };

  const renderInputs = (section) => {
    return (incomeStatement?.[section] || []).map((input, index) => (
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

  const calculateTotal = (section) => {
    return incomeStatement[section]
      .reduce((total, item) => total + parseFloat(item.amount || 0), 0)
      .toFixed(2);
  };

  const handleChangeInput = (section, index, event) => {
    const { name, value } = event.target;
    setIncomeStatement((prevIncomeStatement) => {
      const newSection = [...prevIncomeStatement[section]];
      newSection[index][name] = value;
      return {
        ...prevIncomeStatement,
        [section]: newSection,
      };
    });
  };

  const handleAddInput = (section) => {
    setIncomeStatement((prevIncomeStatement) => ({
      ...prevIncomeStatement,
      [section]: [...prevIncomeStatement[section], { description: "", amount: "" }],
    }));
  };

  const handleRemoveInput = (section) => {
    setIncomeStatement((prevIncomeStatement) => ({
      ...prevIncomeStatement,
      [section]: prevIncomeStatement[section].slice(0, -1),
    }));
  };



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
            onClick={handleOpenModal}
          >
            Add new
          </button>
          <select
            className="bg-[#5D7285] font-poppins desktop:h-10 desktop:w-[8rem] laptop:h-10 laptop:w-[7.5rem] tablet:h-6 tablet:w-[5.5rem] phone:h-5 phone:w-[4.5rem] desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded phone:mr-1 flex items-center"
            onChange={handleSelectDate}
            value={incomeStatement.date}
          >
            <option value="" disabled>
              Select date
            </option>
             {existingDates.map((date, index) => (
              <option key={index} value={date}>
                {date}
              </option>
            ))} 
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
       <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto mt-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold mb-4">
                Add New Income Statment Record
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
              value={incomeStatement.date}
              onChange={handleDateChange}
            />
            <div className="border border-gray-300 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Revenue</h3>
              {renderInputs("incomeRevenue")}
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                  onClick={() => handleAddInput("incomeRevenue")}
                >
                  Add New
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleRemoveInput("incomeRevenue")}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="border border-gray-300 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Expenses</h3>
              {renderInputs("incomeExpenses")}
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                  onClick={() => handleAddInput("incomeExpenses")}
                >
                  Add New
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleRemoveInput("incomeExpenses")}
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
      </Modal> 
    </div>
  );
};

export default IncomeStatementGraybar;
