import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc,updateDoc } from 'firebase/firestore';
import { db } from '../../firebases/FirebaseConfig';
import { Card, Typography, Row, Button, Spin, message, Badge, Modal } from 'antd';
import { DeleteOutlined, PushpinOutlined, PushpinFilled,  RollbackOutlined} from '@ant-design/icons';
import MegaphonePic from '../../assets/images/Megaphone.png';
import 'react-quill/dist/quill.snow.css'

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
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

        const announcementsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const announcementDate = new Date(data.timestamp?.seconds * 1000);
          const isArchived = !data.pinned && 
            data.timestamp?.seconds * 1000 < now.getTime() - 7 * 24 * 60 * 60 * 1000;
          const isNew = now.getTime() - announcementDate.getTime() <= threeDaysInMs;

          return { 
            id: doc.id, 
            ...data, 
            isArchived, 
            isNew 
          };
        });

        // Sort announcements by timestamp (newest first), with pinned announcements at the top
        announcementsData.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.timestamp.seconds - a.timestamp.seconds;
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
      setAnnouncements(announcements.filter((announcement) => announcement.id !== id));
      setArchivedAnnouncements(archivedAnnouncements.filter((announcement) => announcement.id !== id));
    } catch (err) {
      console.error('Error deleting announcement: ', err);
      message.error('Failed to delete announcement.');
    }
  };

  const handlePin = async (id, currentPinnedState) => {
    try {
      await updateDoc(doc(db, 'announcements', id), {
        pinned: !currentPinnedState
      });
      message.success(`Announcement ${currentPinnedState ? 'unpinned' : 'pinned'} successfully.`);
    } catch (err) {
      console.error('Error pinning/unpinning announcement: ', err);
      message.error('Failed to pin/unpin announcement.');
    }
  };

  const handleRepost = async (id) => {
    try {
      // Remove archived state and update timestamp
      await updateDoc(doc(db, 'announcements', id), {
        timestamp: { seconds: Math.floor(Date.now() / 1000) },
        pinned: false
      });
      message.success('Announcement reposted successfully.');
    } catch (err) {
      console.error('Error reposting announcement: ', err);
      message.error('Failed to repost announcement.');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

     // Center-align images
  div.querySelectorAll('img').forEach((img) => {
    img.style.display = 'block'; // Ensure image takes up its own block
    img.style.margin = '0 auto'; // Center image horizontally
    console.log('Centered image element:', img.outerHTML);
  });
  
    console.log('Processed HTML:', div.innerHTML); // Log the final processed HTML
    return div.innerHTML;
  };


  const toggleExpand = (id) => {
    setExpandedAnnouncementId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="announcement-section" style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button type="primary" onClick={() => setIsArchiveModalVisible(true)} style={{ marginBottom: '4px', background: '#0C82B4' }}>
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
    backgroundColor: announcement.isNew ? '#E9F5FE' : '#fff',
  
  }}
>
<div 
                style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '10px', 
                  cursor: 'pointer' 
                }}
                onClick={() => handlePin(announcement.id, announcement.pinned)}
              >
                {announcement.pinned ? (
                  <PushpinFilled style={{ color: '#0C82B4', fontSize: '20px' }} />
                ) : (
                  <PushpinOutlined style={{ color: '#999', fontSize: '20px' }} />
                )}
              </div>
<Button
    type="text"
    icon={<DeleteOutlined style={{ color: 'red' }} />}
    onClick={() => handleDelete(announcement.id)}
    style={{
      position: 'absolute',
      top: '35px',
      right: '10px',
      zIndex: 2,
    }}
  />
           
  <Row gutter={[16, 16]} align="middle" justify="center">
    <div className="m-8" style={{ padding: '10px 0', textAlign: 'center' }}>
      <Title level={4} style={{ color: '#0C82B4', textAlign: 'center' }}>
        {announcement.title}
      </Title>
      <div
        className="announcement-body"
        dangerouslySetInnerHTML={{ __html: preprocessHtml(announcement.body) }}
        style={{
          marginBottom: '10px',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#333',
          textAlign: 'left', // Center align content
        }}
      ></div>
      <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
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
                  zIndex: 2, // Ensure delete button is on top
                }}
              />
              <Button
                type="text"
                icon={<RollbackOutlined style={{ color: 'green' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRepost(announcement.id);
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '50px',
                  zIndex: 2,
                }}
                title="Repost Announcement"
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
  dangerouslySetInnerHTML={{ __html: preprocessHtml(announcement.body) }}
  style={{
    marginBottom: '10px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#333',
  }}
></div>
              )}
            </Card>
          ))
        )}
      </Modal>
    </div>
  );
};

export default AnnouncementSection;
