import React, { useEffect, useState } from 'react';
import nogroup from "../../assets/images/no-group.png";

export default function EventsSection() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data fetching
        setTimeout(() => {
            // Simulate an empty response
            setEvents([]); 
            setLoading(false); 
        }, 2000); // Simulate a 2-second loading time
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-4 mt-4">
            {loading ? (
                <p>Loading Events...</p>
            ) : (
                <>
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center">
                            <img 
                                src={nogroup} 
                                alt="No Events Available" 
                                className="max-h-screen max-w-screen mb-2"
                            />
                            <h1 className="font-mono text-2xl font-bold text-center mb-4">No available events</h1>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center desktop:w-[63rem] laptop:w-[50rem] tablet:w-[38rem] phone:w-[15rem] mx-auto">
                            {/* Render your events here */}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
