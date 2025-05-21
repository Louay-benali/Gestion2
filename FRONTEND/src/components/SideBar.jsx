import React, { useState, useEffect, useRef } from "react";
import LogoAndTitle from "./LogoAndTitle";
import { IoChevronDownOutline } from "react-icons/io5";
import { PiChatCircleDots } from "react-icons/pi";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({
  setSelectedPage,
  menuItems,
  tableMenuItems = [],
  isCollapsed,
}) => {
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const sidebarRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Set active item based on current path
  useEffect(() => {
    const path = location.pathname;
    const currentPage = menuItems.find(item => 
      item.link && path.includes(item.link)
    );
    
    if (currentPage) {
      setActiveItem(currentPage.label);
      if (setSelectedPage) {
        setSelectedPage(currentPage.label);
      }
    } else if (path === "/profile") {
      setActiveItem("Profile");
      if (setSelectedPage) {
        setSelectedPage("Profile");
      }
    }
  }, [location, menuItems, setSelectedPage]);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarToggle(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen((v) => !v);
  };

  const handleItemClick = (label, link) => {
    setActiveItem(label);
    if (setSelectedPage) {
      setSelectedPage(label);
    }
    
    // Navigate if link is provided
    if (link) {
      navigate(link);
    }
  };

  const handleMouseEnter = (e, label) => {
    // Only show tooltip if sidebar is collapsed AND not expanded by hover
    if (isCollapsed && !sidebarToggle) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipContent(label);
      setTooltipPosition({
        top: rect.top + window.scrollY + rect.height / 2,
        left: rect.right + window.scrollX + 10,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Determine if text labels should be shown
  // Show labels if sidebar is not collapsed OR if it's toggled by hover
  const showLabels = !isCollapsed || sidebarToggle;

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`fixed md:sticky top-0 ${
          isCollapsed && !sidebarToggle ? "w-16 md:w-22" : "w-64 md:w-72"
        } h-screen bg-white border-r border-gray-200 flex flex-col overflow-y-auto font-style transition-all duration-300 z-20`}
        onMouseEnter={() => {
          if (isCollapsed) setSidebarToggle(true);
        }}
        onMouseLeave={() => {
          if (isCollapsed) setSidebarToggle(false);
        }}
      >
        {/* Logo and Title */}
        <div
          className={`${
            isCollapsed && !sidebarToggle ? "py-4 flex justify-center" : ""
          }`}
        >
          <LogoAndTitle collapsed={isCollapsed && !sidebarToggle} />
        </div>

        {/* Separator in collapsed mode */}
        {isCollapsed && !sidebarToggle && (
          <div className="my-2 border-b border-gray-200 w-full"></div>
        )}

        {/* Menu Section */}
        <div
          className={`${isCollapsed && !sidebarToggle ? "" : "mt-6"} flex-1`}
        >
          {showLabels && (
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-gray-500">MENU</p>
            </div>
          )}

          <ul
            className={`${
              isCollapsed && !sidebarToggle
                ? "flex flex-col items-center gap-6 mt-6"
                : "mb-6 flex flex-col gap-4"
            }`}
          >
            {menuItems.map((item, index) => (
              <nav
                key={index}
                className={`${
                  isCollapsed && !sidebarToggle
                    ? "w-full flex justify-center"
                    : "rounded-lg"
                }`}
                onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                onMouseLeave={handleMouseLeave}
              >
                {item.link ? (
                  <Link
                    to={item.link}
                    onClick={() => handleItemClick(item.label, item.link)}
                    className={`
                      ${
                        isCollapsed && !sidebarToggle
                          ? "p-2 flex justify-center"
                          : "rounded-lg mr-4 ml-4 flex items-center gap-3 px-4 py-2"
                      } 
                      ${
                        activeItem === item.label
                          ? `${
                              isCollapsed && !sidebarToggle
                                ? "bg-blue-100 text-blue-500"
                                : "text-blue-500 bg-gray-100"
                            }`
                          : "text-gray-500 hover:text-gray-600"
                      } 
                      ${
                        isCollapsed && !sidebarToggle
                          ? "hover:bg-blue-50 rounded-md"
                          : "hover:bg-gray-100"
                      }
                    `}
                  >
                    <div
                      className={
                        activeItem === item.label
                          ? "text-blue-500"
                          : "text-gray-500"
                      }
                    >
                      {item.icon}
                    </div>
                    {showLabels && (
                      <span
                        className={`text-sm font-medium ${
                          activeItem === item.label
                            ? "text-blue-500"
                            : "text-gray-600"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                ) : (
                  <a
                    href="#"
                    onClick={() => handleItemClick(item.label)}
                    className={`
                      ${
                        isCollapsed && !sidebarToggle
                          ? "p-2 flex justify-center"
                          : "rounded-lg mr-4 ml-4 flex items-center gap-3 px-4 py-2"
                      } 
                      ${
                        activeItem === item.label
                          ? `${
                              isCollapsed && !sidebarToggle
                                ? "bg-blue-100 text-blue-500"
                                : "text-blue-500 bg-gray-100"
                            }`
                          : "text-gray-500 hover:text-gray-600"
                      } 
                      ${
                        isCollapsed && !sidebarToggle
                          ? "hover:bg-blue-50 rounded-md"
                          : "hover:bg-gray-100"
                      }
                    `}
                  >
                    <div
                      className={
                        activeItem === item.label
                          ? "text-blue-500"
                          : "text-gray-500"
                      }
                    >
                      {item.icon}
                    </div>
                    {showLabels && (
                      <span
                        className={`text-sm font-medium ${
                          activeItem === item.label
                            ? "text-blue-500"
                            : "text-gray-600"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </a>
                )}
              </nav>
            ))}

            {/* Dropdown Table - Only render if tableMenuItems exist and are not empty */}
            {tableMenuItems.length > 0 && (
              <nav
                className={`${
                  isCollapsed && !sidebarToggle
                    ? "w-full flex justify-center"
                    : "rounded-lg flex flex-col"
                }`}
                onMouseEnter={(e) => handleMouseEnter(e, "Tables")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={toggleDropdown}
                  className={`
                    ${
                      isCollapsed && !sidebarToggle
                        ? "p-2 flex justify-center rounded-md"
                        : "rounded-lg cursor-pointer mr-4 ml-4 flex items-center gap-3 px-4 py-2"
                    } 
                    text-gray-500 hover:text-gray-600 
                    ${
                      isCollapsed && !sidebarToggle
                        ? "hover:bg-blue-50"
                        : "hover:bg-gray-100"
                    }
                  `}
                >
                  {tableMenuItems[0].icon}
                  {showLabels && (
                    <>
                      <span className="text-sm font-medium text-gray-600">
                        Tables
                      </span>
                      <IoChevronDownOutline
                        size={20}
                        className={`ml-auto transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </button>

                {isOpen && showLabels && (
                  <div>
                    {tableMenuItems.map((item, index) => (
                      <li key={index} className="pl-10">
                        <a
                          href="#"
                          onClick={() => handleItemClick(item.label)}
                          className={`rounded-lg mr-4 ml-4 flex items-center gap-3 px-4 py-2 ${
                            activeItem === item.label
                              ? "text-blue-500 bg-gray-100"
                              : "text-gray-500 hover:text-gray-600"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </a>
                      </li>
                    ))}
                  </div>
                )}
              </nav>
            )}
          </ul>

          {showLabels && (
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-gray-500">SUPPORT</p>
            </div>
          )}

          {isCollapsed && !sidebarToggle && (
            <div className="my-2 border-b border-gray-200 w-full"></div>
          )}

          <nav
            className={`${
              isCollapsed && !sidebarToggle
                ? "w-full flex justify-center mt-6"
                : "rounded-lg"
            }`}
            onMouseEnter={(e) => handleMouseEnter(e, "Chat")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleItemClick("Chat")}
              className={`
                ${
                  isCollapsed && !sidebarToggle
                    ? "p-2 flex justify-center"
                    : "rounded-lg mx-4 flex items-center gap-3 px-4 py-2 w-[calc(100%-2rem)]"
                } 
                ${
                  activeItem === "Chat"
                    ? `${
                        isCollapsed && !sidebarToggle
                          ? "bg-blue-100 text-blue-500"
                          : "text-blue-500 bg-gray-100"
                      }`
                    : "text-gray-500 hover:text-gray-600"
                } 
                ${
                  isCollapsed && !sidebarToggle
                    ? "hover:bg-blue-50 rounded-md"
                    : "hover:bg-gray-100"
                }
              `}
            >
              <PiChatCircleDots
                size={24}
                className={
                  activeItem === "Chat" ? "text-blue-500" : "text-gray-500"
                }
              />
              {showLabels && <span className="text-sm font-medium">Chat</span>}
            </button>
          </nav>

          {isCollapsed && !sidebarToggle && <div className="mt-6"></div>}
        </div>
      </aside>

      {/* Tooltip for collapsed mode - only show when not expanded by hover */}
      {isCollapsed && !sidebarToggle && showTooltip && (
        <div
          className="fixed bg-gray-800 text-white text-xs rounded py-1 px-2 z-50 whitespace-nowrap"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: "translateY(-50%)",
          }}
        >
          {tooltipContent}
        </div>
      )}
    </>
  );
};

export default Sidebar;
