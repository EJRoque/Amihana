import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig'; // adjust the path as needed
import MegaphonePic from "../../assets/images/Megaphone.png";

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="flex flex-col items-center space-y-4 min-h-screen px-2 tablet:px-4 laptop:px-6 desktop:px-8">
      {announcements.length === 0 ? (
        <p className="text-xs phone:text-xs">No announcements available.</p>
      ) : (
        announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="flex flex-col laptop:flex-row items-center bg-[#E9F5FE] rounded-lg p-2 tablet:p-4 laptop:p-6 border-2 border-black w-full max-w-screen-sm mx-auto"
          >
            <div className="flex flex-col justify-between w-full p-2 tablet:p-4">
              <div className="bg-[#0C82B4] text-white text-xs tablet:text-sm laptop:text-base font-bold rounded-lg px-2 tablet:px-4 py-1 tablet:py-2 mb-2 tablet:mb-4 shadow w-full">
                <h2 className="text-center text-xs tablet:text-sm laptop:text-base desktop:text-lg phone:text-[12px]">
                  {announcement.title || "No Title"}
                </h2>
              </div>
              <div className="flex-1 p-2 bg-white border-2 border-black rounded-lg">
                <p
                  className="text-xs tablet:text-sm laptop:text-base desktop:text-lg phone:text-[8px] text-black"
                  dangerouslySetInnerHTML={renderBodyWithLineBreaks(announcement.body || "No content available.")}
                />
              </div>
              <p className="text-gray-700 text-xs tablet:text-sm laptop:text-base mt-2 text-right">
                {formatDate(announcement.timestamp)}
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
        ))
      )}
    </div>
  );
};

export default AnnouncementSection;
