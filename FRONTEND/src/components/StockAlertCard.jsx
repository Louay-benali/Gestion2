import React from "react";
import { MdWarning, MdRefresh } from "react-icons/md";

const StockAlertCard = () => {
  // Données des alertes de stock bas (à remplacer par des données réelles)
  const lowStockItems = [
    { id: 1, name: "Filtre à huile", quantity: 3, threshold: 5 },
    { id: 2, name: "Courroie de transmission", quantity: 2, threshold: 5 },
    { id: 3, name: "Joints d'étanchéité", quantity: 4, threshold: 10 },
    { id: 4, name: "Plaquettes de frein", quantity: 1, threshold: 5 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Alertes de Stock
        </h2>
        <button className="text-blue-500 hover:text-blue-700">
          <MdRefresh size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {lowStockItems.length > 0 ? (
          lowStockItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-500 rounded"
            >
              <div className="flex items-center">
                <MdWarning className="text-red-500 mr-3" size={20} />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantité:{" "}
                    <span className="font-bold text-red-600">
                      {item.quantity}
                    </span>{" "}
                    / Seuil: {item.threshold}
                  </p>
                </div>
              </div>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
                Commander
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            Aucune alerte de stock bas
          </p>
        )}
      </div>

      <div className="mt-4 text-center">
        <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
          Voir toutes les alertes
        </button>
      </div>
    </div>
  );
};

export default StockAlertCard;
