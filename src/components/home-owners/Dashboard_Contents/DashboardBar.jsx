import React from 'react'


export default function DashboardBar() {
  return (
    <div>
    <div className="flex flex-row justify-center">
        <div className= "bg-[#FFFF] flex items-center desktop:h-16 laptop:h-16 phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 rounded-lg shadow-xl">
        </div>
        <div className= "bg-[#ffff] flex items-center rounded-2xl desktop:h-52 m-2 w-3/5 ">
        </div>
        
    </div>
    <div className="flex flex-row justify-center">
        <div 
        className= "bg-[#ffff] flex items-center rounded-2xl desktop:h-60 m-2 w-2/4 ">

        </div>
        
        <div 
        className= "bg-[#ffff] flex items-center rounded-2xl desktop:h-60 m-2 w-1/3 ">

        </div>
    </div>
    </div>
  )
}
