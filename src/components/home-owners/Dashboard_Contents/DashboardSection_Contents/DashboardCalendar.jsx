import { Calendar as AntdCalendar, Typography, ConfigProvider, Card, Select, Modal, Button } from "antd";
import locale from "antd/lib/locale/en_US";
import dayjs from "dayjs";
import { getApprovedReservations, fetchUserFullName } from "../../../../firebases/firebaseFunctions";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import "dayjs/locale/en";
import React, { useState, useEffect } from "react";

const { Title, Text } = Typography;
const { Option } = Select;

export default function DashboardCalendar() {
  const [date, setDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [approvedReservations, setApprovedReservations] = useState([]);
  const [userName, setUserName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    // Check if the screen size is mobile or tablet using a media query
    const updateScreenSize = () => {
      setIsMobileOrTablet(window.innerWidth <= 768); // 768px is a common breakpoint for tablets
    };

    updateScreenSize(); // Run on initial load
    window.addEventListener("resize", updateScreenSize); // Update on resize
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          const fullName = await fetchUserFullName(user.uid);
          setUserName(fullName);
        } catch (error) {
          toast.error("Failed to fetch user data.");
          console.error("Error fetching user name:", error);
        }
      }
    };

    fetchUserName();
  }, []);

  useEffect(() => {
    if (userName) {
      const fetchApprovedReservations = async () => {
        try {
          const approved = await getApprovedReservations(userName);
          if (approved) {
            setApprovedReservations(approved);
          }
        } catch (error) {
          toast.error("Failed to fetch reservations.");
          console.error("Error fetching reservations:", error);
        }
      };

      fetchApprovedReservations();
    }
  }, [userName]);

  const getReservationsForDate = (currentDate) => {
    return approvedReservations.filter((reservation) =>
      dayjs(reservation.date).isSame(currentDate, "day")
    );
  };

  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  return (
    <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-6 bg-gray-50 p-4 md:p-8 shadow-xl rounded-lg mx-auto w-full phone:w-[90%] tablet:w-[80%] laptop:w-[80%] desktop:w-[70%]">
      
      {/* Calendar Section */}
      <div className="w-full md:w-1/2 p-4 bg-white shadow-lg rounded-lg phone:w-full phone:p-2">
        <Title level={2} className="font-poppins text-center text-gray-800 mb-4 text-lg phone:text-xl tablet:text-2xl laptop:text-3xl">
          Calendar
        </Title>
        
        {/* Conditionally render button or inline calendar based on screen size */}
        {isMobileOrTablet ? (
          // Mobile/Tablet View: Button to open calendar in modal
          <Button type="primary" className="w-full" onClick={showModal}>
            Open Calendar
          </Button>
        ) : (
          // Desktop View: Inline calendar
          <ConfigProvider locale={locale}>
            <AntdCalendar
              fullscreen={false}
              value={date}
              onSelect={(newDate) => {
                setDate(newDate);
                setSelectedDate(newDate);
              }}
              fullCellRender={(value) => {
                const isReserved = approvedReservations.some(reservation =>
                  dayjs(reservation.date).isSame(value, "day")
                );

                return (
                  <div
                    className={`ant-picker-cell-inner ${
                      isReserved ? "bg-[#0C82B4] text-white rounded-lg" : ""
                    }`}
                  >
                    {value.date()}
                  </div>
                );
              }}
              headerRender={({ value, onChange }) => {
                const currentYear = value.year();
                const startYear = currentYear - 5;
                const endYear = currentYear + 5;

                const monthOptions = Array.from({ length: 12 }, (_, i) => (
                  <Option key={i} value={i}>
                    {dayjs().month(i).format("MMMM")}
                  </Option>
                ));

                const yearOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => (
                  <Option key={i} value={startYear + i}>
                    {startYear + i}
                  </Option>
                ));

                return (
                  <div style={{ display: "flex", gap: "8px", padding: "8px" }}>
                    <Select
                      value={value.month()}
                      onChange={(month) => {
                        const newValue = value.clone().month(month);
                        onChange(newValue);
                      }}
                      style={{ width: 100 }}
                    >
                      {monthOptions}
                    </Select>
                    <Select
                      value={value.year()}
                      onChange={(year) => {
                        const newValue = value.clone().year(year);
                        onChange(newValue);
                      }}
                      style={{ width: 100 }}
                    >
                      {yearOptions}
                    </Select>
                  </div>
                );
              }}
              className="border border-gray-300 rounded-lg shadow-md"
            />
          </ConfigProvider>
        )}
      </div>

      {/* Reservation Details Section */}
      <div className="font-poppins w-full md:w-1/2 p-4 bg-white shadow-lg rounded-lg phone:w-full phone:p-2">
        <Title level={4} className="text-[#0C82B4] mb-4 text-center">Reservation Details</Title>
        {selectedDate ? (
          getReservationsForDate(selectedDate).map((reservation, index) => (
            <Card key={index} title={`Reservation at ${reservation.venue}`} bordered className="font-poppins mb-4 shadow-md">
              <Text strong className="font-poppins text-[#0C82B4]">Date: </Text> 
              <Text>{reservation.date}</Text>
              <br />
              <Text strong className="font-poppins text-[#0C82B4]">Start Time: </Text>
              <Text>{reservation.startTime}</Text>
              <br />
              <Text strong className="font-poppins text-[#0C82B4]">End Time: </Text>
              <Text>{reservation.endTime}</Text>
              <br />
              <Text strong className="font-poppins text-[#0C82B4]">Venue: </Text>
              <Text>{reservation.venue}</Text>
              <br />
            </Card>
          ))
        ) : (
          <Text className="text-center text-gray-500">Select a date to view reservations</Text>
        )}
      </div>

      {/* Modal Calendar for Mobile and Tablet */}
      <Modal
        title="Select a Date"
        visible={isModalVisible}
        onCancel={hideModal}
        footer={null}
        className="phone:w-full"
        bodyStyle={{ width: "100%" }}
      >
        <ConfigProvider locale={locale}>
          <AntdCalendar
            fullscreen={false}
            value={date}
            onSelect={(newDate) => {
              setDate(newDate);
              setSelectedDate(newDate);
              hideModal();
            }}
            className="border border-gray-300 rounded-lg shadow-md"
          />
        </ConfigProvider>
      </Modal>
    </div>
  );
}
