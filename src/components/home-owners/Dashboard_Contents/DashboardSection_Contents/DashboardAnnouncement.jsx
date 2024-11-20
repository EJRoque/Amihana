import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebases/FirebaseConfig";
import { Typography } from "antd";
import { useNavigate } from "react-router-dom";  // Import useNavigate from react-router-dom

const { Title, Text } = Typography;

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

function preprocessHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;

  // Find the title and next element (e.g., subtitle or related content)
  const titleElement = div.querySelector("h1") || div.querySelector("h2") || div.querySelector("h3");
  const subtitleElement = div.querySelector("h4") || div.querySelector("h5") || div.querySelector("p");
  const imageElements = div.querySelectorAll("img");

  // Clear the div and append only the title, subtitle, and images
  const newDiv = document.createElement("div");

  // Append the title if it exists
  if (titleElement) {
    newDiv.appendChild(titleElement);
  }

  // Append the subtitle or next related content (e.g., first paragraph or h4)
  if (subtitleElement) {
    newDiv.appendChild(subtitleElement);
  }

  // Append all images
  imageElements.forEach((img) => {
    newDiv.appendChild(img);
  });

  // Return the modified HTML
  return newDiv.innerHTML;
}

export default function DashboardAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const isMobile = useMobileView();
  const navigate = useNavigate();  // Initialize useNavigate hook for redirection

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "announcements"), (snapshot) => {
      const announcementsList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
        .slice(0, 5); // Limit to 5 featured announcements
      setAnnouncements(announcementsList);
      setSelectedAnnouncement(announcementsList[0]); // Set the first announcement as selected by default
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    // Redirect to the announcement details page
    navigate(`/announcement-home-owners`);
  };

  return (
    <div className="flex flex-col tablet:flex-row desktop:flex-row laptop:flex-row justify-center items-center h-full w-full px-4">
      {announcements.length > 0 ? (
        <div className="flex flex-col laptop:flex-row desktop:flex-row tablet:flex-col bg-white shadow-xl rounded-lg overflow-hidden w-full p-4">
          {/* Main Announcement Section */}
          <div
            className="w-full laptop:w-2/3 desktop:w-2/3 tablet:w-full p-5 text-center cursor-pointer"  // Added cursor-pointer here
            onClick={() => handleAnnouncementClick(selectedAnnouncement)}  // Redirect to announcement page on click
          >
            <div className="text-center border-b border-gray-200 pb-4 mb-4">
              <Title level={4} className="text-[#0C82B4]">
                {selectedAnnouncement?.title || "Select an Announcement"}
              </Title>
            </div>
            {selectedAnnouncement && (
              <div
                className="text-base leading-loose mt-4"
                dangerouslySetInnerHTML={{
                  __html: preprocessHtml(selectedAnnouncement.body),
                }}
              />
            )}
          </div>

          {/* Featured Announcements Section */}
          <div className="w-full laptop:w-1/3 desktop:w-1/3 tablet:w-full border-l border-gray-200 p-4 space-y-4">
            <Title level={4} className="text-center text-[#0C82B4]">
              Featured Announcements
            </Title>
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                onClick={() => setSelectedAnnouncement(announcement)}
                className={`cursor-pointer p-2 rounded-lg ${
                  selectedAnnouncement?.id === announcement.id
                    ? "bg-blue-100 font-bold"
                    : "hover:bg-gray-100"
                }`}
              >
                <Text>{announcement.title}</Text>
                <Text className="block text-xs text-gray-500">
                  {formatDate(announcement.timestamp)}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No Announcements Available
        </div>
      )}
    </div>
  );
}
