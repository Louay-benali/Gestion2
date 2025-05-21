import React, { useState } from "react";
import Sidebar from "../components/SideBar.jsx";
import QuickStats from "../components/QuickStats.jsx";
import StatisticsSection from "../components/StatisticsSection.jsx";
import RevenueCard from "../components/RevenueCard.jsx";
import MachineTable from "../components/MachineTable.jsx";
import UserProfile from "../layout/UserProfile.jsx";
import Calendar from "../layout/Calender.jsx";
import InterventionTable from "../components/InterventionTable.jsx";
import UserManagement from "../components/UserManagement.jsx";
import MachineManagement from "../components/MachineManagement.jsx";
import NavBarDashboard from "../layout/NavBarDashboard.jsx";

// Importez les icônes nécessaires
import {
  MdDashboard,
  MdPerson,
  MdTableChart,
  MdInventory,
} from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { BsCalendarEvent } from "react-icons/bs";

const AdminDashboard = () => {
  // État pour suivre quelle page est sélectionnée
  const [selectedPage, setSelectedPage] = useState("Dashboard");

  // État pour gérer l'état de collapse de la sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Définition des éléments du menu principal
  const menuItems = [
    { label: "Dashboard", icon: <MdDashboard size={24} /> },
    { label: "Calendar", icon: <BsCalendarEvent size={24} /> },
    { label: "User Profile", icon: <MdPerson size={24} /> },
    { label: "User Management", icon: <IoDocumentText size={24} /> },
    { label: "Machine Management", icon: <IoDocumentText size={24} /> },
  ];

  // Définition des éléments du menu de table
  const tableMenuItems = [
    {
      icon: <MdTableChart size={24} />,
      label: "Machine Table",
    },
    {
      icon: <MdTableChart size={24} />,
      label: "Intervention Table",
    },
  ];

  // Fonction qui affiche le contenu selon la page sélectionnée
  const renderContent = () => {
    switch (selectedPage) {
      case "Dashboard":
        return (
          <>
            <QuickStats />
            <div className="flex flex-col lg:flex-row gap-6 mt-6">
              <div className="w-full lg:w-2/3">
                <StatisticsSection />
              </div>
              <div className="w-full lg:w-1/3">
                <RevenueCard />
              </div>
            </div>
          </>
        );
      case "User Profile":
        return <UserProfile />;
      case "Machine Table":
        return <MachineTable />;
      case "Calendar":
        return <Calendar />;
      case "User Management":
        return <UserManagement />;
      case "Machine Management":
        return <MachineManagement />;
      case "Intervention Table":
        return <InterventionTable />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Passez tous les props nécessaires à Sidebar */}
      <Sidebar
        setSelectedPage={setSelectedPage}
        menuItems={menuItems}
        tableMenuItems={tableMenuItems}
        isCollapsed={isSidebarCollapsed} // Utilisez l'état pour gérer le collapse
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <NavBarDashboard
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} // Ajoutez un gestionnaire pour le bouton
        />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
