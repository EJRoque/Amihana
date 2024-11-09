import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig'; // adjust the path as needed
import { Card, Typography, Row, Button, Spin, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import MegaphonePic from '../../assets/images/Megaphone.png';

const { Title, Text } = Typography;

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'announcements'),
      (snapshot) => {
        const announcementsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

        setAnnouncements(announcementsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching announcements: ', err);
        setError('Failed to load announcements.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      message.success('Announcement deleted successfully.');
    } catch (err) {
      console.error('Error deleting announcement: ', err);
      message.error('Failed to delete announcement.');
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
    <div className="announcement-section" style={{ textAlign: 'center', padding: '20px' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
            bordered={false}
            className="announcement-card"
            style={{
              marginBottom: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: 'red' }} />}
              onClick={() => handleDelete(announcement.id)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1,
              }}
            />
            <img
              src={MegaphonePic}
              alt="Megaphone"
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                width: '60px',
                transform: 'scaleX(-1)',
              }}
            />

            <Row gutter={[16, 16]} align="middle">
              <div className="m-8" style={{ padding: '10px 0' }}>
                <Title level={4} style={{ color: '#0C82B4' }}>
                  {announcement.title}
                </Title>
                <div
                  className="announcement-body"
                  dangerouslySetInnerHTML={renderBodyWithLineBreaks(announcement.body)}
                  style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.6', color: '#333' }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
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
