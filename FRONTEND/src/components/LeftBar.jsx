import React, { useState, useEffect } from "react";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import SearchInput from "./SearchInput";

const LeftBar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  // Remove this local state as it's causing the issue
   const [isSidebarOpen, setIsSidebarOpen] = useState(!isSidebarCollapsed);
  
   //This useEffect is no longer needed
   useEffect(() => {
     setIsSidebarOpen(!isSidebarCollapsed);
   }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    // Simply call the parent function to update the sidebar state
    // No need to maintain local state
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <button
        onClick={toggleSidebar}
        className="text-gray-600 hover:text-indigo-600 border border-gray-200 rounded-md p-1.5 sm:p-2"
        aria-label={!isSidebarCollapsed ? "Collapse sidebar" : "Expand sidebar"}
      >
        <HiOutlineMenuAlt1 size={20} className="sm:w-6 sm:h-6" />
      </button>
      <SearchInput
        className="w-full max-w-[150px] sm:max-w-[250px] md:max-w-[400px]"
        placeholder="Rechercher..."
      />
    </div>
  );
};

export default LeftBar;