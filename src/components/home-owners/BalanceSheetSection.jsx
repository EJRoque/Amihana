import React from 'react'

const BalanceSheetSection = () => {
      return (
            <>
                  <div className='flex flex-col gap-4 m-2 mr-1 phone:p-2 phone:m-1 phone:text-sm'>


                        {/*1: year */}
                        <div className='p-3 h-fit laptop:px-8 text-xs desktop:px-8 bg-white shadow-md shadow-gray-500 w-fit rounded-lg'>Year 2023 </div>

                        {/*2: make a table here */}
                        <div className='overflow-x-auto'>


                              <table className='rounded-md bg-white text-center text-xs w-full border-collapse border border-slate-400 '>
                                    <thead>
                                          <tr>
                                                <th className="border border-slate-300 p-2">Name</th>
                                                <th className="border border-slate-300 p-2">Janu</th>
                                                <th className="border border-slate-300 p-2">Febru</th>
                                                <th className="border border-slate-300 p-2">Marc</th>
                                                <th className="border border-slate-300 p-2">Apri</th>
                                                <th className="border border-slate-300 p-2">Ma</th>
                                                <th className="border border-slate-300 p-2">June</th>
                                                <th className="border border-slate-300 p-2">Jul</th>
                                                <th className="border border-slate-300 p-2">Aug</th>
                                                <th className="border border-slate-300 p-2">Septem</th>
                                                <th className="border border-slate-300 p-2">Octo</th>
                                                <th className="border border-slate-300 p-2">Novem</th>
                                                <th className="border border-slate-300 p-2">Decem</th>
                                                <th className="border border-slate-300 p-2">Hoa Membership</th>
                                          </tr>
                                    </thead>

                                    <tbody>logic here</tbody>
                              </table>
                        </div>

                        {/*3: Add New Button */}
                        <div className='flex justify-end'>
                              <button
                                    className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:px-6 laptop:px-6 phone:p-1 mx-4 rounded flex items-center"

                              >
                                    Add New
                              </button>
                        </div>


                  </div>
            </>
      )
}

export default BalanceSheetSection