import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebases/FirebaseConfig";
import { format } from "date-fns"; // Used to format the timestamp.

function useMobileView() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export default function DashboardAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const isMobile = useMobileView();

  // Fetch and sort announcements by timestamp
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "announcements"),
      (snapshot) => {
        const announcementsList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds); // Newest first
        setAnnouncements(announcementsList);
      }
    );

    return () => unsubscribe();
  }, []);

  // Auto-transition between announcements
  useEffect(() => {
    if (announcements.length === 0) return;

    const intervalId = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
        setIsFading(false);
      }, 500); // Duration of the fade-out transition
    }, 5000); // Change every 5 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [announcements]);

  return (
    <div>
      {isMobile ? (
        <div className="bg-white p-6 shadow-xl rounded-lg w-[90%] mx-auto h-[70vh]">
          <h1 className="text-center font-semibold text-2xl mb-4">
            Announcement
          </h1>
          <div className="relative w-full overflow-hidden">
            {announcements.length > 0 ? (
              <div
                className={`transition-opacity duration-500 ${
                  isFading ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="p-4 bg-gray-100 border border-gray-300 rounded-md shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {announcements[currentIndex].title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {announcements[currentIndex].body}
                  </p>
                  {announcements[currentIndex].timestamp && (
                    <p className="text-xs text-gray-500">
                      {format(
                        announcements[currentIndex].timestamp.toDate(),
                        "MMMM d, yyyy"
                      )}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No Announcements Available
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 shadow-xl rounded-lg w-[100%] mx-auto">
          <h1 className="text-center font-semibold text-3xl mb-6">
            Announcement
          </h1>
          <div className="relative w-full overflow-hidden">
            {announcements.length > 0 ? (
              <div
                className={`transition-opacity duration-500 ${
                  isFading ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="p-6 bg-gray-100 border border-gray-300 rounded-md shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {announcements[currentIndex].title}
                  </h2>
                  <p className="text-md text-gray-600 mb-4">
                    {announcements[currentIndex].body}
                  </p>
                  {announcements[currentIndex].timestamp && (
                    <p className="text-sm text-gray-500">
                      {format(
                        announcements[currentIndex].timestamp.toDate(),
                        "MMMM d, yyyy"
                      )}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No Announcements Available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
