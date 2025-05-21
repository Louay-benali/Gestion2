import React, { useState } from "react";
import NavBarDashboard from "../layout/NavBarDashboard.jsx";
import Sidebar from "../components/SideBar";
import QuickStats from "../components/QuickStats";
import StatisticsSection from "../components/StatisticsSection";
import RevenueCard from "../components/RevenueCard";
import MachineTable from "../components/MachineTable";
import UserProfile from "../layout/UserProfile.jsx";
import TechnicienTasks from "../components/TechnicienTasks";
import Calendar from "../layout/Calender.jsx";
import InterventionTech from "../components/InterventionTech.jsx";
import MaintenanceTable from "../components/MaintenanceTable";
import CreerRapportIntervention from "../components/CreerRapportIntervention.jsx";
import { MdInventory, MdAssignment } from "react-icons/md";
import { MdDashboard, MdTableChart } from "react-icons/md";
import { BsCalendarEvent } from "react-icons/bs";
import { FiUser } from "react-icons/fi";
import { TbForms } from "react-icons/tb";
import { IoDocumentText } from "react-icons/io5";
import DemanderPieces from "../components/DemanderPieces.jsx";
import PanneTable from "../components/PanneTable.jsx";
import PiecesStockTable from "../components/PiecesStockTable.jsx";
import DemandePieceTech from "../components/DemandePieceTech.jsx";
import DeclarePanneForm from "../components/DeclarePanneForm.jsx";

const TechnicienDashboard = () => {
  // State for tracking which page is selected
  const [selectedPage, setSelectedPage] = useState("Dashboard");
  // New state for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Definition of menu items specific to the technician
  const technicienMenuItems = [
    {
      icon: <MdDashboard size={24} />,
      label: "Dashboard",
    },
    {
      icon: <BsCalendarEvent size={24} />,
      label: "Calendar",
    },
    {
      icon: <FiUser size={24} />,
      label: "UserProfile",
    },
    { label: "Déclarer Panne", icon: <IoDocumentText size={24} /> },
    {
      icon: <MdAssignment size={24} />,
      label: "Task",
    },
    {
      icon: <TbForms size={24} />,
      label: "Creer Rapport",
    },
    {
      icon: <MdInventory size={24} />,
      label: "Demande Pièces",
    },
  ];

  // Definition of menu items for tables
  const tableMenuItems = [
    {
      icon: <MdTableChart size={24} />,
      label: "Machine Table",
    },
    {
      icon: <MdTableChart size={24} />,
      label: "Intervention Table",
    },
    {
      icon: <MdTableChart size={24} />,
      label: "Maintenance Table",
    },
    {
      icon: <MdTableChart size={24} />,
      label: "Panne Table",
    },
    {
      icon: <MdTableChart size={24} />,
      label: "Pièces Table",
    },
    {
      icon: <MdTableChart size={24} />,
      label: "Demandes Table",
    },
  ];

  // Function to handle sidebar toggle
  const handleToggleSidebar = (isOpen) => {
    setIsSidebarCollapsed(!isOpen);
  };

  // Function that displays content according to the selected page
  const renderContent = () => {
    switch (selectedPage) {
      case "Dashboard":
        return (
          <div className="flex flex-col w-full gap-6">
            <div className="w-full">
              <QuickStats />
            </div>
            <div className="flex flex-col lg:flex-row w-full gap-6">
              <div className="w-full lg:w-2/3 flex">
                <StatisticsSection />
              </div>
              <div className="w-full lg:w-1/3 flex">
                <RevenueCard />
              </div>
            </div>
          </div>
        );
      case "UserProfile":
        return <UserProfile />;
      case "Machine Table":
        return <MachineTable />;
      case "Intervention Table":
        return <InterventionTech />;
      case "Maintenance Table":
        return <MaintenanceTable />;
      case "Creer Rapport":
        return <CreerRapportIntervention />;
      case "Task":
        return <TechnicienTasks />;
      case "Calendar":
        return <Calendar />;
      case "Demande Pièces":
        return <DemanderPieces />;
      case "Panne Table":
        return <PanneTable />;
      case "Pièces Table":
        return <PiecesStockTable />;
      case "Demandes Table":
        return <DemandePieceTech />;
      case "Déclarer Panne":
        return <DeclarePanneForm />;
      case "Chat":
        return <div>Chat Component</div>; // Placeholder for Chat
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Pass menuItems, tableMenuItems, and isCollapsed to Sidebar */}
      <Sidebar
        setSelectedPage={setSelectedPage}
        menuItems={technicienMenuItems}
        tableMenuItems={tableMenuItems}
        isCollapsed={isSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <NavBarDashboard onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* Dynamically display content */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default TechnicienDashboard;
