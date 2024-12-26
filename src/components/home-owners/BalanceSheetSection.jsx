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
    }
  };

  return (
    <div id="printable-area" className="bg-[#E9F5FE] rounded-2xl flex flex-col gap-4 phone:p-2 phone:text-xs tablet:text-sm laptop:text-base desktop:text-base border-2 border-slate-300 w-full mx-8">
      <h2 className="phone:text-base tablet:text-lg laptop:text-xl desktop:text-xl font-bold mx-2">
        Butaw Collection and HOA Membership {selectedYear}
      </h2>

      <div className="flex w-full overflow-x-auto">
        <div className="w-full">
          <table className="w-full bg-white table-auto text-xs tablet:text-sm laptop:text-base desktop:text-base">
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
        className={`border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2 cursor-pointer text-center ${
          balanceSheetRecord[key]?.paid
            ? 'bg-green-200 text-green-700' // Pastel green for Paid
            : 'bg-red-200 text-red-700' // Pastel red for Unpaid
        }`}
        onClick={() => handleTogglePaidStatus(key)} // Add click handler
      >
        {balanceSheetRecord[key]?.paid ? 'Paid' : 'Unpaid'}
      </td>
    </tr>
  ))}
  <tr>
    <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2 bg-[#0C82B4] text-white">HOA Membership</td>
    <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2 text-center">
      {formatAmount(balanceSheetRecord.Hoa?.amount)} {/* Display formatted HOA amount or N/A if not set */}
    </td>
    <td
      className={`border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2 cursor-pointer text-center ${
        balanceSheetRecord.Hoa?.paid
          ? 'bg-green-200 text-green-700' // Pastel green for Paid
          : 'bg-red-200 text-red-700' // Pastel red for Unpaid
      }`}
    >
      {balanceSheetRecord.Hoa?.paid ? 'Paid' : 'Unpaid'}
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
