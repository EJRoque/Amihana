import React from 'react'
import {
    message,
    Card,
    Typography,
    Tooltip,
    Select,
    Input
}
from 'antd';

export default function CostControl() {
  return (
    <div className="bg-white shadow-md h-full w-full flex flex-col px-4 md:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6 text-start sm:text-left ">Cost Control</h1>
        {/* Input fields */}
      <div className='flex flex-col space-y-2'>

        <h1 >Venue Prices</h1>
        <div className='flex flex-row space-x-2'>
            <Tooltip title="Select a cost type">
            <Input
                placeholder="Select"
                className='w-auto'
            >
            </Input>
            </Tooltip>
            <Input 
                placeholder="Change Price"
                className='w-[50%]'
            />     
        </div>

        <div className='flex flex-row space-x-2'>
            <Tooltip title="Select a cost type">
            <Input
                placeholder="Select"
                className='w-auto'
            >
            </Input>
            </Tooltip>
            <Input 
                placeholder="Change Price"
                className='w-[50%]'
            />     
        </div>

        <div className='flex flex-row space-x-2'>
            <Tooltip title="Select a cost type">
            <Input
                placeholder="Select"
                className='w-auto'
            >
            </Input>
            </Tooltip>
            <Input 
                placeholder="Change Price"
                className='w-[50%]'
            />     
        </div>


        
      </div>
      
            
      
    </div>
  )
}
