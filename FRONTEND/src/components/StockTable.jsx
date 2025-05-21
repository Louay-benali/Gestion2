import React from "react";

export default function StockTable({ stockItems = [] }) {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl">
      <table className="min-w-full">
        <thead>
          <tr className="text-gray-700">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Nom de pièce
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Quantité
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Référence
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Statut
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stockItems.length > 0 ? (
            stockItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{item.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getQuantityColor(
                      item.quantite
                    )}`}
                  >
                    {item.quantite}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.quantite > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.quantite > 0 ? "En stock" : "Hors stock"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                Aucun article en stock
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Fonction utilitaire pour colorer les quantités selon leur niveau
function getQuantityColor(quantite) {
  if (quantite <= 5) {
    return "bg-red-100 text-red-800"; // Niveau critique
  } else if (quantite <= 20) {
    return "bg-yellow-100 text-yellow-800"; // Niveau bas
  } else {
    return "bg-green-100 text-green-800"; // Niveau normal
  }
}
