import { useState, useEffect } from "react";
import balanceSheetLogo from "../../assets/icons/balance-sheet-logo.svg";
import Modal from "./Modal";
import { db } from "../../firebases/FirebaseConfig";
import { collection, doc, setDoc, getDocs, getDoc } from "firebase/firestore";

const BalanceSheetGraybarAdmin = ({ setSelectedYear, setData }) => {
  const [existingDates, setExistingDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [yearInput, setYearInput] = useState("");

  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "balanceSheetRecord"));
        const dates = querySnapshot.docs.map((doc) => doc.id); // Get document IDs
        setExistingDates(dates);
      } catch (error) {
        console.error("Error fetching existing dates:", error);
      }
    };

    getExistingDates();
  }, []);

  // Function to transfer data from the previous year
  const transferPreviousYearData = async (newYear) => {
    const previousYear = (parseInt(newYear) - 1).toString();
    const prevYearDocRef = doc(db, "balanceSheetRecord", previousYear);
    const prevYearDoc = await getDoc(prevYearDocRef);

    if (prevYearDoc.exists()) {
      const previousData = prevYearDoc.data().Name || {};
      
      // Reset all statuses to false
      const resetData = Object.keys(previousData).reduce((acc, name) => {
        acc[name] = {
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

      const newYearDocRef = doc(db, "balanceSheetRecord", newYear);

      await setDoc(newYearDocRef, { Name: resetData }, { merge: true });

      // Update data in the parent component if setData is provided
      if (setData) {
        setData(resetData);
      }
    }
  };

  const handleAddNewYear = async (e) => {
    e.preventDefault();
    if (!yearInput.trim()) return;

    try {
      const yearDocRef = doc(db, "balanceSheetRecord", yearInput);
      await setDoc(yearDocRef, {});

      // Transfer data from the previous year
      await transferPreviousYearData(yearInput);

      setExistingDates((prevDates) => [...prevDates, yearInput]);
      setIsModalOpen(false);
      setYearInput("");
    } catch (error) {
      console.error("Error adding new year:", error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYear(selectedYear); // Properly update state in the parent
  };

  return (
    <div className="bg-[#EAEBEF] flex items-center desktop:h-16 laptop:h-16 phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 border-2 border-slate-400 rounded-md shadow-xl">
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex justify-between w-full items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          {/* left */}
          <div className="flex items-center gap-2">
            <h1 className="text-[#0C82B4] my-auto font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
              Balance Sheet
            </h1>
            <img
              src={balanceSheetLogo}
              className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
            />
          </div>

          {/* right */}
          <div className="flex items-center desktop:space-x-2 laptop:space-x-2">
            <button
              className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 mr-1 rounded flex items-center"
              onClick={handleOpenModal}
            >
              Add new
            </button>
            <select
              className="bg-[#5D7285] font-poppins desktop:h-10 desktop:w-[8rem] laptop:h-10 laptop:w-[7.5rem] tablet:h-6 tablet:w-[5.5rem] phone:h-5 phone:w-[4.5rem] desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded phone:mr-1 flex items-center"
              onChange={handleYearChange}
              defaultValue="" // Ensures default selected option is "Select year"
            >
              <option value="" disabled>Select year</option>
              {existingDates.map((date, index) => (
                <option key={index} value={date}>
                  {date}
                </option>
              ))}
            </select>
            <button
              className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded flex items-center"
              onClick={""}
            >
              Print
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div>
          <h1 className="font-poppins font-semibold mb-7">
            Create new balance sheet
          </h1>
          <form className="flex flex-col space-y-2" onSubmit={handleAddNewYear}>
            <label htmlFor="year">Enter year</label>
            <input
              type="text"
              id="year"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="flex-1 border border-gray-300 p-2 rounded"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default BalanceSheetGraybarAdmin;
