import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function DashboardCalendar() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="bg-white p-2 shadow-lg rounded-lg mx-auto w-full phone:w-[90%] tablet:w-[90%] laptop:w-[80%] desktop:w-[80%] phone:p-2 tablet:p-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-600 phone:text-xl">
        Calendar
      </h2>
      <Calendar
        onChange={setDate}
        value={date}
        tileClassName={({ date, view }) => {
          if (view === "month") {
            return "hover:bg-indigo-100 rounded-md cursor-pointer transition duration-200";
          }
        }}
        className="mx-auto border p-2 border-gray-200 rounded-lg shadow-md"
      />
    </div>
  );
}
