import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig'; // adjust the path as needed
import MegaphonePic from "../../assets/images/Megaphone.png";

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state

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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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

  return (
    <div className="flex flex-col items-center space-y-4 min-h-screen">
      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="flex justify-center items-center desktop:w-[63rem] laptop:w-[50rem] tablet:w-[38rem] phone:w-[15rem] mx-auto"
          >
            <div className="flex flex-col laptop:flex-row items-center bg-[#E9F5FE] rounded-lg p-2 tablet:p-6 phone:p-3 border-2 border-black">
              <div className="flex flex-col laptop:flex-1 justify-between w-full p-4 tablet:p-6 phone:p-2">
                <div className="bg-[#0C82B4] text-white text-base laptop:text-xl font-bold rounded-lg px-4 py-2 mb-4 laptop:mb-6 shadow w-full">
                  <h2 className="text-center laptop:text-lg phone:text-[15px]">
                    {announcement.title || "No Title"}
                  </h2>
                </div>
                <div className="flex-1 p-3 h-auto bg-white border-2 border-black rounded-lg">
                  <p className="phone:text-xs laptop:text-sm desktop:text-lg text-black">
                    {announcement.body || "No content available."}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center mt-4">
                <img
                  src={MegaphonePic}
                  alt="Announcement"
                  className="mb-8 hidden laptop:block desktop:block laptop:w-[18rem] laptop:h-[17rem] desktop:w-[20rem] desktop:h-[19rem]"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AnnouncementSection;
