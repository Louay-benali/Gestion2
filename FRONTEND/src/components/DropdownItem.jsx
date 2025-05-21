import React from "react";

const DropdownItem = ({ label, icon, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-lg cursor-pointer z-full mr-4 ml-4 flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={`w-6 h-6 ${isSelected ? "text-blue-500" : "text-gray-500"}`}
      >
        {icon}
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default DropdownItem;
