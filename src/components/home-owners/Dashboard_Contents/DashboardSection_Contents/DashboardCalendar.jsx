import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function DashboardCalendar() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="bg-white p-8 shadow-lg rounded-lg w-[94%] mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-600">
        Calendar
      </h2>
      <Calendar
        onChange={setDate}
        value={date}
        tileClassName={({ date, view }) => {
          if (view === 'month') {
            return 'hover:bg-indigo-100 rounded-md cursor-pointer transition duration-200';
          }
        }}
        className="mx-auto border border-gray-200 rounded-lg shadow-md"
      />
    </div>
  );
}