import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Menu, Typography, Space, Modal, Button } from 'antd';
import { BellOutlined, DashboardFilled } from '@ant-design/icons';
import { db } from '../../../firebases/FirebaseConfig';
import { collection, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getCurrentUserId, fetchUserFullName } from '../../../firebases/firebaseFunctions';

export default function DashboardBar() {
  const [notifications, setNotifications] = useState([]);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentUserFullName, setCurrentUserFullName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [venueAmounts, setVenueAmounts] = useState({ basketball: 0, clubhouse: 0 });

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
    setNotifications(storedNotifications);

    const fetchUserName = async () => {
      if (currentUserId) {
        try {
          const fullName = await fetchUserFullName(currentUserId);
          setCurrentUserFullName(fullName);
        } catch (error) {
          console.error('Failed to fetch user full name:', error);
        }
      }
    };
    fetchUserName();
  }, [currentUserId]);

  useEffect(() => {
    // Fetch the venue amounts from Firestore for both venues (Basketball Court and Club House)
    const fetchVenueAmounts = async () => {
      try {
        const basketballDocRef = doc(db, "venueAmounts", "BasketballCourt");
        const clubhouseDocRef = doc(db, "venueAmounts", "ClubHouse");
        const basketballDoc = await getDoc(basketballDocRef);
        const clubhouseDoc = await getDoc(clubhouseDocRef);

        setVenueAmounts({
          basketball: basketballDoc.exists() ? basketballDoc.data().amount : 0,
          clubhouse: clubhouseDoc.exists() ? clubhouseDoc.data().amount : 0,
        });
      } catch (error) {
        console.error("Error fetching venue amounts:", error);
      }
    };
    
    fetchVenueAmounts();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const updatedNotifications = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'approved' || data.status === 'declined') {
          const { userName, venue, date, startTime, endTime } = data.formValues || {};
          const totalAmount = calculateTotalAmount(startTime, endTime, venue);
          updatedNotifications.push({
            id: doc.id,
            userName,
            status: data.status,
            venue,
            date,
            startTime,
            endTime,
            totalAmount,
            message: `Hi ${userName}, your reservation for ${venue} on ${date} from ${startTime} to ${endTime} has been ${
              data.status === 'approved' ? 'approved' : 'declined'
            } by the admin.`,
          });
        }
      });

      setNotifications(updatedNotifications);
    });

    return () => unsubscribe();
  }, [currentUserFullName, venueAmounts]);

  const calculateTotalAmount = (startTime, endTime, venue) => {
    if (!startTime || !endTime || !venue) return 0;
    const amountPerHour = venue === "Basketball Court" ? venueAmounts.basketball : venueAmounts.clubhouse;
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);
    let durationInHours = (end - start) / (1000 * 60 * 60);
    if (durationInHours < 0) durationInHours += 24; // Adjust if crossing midnight
    return durationInHours * amountPerHour;
  };

  const removeNotification = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to remove notification:', error);
    }
  };

  const handleViewAll = () => setViewAllModalOpen(true);
  const handleViewAllCancel = () => setViewAllModalOpen(false);
  const handleNotificationDetail = (item) => {
    setSelectedNotification(item);
    setDetailModalVisible(true);
  };

  const handleDetailModalClose = async () => {
    if (selectedNotification) {
      await removeNotification(selectedNotification.id);
    }
    setDetailModalVisible(false);
    setSelectedNotification(null);
  };

  const handleGoToEventPage = async () => {
    if (selectedNotification) {
      await removeNotification(selectedNotification.id);
    }
    window.location.href = '/events-home-owners';
  };

  const notificationMenu = (
    <Menu className="w-80">
      {notifications.length ? (
        notifications.map((item, index) => (
          <Menu.Item key={item.id} onClick={() => handleNotificationDetail(item)}>
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column' }}>
              <Typography.Text strong>
                {item.status === 'approved' ? 'Reservation Approved' : 'Reservation Declined'}
              </Typography.Text>
            </div>
            {index < notifications.length - 1 && <Menu.Divider />}
          </Menu.Item>
        ))
      ) : (
        <Menu.Item key="no-notification" className="text-center text-gray-500">
          No notifications
        </Menu.Item>
      )}
      <Menu.Item key="view-all" className="text-center border-t pt-2">
        <span onClick={handleViewAll} className="text-blue-500 hover:underline cursor-pointer">
          View all notifications
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <div
        className={`bg-white shadow-md flex items-center justify-between my-3 p-3 rounded-md overflow-hidden 
        ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 
                        'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} 
                        desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}
      >
        <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
          <h1
            className={`text-[#0C82B4] my-auto font-poppins ${
              sidebarOpen
                ? 'desktop:text-sm laptop:text-sm tablet:text-xs phone:text-[8px]'
                : 'desktop:text-base laptop:text-base tablet:text-sm phone:text-[10px]'
            } phone:ml-1 capitalize`}
          >
            Dashboard
            <DashboardFilled className="mx-2" />
          </h1>
        </div>
        <Space className="mr-4">
          <Dropdown overlay={notificationMenu} trigger={['click']} placement="bottomRight">
            <Badge count={notifications.length} className="cursor-pointer">
              <BellOutlined className="text-lg text-gray-600" />
            </Badge>
          </Dropdown>
        </Space>
      </div>

      <Modal
        title="All Notifications"
        open={viewAllModalOpen}
        onCancel={handleViewAllCancel}
        footer={null}
        width={600}
      >
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item.id}
              style={{
                padding: 10,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={() => handleNotificationDetail(item)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <Typography.Text strong>
                {item.status === 'approved' ? 'Reservation Approved' : 'Reservation Declined'}
              </Typography.Text>
            </div>
          ))
        ) : (
          <Typography.Text className="text-gray-500">No notifications available.</Typography.Text>
        )}
      </Modal>

      <Modal
        title="Notification Details"
        open={detailModalVisible}
        onCancel={handleDetailModalClose}
        footer={null}
      >
        {selectedNotification && (
          <div>
            <Typography.Title level={4}>
              {selectedNotification.status === 'approved' ? 'Reservation Approved' : 'Reservation Declined'}
            </Typography.Title>
            <Typography.Paragraph>
              <div>
                <strong>Name:</strong> {selectedNotification.userName || 'Unknown User'}
              </div>
              <div>
                <strong>Date:</strong> {selectedNotification.date || 'N/A'}
              </div>
              <div>
                <strong>Time:</strong> {selectedNotification.startTime || 'N/A'} -{' '}
                {selectedNotification.endTime || 'N/A'}
              </div>
              <div>
                <strong>Venue:</strong> {selectedNotification.venue || 'N/A'}
              </div>
              <div>
                <strong>Total Amount:</strong> {selectedNotification.totalAmount ? `${selectedNotification.totalAmount} Php` : 'Amount not set'}
              </div>
              <div
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderRadius: 5,
                  backgroundColor: selectedNotification.status === 'approved' ? '#e0f7fa' : '#ffebee',
                  border: selectedNotification.status === 'approved' ? '1px solid #b2ebf2' : '1px solid #ef5350',
                }}
              >
                {selectedNotification.status === 'approved' ? (
                  <strong>
                    Greetings, your reservation has been approved by the admin. You may now check it on your Event Page.
                  </strong>
                ) : (
                  <strong>
                    Sorry to inform you, but your reservation has been declined by the admin due to a reservation
                    conflict. You may try to book a different venue, date, and time.
                  </strong>
                )}
              </div>
            </Typography.Paragraph>
            {selectedNotification.status === 'approved' && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                <Button type="primary" onClick={handleGoToEventPage}>
                  Go to Event Page
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
