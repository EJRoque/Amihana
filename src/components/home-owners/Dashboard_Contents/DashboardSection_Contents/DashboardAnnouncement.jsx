import React, { useState, useEffect } from "react";
import { Carousel } from 'antd';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../firebases/FirebaseConfig';
import AnnouncementSection from "../../AnnouncementSection";

export default function DashboardAnnouncement() {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "announcements"), (snapshot) => {
            const announcementsList = snapshot.docs.map(doc => doc.data());
            setAnnouncements(announcementsList);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-white p-4 overflow-hidden
            desktop:py-6 desktop:w-[100vh]
            laptop:py-4 laptop:w-[95vh]
            tablet:py-2 tablet:[80vh]
            phone:py-1 phone:w-[25vh]">
            <h1 className="flex justify-center font-poppins font-bold overflow-hidden 
                desktop:text-2xl 
                laptop:text-xl 
                tablet:text-lg 
                phone:text-base 
                mb-4">
                Announcement
            </h1>
            <div className="relative w-full overflow-hidden
                desktop:h-[60vh] 
                laptop:h-[55vh] 
                tablet:h-[50vh] 
                phone:h-[40vh]">
                <Carousel
                    autoplay
                    dots={true}
                    className="h-full"
                    slidesToShow={1} // Show one slide at a time
                    slidesToScroll={1} // Scroll one slide at a time
                >
                    {announcements.map((announcement, index) => (
                        <div key={index} className="flex items-center justify-center h-full p-4 
                            desktop:p-6 
                            laptop:p-4 
                            tablet:p-2 
                            phone:p-1">
                            <AnnouncementSection announcement={announcement} />
                        </div>
                    ))}
                </Carousel>
            </div>
        </div>
    );
}
