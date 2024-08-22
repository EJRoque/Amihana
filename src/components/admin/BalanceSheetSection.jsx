import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";

const BalanceSheetSection = ({ data, setData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenV2, setIsOpenV2] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // State to track edit mode
  const [userInputs, setUserInputs] = useState([""]); // Array to handle multiple user inputs

  const togglePaidStatus = (name, month) => {
    if (isEditMode) {
      setData(
        data.map((item) =>
          item.name === name
            ? {
                ...item,
                status: { ...item.status, [month]: !item.status[month] },
              }
            : item
        )
      );
    }
  };

  const handleAddUser = () => {
    const newUsers = userInputs
      .filter((user) => user.trim() !== "")
      .map((user) => ({
        name: user,
        status: {
          Janu: false,
          Febru: false,
          Marc: false,
          Apri: false,
          Ma: false,
          June: false,
          Jul: false,
          Aug: false,
          Septem: false,
          Octo: false,
          Novem: false,
          Decem: false,
          Hoa: false,
        },
      }));

    if (newUsers.length > 0) {
      setData([...data, ...newUsers]);
      setUserInputs([""]); // Reset inputs after adding
      setIsOpenV2(false);
    }
  };

  const handleDeleteUser = (name) => {
    setData(data.filter((user) => user.name !== name));
  };

  const addInputField = () => {
    setUserInputs([...userInputs, ""]); // Add new empty input field
  };

  const removeInputField = (index) => {
    setUserInputs(userInputs.filter((_, i) => i !== index)); // Remove the input field at the specified index
  };

  const handleInputChange = (index, value) => {
    const updatedInputs = [...userInputs];
    updatedInputs[index] = value;
    setUserInputs(updatedInputs);
  };

  return (
    <>
      {!isOpenV2 ? (
        <div className="bg-[#E9F5FE] min-h-[65dvh] flex overflow-y-auto phone:h-[2.5rem] tablet:h-[10rem] laptop:h-[15rem] desktop:h-[20rem] phone:w-[14rem] tablet:w-[38rem] laptop:w-[50rem] desktop:w-[58rem] phone:m-[0.25rem] tablet:m-[0.5rem] laptop:m-[0.75rem] desktop:m-[1rem] rounded-2xl shadow-xl border-2 border-slate-400">
          <div className="w-full p-[0.5rem] tablet:p-[1rem] laptop:p-[1rem] desktop:p-[1.5rem]">
            <div className="flex items-center justify-between w-full phone:space-x-[0.25rem] tablet:space-x-[0.5rem] laptop:space-x-[0.75rem] desktop:space-x-[1rem]">
              <div className="flex items-center p-[0.75rem] text-[0.625rem] phone:px-[0.5rem] tablet:px-[1rem] laptop:px-[1.5rem] desktop:px-[2rem] bg-white shadow-md shadow-gray-500 w-fit rounded-lg mb-3">
                Year 2023
              </div>
              <button
                onClick={() => {
                  setIsOpen(!isOpen);
                  setIsEditMode(!isEditMode); // Toggle edit mode when clicking Edit
                }}
                className="bg-[#0C82B4] font-poppins text-white rounded flex items-center phone:h-[1.25rem] tablet:h-[1.5rem] laptop:h-[2.5rem] desktop:h-[2.5rem] phone:text-[0.4375rem] tablet:text-[0.625rem] laptop:text-[0.875rem] desktop:text-[1rem] phone:px-[0.5rem] tablet:px-[1rem] laptop:px-[1.5rem] desktop:px-[2rem] phone:py-[0.25rem] tablet:py-[0.375rem] laptop:py-[0.5rem] mx-[0.25rem] mr-[0.5rem]"
              >
                {isEditMode ? "Save" : "Edit"}
              </button>
            </div>
            <table className="table-auto bg-white text-center desktop:text-[0.75rem] laptop:text-[10.6px] tablet:text-[6.5px] phone:text-[9px] desktop:w-[55rem] laptop:w-[40rem]">
              <thead>
                <tr>
                  <th className="border border-slate-300 p-[0.5rem]">Name</th>
                  <th className="border border-slate-300 p-[0.5rem]">
                    January
                  </th>
                  <th className="border border-slate-300 p-[0.5rem]">
                    February
                  </th>
                  <th className="border border-slate-300 p-[0.5rem]">March</th>
                  <th className="border border-slate-300 p-[0.5rem]">April</th>
                  <th className="border border-slate-300 p-[0.5rem]">May</th>
                  <th className="border border-slate-300 p-[0.5rem]">June</th>
                  <th className="border border-slate-300 p-[0.5rem]">July</th>
                  <th className="border border-slate-300 p-[0.5rem]">August</th>
                  <th className="border border-slate-300 p-[0.5rem]">
                    September
                  </th>
                  <th className="border border-slate-300 p-[0.5rem]">
                    October
                  </th>
                  <th className="border border-slate-300 p-[0.5rem]">
                    November
                  </th>
                  <th className="border border-slate-300 p-[0.5rem]">
                    December
                  </th>
                  <th className="border border-slate-300 p-[0.5rem]">
                    Hoa Membership
                  </th>
                  {isOpen && <th className="bg-[#E9F5FE]"></th>}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="p-[0.5rem]">
                    <td className="border-2 border-black-800">{item.name}</td>
                    {Object.keys(item.status).map((month) => (
                      <td
                        key={month}
                        onClick={() => togglePaidStatus(item.name, month)}
                        className={`border-2 border-black-800 ${
                          item.status[month]
                            ? "bg-green-600 text-white"
                            : "bg-white"
                        } ${isEditMode ? "cursor-pointer" : "cursor-default"}`} // Conditionally apply cursor style
                      >
                        {item.status[month] ? "Paid" : ""}
                      </td>
                    ))}
                    {isOpen && (
                      <td className="bg-[#E9F5FE]">
                        <button
                          onClick={() => handleDeleteUser(item.name)}
                          className="text-red-600"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="py-[1rem] flex justify-end pr-[0.5rem]">
              {isOpen && (
                <button
                  onClick={() => setIsOpenV2(true)}
                  className="bg-[#0C82B4] font-poppins text-white rounded flex items-center phone:h-[1.25rem] tablet:h-[1.5rem] laptop:h-[2.5rem] desktop:h-[2.5rem] phone:text-[0.4375rem] tablet:text-[0.625rem] laptop:text-[0.875rem] desktop:text-[1rem] phone:px-[0.5rem] tablet:px-[1rem] laptop:px-[1.5rem] desktop:px-[2rem] phone:py-[0.25rem] tablet:py-[0.375rem] laptop:py-[0.5rem] mx-[0.25rem]"
                >
                  Add New Name
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[90%] flex items-start justify-center">
          <div className="flex bg-[#E9F5FE] w-[90%] tablet:w-[75%] laptop:w-[60%] desktop:w-[50%] h-auto mt-[20px] rounded-md shadow-lg p-4 flex-col gap-4">
            <p className="text-lg font-bold">Add name</p>
            <div className="flex flex-col w-full tablet:w-[75%] laptop:w-[50%] gap-2">
              {userInputs.map((input, index) => (
                <div key={index} className="flex items-center gap-2">
                  <label className="bg-[#E7E7E7] border-2 border-black px-2 py-1">
                    Name
                  </label>
                  <input
                    value={input}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className="bg-white border-2 border-black px-2 py-1"
                  />
                  {index > 0 && (
                    <button
                      onClick={() => removeInputField(index)}
                      className="text-red-600"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={addInputField}
                className="bg-[#0C82B4] text-white py-2 px-4 rounded-md"
              >
                Add New Name
              </button>
              <button
                onClick={handleAddUser}
                className="bg-green-500 text-white py-2 px-4 rounded-md"
              >
                Save
              </button>
              <button
                onClick={() => setIsOpenV2(false)}
                className="bg-red-600 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BalanceSheetSection;
