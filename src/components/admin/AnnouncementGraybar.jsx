import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebases/FirebaseConfig"; // adjust the path as needed
import announcementLogo from "../../assets/icons/announcement-logo.svg";
import Modal from "./Modal";

const AnnouncementGraybar = ({ setAnnouncement }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
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
    if (name === "body") setBody(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = await addDoc(collection(db, "announcements"), {
        title,
        body,
        timestamp: new Date(),
      });
      console.log("Document written with ID: ", docRef.id);
      setAnnouncement({ title, body });

      // Clear the input fields
      setTitle("");
      setBody("");
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    handleCloseModal();
  };

  return (
    <div className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1 className="text-[#0C82B4] my-auto font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
            Announcement
          </h1>
          <img
            src={announcementLogo}
            alt="Announcement Logo"
            className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4"
          />
        </div>
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2">
          <button
            className="bg-[#0C82B4] font-poppins desktop:h-10 laptop:h-10 tablet:h-6 phone:h-5 desktop:text-sm laptop:text-sm tablet:text-[10px] phone:text-[7px] text-white desktop:p-2 laptop:p-2 phone:p-1 mr-1 rounded flex items-center"
            onClick={handleOpenModal}
          >
            Add new
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="flex justify-center items-center bg-[#E9F5FE] mt-5">
          <form
            onSubmit={handleSubmit}
            className="bg-[#E9F5FE] rounded-lg p-5 max-w-lg w-full"
          >
            <h2 className="text-xl font-poppins font-semibold leading-7 text-black mb-4">
              Add new announcement
            </h2>
            <div className="bg-[#0C82B4] p-5 rounded-lg">
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="title"
                    className="text-lg font-poppins font-semibold leading-6 text-white"
                  >
                    Title
                  </label>
                  <input
                    required
                    id="title"
                    name="title"
                    value={title}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter title"
                    className="block w-full rounded-md p-2 text-black border-[1px] border-black"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="body"
                    className="text-lg font-poppins font-semibold leading-6 text-white"
                  >
                    Body
                  </label>
                  <textarea
                    required
                    id="body"
                    name="body"
                    value={body}
                    onChange={handleChange}
                    rows={10}
                    placeholder="Enter body"
                    className="block w-full rounded-md p-2 text-black border-[1px] border-black"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AnnouncementGraybar;
