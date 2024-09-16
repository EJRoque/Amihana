import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../firebases/FirebaseConfig';
import AnnouncementSection from "../../AnnouncementSection";

function useMobileView() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default function DashboardAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useMobileView();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "announcements"), (snapshot) => {
      const announcementsList = snapshot.docs.map(doc => doc.data());
      setAnnouncements(announcementsList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return; // Exit if no announcements

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [announcements]);

  return (
    <div>
      {isMobile ? (
        <div className="bg-white p-4 overflow-hidden shadow-lg rounded-lg w-[50vh] h-[70vh]">
          <h1 className="flex justify-center font-poppins font-bold overflow-hidden">
            Announcement
          </h1>
          <div className="relative w-full overflow-hidden">
            {announcements.length > 0 ? (
              <AnnouncementSection announcement={announcements[currentIndex]} />
            ) : (
              <div>No Announcements Available</div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 overflow-hidden
          desktop:py-6 desktop:w-[100vh]
          laptop:py-4 laptop:w-[95vh]
          tablet:py-2 tablet:[80vh]">
          <h1 className="flex justify-center font-poppins font-bold overflow-hidden 
            desktop:text-2xl 
            laptop:text-xl 
            tablet:text-lg 
            mb-4">
            Announcement
          </h1>
          <div className="relative w-full overflow-hidden
            desktop:h-[60vh] 
            laptop:h-[55vh] 
            tablet:h-[50vh]">
            {announcements.length > 0 ? (
              <AnnouncementSection announcement={announcements[currentIndex]} />
            ) : (
              <div>No Announcements Available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
