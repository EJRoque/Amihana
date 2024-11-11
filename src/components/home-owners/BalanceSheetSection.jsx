import React from "react";
import { notification } from "antd"; // Make sure to import notification

const BalanceSheetSection = ({ balanceSheetRecord, selectedYear, userName, updatePaymentStatus }) => {
  const months = [
    { name: 'January', key: 'Jan' },
    { name: 'February', key: 'Feb' },
    { name: 'March', key: 'Mar' },
    { name: 'April', key: 'Apr' },
    { name: 'May', key: 'May' },
    { name: 'June', key: 'Jun' },
    { name: 'July', key: 'Jul' },
    { name: 'August', key: 'Aug' },
    { name: 'September', key: 'Sep' },
    { name: 'October', key: 'Oct' },
    { name: 'November', key: 'Nov' },
    { name: 'December', key: 'Dec' },
  ];

  // Utility function to format the amount with peso sign and comma
  const formatAmount = (amount) => {
    return amount ? `₱${amount.toLocaleString()}` : '';
  };

  const handleTogglePaidStatus = async (monthKey) => {
    const newStatus = !balanceSheetRecord[monthKey]?.paid; // Toggle paid status

    try {
      await updatePaymentStatus(userName, monthKey, newStatus);
      notification.success({ message: `${monthKey} status updated successfully!` });
    } catch (error) {
      console.error("Error updating payment status:", error);
      notification.error({ message: `Error updating ${monthKey} status` });
    }
  };

  return (
    <div id="printable-area" className="bg-[#E9F5FE] rounded-2xl flex flex-col gap-4 m-2 phone:p-2 phone:m-1 phone:text-xs tablet:text-sm laptop:text-base desktop:text-lg border-2 border-slate-300 phone:w-[95%] tablet:w-[85%] laptop:w-[75%] desktop:w-[60%] mx-auto">
      <h2 className="phone:text-base tablet:text-lg laptop:text-xl desktop:text-2xl font-bold mx-2">
        Butaw Collection and HOA Membership {selectedYear}
      </h2>

      <div className="flex w-full overflow-x-auto">
        <div className="w-full">
          <table className="w-full bg-white table-auto text-xs tablet:text-sm laptop:text-base desktop:text-lg">
            <thead>
              <tr className="bg-gray-300 text-left">
                <th className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">Month</th>
                <th className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">Amount</th>
                <th className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {months.map(({ name, key }) => (
                <tr key={key}>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">{name}</td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2 text-center">
                    {formatAmount(balanceSheetRecord[key]?.amount)} {/* Display formatted amount or N/A if not set */}
                  </td>
                  <td
                    className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2 cursor-pointer text-center"
                    onClick={() => handleTogglePaidStatus(key)} // Add click handler
                  >
                    {balanceSheetRecord[key]?.paid ? 'Paid' : ''}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2 bg-[#0C82B4] text-white">HOA Membership</td>
                <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2 text-center">
                  {formatAmount(balanceSheetRecord.Hoa?.amount)} {/* Display formatted HOA amount or N/A if not set */}
                </td>
                <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2 cursor-pointer text-center">
                  {balanceSheetRecord.Hoa?.paid ? 'Paid' : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-30"></div>
      </div>
    </div>
  );
};

export default BalanceSheetSection;
