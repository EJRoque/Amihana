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
} from "firebase/firestore";

const BalanceSheetSection = ({ selectedYear }) => {
  const [data, setData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userInputs, setUserInputs] = useState([""]);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Hoa"
  ];

  // Function to close the modal
  const handleCloseModal = () => setIsModalOpen(false);

  // Function to open the modal
  const handleOpenModal = () => setIsModalOpen(true);

  // Fetch data whenever selectedYear changes
  useEffect(() => {
    const fetchData = async () => {
      if (selectedYear) {
        try {
          const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
          const yearDoc = await getDoc(yearDocRef);
  
          if (yearDoc.exists()) {
            const fetchedData = yearDoc.data().Name || {};
            setData(fetchedData);
          } else {
            setData({});
          }
        } catch (error) {
          console.error("Error fetching data from Firestore:", error);
        }
      }
    };
  
    fetchData();
  }, [selectedYear]);

  const togglePaidStatus = async (name, month) => {
    console.log("Toggling status for", name, "in month", month); // Debug log
  
    if (isEditMode && data[name]) {
      const newStatus = !data[name][month]; // Toggle status
      const updatedData = {
        ...data,
        [name]: {
          ...data[name],
          [month]: newStatus,
        },
      };
      setData(updatedData); // Update local state
  
      try {
        const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
        await updateDoc(yearDocRef, {
          [`Name.${name}.${month}`]: newStatus, // Ensure the path is correct
        });
        console.log(`Updated ${name}'s ${month} status to`, newStatus ? "Paid" : "Not Paid");
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }
    }
  };

  const handleAddUser = async () => {
    if (!selectedYear) {
      alert("Please select a year first!");
      return;
    }

    const newUsers = userInputs
      .filter(user => user.trim() !== "")
      .reduce((acc, user) => {
        acc[user] = months.reduce((monthAcc, month) => {
          monthAcc[month] = false;
          return monthAcc;
        }, {});
        return acc;
      }, {});

    if (Object.keys(newUsers).length > 0) {
      try {
        const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
        await setDoc(yearDocRef, { Name: { ...data, ...newUsers } }, { merge: true });

        setData(prevData => ({ ...prevData, ...newUsers })); // Update state after adding new users
        setUserInputs([""]); // Clear the input field
        setIsModalOpen(false); // Close modal after saving
        console.log("New users added successfully:", newUsers);
      } catch (error) {
        console.error("Error adding new users:", error);
      }
    }
  };

  const handleDeleteUser = async (name) => {
    if (!selectedYear) return;

    setData(prevData => {
      const updatedData = { ...prevData };
      delete updatedData[name];
      return updatedData;
    });

    try {
      const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
      await updateDoc(yearDocRef, {
        [`Name.${name}`]: deleteField(), // Ensure the path is correct
      });
      console.log(`Deleted user ${name} successfully.`);
    } catch (error) {
      console.error("Error deleting user from Firestore:", error);
    }
  };

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    setUserInputs(prevInputs => {
      const updatedInputs = [...prevInputs];
      updatedInputs[index] = value;
      return updatedInputs;
    });
  };

  const handleRemoveUserInput = (index) => {
    setUserInputs(prevInputs => {
      const updatedInputs = prevInputs.filter((_, i) => i !== index);
      return updatedInputs;
    });
  };

  return (
    <>
      <section className="bg-white rounded-lg drop-shadow-md border-2 p-5 phone:w-[14rem] tablet:w-[38rem] laptop:w-[51rem] desktop:w-[72rem] space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-lg phone:text-lg tablet:text-xl laptop:text-2xl font-bold my-auto">
            Balance Sheet
          </h1>
          <div className="flex space-x-4">
            <button
              className="bg-blue-500 text-white px-3 py-1 phone:px-3 phone:py-1 tablet:px-4 tablet:py-2 rounded desktop:text-[1rem] laptop:text-[0.75rem] tablet:text-[0.65rem] phone:text-[0.45rem]"
              onClick={() => setIsEditMode(prevMode => !prevMode)}
            >
              {isEditMode ? "Save" : "Edit"}
            </button>
            {isEditMode && (
              <button
                className="bg-green-500 text-white px-3 py-1 phone:px-3 phone:py-1 tablet:px-4 tablet:py-2 rounded desktop:text-[1rem] laptop:text-[0.75rem] tablet:text-[0.65rem] phone:text-[0.45rem]"
                onClick={handleOpenModal}
              >
                Add New User
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse desktop:text-[1rem] laptop:text-[0.50rem] tablet:text-[0.40rem] phone:text-[9px]">
            <thead>
              <tr>
                <th className="border px-2 phone:px-2 phone:py-1 tablet:px-4 tablet:py-2">
                  Name
                </th>
                {months.map(month => (
                  <th key={month} className="border px-2 phone:px-2 phone:py-1 tablet:px-4 tablet:py-2">
                    {month}
                  </th>
                ))}
                {isEditMode && (
                  <th className="border px-2 phone:px-2 phone:py-1 tablet:px-4 tablet:py-2">
                    Delete
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {Object.entries(data)
                .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
                .map(([name, status]) => (
                  <tr key={name}>
                    <td className="border px-2 phone:px-2 phone:py-1 tablet:px-4 tablet:py-2">
                      {name}
                    </td>
                    {months.map(month => (
                      <td
                        key={month}
                        className={`border px-2 phone:px-2 phone:py-1 tablet:px-4 tablet:py-2 cursor-pointer ${
                          status[month] ? "bg-green-300" : ""
                        }`}
                        onClick={() => togglePaidStatus(name, month)}
                      >
                        {status[month] ? "Paid" : ""}
                      </td>
                    ))}
                    {isEditMode && (
                      <td className="border px-2 phone:px-2 phone:py-1 tablet:px-4 tablet:py-2 text-center">
                        <button
                          onClick={() => handleDeleteUser(name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="bg-white p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Add New User</h2>
          <div className="space-y-4">
            {userInputs.map((input, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) =>
                    setUserInputs((prevInputs) => {
                      const updatedInputs = [...prevInputs];
                      updatedInputs[index] = e.target.value;
                      return updatedInputs;
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`User ${index + 1}`}
                />
                <button
                  onClick={() =>
                    setUserInputs((prevInputs) => {
                      const updatedInputs = prevInputs.filter(
                        (_, i) => i !== index
                      );
                      return updatedInputs;
                    })
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              onClick={() => setUserInputs((prevInputs) => [...prevInputs, ""])}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              + Add Another User
            </button>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
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
        </div>
      </Modal>
    </>
  );
};

export default BalanceSheetSection;