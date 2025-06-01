import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import useWindowSize from "../hooks/useWindowSize";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

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
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDemandes, setTotalDemandes] = useState(0);
  
  // Utilisation du hook useWindowSize pour détecter les écrans mobiles et tablettes
  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= 640;
  const isTablet = windowSize.width > 640 && windowSize.width <= 1023;

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
  }, [page, limit]); // Refetch when page or limit changes
  
  // Ajuster la limite de pagination en fonction de la taille de l'écran
  useEffect(() => {
    if (isMobile) {
      setLimit(3);
    } else if (isTablet) {
      setLimit(4);
    } else {
      setLimit(5);
    }
  }, [isMobile, isTablet]);

  if (loading) {
    return <div className="flex justify-center items-center p-8 text-gray-600">Chargement...</div>;
  }
  
  // Rendu d'une carte pour l'affichage mobile
  const renderMobileCard = (demande) => {
    return (
      <div key={demande.id} className="bg-white rounded-lg shadow-sm p-3 mb-3 border border-gray-200 transition-all duration-200 hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
          <div className="text-xs text-gray-500">
            {new Date(demande.dateDemande).toLocaleDateString()}
          </div>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium ${getStatusStyles(
              demande.status
            )}`}
          >
            {mapStatusToDisplay(demande.status)}
          </span>
        </div>
        
        <div className="space-y-2 mt-2">
          <div>
            <span className="text-sm font-medium text-gray-600">Description:</span>
            <p className="text-sm text-gray-800 mt-1">{demande.description}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">Pièces:</span>
            <p className="text-sm text-gray-700 mt-1">
              {demande.pieces
                .map(
                  (p) => `${p.nomPiece || p.reference} (${p.quantite})`
                )
                .join(", ")}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border py-3 sm:py-4 rounded-2xl sm:rounded-3xl border-gray-200 bg-white transition-all duration-200">
      <div className="px-3 sm:px-5 pb-3 sm:pb-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Mes Demandes de Pièces</h2>
        
        {/* Vue mobile avec cartes (affichée sur petits écrans) */}
        <div className="md:hidden space-y-1 sm:space-y-2">
          {demandes.length > 0 ? (
            demandes.map((demande) => renderMobileCard(demande))
          ) : (
            <div className="text-center py-6 text-gray-500">
              Aucune demande de pièce trouvée
            </div>
          )}
        </div>
        
        {/* Vue desktop avec tableau (cachée sur petits écrans) */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 sm:px-5 py-3 text-left text-gray-600 text-theme-xs">
                    Date
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left text-gray-600 text-theme-xs">
                    Description
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left text-gray-600 text-theme-xs">
                    Pièces
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left text-gray-600 text-theme-xs">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {demandes.length > 0 ? (
                  demandes.map((demande) => (
                    <tr
                      key={demande.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 sm:px-5 py-4 text-theme-xs text-gray-700">
                        {new Date(demande.dateDemande).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-theme-sm text-gray-800">
                        {demande.description}
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-theme-sm text-gray-700">
                        {demande.pieces
                          .map(
                            (p) => `${p.nomPiece || p.reference} (${p.quantite})`
                          )
                          .join(", ")}
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium ${getStatusStyles(
                            demande.status
                          )}`}
                        >
                          {mapStatusToDisplay(demande.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 sm:px-5 py-6 text-center text-gray-500">
                      Aucune demande de pièce trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-5 py-3 border-t border-gray-200 gap-2">
        <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
          {totalDemandes > 0 ? (
            <>
              Affichage de{" "}
              <span className="font-medium">{(page - 1) * limit + 1}</span> à{" "}
              <span className="font-medium">
                {Math.min(page * limit, totalDemandes)}
              </span>{" "}
              sur <span className="font-medium">{totalDemandes}</span> demandes
            </>
          ) : (
            "Aucune demande de pièce"
          )}
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-2 bg-gray-50 sm:bg-transparent p-2 rounded-lg sm:p-0">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`p-1 sm:p-2 rounded-md flex items-center justify-center ${
              page === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
            }`}
            aria-label="Page précédente"
          >
            {isMobile ? (
              <FiChevronLeft size={20} />
            ) : (
              <>
                <FiChevronLeft size={16} className="mr-1" />
                <span>Précédent</span>
              </>
            )}
          </button>
          <span className="text-xs sm:text-sm font-medium">
            {isMobile ? `${page}/${totalPages}` : `Page ${page} sur ${totalPages}`}
          </span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === totalPages}
            className={`p-1 sm:p-2 rounded-md flex items-center justify-center ${
              page === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
            }`}
            aria-label="Page suivante"
          >
            {isMobile ? (
              <FiChevronRight size={20} />
            ) : (
              <>
                <span>Suivant</span>
                <FiChevronRight size={16} className="ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemandePieceTech;
