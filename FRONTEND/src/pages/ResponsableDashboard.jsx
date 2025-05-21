import React, { useState } from "react";
import NavBarDashboard from "../layout/NavBarDashboard.jsx";
import Sidebar from "../components/SideBar";
import QuickStats from "../components/QuickStats";
import StatisticsSection from "../components/StatisticsSection";
import RevenueCard from "../components/RevenueCard";
import Calendar from "../layout/Calender.jsx";
import MachineTable from "../components/MachineTable";
import InterventionTable from "../components/InterventionTable";
import MaintenanceTable from "../components/MaintenanceTable";
import UserProfile from "../layout/UserProfile.jsx";
import RapportGeneral from "../components/RapportGeneral";
import DemandesValRejTable from "../components/DemandesValRejTable.jsx";
import CreateTaskForm from "../components/CreateTaskForm.jsx";
import CreateMaintenanceForm from "../components/CreateMaintenanceForm.jsx";
import CreateInterventionForm from "../components/CreateInterventionForm.jsx";

import {
  MdDashboard,
  MdTableChart,
  MdPerson,
  MdAssessment,
  MdCheckCircle,
  MdAssignmentInd,
  MdAddTask,
  MdEngineering,
  MdBuild,
} from "react-icons/md";
import { BsCalendarEvent } from "react-icons/bs";

const ResponsableDashboard = () => {
  const [selectedPage, setSelectedPage] = useState("Dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Main menu items
  const menuItems = [
    { label: "Dashboard", icon: <MdDashboard size={24} /> },
    { label: "Calendar", icon: <BsCalendarEvent size={24} /> },
    { label: "Créer Tâche", icon: <MdAddTask size={24} /> },
    { label: "Planifier Maintenance", icon: <MdEngineering size={24} /> },
    { label: "Créer Intervention", icon: <MdBuild size={24} /> },
    { label: "Valider demandes", icon: <MdCheckCircle size={24} /> },
    { label: "Rapport Général", icon: <MdAssessment size={24} /> },
    { label: "User Profile", icon: <MdPerson size={24} /> },
  ];

  // Table menu items (similar to TechnicienDashboard)
  const tableMenuItems = [
    { label: "Machine Table", icon: <MdTableChart size={24} /> },
    { label: "Intervention Table", icon: <MdTableChart size={24} /> },
    { label: "Maintenance Table", icon: <MdTableChart size={24} /> },
  ];

  // Function to handle sidebar toggle
  const handleToggleSidebar = (isOpen) => {
    setIsSidebarCollapsed(!isOpen);
  };

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
      case "Créer Tâche":
        return <CreateTaskForm />;
      case "Planifier Maintenance":
        return <CreateMaintenanceForm />;
      case "Créer Intervention":
        return <CreateInterventionForm />;
      case "Calendar":
        return <Calendar />;
      case "Machine Table":
        return <MachineTable />;
      case "Intervention Table":
        return <InterventionTable />;
      case "Maintenance Table":
        return <MaintenanceTable />;
      case "User Profile":
        return <UserProfile />;
      case "Rapport Général":
        return <RapportGeneral />;
      case "Valider demandes":
        return <DemandesValRejTable />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        setSelectedPage={setSelectedPage}
        menuItems={menuItems}
        tableMenuItems={tableMenuItems}
        isCollapsed={isSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <NavBarDashboard onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ResponsableDashboard;
