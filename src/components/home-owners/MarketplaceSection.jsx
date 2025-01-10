import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Upload, message, Card, Space, Typography,Badge, Tag, Pagination } from 'antd';
import { UploadOutlined, EditOutlined, ShoppingOutlined } from '@ant-design/icons';
import MarketplaceGraybar from './MarketplaceGraybar';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebases/FirebaseConfig';
import { getAuth } from 'firebase/auth';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PRODUCTS_PER_PAGE = 6;

export default function MarketplaceSection() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [form] = Form.useForm();
  const auth = getAuth();

  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), where("status", "!=", "sold"));
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
        message.error("Failed to load products");
      }
    };

    fetchProducts();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const isNewProduct = (createdAt) => {
    if (!createdAt) return false;
    
    const createdDate = createdAt instanceof Timestamp 
      ? createdAt.toDate() 
      : new Date(createdAt);
      
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return createdDate > oneWeekAgo;
  };

  const handleAddOrEditProduct = async (values) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        message.error('Please sign in to add or edit products');
        return;
      }

      setUploading(true);
      const { name, price, contact, image, description } = values;
      
      let imageUrl = editingProduct?.imageUrl;
      if (image?.fileList?.[0]?.originFileObj) {
        imageUrl = await handleImageUpload(image.fileList[0].originFileObj);
      }

      const productData = {
        name,
        price: parseFloat(price),
        contact,
        description: description || '', // Add description to product data
        imageUrl,
        status: 'active',
        sellerId: currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      if (editingProduct) {
        if (editingProduct.sellerId !== currentUser.uid) {
          message.error('You can only edit your own products');
          return;
        }
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        message.success('Product updated successfully!');
      } else {
        await addDoc(collection(db, "products"), productData);
        message.success('Product added successfully!');
      }

      form.resetFields();
      setIsModalOpen(false);
      setEditingProduct(null);
      
      // Refresh products
      const q = query(collection(db, "products"), where("status", "!=", "sold"));
      const querySnapshot = await getDocs(q);
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      console.error("Error with product:", error);
      message.error('Operation failed');
    } finally {
      setUploading(false);
    }
  };

  const handleMarkAsSold = async (productId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        message.error('Please sign in to mark products as sold');
        return;
      }

      const product = products.find(p => p.id === productId);
      if (product.sellerId !== currentUser.uid) {
        message.error('You can only mark your own products as sold');
        return;
      }

      await updateDoc(doc(db, "products", productId), {
        status: 'sold'
      });
      message.success('Product marked as sold!');
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Error marking product as sold:", error);
      message.error('Failed to mark as sold');
    }
  };

  const handleEdit = (product) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      message.error('Please sign in to edit products');
      return;
    }

    if (product.sellerId !== currentUser.uid) {
      message.error('You can only edit your own products');
      return;
    }

    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      price: product.price,
      contact: product.contact,
      description: product.description // Add description to form when editing
    });
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      message.error('Please sign in to add products');
      return;
    }

    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5' }}>
      <MarketplaceGraybar onToggleFilter={"handleToggleFilter"} />

      <Button
        type="primary"
        icon={<ShoppingOutlined />}
        style={{ marginTop: 16, marginBottom: 16 }}
        onClick={handleAddNewClick}
      >
        Add Product
      </Button>

      <Modal
        title={editingProduct ? "Edit Product" : "Add New Product"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrEditProduct}
        >
          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the product name!' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a product description!' }]}
          >
            <TextArea 
              placeholder="Describe your product (condition, features, etc.)" 
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>

          <Form.Item
            label="Contact Information"
            name="contact"
            rules={[{ required: true, message: 'Please enter your contact information!' }]}
          >
            <Input placeholder="Enter your contact information" />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please enter the product price!' }]}
          >
            <Input type="number" prefix="₱" placeholder="Enter price" />
          </Form.Item>

          <Form.Item
            label="Product Image"
            name="image"
            rules={[{ required: !editingProduct, message: 'Please upload an image!' }]}
          >
            <Upload
              name="file"
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={uploading}>
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <div style={{ 
  marginTop: 16, 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
  gap: 24,
  marginBottom: 24 
}}>
  {products.slice((currentPage - 1) * 6, currentPage * 6).map((product) => (
    <Badge.Ribbon
      key={product.id}
      text="NEW"
      color="#0C82B4"
      style={{ 
        display: isNewProduct(product.createdAt) ? 'block' : 'none',
        zIndex: 1
      }}
    >
      <Card
        hoverable
        style={{ 
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.04)'
        }}
        cover={
          <div style={{ 
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5'
          }}>
            <img
              alt={product.name}
              src={product.imageUrl}
              style={{ 
                height: 240,
                width: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
            {isNewProduct(product.createdAt) && (
              <Tag 
                color="#0C82B4"
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                New Arrival
              </Tag>
            )}
          </div>
        }
        bodyStyle={{ 
          padding: '20px',
          background: '#ffffff' 
        }}
        actions={
          auth.currentUser?.uid === product.sellerId
            ? [
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEdit(product)}
                  style={{
                    color: '#595959',
                    fontWeight: 500
                  }}
                >
                  Edit
                </Button>,
                <Button 
                  type="text" 
                  onClick={() => handleMarkAsSold(product.id)}
                  style={{
                    color: '#595959',
                    fontWeight: 500
                  }}
                >
                  Mark as Sold
                </Button>
              ]
            : undefined
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Title 
              level={4} 
              style={{ 
                margin: 0,
                fontSize: '18px',
                lineHeight: '24px',
                color: '#262626'
              }}
            >
              {product.name}
            </Title>
            <Text 
              strong 
              style={{ 
                fontSize: '20px',
                color: '#1890ff',
                display: 'block',
                marginTop: '8px'
              }}
            >
              ₱{product.price.toFixed(2)}
            </Text>
          </Space>
        </div>

        <Paragraph 
          ellipsis={{ rows: 2 }}
          style={{ 
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#595959',
            marginBottom: '16px'
          }}
        >
          {product.description}
        </Paragraph>

        <div style={{ 
          borderTop: '1px solid #f0f0f0',
          paddingTop: '16px',
          marginTop: 'auto' 
        }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text 
              style={{ 
                fontSize: '13px',
                color: '#8c8c8c',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: '#1890ff',
                borderRadius: '50%' 
              }}/>
              Contact: {product.contact}
            </Text>
            {isNewProduct(product.createdAt) && (
              <Text 
                type="success"
                style={{ 
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <div style={{ 
                  width: '6px', 
                  height: '6px', 
                  backgroundColor: '#52c41a',
                  borderRadius: '50%' 
                }}/>
                Posted {getTimeAgo(product.createdAt)}
              </Text>
            )}
          </Space>
        </div>
      </Card>
    </Badge.Ribbon>
  ))}
</div>
    </div>
  );
}

// Helper function to show how long ago the product was posted
function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
}