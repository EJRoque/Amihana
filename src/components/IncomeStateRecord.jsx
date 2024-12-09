import React, { useState, useEffect } from "react";
import {collection,onSnapshot,doc,deleteDoc,getDoc,setDoc,} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../components/admin/Modal";
import { db } from "../firebases/FirebaseConfig";
import closeIcon from "../assets/icons/close-icon.svg";
import { Dropdown, Button, Menu, Modal as AntModal, Input } from "antd";
import { DownOutlined, ContainerFilled } from "@ant-design/icons"; // Import Ant Design icons
import { FaPlus, FaPrint, FaTrash } from "react-icons/fa";

const IncomeStateRecord = ({ incomeStatement, setIncomeStatement }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncomeState, setSelectedIncomeState] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.error("User is not authenticated");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().isAdmin);
        } else {
          console.error("No such user document!");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAdmin(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (isAdmin === null || !incomeStatement) {
    return <div className="flex items-center justify-center">Loading...</div>;
  }

  const formatAmount = (amount) =>
    `₱${Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;


  
  return (
    <div  className="bg-white font-poppins rounded-lg desktop:w-[98%] phone:w-full tablet:w-[95%] laptop:w-[97%] shadow-md border-2 p-4 phone:p-2 tablet:p-4 laptop:p-6 desktop:p-8 space-y-4  mx-auto">
      <div className="mb-6 flex justify-between items-center">
  <h2 className="font-medium desktop:text-lg laptop:text-lg tablet:text-base phone:text-xs">
  Report Generation Date: <br />
    {incomeStatement?.date || "No date selected"}
  </h2>
</div>

{/* Revenue */}
<div className="mb-6">
  <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">Revenue</h2>
  <table className="w-full border-collapse bg-white">
    <thead className="bg-[#E7E7E7]">
      <tr>
        <th className="border border-gray-300 p-1 text-left">Description</th>
        <th className="border border-gray-300 p-1">Amount</th>
      </tr>
    </thead>
    <tbody>
      {incomeStatement?.incomeRevenue?.length ? (
        incomeStatement.incomeRevenue.map((item, index) => (
          <tr key={index}>
            <td className="border border-gray-300 p-1">{item.description}</td>
            <td className="border border-gray-300 p-1 text-right">
              {formatAmount(item.amount)}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            className="border border-gray-300 p-1 text-center"
            colSpan={2}
          >
            No revenue data available
          </td>
        </tr>
      )}
      <tr className="bg-[#0C82B4] text-white font-bold">
        <td className="border border-gray-300 p-1">
          {incomeStatement?.totalRevenue?.description || "Total Revenue"}
        </td>
        <td className="border border-gray-300 p-1 text-right">
          {formatAmount(incomeStatement?.totalRevenue?.amount) || "-"}
        </td>
      </tr>
    </tbody>
  </table>
</div>

{/* Expenses */}
<div className="mb-6">
  <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">Expenses</h2>
  <table className="w-full border-collapse bg-white">
    <thead className="bg-[#E7E7E7]">
      <tr>
        <th className="border border-gray-300 p-1 text-left">Description</th>
        <th className="border border-gray-300 p-1">Amount</th>
      </tr>
    </thead>
    <tbody>
      {incomeStatement?.incomeExpenses?.length ? (
        incomeStatement.incomeExpenses.map((item, index) => (
          <tr key={index}>
            <td className="border border-gray-300 p-1">{item.description}</td>
            <td className="border border-gray-300 p-1 text-right">
              {formatAmount(item.amount)}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            className="border border-gray-300 p-1 text-center"
            colSpan={2}
          >
            No expenses data available
          </td>
        </tr>
      )}
      <tr className="bg-[#0C82B4] text-white font-bold">
        <td className="border border-gray-300 p-1">
          {incomeStatement?.totalExpenses?.description || "Total Expenses"}
        </td>
        <td className="border border-gray-300 p-1 text-right">
          {formatAmount(incomeStatement?.totalExpenses?.amount) || "-"}
        </td>
      </tr>
    </tbody>
  </table>
</div>

{/* Net income */}
<div className="mb-6">
  <table className="w-full border-collapse">
    <tbody>
      <tr className="bg-[#F1F2BF] font-bold">
        <td className="border border-gray-300 p-1">
          {incomeStatement?.netIncome?.description || "Net Income"}
        </td>
        <td className="border border-gray-300 p-1 text-right">
          {formatAmount(incomeStatement?.netIncome?.amount) || "-"}
        </td>
      </tr>
    </tbody>
  </table>
</div>
    </div>
  );
};

export default IncomeStateRecord;
