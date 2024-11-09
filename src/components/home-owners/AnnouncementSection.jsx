import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebases/FirebaseConfig";
import MegaphonePic from "../../assets/images/Megaphone.png";
import { Card, Typography, Row, Spin } from "antd";

const { Title, Text } = Typography;

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      },
      (err) => {
        console.error("Error fetching announcements: ", err);
        setError("Failed to load announcements.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
    <div style={{ padding: "20px", textAlign: "center" }}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <Spin tip="Loading announcements..." />
        </div>
      ) : error ? (
        <Text type="danger">{error}</Text>
      ) : announcements.length === 0 ? (
        <Text>No announcements available.</Text>
      ) : (
        announcements.map((announcement) => (
          <Card
            key={announcement.id}
            style={{
              marginBottom: "20px",
              borderRadius: "12px",
              boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
              position: "relative",
              padding: "20px",
              width: "100%",
              maxWidth: "800px", // Limit max width for better appearance
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Megaphone Image */}
            <img
              src={MegaphonePic}
              alt="Megaphone"
              style={{
                position: "absolute",
                top: "15px",
                left: "15px",
                width: "40px", // Adjust the size of the image
                transform: "scaleX(-1)", // Flip the image horizontally
              }}
            />

            <Row gutter={[16, 16]} align="middle">
              <div style={{ width: "100%" }}>
                <Title level={4} style={{ color: "#0C82B4", fontSize: "20px" }}>
                  {announcement.title}
                </Title>
                <div
                  dangerouslySetInnerHTML={renderBodyWithLineBreaks(announcement.body)}
                  style={{
                    marginBottom: "10px",
                    fontSize: "14px",
                    lineHeight: "1.8",
                    color: "#333",
                    whiteSpace: "pre-line", // Ensures line breaks are preserved
                  }}
                />
                <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: "10px" }}>
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
