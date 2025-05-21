import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import SearchInput from "./SearchInput";
import { VscSettings } from "react-icons/vsc";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";

// Function to map status to display status
const mapStatusToDisplay = (status) => {
  switch (status) {
    case "validée":
      return "Validée";
    case "rejetée":
      return "Rejetée";
    case "en attente":
      return "En attente";
    default:
      return status;
  }
};

// Status style logic for different statuses
const getStatusStyles = (status) => {
  switch (status) {
    case "validée":
      return "bg-green-100 text-green-800";
    case "rejetée":
      return "bg-red-100 text-red-800";
    case "en attente":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const DemandePiecesTable = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalDemandes: 0,
  });

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      
      // Build URL with filtering parameters
      let url = `http://localhost:3001/demande?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (searchTerm) {
        url += `&description=${encodeURIComponent(searchTerm)}`;
      }
      
      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        withCredentials: true,
      });

      setDemandes(response.data.results);
      setPagination({
        ...pagination,
        totalPages: response.data.totalPages,
        totalDemandes: response.data.totalDemandes,
      });
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
      setError("Erreur lors du chargement des demandes");
      toast.error("Erreur lors du chargement des demandes");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination({ ...pagination, page: 1 });
    setShowFilterMenu(false);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Status options for filter
  const statusOptions = ["validée", "rejetée", "en attente"];

  return (
    <div className="border py-4 rounded-3xl dark:border-gray-200 bg-white w-full">
      {/* Header - Titre et Recherche */}
      <div className="px-4 sm:px-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold">Historique des Demandes de Pièces</h1>
        <div className="flex flex-col sm:flex-row gap-2 justify-end w-full sm:w-auto">
          <SearchInput
            className="w-full"
            placeholder="Rechercher par description..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="relative">
            <button 
              className="border dark:border-gray-300 p-2 rounded-lg w-full sm:w-24 flex flex-row gap-2 items-center justify-center hover:bg-gray-50"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <VscSettings size={20} />
              <span className="md:inline">Filtrer</span>
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 top-12 z-10 w-56 bg-white shadow-lg rounded-lg border border-gray-200 py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-medium">Filtrer par statut</h3>
                </div>
                <div className="py-1">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusFilter(status)}
                      className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                        statusFilter === status ? "bg-gray-100" : ""
                      }`}
                    >
                      <span className={`${getStatusStyles(status)} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium mr-2`}>
                        {mapStatusToDisplay(status)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(searchTerm || statusFilter) && (
        <div className="px-4 sm:px-5 pb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Filtres actifs:</span>
          {searchTerm && (
            <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span>Description: {searchTerm}</span>
              <button onClick={() => setSearchTerm("")} className="text-gray-500 hover:text-gray-700">
                <IoMdClose size={16} />
              </button>
            </div>
          )}
          {statusFilter && (
            <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span>Statut: {mapStatusToDisplay(statusFilter)}</span>
              <button onClick={() => setStatusFilter("")} className="text-gray-500 hover:text-gray-700">
                <IoMdClose size={16} />
              </button>
            </div>
          )}
          {(searchTerm || statusFilter) && (
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 ml-auto"
            >
              Effacer tous
            </button>
          )}
        </div>
      )}

      <div className="border-t dark:border-gray-200 pt-4 sm:pt-6 pb-3 px-4 sm:px-7">
        {loading ? (
          <div className="flex justify-center p-4 sm:p-8">
            <p>Chargement des données...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center p-4 sm:p-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Table for medium and larger screens */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-200 dark:bg-white/[0.03] hidden sm:block">
              <div className="max-w-full overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-300">
                      <th className="px-3 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                        Date
                      </th>
                      <th className="px-3 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                        Description
                      </th>
                      <th className="px-3 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                        Pièces
                      </th>
                      <th className="px-3 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandes.length > 0 ? (
                      demandes.map((demande) => (
                        <tr
                          key={demande.id}
                          className="border-b border-gray-100 dark:border-gray-300"
                        >
                          <td className="px-3 py-4 sm:px-6 text-theme-xs dark:text-gray-500">
                            {new Date(demande.dateDemande).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-4 sm:px-6 text-theme-sm dark:text-gray-500">
                            {demande.description}
                          </td>
                          <td className="px-3 py-4 sm:px-6 text-theme-xs dark:text-gray-500">
                            {demande.pieces
                              .map((p) => `${p.nomPiece || p.reference} (${p.quantite})`)
                              .join(", ")}
                          </td>
                          <td className="px-3 py-4 sm:px-6">
                            <p
                              className={`${getStatusStyles(
                                demande.status
                              )} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}
                            >
                              {mapStatusToDisplay(demande.status)}
                            </p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-3 py-8 text-center text-gray-500">
                          Aucune demande ne correspond aux critères de recherche
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card layout for small screens */}
            <div className="sm:hidden space-y-4">
              {demandes.length > 0 ? (
                demandes.map((demande) => (
                  <div key={demande.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">
                          {new Date(demande.dateDemande).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{demande.description}</p>
                      </div>
                      <p
                        className={`${getStatusStyles(
                          demande.status
                        )} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}
                      >
                        {mapStatusToDisplay(demande.status)}
                      </p>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <p className="font-medium mb-1">Pièces:</p>
                      <p>{demande.pieces
                        .map((p) => `${p.nomPiece || p.reference} (${p.quantite})`)
                        .join(", ")}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune demande ne correspond aux critères de recherche
                </div>
              )}
            </div>

            {/* Pagination controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
              <div className="text-sm text-gray-500 order-2 sm:order-1">
                Affichage de {demandes.length} sur {pagination.totalDemandes} demandes
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`p-2 rounded-md ${
                    pagination.page <= 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FiChevronLeft size={18} />
                </button>
                <span className="text-sm">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`p-2 rounded-md ${
                    pagination.page >= pagination.totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DemandePiecesTable;