import React, { useState, useEffect } from "react";
import { Dropdown, Badge, Menu, Typography, Space, Modal, List, Button, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';

export default function DashboardBar() {
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);

  const handleViewAll = () => {
    setViewAllModalOpen(true);
  };

  const handleViewAllCancel = () => {
    setViewAllModalOpen(false);
  };

  const handleNotificationClick = (item) => {
    // Handle notification click here
    console.log('Notification clicked:', item);
  };

  const notificationMenu = (
    <Menu className="w-80">
      {notifications.length
        ? notifications.map((item) => (
            <Menu.Item key={item.id} onClick={() => handleNotificationClick(item)}>
              <Typography.Text>
                New Reservation request from {item.formValues.userName}
              </Typography.Text>
            </Menu.Item>
          ))
        : <Menu.Item key="no-notification">
            <div className="text-center text-gray-500">No notifications</div>
          </Menu.Item>
      }
      <Menu.Item key="view-all" className="text-center border-t pt-2">
        <span onClick={handleViewAll} className="text-blue-500 hover:underline cursor-pointer">
          View all notifications
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={`bg-white shadow-md flex items-center my-3 p-3 rounded-md overflow-hidden ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
      <div className="flex-1">
        {/* Additional content can go here, aligned to the left */}
      </div>
      <Space className="ml-auto">
        <Dropdown overlay={notificationMenu} trigger={['click']} placement="bottomRight">
          <Badge count={notifications.length} className="cursor-pointer">
            <BellOutlined className="text-lg text-gray-600" />
          </Badge>
        </Dropdown>
      </Space>
    </div>
  );
}
