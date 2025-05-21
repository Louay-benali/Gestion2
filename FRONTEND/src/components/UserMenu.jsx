import React, { useRef, useEffect } from "react";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import UserDropdown from "./UserDropdown";
import { useAuth } from "../contexts/AuthContext.jsx";

const UserMenu = ({ isOpen, setIsOpen, closeAllDropdowns }) => {
  const menuRef = useRef(null);
  const { user } = useAuth();

  // Effect to handle clicks outside of the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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

  // Génère les initiales de l'utilisateur pour l'avatar
  const getUserInitials = () => {
    if (user && user.prenom && user.nom) {
      return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
    }
    return "UT"; // Utilisateur par défaut
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen()}
        className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className="sr-only">Open user menu</span>
        {user && user.avatarUrl ? (
          <img
            className="h-11 w-11 rounded-full"
            src={user.avatarUrl}
            alt="User Avatar"
          />
        ) : (
          <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {getUserInitials()}
          </div>
        )}
        <button className="flex items-center justify-center pr-8 pl-4">
          <span className="text-[14px] font-normal text-[#344054] font-['Outfit',_sans-serif]">
            {user ? user.prenom : "Utilisateur"}
          </span>
          {isOpen ? (
            <RiArrowDropUpLine size={24} />
          ) : (
            <RiArrowDropDownLine size={24} />
          )}
        </button>
      </button>

      {isOpen && <UserDropdown />}
    </div>
  );
};

export default UserMenu;
