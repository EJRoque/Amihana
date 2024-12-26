import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import MarketplaceGraybar from './MarketplaceGraybar';

const { Option } = Select;

export default function MarketplaceSection() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Modern Sofa',
      price: 300,
      category: 'Furniture',
      image: 'https://via.placeholder.com/150',
    },
  ]);

  const [form] = Form.useForm();

  const handleToggleFilter = () => {
    setFilterVisible((prev) => !prev);
  };

  const handleAddProduct = (values) => {
    const { name, price, category, image } = values;

    // Simulate storing the image URL
    const imageUrl = image?.file?.response || 'https://via.placeholder.com/150';

    // products in firebase should display this

    setProducts((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name,
        price: parseFloat(price),
        category,
        image: imageUrl,
      },
    ]);

    form.resetFields();
    setIsModalOpen(false);
    message.success('Product added successfully!');
  };

  return (
    <div className="bg-gray-100 p-4">
      {/* Graybar */}
      <MarketplaceGraybar onToggleFilter={handleToggleFilter} />

      {/* Add Product Button */}
      <Button
        type="primary"
        className="mt-4"
        onClick={() => setIsModalOpen(true)}
      >
        Add Product
      </Button>

      {/* Modal for Adding Product */}
      <Modal
        title="Add New Product"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddProduct}
        >
          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the product name!' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please enter the product price!' }]}
          >
            <Input type="number" placeholder="Enter price" />
          </Form.Item>
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select placeholder="Select a category">
              <Option value="Furniture">Furniture</Option>
              <Option value="Appliances">Appliances</Option>
              <Option value="Decor">Decor</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Product Image"
            name="image"
          >
            <Upload
              name="file"
              listType="picture"
              beforeUpload={() => false} // Disable automatic upload for now
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Product
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Product Grid */}
      <div className="grid grid-cols-4 gap-6 mt-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white shadow-md rounded-md p-3">
            <img
              src={product.image}
              alt={product.name}
              className="rounded-md w-full h-40 object-cover"
            />
            <h3 className="font-semibold text-lg mt-2">{product.name}</h3>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
            <Button type="primary" block>
              Contact Seller
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
