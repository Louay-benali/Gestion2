import React from "react";
import LeftBar from "../components/LeftBar";
import RightBar from "../components/RightBar";
import DarkModeToggle from "../components/DarkModeToggle";

export default function NavBarDashboard({
  onToggleSidebar,
  isSidebarCollapsed,
}) {
  return (
    <header className="bg-white dark:bg-[#1a2234] border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <LeftBar
        onToggleSidebar={onToggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <div className="flex items-center space-x-2">
        <DarkModeToggle />
        <RightBar />
      </div>
    </header>
  );
}
