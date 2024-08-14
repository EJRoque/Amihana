import React, { useState } from 'react';
import EventsModal from "../Modals/EventsModal";
import eventslogo from '../../assets/icons/events-icon.svg';
import ReserveVenueForm from '../ReserveVenueForm';

const EventsGraybar = ({ events = [], setEvents }) => {
    const [openMod, setOpenMod] = useState(false);

    return (
        <div className="bg-[#EAEBEF] flex flex-col desktop:h-auto laptop:h-auto phone:h-auto m-3 border-2 border-slate-400 rounded-md shadow-xl">
            <div className="flex items-center justify-between w-full p-2">
                <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
                    <h1 className="text-[#0C82B4] font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
                        Events
                    </h1>
                    <img
                        src={eventslogo}
                        alt="Events Logo"
                        className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
                    />
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
                <ReserveVenueForm />
            </EventsModal>
        </div>
    );
}

export default EventsGraybar;
