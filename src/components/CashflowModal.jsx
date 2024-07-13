import React from "react";
import closeIcon from "../assets/icons/close-icon.svg";

const CashflowModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white p-4 rounded shadow-xl w-full max-w-lg mx-4">
        <button
          className="absolute top-2 right-2 text-right mb-2"
          onClick={onClose}
        >
          <img src={closeIcon} alt="Close Icon" className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default CashflowModal;
