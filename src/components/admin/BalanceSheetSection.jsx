import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
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
  const [isOpenV2, setIsOpenV2] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userInputs, setUserInputs] = useState([""]);
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

  useEffect(() => {
    const fetchData = async () => {
      if (selectedYear) {
        setData({}); // Clear previous data
        console.log(`Fetching data for year: ${selectedYear}`);
        try {
          const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
          const yearDoc = await getDoc(yearDocRef);
          if (yearDoc.exists()) {
            console.log("Fetched Data: ", yearDoc.data());
            setData(yearDoc.data().Name || {});
          } else {
            console.log("No data found for the selected year.");
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
          [`Name.${name}.${month}`]: newStatus,
        });
        console.log(
          `Updated ${name}'s ${month} status to`,
          newStatus ? "Paid" : "Not Paid"
        );
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
      .filter((user) => user.trim() !== "")
      .reduce((acc, user) => {
        acc[user] = {
          Jan: false,
          Feb: false,
          Mar: false,
          Apr: false,
          May: false,
          Jun: false,
          Jul: false,
          Aug: false,
          Sep: false,
          Oct: false,
          Nov: false,
          Dec: false,
          Hoa: false,
        };
        return acc;
      }, {});

    if (Object.keys(newUsers).length > 0) {
      try {
        const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);

        const updatedData = {
          Name: {
            ...data,
            ...newUsers,
          },
        };

        await setDoc(yearDocRef, updatedData, { merge: true });

        setData((prevData) => ({ ...prevData, ...newUsers })); // Update state after adding new users
        setUserInputs([""]); // Clear the input field
        setIsOpenV2(false); // Close modal after saving
        console.log("New users added successfully:", newUsers);
      } catch (error) {
        console.error("Error adding new users:", error);
      }
    }
  };

  const handleDeleteUser = async (name) => {
    if (!selectedYear) return;

    setData((prevData) => {
      const updatedData = { ...prevData };
      delete updatedData[name];
      return updatedData;
    });

    try {
      const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
      await updateDoc(yearDocRef, {
        [`Name.${name}`]: deleteField(),
      });
      console.log(`Deleted user ${name} successfully.`);
    } catch (error) {
      console.error("Error deleting user from Firestore:", error);
    }
  };

  return (
    <>
      <section className="bg-white rounded-lg drop-shadow-md border-2 p-5 w-full space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Balance Sheet</h1>
          <div className="flex space-x-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setIsEditMode((prevMode) => !prevMode)}
            >
              {isEditMode ? "Save" : "Edit"}
            </button>
            {isEditMode && (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => setIsOpenV2(true)}
              >
                Add New User
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Jan</th>
                <th className="border px-4 py-2">Feb</th>
                <th className="border px-4 py-2">Mar</th>
                <th className="border px-4 py-2">Apr</th>
                <th className="border px-4 py-2">May</th>
                <th className="border px-4 py-2">Jun</th>
                <th className="border px-4 py-2">Jul</th>
                <th className="border px-4 py-2">Aug</th>
                <th className="border px-4 py-2">Sep</th>
                <th className="border px-4 py-2">Oct</th>
                <th className="border px-4 py-2">Nov</th>
                <th className="border px-4 py-2">Dec</th>
                <th className="border px-4 py-2">HOA</th>
                {isEditMode && <th className="border px-4 py-2">Delete</th>}
              </tr>
            </thead>
            <tbody>
              {Object.entries(data)
                .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
                .map(([name, status]) => (
                  <tr key={name}>
                    <td className="border px-4 py-2">{name}</td>
                    {months.map((month) => (
                      <td
                        key={month}
                        className={`border px-4 py-2 cursor-pointer ${
                          status[month] ? "bg-green-300" : ""
                        }`}
                        onClick={() => togglePaidStatus(name, month)}
                      >
                        {status[month] ? "Paid" : ""}
                      </td>
                    ))}
                    {isEditMode && (
                      <td className="border px-4 py-2">
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

      {isOpenV2 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <div className="space-y-4">
              {userInputs.map((input, index) => (
                <input
                  key={index}
                  type="text"
                  value={input}
                  onChange={(e) =>
                    setUserInputs((prevInputs) => {
                      const updatedInputs = [...prevInputs];
                      updatedInputs[index] = e.target.value;
                      return updatedInputs;
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                  placeholder={`User ${index + 1}`}
                />
              ))}
              <button
                onClick={() =>
                  setUserInputs((prevInputs) => [...prevInputs, ""])
                }
                className="text-blue-500 hover:text-blue-700"
              >
                + Add Another User
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpenV2(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-4"
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
        </div>
      )}
    </>
  );
};

export default BalanceSheetSection;
