import React from 'react'


export default function DashboardBar() {
  return (
    <div>
    <div className="flex flex-row justify-center">
        <div className= "bg-[#ffff] flex items-center rounded-2xl desktop:h-52 m-2 w-80 ">
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
