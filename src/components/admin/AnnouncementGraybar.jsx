import React, { useState } from "react";
import announcementLogo from "../../assets/icons/announcement-logo.svg";
import Modal from "./Modal";

const AnnouncementGraybar = ({ announcement, setAnnouncement }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnnouncement((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(
      "Title: " + announcement.title + "\nBody: " + announcement.body
    );
    handleCloseModal();
  };

  return (
    <div className="bg-[#EAEBEF] flex items-center desktop:h-16 laptop:h-16 phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 border-2 border-slate-400 rounded-md shadow-xl">
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1 className="text-[#0C82B4] font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
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

      {/* Modal */}
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
                    value={announcement.title || ""}
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
                    value={announcement.body || ""}
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
