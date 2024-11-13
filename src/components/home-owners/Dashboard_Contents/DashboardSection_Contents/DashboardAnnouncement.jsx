import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebases/FirebaseConfig";
import { Modal, Typography } from "antd";

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

export default function DashboardAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isMobile = useMobileView();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "announcements"),
      (snapshot) => {
        const announcementsList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        setAnnouncements(announcementsList);
        setSelectedAnnouncement(announcementsList[0]); // Set the first announcement as default
      }
    );

    return () => unsubscribe();
  }, []);

  const handleModalOpen = () => setIsModalVisible(true);
  const handleModalClose = () => setIsModalVisible(false);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderBodyWithLineBreaks = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => (
      <p key={index} className="mb-2">
        {line}
      </p>
    ));
  };

  return (
    <div className="flex justify-center items-center h-full w-full px-4">
      {announcements.length > 0 ? (
        <div className="flex bg-white shadow-xl rounded-lg overflow-hidden w-full p-4">
          {/* Display selected announcement */}
          <div
            className="w-2/3 p-5 text-center transition-opacity duration-500 ease-in-out"
            onClick={handleModalOpen}
          >
            <div className="text-center border-b border-gray-200 pb-4 mb-4">
              <Title level={4} className="text-[#0C82B4]">
                {selectedAnnouncement?.title || "Select an Announcement"}
              </Title>
            </div>
            {selectedAnnouncement ? (
              <>
                <Text className="text-lg font-bold text-gray-700 mb-2 block">
                  📅 Date: {formatDate(selectedAnnouncement.timestamp)}
                </Text>
                <Text className="text-lg font-bold text-gray-700 mb-2 block">
                  ⏰ Time: {formatTime(selectedAnnouncement.timestamp)}
                </Text>
                <div className="text-base leading-loose mt-4 text-center">
                  {renderBodyWithLineBreaks(selectedAnnouncement.body)}
                </div>
                <Text className="text-xs text-gray-500 mt-6 block">
                  Thank you for your continued support!
                </Text>
              </>
            ) : (
              <Text>No Announcement Selected</Text>
            )}
          </div>

          {/* Sidebar with announcement titles for selection */}
          <div className="w-1/3 border-l border-gray-200 p-4 space-y-4">
            <Title level={4} className="text-center text-[#0C82B4]">
              Announcements
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
                <Text className="block text-xs text-gray-500">{formatDate(announcement.timestamp)}</Text>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No Announcements Available</div>
      )}

      {/* Modal for expanded view */}
      <Modal
        className="h-auto"
        title="Announcement Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={isMobile ? "90%" : "600px"}
        centered
      >
        {selectedAnnouncement && (
          <div className="p-4 text-center">
            <Title level={3} className="text-[#0C82B4] font-bold">
              {selectedAnnouncement.title}
            </Title>
            <div className="text-lg leading-relaxed text-gray-800 mb-4">
              {renderBodyWithLineBreaks(selectedAnnouncement.body)}
            </div>
            <Text className="text-sm text-gray-500">
              Date: {formatDate(selectedAnnouncement.timestamp)}
              <br />
              Time: {formatTime(selectedAnnouncement.timestamp)}
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
}
