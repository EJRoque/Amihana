import React, { useState, useEffect } from "react";
import { CalendarFilled } from "@ant-design/icons";
import { Button, Modal } from "antd";
import ReserveVenue from "../Modals/Events Forms/ReserveVenue"; // Assuming ReserveVenue is the component you want to render inside the modal.

export default function EventsBarHome() {
  const [openMod, setOpenMod] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleModalOpen = () => {
    setOpenMod(true);
  };

  const handleModalClose = () => {
    setOpenMod(false);
  };

  return (
    <div
      className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden ${
        sidebarOpen
          ? "desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10"
          : "desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12"
      } desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}
    >
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
          <h1
            className={`text-[#0C82B4] my-auto font-poppins ${
              sidebarOpen
                ? "desktop:text-sm laptop:text-sm tablet:text-xs phone:text-[8px]"
                : "desktop:text-base laptop:text-base tablet:text-sm phone:text-[10px]"
            } phone:ml-1 capitalize`}
          >
            Venue Reservations
          </h1>
          <CalendarFilled className="flex-1 m-2 desktop:h-10 desktop:w-10 laptop:h-8 laptop:w-8 phone:h-6 phone:w-6 text-[#0C82B4] flex items-center" />
        </div>
        <div className="flex items-center space-x-2 desktop:space-x-4 laptop:space-x-3 phone:space-x-2">
          <Button className="bg-[#0C82B4] esktop:h-8 laptop:h-8 tablet:h-8 phone:h-5 desktop:text-md laptop:text-md tablet:text-[10px] phone:text-[8px] text-white desktop:p-2 laptop:p-2 phone:p-1" onClick={handleModalOpen}>
            <CalendarFilled
            />
            Reserve Venue
          </Button>
        </div>
      </div>

      {/* Modal Component */}
      <Modal
        title="Reserve Venue"
        open={openMod}
        onCancel={handleModalClose}
        footer={null} // Removes default footer buttons
        width={isMobile ? "100%" : "40%"} // Ensure the width is responsive on larger screens
        style={{
          maxWidth: isMobile ? "100%" : "100%", // Optional: Sets a max width for larger screens
          margin: "auto", // Centers the modal
        }}
      >
        <ReserveVenue />{" "}
        {/* This renders the ReserveVenue form inside the modal */}
      </Modal>
    </div>
  );
}
