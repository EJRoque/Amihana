import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig';
import { Card, Typography, Row, Spin, Badge, Button, Modal } from 'antd';
import MegaphonePic from '../../assets/images/Megaphone.png';
import 'react-quill/dist/quill.snow.css'

const { Title, Text } = Typography;

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isArchiveModalVisible, setIsArchiveModalVisible] = useState(false);
  const [expandedArchiveId, setExpandedArchiveId] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

        const querySnapshot = await getDocs(collection(db, 'announcements'));
        const announcementsData = querySnapshot.docs.map((doc) => {
          const data = {
            id: doc.id,
            ...doc.data(),
          };
          const announcementDate = new Date(data.timestamp?.seconds * 1000);
          const isArchived = data.timestamp?.seconds * 1000 < now.getTime() - 7 * 24 * 60 * 60 * 1000;
          const isNew = now.getTime() - announcementDate.getTime() <= threeDaysInMs; // Check if announcement is within 3 days

          return { ...data, isArchived, isNew };
        });

        // Sort announcements by timestamp (newest first)
      announcementsData.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

        setAnnouncements(announcementsData.filter((item) => !item.isArchived));
        setArchivedAnnouncements(announcementsData.filter((item) => item.isArchived));
      } catch (err) {
        console.error('Error fetching announcements: ', err);
        setError('Failed to load announcements.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

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

  const toggleExpandArchive = (id) => {
    setExpandedArchiveId((prevId) => (prevId === id ? null : id));
  };

  const openArchiveModal = () => setIsArchiveModalVisible(true);
  const closeArchiveModal = () => setIsArchiveModalVisible(false);

  const preprocessHtml = (html) => {
    console.log('Original HTML:', html); // Log the original HTML content
  
    const div = document.createElement('div');
    div.innerHTML = html;
  

    // Custom styles for headers
    div.querySelectorAll('h1').forEach((h1) => {
      h1.style.fontSize = '24px'; // Custom size for h1
    });
    div.querySelectorAll('h2').forEach((h2) => {
      h2.style.fontSize = '20px'; // Custom size for h2
    });

     // Apply inline alignment styles directly
  div.querySelectorAll('.ql-align-center').forEach((el) => {
    el.style.textAlign = 'center';
    console.log('Center-align element:', el.outerHTML);
  });

  div.querySelectorAll('.ql-align-right').forEach((el) => {
    el.style.textAlign = 'right';
    console.log('Right-align element:', el.outerHTML);
  });


  div.querySelectorAll('.ql-align-justify').forEach((el) => {
    el.style.textAlign = 'justify';
    console.log('Justify element:', el.outerHTML);
  });
  
    // Ensure lists display correctly and log any adjustments
    div.querySelectorAll('ul').forEach((ul) => {
      ul.style.paddingLeft = '20px';
      ul.style.listStyleType = 'disc';
      console.log('Styled UL element:', ul.outerHTML);
    });
  
    div.querySelectorAll('ol').forEach((ol) => {
      ol.style.paddingLeft = '20px';
      ol.style.listStyleType = 'decimal';
      console.log('Styled OL element:', ol.outerHTML);
    });
  
    console.log('Processed HTML:', div.innerHTML); // Log the final processed HTML
    return div.innerHTML;
  };

  return (
    <div className="announcement-section" style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button type="primary" onClick={openArchiveModal}>
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
        announcements.map((announcement) => (
          <Badge.Ribbon
            text="Latest"
            color="#0C82B4"
            style={{ display: announcement.isNew ? 'inline' : 'none' }}
            key={announcement.id}
          >
            <Card
              bordered={false}
              className="announcement-card"
              style={{
                marginBottom: '20px',
                marginTop: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                backgroundColor: announcement.isNew ? '#E9F5FE' : '#fff',
              }}
            >
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
                    dangerouslySetInnerHTML={{ __html: preprocessHtml(announcement.body) }}
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
        onCancel={closeArchiveModal}
        footer={null}
      >
        {archivedAnnouncements.length === 0 ? (
          <Text>No archived announcements available.</Text>
        ) : (
          archivedAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
              onClick={() => toggleExpandArchive(announcement.id)}
            >
              <Title level={5}>{announcement.title}</Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatDate(announcement.timestamp)}
              </Text>
              {expandedArchiveId === announcement.id && (
                <div
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
