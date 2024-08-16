import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';

const BalanceSheetSection = ({ data, setData }) => {



      const [isOpen, setIsOpen] = useState(false);
      const [isOpenV2, setisOpenV2] = useState(false);
      const [user, setUser] = useState('');


      //2. logic here
      const togglePaidStatus = (name, month) => {
            setData(data.map(item =>
                  item.name === name ? {
                        ...item,
                        status: { ...item.status, [month]: !item.status[month] }
                  } : item
            ));
      };


      //3. onClick buttons here
      const handleAddUser = (user) => {
            setData([...data, { name: user, status: { Janu: false, Febru: false, Marc: false, Apri: false, Ma: false, June: false, Jul: false, Aug: false, Septem: false, Octo: false, Novem: false, Decem: false, Hoa: false } }]);
            setisOpenV2(!isOpenV2);
      };

      const handleDeleteUser = (name) => {
            setData(data.filter(user => user.name !== name));
      };

      return (
            <>
                  {!isOpenV2 ? (
                        <div className="bg-[#E9F5FE] min-h-[65dvh] flex overflow-y-auto phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 rounded-2xl shadow-xl">
                              <div className="w-full desktop:p-2 laptop:p-2 tablet:p-2">
                                    <div className="flex justify-between w-full desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
                                          <div className='p-3 h-fit laptop:px-8 text-xs desktop:px-8 bg-white shadow-md shadow-gray-500 w-fit rounded-lg'>
                                                Year 2023
                                          </div>
                                          <button
                                                onClick={() => setIsOpen(!isOpen)}
                                                className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:px-8 laptop:px-8 phone:p-1 m-4 mr-1 rounded flex items-center"
                                          >
                                                Edit
                                          </button>
                                    </div>
                                    <table className='table-auto bg-white text-center text-xs w-full'>
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
                                                      <th className="bg-[#E9F5FE]"></th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {data.map((item, index) => (
                                                      <tr key={index} className='p-2'>
                                                            <td className='border-2 border-black-800'>{item.name}</td>
                                                            {Object.keys(item.status).map(month => (
                                                                  <td
                                                                        key={month}
                                                                        onClick={() => togglePaidStatus(item.name, month)}
                                                                        className={`border-2 border-black-800 ${item.status[month] ? 'bg-green-600 text-white' : 'bg-white'}`}
                                                                  >
                                                                        {item.status[month] ? 'Paid' : ''}
                                                                  </td>
                                                            ))}
                                                            {isOpen && (
                                                                  <td className='bg-[#E9F5FE]'>
                                                                        <button onClick={() => handleDeleteUser(item.name)}><FaTrash /></button>
                                                                  </td>
                                                            )}
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                                    <div className='py-4 flex justify-end pr-2'>
                                          {isOpen && (
                                                <button
                                                      onClick={() => setisOpenV2(!isOpenV2)}
                                                      className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:px-6 laptop:px-6 phone:p-1 mx-4 rounded flex items-center"
                                                >
                                                      Add New
                                                </button>
                                          )}
                                    </div>
                              </div>
                        </div>
                  ) : (
                        <div className='w-full h-[90%] bg-white flex items-start justify-center'>
                              <div className='flex bg-[#E9F5FE] w-[90%] h-[40%] mt-[20px] rounded-md shadow-lg p-4 flex-col gap-2'>
                                    <p className='text-lg font-bold'>Add name</p>
                                    <div className='flex flex-col w-[50%]'>
                                          <label className='bg-[#E7E7E7] border-2 border-black px-2 py-1'>Name</label>
                                          <input
                                                onChange={(e) => setUser(e.target.value)}
                                                className='bg-[#FFFFFF] border-2 border-black px-2 py-1'
                                          />
                                    </div>
                                    <button><FaTrash /></button>
                                    <div className='flex gap-4'>
                                          <button
                                                onClick={() => handleAddUser(user)}
                                                className='bg-[#0C82B4] text-white py-2 px-2 rounded-md'
                                          >
                                                Add New
                                          </button>
                                          <button
                                                onClick={() => setisOpenV2(!isOpenV2)}
                                                className='bg-red-600 text-white py-2 px-4 rounded-md'
                                          >
                                                Cancel
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/*4. Para saan ba to ? */}
                  <div className='flex justify-end'>
                        <button
                              className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:px-6 laptop:px-6 phone:p-1 mx-4 rounded flex items-center"
                        >
                              Add New
                        </button>
                  </div>
            </>
      );
};

export default BalanceSheetSection;
