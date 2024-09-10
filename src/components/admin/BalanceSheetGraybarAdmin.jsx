import { useState, useEffect } from "react";
import balanceSheetLogo from "../../assets/icons/balance-sheet-logo.svg";
import { FaEdit, FaSave, FaPlus, FaPrint } from "react-icons/fa"; // Add icon for print
import Modal from "./Modal";
import { db } from "../../firebases/FirebaseConfig";
import { collection, doc, setDoc, getDocs, getDoc } from "firebase/firestore";

const BalanceSheetGraybarAdmin = ({ setSelectedYear, setData }) => {
  const [existingDates, setExistingDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [yearInput, setYearInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // New state to track sidebar

  useEffect(() => {
    const getExistingDates = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "balanceSheetRecord")
        );
        const dates = querySnapshot.docs.map((doc) => doc.id); // Get document IDs
        setExistingDates(dates);
      } catch (error) {
        console.error("Error fetching existing dates:", error);
      }
    };

    getExistingDates();
  }, []);

  const transferPreviousYearData = async (newYear) => {
    const previousYear = (parseInt(newYear) - 1).toString();
    const prevYearDocRef = doc(db, "balanceSheetRecord", previousYear);
    const prevYearDoc = await getDoc(prevYearDocRef);

    if (prevYearDoc.exists()) {
      const previousData = prevYearDoc.data().Name || {};

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
    setSelectedYear(selectedYear);
  };

  // Mock function to toggle sidebar state
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`bg-white flex items-center rounded-md shadow-xl ${sidebarOpen ? 'desktop:h-14 laptop:h-14 phone:h-8' : 'desktop:h-16 laptop:h-16 phone:h-10'} desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1`}>
      <div className={`flex items-center justify-between w-full ${sidebarOpen ? 'desktop:p-1 laptop:p-1 tablet:p-1' : 'desktop:p-2 laptop:p-2 tablet:p-2 phone:p-1'}`}>
        <div className="flex justify-between w-full items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          {/* left */}
          <div className="flex items-center gap-1">
            <h1 className={`text-[#0C82B4] my-auto font-poppins ${sidebarOpen ? 'desktop:text-base laptop:text-base tablet:text-xs phone:text-[8px]' : 'desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px]'} phone:ml-1`}>
              Balance Sheet
            </h1>
            <img
              src={balanceSheetLogo}
              className={`desktop:h-5 desktop:w-5 laptop:h-5 laptop:w-5 phone:h-3 phone:w-3 ${sidebarOpen ? 'desktop:h-4 laptop:h-4 phone:h-2' : ''}`}
              alt="Balance Sheet Logo"
            />
          </div>

          {/* right */}
          <div className={`flex items-center p-2 ${sidebarOpen ? 'desktop:space-x-1 laptop:space-x-1 phone:space-x-0' : 'desktop:space-x-2 laptop:space-x-2 phone:space-x-1'}`}>
            {/* Add New Year Button */}
            <button
              className={`bg-[#0C82B4] font-poppins ${sidebarOpen ? 'desktop:h-8 laptop:h-8 phone:h-4' : 'desktop:h-10 laptop:h-10 phone:h-5'} desktop:text-sm laptop:text-sm phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 mr-1 rounded flex items-center`}
              onClick={handleOpenModal}
            >
              <FaPlus className={`text-base ${sidebarOpen ? 'desktop:text-sm laptop:text-sm phone:text-[6px]' : 'desktop:text-lg laptop:text-lg phone:text-[7px]'}`} />
              <span className={`hidden tablet:inline ${sidebarOpen ? 'text-xs' : 'text-sm'}`}>Add new</span>
            </button>

            {/* Year Selector */}
            <select
              className={`bg-[#5D7285] font-poppins ${sidebarOpen ? 'desktop:h-8 laptop:h-8 phone:h-4' : 'desktop:h-10 laptop:h-10 phone:h-5'} desktop:w-[7rem] laptop:w-[6.5rem] tablet:w-[5rem] phone:w-[4rem] desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded phone:mr-1 flex items-center`}
              onChange={handleYearChange}
              defaultValue=""
            >
              <option value="" disabled>
                Select year
              </option>
              {existingDates.map((date, index) => (
                <option key={index} value={date}>
                  {date}
                </option>
              ))}
            </select>

            {/* Print Button */}
            <button
              className={`bg-[#0C82B4] font-poppins ${sidebarOpen ? 'desktop:h-8 laptop:h-8 phone:h-4' : 'desktop:h-10 laptop:h-10 phone:h-5'} desktop:text-sm laptop:text-sm phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded flex items-center`}
              onClick={() => console.log('Print functionality here')}
            >
              <FaPrint className={`text-base ${sidebarOpen ? 'desktop:text-sm laptop:text-sm phone:text-[6px]' : 'desktop:text-lg laptop:text-lg phone:text-[7px]'}`} />
              <span className={`hidden tablet:inline ${sidebarOpen ? 'text-xs' : 'text-sm'}`}>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal for adding a new balance sheet */}
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
