import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig'; // adjust the path as needed
import MegaphonePic from '../../assets/images/Megaphone.png';

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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      console.error("Error deleting announcement: ", err);
    }
  };

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

  return (
    <div className="flex flex-col items-center space-y-4">
      {loading && <p>Loading announcements...</p>}
      {error && <p>{error}</p>}
      {announcements.length === 0 && !loading && <p>No announcements available.</p>}
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="flex justify-center items-center desktop:w-[63rem] laptop:w-[50rem] tablet:w-[38rem] phone:w-[15rem] mx-auto"
        >
          <div className="flex flex-col laptop:flex-row items-center bg-[#E9F5FE] rounded-lg p-2 tablet:p-6 phone:p-3 border-2 border-black">
            <div className="flex flex-col laptop:flex-1 justify-between w-full p-4 tablet:p-6 phone:p-2">
              <div className="bg-[#0C82B4] text-white text-base laptop:text-xl font-bold rounded-lg px-4 py-2 mb-4 laptop:mb-6 shadow w-full">
                <h2 className="text-center laptop:text-lg phone:text-[15px]">
                  {announcement.title}
                </h2>
              </div>
              <div className="flex-1 p-3 h-auto bg-white border-2 border-black rounded-lg">
                <p
                  className="phone:text-xs laptop:text-sm desktop:text-lg text-black"
                  dangerouslySetInnerHTML={renderBodyWithLineBreaks(announcement.body)}
                />
              </div>
              <p className="text-gray-000 text-sm laptop:text-base mt-2 text-right">
                {formatDate(announcement.timestamp)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center mt-4">
              <img
                src={MegaphonePic}
                alt="Announcement"
                className="mb-8 hidden laptop:block desktop:block laptop:w-[18rem] laptop:h-[17rem] desktop:w-[20rem] desktop:h-[19rem]"
              />
              <button
                onClick={() => handleDelete(announcement.id)}
                className="bg-red-500 text-white text-sm laptop:text-base px-4 py-2 rounded-lg shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementSection;
