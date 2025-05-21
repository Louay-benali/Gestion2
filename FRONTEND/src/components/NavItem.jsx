import React from "react";

const NavItem = ({ icon, label, isSelected, onClick }) => {
  return (
    <nav className=" rounded-lg ">
      <a
        href="#"
        className="rounded-lg mr-4 ml-4  flex items-center gap-3 px-4 py-2 text-blue-500  hover:bg-gray-100"
      >
        {icon}
        <span className="text-sm font-medium text-blue-500">Dashboard</span>
      </a>
    </nav>
  );
};

export default NavItem;
<nav className="rounded-lg ">
  <a
    href="#"
    className="rounded-lg mr-4 ml-4 flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
    <span className="text-sm font-medium text-gray-600">Calender</span>
  </a>
</nav>;