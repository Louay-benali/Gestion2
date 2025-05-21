import React, { useRef, useEffect } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import NotificationDropdown from "./NotificationDropdown";

const NotificationIcon = ({ isOpen, setIsOpen, closeAllDropdowns }) => {
  const notificationRef = useRef(null);

  // Effect to handle clicks outside of the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        closeAllDropdowns();
      }
    };

    // Add event listener when the dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeAllDropdowns]);

  return (
    <div className="relative" ref={notificationRef}>
      <button
        type="button"
        onClick={() => setIsOpen()}
        className="flex items-center justify-center p-2 text-gray-600 hover:text-indigo-600 border border-gray-300 rounded-full"
      >
        <span className="sr-only">View notifications</span>
        <div>
          <IoMdNotificationsOutline size={26} />
        </div>
      </button>
      {isOpen && <NotificationDropdown />}
    </div>
  );
};

export default NotificationIcon;
