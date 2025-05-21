import React from "react";
import LeftBar from "../components/LeftBar";
import RightBar from "../components/RightBar";

export default function NavBarDashboard({ onToggleSidebar, isSidebarCollapsed }) {
  return (
    <header className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <LeftBar onToggleSidebar={onToggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
      <RightBar />
    </header>
  );
}
