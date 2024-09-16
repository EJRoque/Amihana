import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig';
import MegaphonePic from "../../assets/images/Megaphone.png";

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

const AnnouncementSection = ( ) => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useMobileView();
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const announcementsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnnouncements(announcementsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching announcements: ", err);
      setError("Failed to load announcements.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return; // Exit if no announcements

    const intervalId = setInterval(() => {
      setFade(false); // Trigger fade-out
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
        setFade(true); // Trigger fade-in
      }, 500); // Duration of fade-out transition
    }, 5000); // Duration for changing announcements

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [announcements]);

  const renderBodyWithLineBreaks = (text) => {
    return { __html: text.replace(/\n/g, '<br />') };
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>{error}</p>
      </div>
    );
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="w-full">
      {isMobile ? (
        <div className="flex flex-col items-center bg-[#E9F5FE] rounded-lg p-4 w-full">
          <div className={`bg-white border-2 border-black rounded-lg p-2 w-full my-4 mx-4 shadow transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-center font-bold text-sm mb-2">
              {currentAnnouncement.title || "No Title"}
            </h2>
            <p
              className="text-xs text-black"
              dangerouslySetInnerHTML={renderBodyWithLineBreaks(currentAnnouncement.body || "No content available.")}
            />
            <p className="text-right text-gray-500 text-xs mt-2">
              {formatDate(currentAnnouncement.timestamp)}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 min-h-screen px-4 laptop:px-6 desktop:px-8">
          <div className={`flex flex-col laptop:flex-row items-center bg-[#E9F5FE] rounded-lg p-4 border-2 border-black w-full max-w-screen-sm mx-auto transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-col justify-between w-full p-4">
              <div className="bg-[#0C82B4] text-white text-xs tablet:text-sm laptop:text-base font-bold rounded-lg px-4 py-2 mb-4 shadow w-full">
                <h2 className="text-center text-xs tablet:text-sm laptop:text-base desktop:text-lg">
                  {currentAnnouncement.title || "No Title"}
                </h2>
              </div>
              <div className="flex-1 p-4 bg-white border-2 border-black rounded-lg">
                <p
                  className="text-xs tablet:text-sm laptop:text-base desktop:text-lg text-black"
                  dangerouslySetInnerHTML={renderBodyWithLineBreaks(currentAnnouncement.body || "No content available.")}
                />
              </div>
              <p className="text-gray-700 text-xs tablet:text-sm laptop:text-base mt-2 text-right">
                {formatDate(currentAnnouncement.timestamp)}
              </p>
            </div>
            <div className="flex items-center justify-center mt-2 laptop:mt-0">
              <img
                src={MegaphonePic}
                alt="Announcement"
                className="hidden laptop:block laptop:w-[14rem] laptop:h-[13rem] desktop:w-[16rem] desktop:h-[15rem]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementSection;
