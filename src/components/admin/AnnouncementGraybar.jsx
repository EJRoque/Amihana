import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebases/FirebaseConfig";
import announcementLogo from "../../assets/icons/announcement-logo.svg";
import { Modal, Button, Input, Spin, message } from "antd"; // Import Ant Design components
import { PlusCircleFilled, NotificationFilled } from "@ant-design/icons";
import { ClipLoader } from "react-spinners"; // For a loading spinner
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import the default theme styles for Quill

const AnnouncementGraybar = ({ setAnnouncement }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(""); // For React Quill content
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") setTitle(value);
  };

  const handleQuillChange = (value) => {
    setBody(value); // Update body state when Quill content changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const docRef = await addDoc(collection(db, 'announcements'), {
        title,
        body,
        timestamp: new Date(),
      });
      console.log("Document written with ID: ", docRef.id);
      setTitle("");
      setBody(""); // Clear the body after submitting
      message.success("Announcement added successfully!");
    } catch (e) {
      console.error("Error adding document: ", e);
      message.error("Failed to add announcement.");
    }
  
    setIsLoading(false);
    handleCloseModal();
  };

  
  return (
    <div className="announcement-graybar">
      <div
        className={`bg-white shadow-md flex items-center justify-between my-3 p-3 rounded-md overflow-hidden 
        ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 
                        'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} 
                        desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
        <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
          <h1 className={`text-[#0C82B4] my-auto font-poppins ${
                sidebarOpen
                  ? "desktop:text-sm laptop:text-sm tablet:text-xs phone:text-[8px]"
                  : "desktop:text-base laptop:text-base tablet:text-sm phone:text-[10px]"
              } phone:ml-1 capitalize`}>
            Announcement <NotificationFilled style={{color:'#0C82B4'}}/>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="primary"
            className="bg-[#0C82B4] hover:bg-[#0a6c8b] text-white"
            onClick={handleOpenModal}
            icon={<span className="material-icons"><PlusCircleFilled /></span>}
          >
            Post
          </Button>
        </div>
      </div>

      {/* Modal for creating an announcement */}
      <Modal
        title="Add New Announcement"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        {isLoading ? (
          <div className="flex justify-center items-center">
            <Spin tip="Adding Announcement..." size="large" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="title" className="text-lg font-poppins font-semibold">
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="body" className="text-lg font-poppins font-semibold">
                  Body
                </label>
                {/* React Quill Editor */}
                <ReactQuill
                  value={body}
                  onChange={handleQuillChange}
                  theme="snow"
                  placeholder="Enter body"
                  required
                  modules={{
                    toolbar: [
                      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['bold', 'italic', 'underline'],
                      [{ 'align': [] }],
                      ['link', 'image'],
                      ['blockquote', 'code-block'],

                    ]
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="bg-[#0C82B4] hover:bg-[#0a6c8b] text-white"
              >
                Post Announcement
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AnnouncementGraybar;
