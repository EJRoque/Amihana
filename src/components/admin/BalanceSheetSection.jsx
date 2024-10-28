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
import { Button } from "antd"; // Import Button from Ant Design
import { ClipLoader } from "react-spinners"; // Import the spinner

const BalanceSheetSection = ({ selectedYear, setData }) => {
  const [data, setDataState] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userInputs, setUserInputs] = useState([""]);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
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

  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = () => setIsModalOpen(true);

  useEffect(() => {
    if (setData) {
      setData(data); // Pass the data to the parent component
    }
  }, [data, setData]);

  useEffect(() => {
    if (selectedYear) {
      const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
  
      const unsubscribe = onSnapshot(yearDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const fetchedData = docSnapshot.data().Name || {};
          setDataState(fetchedData); // Update state with the latest data
        } else {
          setDataState({}); // Clear state if no data is found
        }
      });
  
      return () => unsubscribe(); // Clean up listener on unmount or year change
    }
  }, [selectedYear]);

  const togglePaidStatus = async (name, month) => {
    if (isEditMode && data[name]) {
      const newStatus = !data[name][month];
      const updatedData = {
        ...data,
        [name]: {
          ...data[name],
          [month]: newStatus,
        },
      };
      setDataState(updatedData);

      try {
        const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
        await updateDoc(yearDocRef, {
          [`Name.${name}.${month}`]: newStatus,
        });
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
  
    // Validation to check if any input contains '.' or '/'
    const invalidInputs = userInputs.some((user) => user.includes(".") || user.includes("/"));
    if (invalidInputs) {
      alert("Names cannot contain '.' or '/'");
      return; // Prevent further execution if invalid input is found
    }
  
    setIsLoading(true); // Start loading
  
    const newUsers = userInputs
    .map((user) => user.trim()) // Trim whitespace
      .filter((user) => user.trim() !== "")
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
        const updatedData = { ...data, ...newUsers };
  
        // Sort the names alphabetically before updating Firestore and state
        const sortedNames = Object.keys(updatedData)
          .sort()
          .reduce((acc, name) => {
            acc[name] = updatedData[name];
            return acc;
          }, {});
  
        await setDoc(
          yearDocRef,
          { Name: sortedNames }, // Save sorted names
          { merge: true }
        );
  
        setUserInputs([""]);
        setIsLoading(false); // Stop loading
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error adding new users:", error);
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
      <section className="bg-white rounded-lg shadow-md border-2 p-4 phone:p-2 tablet:p-4 laptop:p-6 desktop:p-8 space-y-4 phone:w-full tablet:w-[90%] laptop:w-[80%] desktop:w-[70%] mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-lg phone:text-sm tablet:text-lg laptop:text-xl desktop:text-2xl font-bold">
            Butaw Collection and HOA Membership {selectedYear}
          </h1>
          <div className="flex space-x-2 tablet:space-x-4">
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-2 py-1 rounded text-xs"
            />
            <Button
              type="primary"
              className="bg-[#0C82B4] text-white px-2 py-1 phone:px-2 phone:py-1 tablet:px-3 tablet:py-2 laptop:px-4 laptop:py-2 rounded text-xs tablet:text-sm laptop:text-base transition-transform transform hover:scale-105"
              onClick={() => setIsEditMode((prevMode) => !prevMode)}
            >
              {isEditMode ? "Save" : "Edit"}
            </Button>
            {isEditMode && (
              <Button
                type="primary"
                className="bg-green-500 text-white px-2 py-1 phone:px-2 phone:py-1 tablet:px-3 tablet:py-2 laptop:px-4 laptop:py-2 rounded text-xs tablet:text-sm laptop:text-base transition-transform transform hover:scale-105"
                onClick={handleOpenModal}
              >
                Add New User
              </Button>
            )}
          </div>
        </div>

        <div id="balance-sheet-section" className="overflow-x-auto">
          <table className="w-full border-collapse text-xs phone:text-xs tablet:text-sm laptop:text-base desktop:text-lg">
            <thead>
              <tr>
                <th className="border px-2 py-1 phone:px-1 phone:py-0.5 tablet:px-2 tablet:py-1 laptop:px-3 laptop:py-2">
                  Name
                </th>
                {months.map((month) => (
                  <th
                    key={month}
                    className="border px-2 py-1 phone:px-1 phone:py-0.5 tablet:px-2 tablet:py-1 laptop:px-3 laptop:py-2"
                  >
                    {month}
                  </th>
                ))}
                {isEditMode && (
                  <th className="border px-2 py-1 phone:px-1 phone:py-0.5 tablet:px-2 tablet:py-1 laptop:px-3 laptop:py-2">
                    Delete
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData
                .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
                .map(([name, status]) => (
                  <tr key={name}>
                    <td className="border px-2 py-1 phone:px-1 phone:py-0.5 tablet:px-2 tablet:py-1 laptop:px-3 laptop:py-2 whitespace-nowrap overflow-hidden">
                      {name}
                    </td>
                    {months.map((month) => (
                      <td
                        key={month}
                        className={`border px-2 py-1 text-center phone:px-1 phone:py-0.5 tablet:px-2 tablet:py-1 laptop:px-3 laptop:py-2 ${
                          status[month] ? "bg-green-200" : ""
                        }`}
                        onClick={() => togglePaidStatus(name, month)}
                      >
                        {status[month] ? "Paid" : ""}
                      </td>
                    ))}
                    {isEditMode && (
                      <td className="border px-2 py-1 text-center phone:px-1 phone:py-0.5 tablet:px-2 tablet:py-1 laptop:px-3 laptop:py-2">
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
        {isModalOpen && (
         <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
         <div className="bg-white p-4 phone:p-2 tablet:p-4 laptop:p-6 max-w-md max-h-[80vh] overflow-y-auto">
           <h2 className="text-lg phone:text-base tablet:text-xl laptop:text-2xl font-bold mb-4">
             Add New User
           </h2>
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
                       className="w-full px-3 py-2 border border-gray-300 rounded text-xs phone:text-xs tablet:text-sm laptop:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                   onClick={() =>
                     setUserInputs((prevInputs) => [...prevInputs, ""])
                   }
                   className="text-blue-500 hover:text-blue-700 text-sm phone:text-xs tablet:text-sm laptop:text-base"
                 >
                   + Add Another User
                 </button>
               </div>
               <div className="mt-4 phone:mt-2 tablet:mt-4 laptop:mt-6 flex justify-end space-x-2">
                 <button
                   onClick={handleCloseModal}
                   className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-xs phone:text-xs tablet:text-sm laptop:text-base"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleAddUser}
                   className="bg-blue-500 text-white px-4 py-2 rounded text-xs phone:text-xs tablet:text-sm laptop:text-base"
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
