import React from 'react'
import Header from '../Header'
import SidebarAdmin from './Sidebar'
import BalanceSheetGraybarAdmin from '../home-owners/BalanceSheetGraybar'
import { FaTrash } from "react-icons/fa";

const AddUser = ({data}) => {

  return (
      <div className="min-h-screen flex flex-col bg-white-800">
            <Header />
            <div className="flex flex-grow">
                  <SidebarAdmin />
                  <div className="flex-grow flex flex-col ml-1">

                  <BalanceSheetGraybarAdmin/>

                  <div className='w-full h-[90%] bg-white flex items-start justify-center '>
                        <div className='flex bg-[#E9F5FE] w-[90%] h-[40%] mt-[20px] rounded-md shadow-lg p-4 flex-col gap-2'>
                              <p className='text-lg font-bold'>Add name</p>
                              <div className='flex flex-col w-[50%]'>
                                    <label className='bg-[#E7E7E7] border-2 border-black px-2 py-1'>Name</label>
                                    <input className='bg-[#FFFFFF] border-2 border-black px-2 py-1'></input>
                              </div>
                                    <button><FaTrash /></button>
                              <div className='flex gap-4'>
                                    <button className='bg-[#0C82B4] text-white py-2 px-2 rounded-md'>Add New</button>
                                    <button className='bg-red-600 text-white py-2 px-4 rounded-md'>Cancel</button>
                              </div>

                        </div>      
                  </div>
  

                  </div>
            </div>
      </div>
  )
}

export default AddUser
