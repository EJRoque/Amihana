import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebases/FirebaseConfig";
import { Modal, Typography } from "antd";
import "react-quill/dist/quill.snow.css";

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

  div.querySelectorAll(".ql-align-center").forEach((el) => {
    el.style.textAlign = "center";
  });

  div.querySelectorAll(".ql-align-right").forEach((el) => {
    el.style.textAlign = "right";
  });

  div.querySelectorAll(".ql-align-justify").forEach((el) => {
    el.style.textAlign = "justify";
  });

  div.querySelectorAll("ul").forEach((ul) => {
    ul.style.paddingLeft = "20px";
    ul.style.listStyleType = "disc";
  });

  div.querySelectorAll("ol").forEach((ol) => {
    ol.style.paddingLeft = "20px";
    ol.style.listStyleType = "decimal";
  });

  div.querySelectorAll("img").forEach((img) => {
    img.style.display = "block";
    img.style.margin = "0 auto";
  });

  return div.innerHTML;
}

export default function DashboardAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isMobile = useMobileView();

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
      setSelectedAnnouncement(announcementsList[0]);
    });

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

  return (
    <div className="flex flex-col tablet:flex-row desktop:flex-row laptop:flex-row justify-center items-center h-full w-full px-4">
      {announcements.length > 0 ? (
        <div className="flex flex-col laptop:flex-row desktop:flex-row tablet:flex-col bg-white shadow-xl rounded-lg overflow-hidden w-full p-4">
          {/* Main Announcement Section */}
          <div
            className="w-full laptop:w-2/3 desktop:w-2/3 tablet:w-full p-5 text-center"
            onClick={handleModalOpen}
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

      <Modal
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
            <div
              className="text-lg leading-relaxed text-gray-800 mb-4"
              dangerouslySetInnerHTML={{
                __html: preprocessHtml(selectedAnnouncement.body),
              }}
            />
            <Text className="text-sm text-gray-500">
              Date: {formatDate(selectedAnnouncement.timestamp)}
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
}
