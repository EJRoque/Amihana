import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebases/FirebaseConfig";
import { Carousel, Modal, Typography } from "antd";
import MegaphonePic from "../../../../assets/images/Megaphone.png";

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
        <div
          className="relative bg-white p-4 shadow-xl rounded-lg cursor-pointer overflow-hidden w-full max-w-[1100px] mx-auto h-full max-h-[1000px] tablet:max-h-[500px] phone:max-h-[320px]"
          onClick={handleModalOpen}
        >
          <Carousel
            autoplay
            autoplaySpeed={3000}
            dots={false}
            effect="scrollx"
            style={{ width: "100%" }}
          >
            {announcements.map((announcement, index) => (
              <div key={index} className="p-5 text-center transition-opacity duration-500 ease-in-out">
               
                <Title level={4} className="text-[#0C82B4] font-bold">
                  <span role="img" aria-label="alert">🚨</span> Attention, All Customers!
                </Title>
                <Text className="text-lg font-bold text-gray-700 mb-2 block">
                  📅 Date: {formatDate(announcement.timestamp)}
                </Text>
                <Text className="text-lg font-bold text-gray-700 mb-2 block">
                  ⏰ Time: {formatTime(announcement.timestamp)}
                </Text>
                <div className="text-base leading-relaxed text-gray-800 mt-4 text-center">
                  {renderBodyWithLineBreaks(announcement.body)}
                </div>
                <Text className="text-xs text-gray-500 mt-6 block">
                  Thank you for your continued support!
                </Text>
              </div>
            ))}
          </Carousel>
        </div>
      ) : (
        <div className="text-center text-gray-500">No Announcements Available</div>
      )}

      {/* Modal for expanded view */}
      <Modal
        title="Announcement"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={isMobile ? "90%" : "600px"}
      >
        {announcements.length > 0 && (
          <Carousel autoplay autoplaySpeed={5000} dots effect="scrollx">
            {announcements.map((announcement, index) => (
              <div key={index} className="p-4 text-center">
                <img
                  src={MegaphonePic}
                  alt="Megaphone"
                  className="w-16 mb-5 mx-auto"
                />
                <Title level={3} className="text-[#0C82B4] font-bold">
                  {announcement.title}
                </Title>
                <div className="text-lg leading-relaxed text-gray-800 mb-20 text-justify">
                  {renderBodyWithLineBreaks(announcement.body)}
                </div>
                <Text className="text-sm text-gray-500">
                  Date: {formatDate(announcement.timestamp)}
                  <br />
                  Time: {formatTime(announcement.timestamp)}
                </Text>
              </div>
            ))}
          </Carousel>
        )}
      </Modal>
    </div>
  );
}

