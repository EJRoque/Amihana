import React from "react";

const CashflowRecord = ({ cashFlow }) => {
  const formatAmount = (amount) => parseFloat(amount).toFixed(2);

  return (
    <div className="p-2 bg-[#E9F5FE] rounded-lg desktop:w-[63rem] laptop:w-[53rem] tablet:w-[38rem] mx-auto border-2 shadow-xl">
      <div className="mb-6">
        <h2 className="font-semibold">Date: {cashFlow.date}</h2>
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">
          Opening Balance
        </h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 text-left p-1">
                Description
              </th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.openingBalance.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">
                  {item.description}
                </td>
                <td className="border border-gray-300 p-1 text-right">
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">
          Add: Cash Receipts
        </h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 p-1 text-left">
                Description
              </th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.cashReceipts.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">
                  {item.description}
                </td>
                <td className="border border-gray-300 p-1 text-right">
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))}
            <tr className="bg-[#0C82B4] text-white font-bold">
              <td className="border border-gray-300 p-1">
                {cashFlow.totalCashAvailable.description}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatAmount(cashFlow.totalCashAvailable.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">
          Less: Cash Paid-out
        </h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 p-1 text-left">
                Description
              </th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.cashPaidOut.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">
                  {item.description}
                </td>
                <td className="border border-gray-300 p-1 text-right">
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))}
            <tr className="bg-[#0C82B4] text-white font-bold">
              <td className="border border-gray-300 p-1">
                {cashFlow.totalCashPaidOut.description}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatAmount(cashFlow.totalCashPaidOut.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="bg-[#F1F2BF] font-bold">
              <td className="border border-gray-300 p-1">
                {cashFlow.endingBalance.description}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatAmount(cashFlow.endingBalance.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashflowRecord;
