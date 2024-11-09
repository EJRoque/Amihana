import React, { useState } from "react";
import { Calendar as AntdCalendar, Typography, ConfigProvider } from "antd";
import locale from "antd/lib/locale/en_US";
import dayjs from "dayjs";
import "dayjs/locale/en";

const { Title } = Typography;

export default function DashboardCalendar() {
  const [date, setDate] = useState(dayjs());

  return (
    <div className="bg-white p-4 shadow-lg rounded-lg mx-auto w-full phone:w-[90%] tablet:w-[60%] laptop:w-[80%] desktop:w-[70%]">
      <Title level={2} className="text-center text-gray-700 mb-4 text-lg phone:text-xl tablet:text-2xl laptop:text-3xl">
        Calendar
      </Title>
      <ConfigProvider locale={locale}>
        <div className="h-72 overflow-auto phone:h-64 tablet:h-72 laptop:h-80 desktop:h-[350px]">
          <AntdCalendar
            fullscreen={false}
            value={date}
            onSelect={(newDate) => setDate(newDate)}
            onPanelChange={(newDate, mode) => {
              if (mode === "month") setDate(newDate);
            }}
            headerRender={({ value, onChange }) => {
              const monthOptions = [];
              const localeData = value.localeData();

              for (let i = 0; i < 12; i++) {
                const monthName = localeData.monthsShort(dayjs().month(i));
                monthOptions.push(
                  <option key={i} value={i}>
                    {monthName}
                  </option>
                );
              }

              return (
                <div className="flex justify-center p-2">
                  <select
                    value={value.month()}
                    onChange={(e) => {
                      const newValue = value.clone().month(parseInt(e.target.value, 10));
                      onChange(newValue);
                    }}
                    className="border rounded-md p-1"
                  >
                    {monthOptions}
                  </select>
                </div>
              );
            }}
            className="border border-gray-200 rounded-lg shadow-md"
          />
        </div>
      </ConfigProvider>
    </div>
  );
}
