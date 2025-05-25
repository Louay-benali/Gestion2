import React, { useRef, useEffect, useContext } from "react";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import UserDropdown from "./UserDropdown";
import { useAuth } from "../contexts/AuthContext.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";

const UserMenu = ({ isOpen, setIsOpen, closeAllDropdowns }) => {
  const menuRef = useRef(null);
  const { user } = useAuth();
  const { apiBaseUrl } = useContext(AuthContext);

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
      <div
        onClick={() => setIsOpen()}
        className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        <span className="sr-only">Open user menu</span>
        {user && user.profileImage ? (
          <img
            className="h-11 w-11 rounded-full object-cover"
            src={`${apiBaseUrl}${user.profileImage}`}
            alt="User Avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium ${user && user.profileImage ? 'hidden' : ''}`}>
          {getUserInitials()}
        </div>
        <div className="flex items-center justify-center pr-8 pl-4">
          <span className="text-[14px] font-normal text-[#344054] font-['Outfit',_sans-serif]">
            {user ? user.prenom : "Utilisateur"}
          </span>
          {isOpen ? (
            <RiArrowDropUpLine size={24} />
          ) : (
            <RiArrowDropDownLine size={24} />
          )}
        </div>
      </div>

      {isOpen && <UserDropdown />}
    </div>
  );
};

export default UserMenu;
