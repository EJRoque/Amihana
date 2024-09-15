import React, { useState } from 'react';
import EventsModal from "../Modals/EventsModal";
import { CalendarFilled } from "@ant-design/icons";
import AddEvent from '../Modals/Events Forms/AddEvent';

const EventsGraybar = ({ events = [], setEvents }) => {
    const [openMod, setOpenMod] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
            <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
                <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1"> 
                <h1 className="text-[#0C82B4] my-auto font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
                    Events
                    </h1>
                    <CalendarFilled className="flex-1 m-2 desktop:h-10 desktop:w-10 laptop:h-8 laptop:w-8 phone:h-4 phone:w-4 text-[#0C82B4] flex items-center" />

                </div>
                <div className="flex items-center desktop:space-x-2 laptop:space-x-2">
                    <button
                        className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 rounded flex items-center"
                        onClick={() => setOpenMod(true)}
                    >
                        Add new
                    </button>
                </div>
            </div>


            <EventsModal 
                openMod={openMod}
                setOpenMod={setOpenMod}
            >
                <AddEvent />
            </EventsModal>
        </div>
    );
}

export default EventsGraybar;
