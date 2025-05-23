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
      return "bg-green-50 text-green-600";
    case "rejetée":
    case "rejetee":
      return "bg-red-50 text-red-600";
    case "en attente":
      return "bg-yellow-50 text-yellow-700";
    default:
      return "bg-gray-50 text-gray-600";
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
    <div className="border py-4 rounded-3xl border-gray-200 bg-white">
      <div className="px-5 pb-4">
        <h2 className="text-xl font-semibold mb-4">Mes Demandes de Pièces</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-gray-600 text-theme-xs">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-gray-600 text-theme-xs">
                  Description
                </th>
                <th className="px-5 py-3 text-left text-gray-600 text-theme-xs">
                  Pièces
                </th>
                <th className="px-5 py-3 text-left text-gray-600 text-theme-xs">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((demande) => (
                <tr
                  key={demande.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-theme-xs text-gray-700">
                    {new Date(demande.dateDemande).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-theme-sm text-gray-800">
                    {demande.description}
                  </td>
                  <td className="px-5 py-4 text-theme-sm text-gray-700">
                    {demande.pieces
                      .map(
                        (p) => `${p.nomPiece || p.reference} (${p.quantite})`
                      )
                      .join(", ")}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium ${getStatusStyles(
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
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3 border-t border-gray-200 gap-2">
        <div className="text-sm text-gray-500">
          Affichage de{" "}
          <span className="font-medium">{(page - 1) * limit + 1}</span> à{" "}
          <span className="font-medium">
            {Math.min(page * limit, totalDemandes)}
          </span>{" "}
          sur <span className="font-medium">{totalDemandes}</span> demandes
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`p-2 rounded-md ${
              page === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Précédent
          </button>
          <span className="text-sm">
            Page {page} sur {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === totalPages}
            className={`p-2 rounded-md ${
              page === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemandePieceTech;
