import React, { useState } from "react";
import NavBarDashboard from "./NavBarDashboard";
import Sidebar from "../components/SideBar";
import { useAuth } from "../contexts/AuthContext.jsx";
import { MdDashboard, MdPerson } from "react-icons/md";
import { BsCalendarEvent } from "react-icons/bs";
import { IoDocumentText } from "react-icons/io5";

const Layout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("Profile");
  const { user } = useAuth();

  // Définition des éléments du menu principal en fonction du rôle de l'utilisateur
  const getMenuItems = () => {
    const baseItems = [
      { label: "Profile", icon: <MdPerson size={24} /> }
    ];

    // Ajouter des éléments spécifiques au rôle
    if (user) {
      switch (user.role) {
        case "operateur":
          return [
            { label: "Dashboard", icon: <MdDashboard size={24} />, link: "/operateur-dashboard" },
            { label: "Calendar", icon: <BsCalendarEvent size={24} /> },
            { label: "Déclarer Panne", icon: <IoDocumentText size={24} /> },
            ...baseItems
          ];
        case "technicien":
          return [
            { label: "Dashboard", icon: <MdDashboard size={24} />, link: "/technicien-dashboard" },
            ...baseItems
          ];
        case "magasinier":
          return [
            { label: "Dashboard", icon: <MdDashboard size={24} />, link: "/magasinier-dashboard" },
            ...baseItems
          ];
        case "responsable":
          return [
            { label: "Dashboard", icon: <MdDashboard size={24} />, link: "/responsable-dashboard" },
            ...baseItems
          ];
        case "admin":
          return [
            { label: "Dashboard", icon: <MdDashboard size={24} />, link: "/admin-dashboard" },
            ...baseItems
          ];
        default:
          return baseItems;
      }
    }
    return baseItems;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile by default, shown on medium screens and up */}
      <div className={`${isSidebarCollapsed ? 'hidden md:block' : 'w-full md:w-auto'} transition-all duration-300`}>
        <Sidebar
          setSelectedPage={setSelectedPage}
          menuItems={getMenuItems()}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-screen w-full">
        <NavBarDashboard
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;