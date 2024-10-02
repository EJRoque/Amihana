import React from 'react';
import Dashboard_Graph from './Dashboard_Graph';


export default function DashboardSection() {

  return (
    <>
    <div className='desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1 
    desktop:flex-row desktop:flex desktop:space-x-2 justify-center 
    laptop:flex-row laptop:flex laptop:space-x-2 laptop:space-y-0
    phone:flex-col phone:space-y-2 '>
      {/* first boxes */}
      <div className='bg-gray-100 shadow-md w-full h-96 rounded-lg'>
        </div>
      <div className='bg-gray-100 shadow-md w-full h-96 rounded-lg'>

      </div>
      
    </div> 
    <div className='mt-2 desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1 flex flex-col justify-center space-y-2'>
      <div className='bg-gray-100 shadow-md w-full h-96 rounded-lg'>
        <Dashboard_Graph /> 
      </div>
    </div>
    </>
  )
}
