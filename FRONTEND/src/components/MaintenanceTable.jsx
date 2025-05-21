import React, { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import { Filter, X, Settings, Save, XCircle } from "lucide-react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import Cookies from "js-cookie";

// Function to map maintenance status to UI display status
const mapMaintenanceStatusToDisplay = (statut) => {
  switch (statut) {
    case "Planifiée":
      return "Planifiée";
    case "En cours":
      return "En cours";
    case "Terminée":
      return "Terminée";
    case "Annulée":
      return "Annulée";
    default:
      return statut;
  }
};

// Status style logic for different maintenance states
const getStatusStyles = (status) => {
  // Convert status to lowercase for case-insensitive comparison
  const lowercaseStatus = status ? status.toLowerCase() : "";

  switch (lowercaseStatus) {
    case "planifiée":
      return "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400";
    case "en cours":
      return "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400";
    case "terminée":
      return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
    case "annulée":
      return "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400";
    default:
      return "bg-gray-50 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400";
  }
};

const MaintenanceTable = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalMaintenances: 0,
  });
  const [isAnyFilterActive, setIsAnyFilterActive] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    titre: "",
    description: "",
    statut: "",
  });

  const fetchMaintenances = async () => {
    try {
      setLoading(true);

      // Construire l'URL avec les paramètres de filtrage
      let url = `http://localhost:3001/maintenance?page=${pagination.page}&limit=${pagination.limit}`;

      if (searchTerm) {
        url += `&titre=${encodeURIComponent(searchTerm)}`;
      }

      if (statusFilter) {
        url += `&statut=${encodeURIComponent(statusFilter)}`;
      }

      if (typeFilter) {
        url += `&typeIntervention=${encodeURIComponent(typeFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        withCredentials: true,
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      const data = await response.json();

      setMaintenances(data.results);
      setPagination({
        ...pagination,
        totalPages: data.totalPages,
        totalMaintenances: data.totalMaintenances,
      });

      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des données: ${err.message}`);
      console.error("Failed to fetch maintenances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, typeFilter]);

  // Check if any filter is active
  useEffect(() => {
    setIsAnyFilterActive(statusFilter !== "" || searchTerm !== "" || typeFilter !== "");
  }, [statusFilter, searchTerm, typeFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination({ ...pagination, page: 1 });
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    setPagination({ ...pagination, page: 1 });
  };

  const resetFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
    setTypeFilter("");
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Start editing a maintenance
  const startEdit = (maintenance) => {
    setEditingId(maintenance._id);
    setEditValues({
      titre: maintenance.titre || "",
      description: maintenance.description || "",
      statut: maintenance.statut || "",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Save edited maintenance
  const saveEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/maintenance/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          titre: editValues.titre,
          description: editValues.description,
          statut: editValues.statut,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Refresh the data
      fetchMaintenances();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update maintenance:", err);
      alert(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };

  // Status options for filtering and editing
  const statusOptions = ["Planifiée", "En cours", "Terminée", "Annulée"];
  
  // Type options for filtering
  const typeOptions = ["Préventive", "Corrective", "Prédictive"];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Render a card view for mobile displays
  const renderMobileCard = (maintenance) => {
    const status = mapMaintenanceStatusToDisplay(maintenance.statut);
    
    if (editingId === maintenance._id) {
      return (
        <div key={maintenance._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {maintenance._id}</div>
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(maintenance._id)}
                className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                title="Enregistrer"
              >
                <Save size={16} />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                title="Annuler"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Titre
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200"
                value={editValues.titre}
                onChange={(e) =>
                  setEditValues({ ...editValues, titre: e.target.value })
                }
                placeholder="Titre de la maintenance"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Description
              </label>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200"
                value={editValues.description}
                onChange={(e) =>
                  setEditValues({ ...editValues, description: e.target.value })
                }
                placeholder="Description"
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Statut
              </label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200"
                value={editValues.statut}
                onChange={(e) =>
                  setEditValues({ ...editValues, statut: e.target.value })
                }
              >
                <option value="">Sélectionner un statut</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={maintenance._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {maintenance._id}</div>
          <div className="flex items-center gap-2">
            <p className={`${getStatusStyles(status)} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}>
              {status}
            </p>
            <button
              onClick={() => startEdit(maintenance)}
              className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              title="Modifier"
            >
              <MdEdit size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Titre:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{maintenance.titre}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Type:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{maintenance.typeIntervention}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Date planifiée:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{formatDate(maintenance.datePlanifiee)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Technicien:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">
              {maintenance.technicien ? `${maintenance.technicien.nom} ${maintenance.technicien.prenom}` : "-"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border py-4 rounded-3xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="px-4 sm:px-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-semibold dark:text-white">
          Tableau des Maintenances
        </h1>
        <div className="flex gap-2 justify-between w-full sm:w-auto">
          <SearchInput
            className="flex-1 sm:w-48 md:w-72"
            placeholder="Rechercher par titre..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button
            className={`border p-2 rounded-lg sm:w-24 flex flex-row gap-1 items-center justify-center transition-colors ${
              showFilters
                ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="sm:block" />
            <span className="hidden sm:block">Filtrer</span>
          </button>
        </div>
      </div>

      {/* Filter section */}
      {showFilters && (
        <div className="px-4 sm:px-5 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
            <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-40">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Statut
              </label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white w-full"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-40">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Type d'intervention
              </label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white w-full"
                value={typeFilter}
                onChange={(e) => handleTypeFilter(e.target.value)}
              >
                <option value="">Tous les types</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {isAnyFilterActive && (
              <button
                className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mt-2 sm:mt-6"
                onClick={resetFilters}
              >
                <X size={14} />
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      )}

      {/* Display active filters */}
      {isAnyFilterActive && !showFilters && (
        <div className="px-4 sm:px-5 pb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Filtres actifs:</span>
          {searchTerm && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span className="dark:text-gray-300">Titre: {searchTerm}</span>
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {statusFilter && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span className="dark:text-gray-300">Statut: {statusFilter}</span>
              <button
                onClick={() => setStatusFilter("")}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {typeFilter && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span className="dark:text-gray-300">Type: {typeFilter}</span>
              <button
                onClick={() => setTypeFilter("")}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 pb-3 px-4 sm:px-7">
        {loading ? (
          <div className="flex justify-center p-8">
            <p className="dark:text-gray-300">Chargement des données...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center p-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Mobile view with cards (shown on small screens) */}
            <div className="md:hidden">
              {maintenances.length > 0 ? (
                maintenances.map((maintenance) => renderMobileCard(maintenance))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucune maintenance ne correspond aux critères de recherche
                </div>
              )}
            </div>

            {/* Desktop view with table (hidden on small screens) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Titre
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Date planifiée
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Technicien
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 text-theme-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenances.length > 0 ? (
                      maintenances.map((maintenance) => {
                        const status = mapMaintenanceStatusToDisplay(maintenance.statut);
                        return (
                          <tr
                            key={maintenance._id}
                            className="border-b border-gray-100 dark:border-gray-700"
                          >
                            <td className="px-4 py-4 text-theme-xs dark:text-gray-300">
                              {maintenance._id}
                            </td>
                            <td className="px-4 py-4">
                              {editingId === maintenance._id ? (
                                <input
                                  type="text"
                                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 w-full"
                                  value={editValues.titre}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      titre: e.target.value,
                                    })
                                  }
                                  placeholder="Titre de la maintenance"
                                />
                              ) : (
                                <div className="flex items-center gap-3">
                                  <span className="block text-theme-xs dark:text-gray-300">
                                    {maintenance.titre}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-theme-sm dark:text-gray-300">
                              {maintenance.typeIntervention}
                            </td>
                            <td className="px-4 py-4 text-theme-sm dark:text-gray-300">
                              {formatDate(maintenance.datePlanifiee)}
                            </td>
                            <td className="px-4 py-4 text-theme-sm dark:text-gray-300">
                              {maintenance.technicien ? 
                                `${maintenance.technicien.nom} ${maintenance.technicien.prenom}` : "-"}
                            </td>
                            <td className="px-4 py-4">
                              {editingId === maintenance._id ? (
                                <select
                                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 w-full"
                                  value={editValues.statut}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      statut: e.target.value,
                                    })
                                  }
                                >
                                  <option value="">Sélectionner un statut</option>
                                  {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <p
                                  className={`${getStatusStyles(
                                    status
                                  )} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}
                                >
                                  {status}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {editingId === maintenance._id ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => saveEdit(maintenance._id)}
                                    className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                    title="Enregistrer"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                    title="Annuler"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEdit(maintenance)}
                                  className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                  title="Modifier"
                                >
                                  <MdEdit size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          Aucune maintenance ne correspond aux critères de recherche
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                Affichage de {maintenances.length} sur{" "}
                {pagination.totalMaintenances} maintenances
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`p-2 rounded-md ${
                    pagination.page <= 1
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <FiChevronLeft size={18} />
                </button>
                <span className="text-sm dark:text-gray-300">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`p-2 rounded-md ${
                    pagination.page >= pagination.totalPages
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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

export default MaintenanceTable; 