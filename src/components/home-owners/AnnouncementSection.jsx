import React from "react";
import MegaphonePic from "../../assets/images/Megaphone.png";

const AnnouncementSection = ({ announcement }) => {
  return (
    <div className="flex justify-center items-center desktop:w-[63rem] laptop:w-[50rem] tablet:w-[38rem] phone:w-[15rem] mx-auto">
      <div className="flex flex-col laptop:flex-row items-center bg-[#E9F5FE] rounded-lg p-2 tablet:p-6 phone:p-3 border-2 border-black">
        <div className="flex flex-col laptop:flex-1 justify-between w-full p-4 tablet:p-6 phone:p-2">
          <div className="bg-[#0C82B4] text-white text-base laptop:text-xl font-bold rounded-lg px-4 py-2 mb-4 laptop:mb-6 shadow w-full">
            <h2 className="text-center laptop:text-lg phone:text-[15px]">
              Sample Title
            </h2>
          </div>
          <div className="flex-1 p-3 h-auto bg-white border-2 border-black rounded-lg">
            <p className="phone:text-xs laptop:text-sm desktop:text-lg text-black">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. Lorem
              Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mt-4">
          <img
            src={MegaphonePic}
            alt="Announcement"
            className="mb-8 hidden laptop:block desktop:block laptop:w-[18rem] laptop:h-[17rem] desktop:w-[20rem] desktop:h-[19rem]"
          />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementSection;
