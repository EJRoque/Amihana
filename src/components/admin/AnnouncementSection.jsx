import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig';
import { Card, Typography, Row, Button, Spin, message, Badge, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import MegaphonePic from '../../assets/images/Megaphone.png';

const { Title, Text } = Typography;

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isArchiveModalVisible, setIsArchiveModalVisible] = useState(false);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'announcements'),
      (snapshot) => {
        const now = new Date();
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
  
        const announcementsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const announcementDate = new Date(data.timestamp?.seconds * 1000);
          const isArchived = data.timestamp?.seconds * 1000 < now.getTime() - 7 * 24 * 60 * 60 * 1000;
          const isNew = now.getTime() - announcementDate.getTime() <= threeDaysInMs; // Check if announcement is within 3 days
  
          return { id: doc.id, ...data, isArchived, isNew };
        });
  
        setAnnouncements(announcementsData.filter((a) => !a.isArchived));
        setArchivedAnnouncements(announcementsData.filter((a) => a.isArchived));
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

  const toggleExpand = (id) => {
    setExpandedAnnouncementId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="announcement-section" style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
      <Button type="primary" onClick={() => setIsArchiveModalVisible(true)} style={{ marginBottom: '4px' }}>
        Archive
      </Button>
      </div>
      {announcements.length === 0 && !loading && !error && (
        <div style={{ marginTop: '10px' }}>
          <Text>No announcements available.</Text>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin tip="Loading announcements..." />
        </div>
      ) : error ? (
        <Text type="danger">{error}</Text>
      ) : (
        announcements.map((announcement, index) => (
          <Badge.Ribbon
        text="Latest"
        color="#0C82B4"
        style={{ display: announcement.isNew && index === 0 ? 'inline' : 'none' }}
        key={announcement.id}
      >
            <Card
          bordered={false}
          className="announcement-card"
          style={{
            marginBottom: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            backgroundColor: announcement.isNew ? '#E9F5FE' : '#fff', // Change color based on isNew
          }}
        >
              <Button
                type="text"
                icon={<DeleteOutlined style={{ color: 'red' }} />}
                onClick={() => handleDelete(announcement.id)}
                style={{
                  position: 'absolute',
                  top: '35px',
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
          </Badge.Ribbon>
        ))
      )}

      <Modal
        title="Archived Announcements"
        visible={isArchiveModalVisible}
        onCancel={() => setIsArchiveModalVisible(false)}
        footer={null}
      >
        {archivedAnnouncements.length === 0 ? (
          <Text>No archived announcements available.</Text>
        ) : (
          archivedAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              bordered={false}
              className="archive-card"
              style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
              onClick={() => toggleExpand(announcement.id)}
            >
              <Button
                type="text"
                icon={<DeleteOutlined style={{ color: 'red' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(announcement.id);
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  zIndex: 1,
                }}
              />
              <Title level={5} style={{ color: '#0C82B4' }}>
                {announcement.title}
              </Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatDate(announcement.timestamp)}
              </Text>
              {expandedAnnouncementId === announcement.id && (
                <div
                  className="announcement-body"
                  dangerouslySetInnerHTML={renderBodyWithLineBreaks(announcement.body)}
                  style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.6', color: '#333' }}
                />
              )}
            </Card>
          ))
        )}
      </Modal>
    </div>
  );
};

export default AnnouncementSection;
