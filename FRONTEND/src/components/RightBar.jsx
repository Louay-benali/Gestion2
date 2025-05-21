import React, { useState } from "react";
import UserMenu from "./UserMenu";
import NotificationIcon from "./NotificationIcon";

const RightBar = () => {
  // Shared state to track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState(null);

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <NotificationIcon
        isOpen={openDropdown === "notifications"}
        setIsOpen={() =>
          setOpenDropdown(
            openDropdown === "notifications" ? null : "notifications"
          )
        }
        closeAllDropdowns={closeAllDropdowns}
      />
      <UserMenu
        isOpen={openDropdown === "userMenu"}
        setIsOpen={() =>
          setOpenDropdown(openDropdown === "userMenu" ? null : "userMenu")
        }
        closeAllDropdowns={closeAllDropdowns}
      />
    </div>
  );
};

export default RightBar;
