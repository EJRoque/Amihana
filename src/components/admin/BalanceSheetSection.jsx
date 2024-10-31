import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import Modal from "./Modal";
import { db } from "../../firebases/FirebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteField,
  onSnapshot
} from "firebase/firestore";
import { Button, notification } from "antd"; // Import Button from Ant Design
import { ClipLoader } from "react-spinners"; // Import the spinner

const BalanceSheetSection = ({ selectedYear, setData }) => {
  const [data, setDataState] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userInputs, setUserInputs] = useState([""]);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [hoaMembershipAmount, setHoaMembershipAmount] = useState(0);
  
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Hoa",
  ];

  const [amounts, setAmounts] = useState({
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
    Hoa: 0,
  });

  const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Handle Amount Changes
const handleAmountChange = (month, value) => {
  setAmounts((prevAmounts) => ({
    ...prevAmounts,
    [month]: parseFloat(value) || 0,
  }));
};

const handleHoaMembershipChange = (value) => {
  setHoaMembershipAmount(parseFloat(value) || 0);
};

 
  // Save Monthly and HOA Membership Amounts to Firestore
  const saveMonthlyAmounts = async () => {
    if (!selectedYear) {
      notification.warning({ message: "Please select a year first!" });
      return;
    }

    try {
      const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
      await setDoc(
        yearDocRef,
        { 
          monthlyAmounts: amounts,
          hoaMembershipAmount,
        },
        { merge: true }
      );

      notification.success({ message: "Monthly and HOA amounts saved successfully!" });
    } catch (error) {
      console.error("Error saving amounts:", error);
      notification.error({ message: "Error saving amounts" });
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = () => setIsModalOpen(true);

  useEffect(() => {
    if (setData) {
      setData(data); // Pass the data to the parent component
    }
  }, [data, setData]);

// Fetch data for the selected year and set amounts
  useEffect(() => {
    if (selectedYear) {
      const fetchYearData = async () => {
        try {
          const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
          const docSnapshot = await getDoc(yearDocRef);

          if (docSnapshot.exists()) {
            const yearData = docSnapshot.data();
            const orderedMonthlyAmounts = monthsOrder.reduce((acc, month) => {
              acc[month] = yearData.monthlyAmounts?.[month] || 0;
              return acc;
            }, {});

            setAmounts(orderedMonthlyAmounts);
            setHoaMembershipAmount(yearData.hoaMembershipAmount || 0);
            setDataState(yearData.Name || {});
          } else {
            setAmounts(monthsOrder.reduce((acc, month) => ({ ...acc, [month]: 0 }), {}));
            setHoaMembershipAmount(0);
            setDataState({});
          }
        } catch (error) {
          console.error("Error fetching year data:", error);
        }
      };

      fetchYearData();
    }
  }, [selectedYear]);


  const togglePaidStatus = async (name, month, isHoa = false) => {
    if (isEditMode && data[name]) {
      const newPaidStatus = isHoa ? !data[name].Hoa?.paid : !data[name][month]?.paid;
      const updatedData = {
        ...data,
        [name]: {
          ...data[name],
          [month]: isHoa ? data[name][month] : {
            paid: newPaidStatus,
            amount: newPaidStatus ? amounts[month] : 0,
          },
          Hoa: isHoa
            ? {
                paid: newPaidStatus,
                amount: newPaidStatus ? hoaMembershipAmount : 0,
              }
            : data[name].Hoa,
        },
      };
  
      setDataState(updatedData);
  
      try {
        const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
        if (isHoa) {
          await updateDoc(yearDocRef, {
            [`Name.${name}.Hoa.paid`]: newPaidStatus,
            [`Name.${name}.Hoa.amount`]: newPaidStatus ? hoaMembershipAmount : 0,
          });
        } else {
          await updateDoc(yearDocRef, {
            [`Name.${name}.${month}.paid`]: newPaidStatus,
            [`Name.${name}.${month}.amount`]: newPaidStatus ? amounts[month] : 0,
          });
        }
  
        notification.success({
          message: `${isHoa ? "HOA" : month} status updated successfully for ${name}`,
        });
      } catch (error) {
        console.error("Error updating Firestore:", error);
        notification.error({
          message: `Error updating ${isHoa ? "HOA" : month} status for ${name}`,
        });
      }
    }
  };

  const handleDeleteUser = async (name) => {
    if (!selectedYear) return;

    setDataState((prevData) => {
      const updatedData = { ...prevData };
      delete updatedData[name];
      return updatedData;
    });

    try {
      const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
      await updateDoc(yearDocRef, {
        [`Name.${name}`]: deleteField(),
      });
    } catch (error) {
      console.error("Error deleting user from Firestore:", error);
    }
  };

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    setUserInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];
      updatedInputs[index] = value;
      return updatedInputs;
    });
  };

  const handleRemoveUserInput = (index) => {
    setUserInputs((prevInputs) => {
      const updatedInputs = prevInputs.filter((_, i) => i !== index);
      return updatedInputs;
    });
  };

  // Filter data based on search term
  const filteredData = Object.entries(data).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <section className="bg-white rounded-lg w-full shadow-md border-2 p-4 space-y-6 mx-auto">
  <div className="space-y-6">
    {/* Header Section */}
    <div className="flex justify-between items-center border-b pb-4">
      <h1 className="text-xl font-bold">
        Butaw Collection and HOA Membership {selectedYear}
      </h1>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        />
        <Button
          type="primary"
          className="bg-[#0C82B4] text-white rounded text-sm transition-transform transform hover:scale-105"
          onClick={() => setIsEditMode((prevMode) => !prevMode)}
        >
          {isEditMode ? "Save" : "Edit"}
        </Button>
        {isEditMode && (
          <Button
            type="primary"
            className="bg-green-500 text-white rounded text-sm transition-transform transform hover:scale-105"
            onClick={handleOpenModal}
          >
            Add New User
          </Button>
        )}
      </div>
    </div>

     {/* Adjust Monthly Amounts Section */}
     <div className="border-b pb-4">
          <h2 className="text-lg font-semibold">Adjust Monthly Amounts</h2>
          <div className="grid grid-cols-4 gap-4 mt-2">
            {Object.keys(amounts).map((month) => (
              <div key={month} className="flex flex-col">
                <label className="font-semibold">{month}</label>
                <input
                  type="number"
                  value={amounts[month]}
                  onChange={(e) => handleAmountChange(month, e.target.value)}
                  className="border px-3 py-2 rounded text-sm"
                  disabled={!selectedYear}
                />
              </div>
            ))}
            <div className="flex flex-col">
              <label className="font-semibold">HOA Membership</label>
              <input
                type="number"
                value={hoaMembershipAmount}
                onChange={(e) => handleHoaMembershipChange(e.target.value)}
                className="border px-3 py-2 rounded text-sm"
                disabled={!selectedYear}
              />
            </div>
          </div>
          <Button
            type="primary"
            className="mt-4 bg-blue-500 text-white rounded text-sm transition-transform transform hover:scale-105"
            onClick={saveMonthlyAmounts}
            disabled={!selectedYear}
          >
            Save Monthly Amounts
          </Button>
        </div>

    {/* Balance Sheet Table Section */}
    <div id="balance-sheet-section" className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            {months.map((month) => (
              <th key={month} className="border px-2 py-1">
                {month}
              </th>
            ))}
            {isEditMode && (
              <th className="border px-2 py-1">Delete</th>
            )}
          </tr>
        </thead>
        <tbody>
  {filteredData
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .map(([name, status]) => (
      <tr key={name}>
        <td className="border px-2 py-1 whitespace-nowrap overflow-hidden">
          {name}
        </td>
        {months.map((month) => (
          <td
            key={month}
            className={`border px-2 py-1 text-center cursor-pointer ${
              status[month]?.paid ? "bg-green-200" : ""
            }`}
            onClick={() => togglePaidStatus(name, month, month === "Hoa")}
          >
            {status[month]?.paid
              ? `${month === "Hoa" ? `Paid` : "Paid"}`
              : ""}
          </td>
        ))}
        {isEditMode && (
          <td className="border px-2 py-1 text-center">
            <FaTrash
              className="inline cursor-pointer text-red-500"
              onClick={() => handleDeleteUser(name)}
            />
          </td>
        )}
      </tr>
    ))}
</tbody>
      </table>
    </div>
  </div>

  {/* Add New User Modal */}
  {isModalOpen && (
    <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
      <div className="bg-white p-4 max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New User</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <ClipLoader color="#0C82B4" loading={isLoading} size={50} />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {userInputs.map((input, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`User ${index + 1}`}
                  />
                  <button
                    onClick={() => handleRemoveUserInput(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setUserInputs((prevInputs) => [...prevInputs, ""])}
                className="text-blue-500 hover:text-blue-700"
              >
                + Add Another User
              </button>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add User
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )}
</section>
    </>
  );
};

export default BalanceSheetSection;
