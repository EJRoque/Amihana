import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Menu, Typography, Space, Modal, List, Button, message } from 'antd';
import { BellOutlined, DashboardFilled } from '@ant-design/icons';
import { getPendingReservations, approveReservation, declineReservation, checkReservationConflict } from '../../../firebases/firebaseFunctions';

export default function DashboardNotifbar() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsList = await getPendingReservations();
        // Ensure notificationsList is an array
        setNotifications(Array.isArray(notificationsList) ? notificationsList : []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]); // Fallback to an empty array in case of error
      }
    };

    fetchNotifications();
  }, []);

  const handleViewAll = () => {
    setViewAllModalOpen(true);
  };

  const handleViewAllCancel = () => {
    setViewAllModalOpen(false);
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setViewAllModalOpen(false);
  };

  const handleAccept = async (reservationId, formValues) => {
    try {
      const conflictExists = await checkReservationConflict(
        formValues.date,
        formValues.venue,
        formValues.startTime,
        formValues.endTime
      );
  
      if (conflictExists) {
        message.error('This event has already been reserved and cannot be accepted again.');
        return;
      }
  
      await approveReservation(reservationId, formValues);
      const notificationsList = await getPendingReservations();
      setNotifications(Array.isArray(notificationsList) ? notificationsList : []);
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error accepting reservation:', error);
      message.error('Failed to accept reservation.');
    }
  };

  const handleDecline = async (reservationId) => {
    try {
      await declineReservation(reservationId);
      const notificationsList = await getPendingReservations();
      setNotifications(Array.isArray(notificationsList) ? notificationsList : []);
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error declining reservation:', error);
      message.error('Failed to decline reservation.');
    }
  };

  const notificationMenuItems = notifications.length
    ? notifications.map((item) => ({
        key: item.id,
        label: (
          <div onClick={() => handleNotificationClick(item)}>
            <Typography.Text>
              New Reservation request from {item.formValues?.userName || 'Unknown User'}
            </Typography.Text>
          </div>
        ),
      }))
    : [
        {
          key: 'no-notification',
          label: <div className="text-center text-gray-500">No notifications</div>,
        },
      ];

  notificationMenuItems.push({
    key: 'view-all',
    label: (
      <div className="text-center border-t pt-2">
        <span onClick={handleViewAll} className="text-blue-500 hover:underline cursor-pointer">
          View all notifications
        </span>
      </div>
    ),
  });

  return (
    <div
      className={`bg-white shadow-md flex items-center justify-between my-3 p-3 rounded-md overflow-hidden ${
        sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'
      } desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}
    >
      <h1
        className={`text-[#0C82B4] my-auto font-poppins ${
          sidebarOpen
            ? 'desktop:text-sm laptop:text-sm tablet:text-xs phone:text-md'
            : 'desktop:text-lg laptop:text-md tablet:text-sm phone:text-[10px]'
        } phone:ml-1 capitalize`}
      >
        Dashboard
        <DashboardFilled className="mx-2" />
      </h1>

      <Space>
        <Dropdown menu={{ items: notificationMenuItems }} trigger={['click']} placement="bottomRight">
          <Badge count={notifications.length} className="cursor-pointer">
            <BellOutlined className="text-lg text-gray-600 mr-3" />
          </Badge>
        </Dropdown>
      </Space>

      <Modal
        title="Notification Details"
        open={!!selectedNotification}
        onCancel={() => setSelectedNotification(null)}
        footer={null}
        centered
        width={800}
      >
        {selectedNotification && (
          <div>
            <Typography.Title level={4}>Reservation Details</Typography.Title>
            <Typography.Paragraph>
              <div>
                <strong>Name:</strong> {selectedNotification.formValues?.userName || 'Unknown User'}
              </div>
              <div>
                <strong>Date: </strong> 
                {selectedNotification.formValues?.date 
                ? new Date(selectedNotification.formValues.date).toLocaleDateString('en-US', {
                    year: 'numeric', // "2024"
                    month: 'long', // "November"
                    day: 'numeric' // "20"
                 })
                : 'N/A'}
              </div>
              <div>
                <strong>Time:</strong> {selectedNotification.formValues?.startTime || 'N/A'} -{' '}
                {selectedNotification.formValues?.endTime || 'N/A'}
              </div>
              <div>
                <strong>Venue:</strong> {selectedNotification.formValues?.venue || 'N/A'}
              </div>
              {/* Use the totalAmount stored in the notification */}
              <div>
                <strong>Total Amount:</strong>{' '}
                {typeof selectedNotification.formValues?.totalAmount === 'string' 
                  ? `₱${parseFloat(selectedNotification.formValues.totalAmount).toFixed(2)}`
                  : `₱${selectedNotification.formValues?.totalAmount?.toFixed(2) || '0.00'}`}
              </div>
            </Typography.Paragraph>
            <div className="mt-2">
              <Button
                onClick={() => handleAccept(selectedNotification.id, selectedNotification.formValues)}
                type="primary"
                className="mr-2"
              >
                Accept
              </Button>
              <Button onClick={() => handleDecline(selectedNotification.id)} type="danger">
                Decline
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="All Notifications"
        open={viewAllModalOpen}
        onCancel={handleViewAllCancel}
        footer={null}
        centered
        width={800}
      >
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={`New Reservation request from ${item.formValues?.userName || 'Unknown User'}`}
                description={
                  <>
                    <div>
                      <strong>Date:</strong> {item.formValues?.date || 'N/A'}
                    </div>
                    <div>
                      <strong>Time:</strong> {item.formValues?.startTime || 'N/A'} -{' '}
                      {item.formValues?.endTime || 'N/A'}
                    </div>
                    <div>
                      <strong>Venue:</strong> {item.formValues?.venue || 'N/A'}
                    </div>
                    <div className="mt-2">
                      <Button
                        onClick={() => handleAccept(item.id, item.formValues)}
                        type="primary"
                        className="mr-2"
                      >
                        Accept
                      </Button>
                      <Button onClick={() => handleDecline(item.id)} type="danger">
                        Decline
                      </Button>
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}
