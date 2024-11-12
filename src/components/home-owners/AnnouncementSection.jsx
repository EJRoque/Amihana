import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebases/FirebaseConfig";
import MegaphonePic from "../../assets/images/Megaphone.png";
import { Card, Typography, Row, Spin, Select } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "announcements"),
      (snapshot) => {
        const announcementsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds); // Sort by timestamp (newest first)

        setAnnouncements(announcementsData);
        setLoading(false);
        setFilteredAnnouncements(announcementsData); // Initially, show all announcements
      },
      (err) => {
        console.error("Error fetching announcements: ", err);
        setError("Failed to load announcements.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filterAnnouncements = (filter) => {
    const now = new Date();
    let filtered = announcements;

    if (filter === "today") {
      filtered = announcements.filter((announcement) => {
        const announcementDate = new Date(announcement.timestamp.seconds * 1000);
        return (
          announcementDate.toDateString() === now.toDateString()
        );
      });
    } else if (filter === "last7days") {
      filtered = announcements.filter((announcement) => {
        const announcementDate = new Date(announcement.timestamp.seconds * 1000);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return announcementDate >= sevenDaysAgo;
      });
    } else if (filter === "lastMonth") {
      filtered = announcements.filter((announcement) => {
        const announcementDate = new Date(announcement.timestamp.seconds * 1000);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return announcementDate >= oneMonthAgo;
      });
    }

    setFilteredAnnouncements(filtered);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    filterAnnouncements(value);
  };

  const renderBodyWithLineBreaks = (text) => {
    return { __html: text.replace(/\n/g, "<br />") };
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-5 text-center">
      <div className="mb-4">
        <Select value={filter} onChange={handleFilterChange} className="w-40 flex justify-start">
          <Option value="all">All</Option>
          <Option value="today">Today</Option>
          <Option value="last7days">Last 7 Days</Option>
          <Option value="lastMonth">Last Month</Option>
        </Select>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spin tip="Loading announcements..." />
        </div>
      ) : error ? (
        <Text type="danger">{error}</Text>
      ) : filteredAnnouncements.length === 0 ? (
        <Text>No announcements available.</Text>
      ) : (
        filteredAnnouncements.map((announcement) => (
          <Card
            key={announcement.id}
            className="mb-3 p-5 shadow-md rounded-md overflow-hidden my-8
                       desktop:-mx-2 desktop:h-auto laptop:-mx-4 tablet:-mx-6 phone:-mx-8"
          >
            {/* Megaphone Image */}
            <img
              src={MegaphonePic}
              alt="Megaphone"
              className="absolute top-4 left-4 w-10 transform -scale-x-100"
            />

            <Row gutter={[16, 16]} align="middle">
              <div className="w-full">
                <Title level={4} className="text-blue-600 text-lg">
                  {announcement.title}
                </Title>
                <div
                  dangerouslySetInnerHTML={renderBodyWithLineBreaks(announcement.body)}
                  className="mb-2 text-sm leading-relaxed text-gray-800 whitespace-pre-line"
                />
                <Text type="secondary" className="text-xs block mt-2">
                  {formatDate(announcement.timestamp)}
                </Text>
              </div>
            </Row>
          </Card>
        ))
      )}
    </div>
  );
};

export default AnnouncementSection;
