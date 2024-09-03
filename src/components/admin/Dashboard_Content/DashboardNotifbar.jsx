import React, { useState } from 'react';
import { Dropdown, Badge, Menu, Typography, Space, Modal, List } from 'antd';
import { BellOutlined } from '@ant-design/icons';

export default function DashboardNotifbar() {
  const [notifications, setNotifications] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleViewAll = () => {
    setIsModalVisible(true); // Open the modal
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Close the modal
  };

  const menu = (
    <Menu
      className="w-80"
      items={[
        ...(notifications.length
          ? notifications.map((item, index) => ({
              key: index,
              label: <Typography.Text>{item}</Typography.Text>,
            }))
          : [{ key: 'no-notification', label: <div className="text-center text-gray-500">No notifications</div> }]),
        {
          key: 'view-all',
          label: (
            <div className="text-center border-t pt-2">
              <span onClick={handleViewAll} className="text-blue-500 hover:underline cursor-pointer">
                View all notifications
              </span>
            </div>
          ),
        },
      ]}
    />
  );

  return (
    <div className="bg-white h-12 shadow-md flex justify-end items-center rounded-md px-4">
      <Space>
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <Badge count={notifications.length} className="cursor-pointer">
            <BellOutlined className="text-lg phone:text-xl laptop:text-2xl desktop:text-3xl text-gray-600 mr-3" />
          </Badge>
        </Dropdown>
      </Space>

      {/* Modal for Viewing All Notifications */}
      <Modal
        title="All Notifications"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        width="95%" // Adjust modal width for responsiveness
        style={{ top: '-20%', maxHeight: '80vh' }} // Move modal closer to the top with adjustable height
        bodyStyle={{ overflowY: 'auto' }}
        className="phone:max-w-md laptop:max-w-3xl desktop:max-w-4xl mx-auto"
      >
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text>{item}</Typography.Text>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}
