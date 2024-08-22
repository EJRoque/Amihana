import React from "react";

const BalanceSheetSection = () => {
  return (
    <>
      <div className="bg-[#E9F5FE] rounded-2xl flex flex-col gap-4 m-2 phone:p-2 phone:m-1 phone:text-xs tablet:text-sm laptop:text-base desktop:text-lg border-2 border-slate-300 phone:w-[95%] tablet:w-[85%] laptop:w-[75%] desktop:w-[60%] mx-auto">
        <h2 className="phone:text-base tablet:text-lg laptop:text-xl desktop:text-2xl font-bold mx-2">
          Butaw Collection and HOA Membership
        </h2>

        <div className="flex w-full overflow-x-auto">
          <div className="w-full">
            <table className="w-full bg-white table-auto text-xs tablet:text-sm laptop:text-base desktop:text-lg">
              <thead>
                <tr className="bg-gray-300 text-left">
                  <th className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Month
                  </th>
                  <th className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    January
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    February
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    March
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    April
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    May
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    June
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    July
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    August
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    September
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    October
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    November
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    December
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2 bg-[#0C82B4] text-white">
                    HOA Membership
                  </td>
                  <td className="border-2 border-black px-2 tablet:px-4 py-1 tablet:py-2">
                    Paid
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-30"></div>
        </div>
      </div>
    </>
  );
};

export default BalanceSheetSection;
