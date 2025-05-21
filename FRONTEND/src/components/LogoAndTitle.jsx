import React from "react";

const LogoAndTitle = ({ collapsed = false }) => {
  return (
    <div className={`${collapsed ? 'flex justify-center py-3' : 'flex items-center gap-3 px-6 py-4'}`}>
      <div className="bg-blue-500 text-white p-2 rounded-lg">
        {/* Icône du logo - vous pouvez utiliser votre propre icône */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width={collapsed ? "20" : "24"} 
          height={collapsed ? "20" : "24"} 
          fill="currentColor"
        >
          <path d="M2 12h6v9H2v-9zm7-12h6v21H9V0zm7 6h6v15h-6V6z" />
        </svg>
      </div>
      
      {!collapsed && (
        <div>
          <h1 className="font-semibold text-lg">MaintenancePro</h1>
          <p className="text-xs text-gray-500">Gestion des équipements</p>
        </div>
      )}
    </div>
  );
};

export default LogoAndTitle;