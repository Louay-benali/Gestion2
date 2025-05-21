import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

// Function to map status to display status
const mapStatusToDisplay = (status) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "validée":
    case "validee":
      return "Validée";
    case "rejetée":
    case "rejetee":
      return "Rejetée";
    case "en attente":
      return "En Attente";
    default:
      return status;
  }
};

// Status style logic for different statuses
const getStatusStyles = (status) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "validée":
    case "validee":
      return "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-700 py-1 px-2";
    case "rejetée":
    case "rejetee":
      return "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-700 py-1 px-2";
    case "en attente":
      return "bg-yellow-50 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-700 py-1 px-2";
    default:
      return "bg-gray-50 text-gray-800 dark:bg-gray-500/15 dark:text-gray-700 py-1 px-2";
  }
};

const DemandePieceTech = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDemandes, setTotalDemandes] = useState(0);

  const fetchDemandes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/demande/technicien/demandes?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        }
      );

      setDemandes(response.data.results);
      setTotalPages(response.data.totalPages);
      setTotalDemandes(response.data.totalDemandes);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
      toast.error("Erreur lors du chargement des demandes");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, [page]); // Refetch when page changes

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Mes Demandes de Pièces</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pièces
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {demandes.map((demande) => (
              <tr key={demande.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(demande.dateDemande).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {demande.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {demande.pieces
                    .map((p) => `${p.nomPiece || p.reference} (${p.quantite})`)
                    .join(", ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(
                      demande.status
                    )}`}
                  >
                    {mapStatusToDisplay(demande.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Précédent
          </button>
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={page === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Suivant
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{((page - 1) * limit) + 1}</span> à{' '}
              <span className="font-medium">{Math.min(page * limit, totalDemandes)}</span> sur{' '}
              <span className="font-medium">{totalDemandes}</span> demandes
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-sm font-medium ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Précédent
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setPage(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${page === index + 1 ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={page === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-sm font-medium ${page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandePieceTech;
