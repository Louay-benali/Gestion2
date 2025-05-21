import React, { useState } from "react";
import NavBarDashboard from "../layout/NavBarDashboard.jsx";
import Sidebar from "../components/SideBar";
import QuickStats from "../components/QuickStats";
import StatisticsSection from "../components/StatisticsSection";
import CommandeTable from "../components/CommandeTable";
import UserProfile from "../layout/UserProfile.jsx";
import DemandesValRejTable from "../components/DemandesValRejTable.jsx";
import PasserCommandeForm from "../components/PasserCommandeForm.jsx";
import RevenueCard from "../components/RevenueCard.jsx";
import StockManagement from "../components/StockManagement.jsx";
import PieceManagement from "../components/PiecesManagement.jsx";

// Importation des icônes nécessaires
import {
  MdDashboard,
  MdPerson,
  MdTableChart,
  MdInventory,
  MdShoppingCart,
  MdCheckCircle,
  MdAssessment,
} from "react-icons/md";

const MagasinierDashboard = () => {
  // État pour suivre quelle page est sélectionnée
  const [selectedPage, setSelectedPage] = useState("Dashboard");

  // État pour gérer l'état de collapse de la sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Définition des éléments du menu principal
  const menuItems = [
    { label: "Dashboard", icon: <MdDashboard size={24} /> },
    { label: "Gérer Stock", icon: <MdInventory size={24} /> },
    { label: "Commandes", icon: <MdShoppingCart size={24} /> },
    { label: "Valider demandes", icon: <MdCheckCircle size={24} /> },
    { label: "Rapports", icon: <MdAssessment size={24} /> },
    { label: "User Profile", icon: <MdPerson size={24} /> },
  ];

  // Définition des éléments du menu de table
  const tableMenuItems = [
    {
      icon: <MdTableChart size={24} />,
      label: "Commandes Table",
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

      case "Gérer Stock":
        return <PieceManagement />;
      case "Commandes":
        return <PasserCommandeForm />;
      case "Commandes Table":
        return <CommandeTable />;
      case "Valider demandes":
        return <DemandesValRejTable />;
      case "Pièces Table":
        return <PieceManagement />;
      case "User Profile":
        return <UserProfile />;
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
        isCollapsed={isSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <NavBarDashboard
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MagasinierDashboard;
