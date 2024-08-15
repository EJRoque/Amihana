import { useState, useEffect, useCallback } from 'react';
import balanceSheetLogo from "../../assets/icons/balance-sheet-logo.svg";
import {
      addCashFlowRecord,
      fetchCashFlowDates,
      fetchCashFlowRecord,
} from "../../firebases/firebaseFunctions";

const BalanceSheetGraybar = ({ cashFlow, setCashFlow, loading, setLoading }) => {
      const [existingDates, setExistingDates] = useState([]);


      useEffect(() => {
            const getExistingDates = async () => {
                  try {
                        setLoading(true);
                        const dates = await fetchCashFlowDates();
                        setExistingDates(dates);
                  } catch (error) {
                        console.error("Error fetching dates:", error);
                  } finally {
                        setTimeout(() => setLoading(false), 1000);

                  }
            };
            getExistingDates();
      }, []);

      const handleSelectDate = useCallback(async (event) => {
            const selectedDate = event.target.value;
            setCashFlow(prevCashFlow => ({
                  ...prevCashFlow,
                  date: selectedDate,
            }));

            try {
                  const cashFlowData = await fetchCashFlowRecord(selectedDate);
                  setCashFlow(prevCashFlow => ({
                        ...prevCashFlow,
                        ...cashFlowData,
                  }));
            } catch (error) {
                  console.error("Error fetching cash flow record:", error);
            }
      }, [setCashFlow]);

      if (loading) {
            return <div className='flex justify-center items-center h-[100dvh]'><h1>Loading Balance Sheesh...</h1></div>;
      }
      return (
            <div className="bg-[#EAEBEF] flex items-center desktop:h-16 laptop:h-16 phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 border-2 border-slate-400 rounded-md shadow-xl">
                  <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
                        <div className="flex justify-between w-full items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">

                              {/* left */}
                              <div className='flex items-center gap-2'>
                                    <h1 className="text-[#0C82B4] font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
                                          Balance Sheet
                                    </h1>
                                    <img
                                          src={balanceSheetLogo}
                                          className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
                                    />
                              </div>


                              {/* right */}
                              <select
                                    className="bg-[#5D7285] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded phone:mr-2 flex items-center"
                                    onChange={handleSelectDate}
                                    value={cashFlow.date}
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
                        </div>
                  </div>
            </div>
      );



}

export default BalanceSheetGraybar;
