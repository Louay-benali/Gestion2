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
      return "bg-blue-50 text-blue-600";
    case "en cours":
      return "bg-amber-50 text-amber-600";
    case "terminée":
      return "bg-emerald-50 text-emerald-600";
    case "annulée":
      return "bg-red-50 text-red-600";
    default:
      return "bg-gray-50 text-gray-600";
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
  // Filter maintenances based on search term and other filters
  const filteredMaintenances = maintenances.filter((maintenance) => {
    // Check if title matches search term
    const matchesSearch =
      searchTerm === "" ||
      (maintenance.titre &&
        maintenance.titre.toLowerCase().includes(searchTerm.toLowerCase()));

    // Check if status matches filter
    const matchesStatusFilter =
      statusFilter === "" || maintenance.statut === statusFilter;

    // Check if type matches filter
    const matchesTypeFilter =
      typeFilter === "" || maintenance.typeIntervention === typeFilter;

    // Maintenance must match all active filters
    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  });

  useEffect(() => {
    setIsAnyFilterActive(
      statusFilter !== "" || searchTerm !== "" || typeFilter !== ""
    );
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
    return date.toLocaleDateString("fr-FR");
  };

  // Render a card view for mobile and tablet displays
  const renderMobileCard = (maintenance) => {
    const status = mapMaintenanceStatusToDisplay(maintenance.statut);

    if (editingId === maintenance._id) {
      return (
        <div
          key={maintenance._id}
          className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="text-xs text-gray-500 truncate max-w-[150px]">
              ID: {maintenance._id}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(maintenance._id)}
                className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200 active:bg-green-300 transition-colors"
                title="Enregistrer"
              >
                <Save size={16} />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300 transition-colors"
                title="Annuler"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Titre</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                value={editValues.titre}
                onChange={(e) =>
                  setEditValues({ ...editValues, titre: e.target.value })
                }
                placeholder="Titre de la maintenance"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                value={editValues.description}
                onChange={(e) =>
                  setEditValues({ ...editValues, description: e.target.value })
                }
                placeholder="Description"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Statut</label>
              <select
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
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
      <div
        key={maintenance._id}
        className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="text-xs text-gray-500 truncate max-w-[150px]">
            ID: {maintenance._id}
          </div>
          <div className="flex items-center gap-2">
            <p
              className={`${getStatusStyles(
                status
              )} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}
            >
              {status}
            </p>
            <button
              onClick={() => startEdit(maintenance)}
              className="p-1.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 active:bg-blue-300 transition-colors"
              title="Modifier"
            >
              <MdEdit size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col md:flex-row md:justify-between">
            <span className="text-sm font-medium text-gray-600">Titre:</span>
            <span className="text-sm text-gray-800 break-words md:max-w-[60%] md:text-right">{maintenance.titre}</span>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between">
            <span className="text-sm font-medium text-gray-600">Type:</span>
            <span className="text-sm text-gray-800 md:text-right">
              {maintenance.typeIntervention}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between">
            <span className="text-sm font-medium text-gray-600">
              Date planifiée:
            </span>
            <span className="text-sm text-gray-800 md:text-right">
              {formatDate(maintenance.datePlanifiee)}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between">
            <span className="text-sm font-medium text-gray-600">
              Technicien:
            </span>
            <span className="text-sm text-gray-800 md:text-right">
              {maintenance.technicien
                ? `${maintenance.technicien.nom} ${maintenance.technicien.prenom}`
                : "-"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border py-4 rounded-3xl border-gray-200 bg-white">
      <div className="px-4 sm:px-5 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-semibold text-center md:text-left">
          Tableau des Maintenances
        </h1>
        <div className="flex gap-2 justify-between w-full md:w-auto">
          <SearchInput
            className="flex-1 md:w-64 lg:w-72"
            placeholder="Rechercher par titre..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button
            className={`border p-2 rounded-lg min-w-[40px] flex flex-row gap-1 items-center justify-center transition-colors ${
              showFilters
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "border-gray-300 hover:bg-gray-50 active:bg-gray-100"
            }`}
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filtrer"
          >
            <Filter size={16} />
            <span className="hidden md:block">Filtrer</span>
          </button>
        </div>
      </div>

      {/* Filter section */}
      {showFilters && (
        <div className="px-4 sm:px-5 pb-4 border-t border-gray-200 pt-4">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 items-start md:items-center">
            <div className="flex flex-col gap-1 w-full md:w-auto md:min-w-48">
              <label className="text-sm text-gray-600 font-medium">Statut</label>
              <select
                className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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

            <div className="flex flex-col gap-1 w-full md:w-auto md:min-w-48">
              <label className="text-sm text-gray-600 font-medium">
                Type d'intervention
              </label>
              <select
                className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 active:text-red-900 mt-2 md:mt-6 py-1.5 px-2 rounded-lg transition-colors hover:bg-red-50 active:bg-red-100 w-full md:w-auto justify-center md:justify-start"
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
          <span className="text-sm text-gray-500 mr-1 mb-1 w-full md:w-auto">Filtres actifs:</span>
          {searchTerm && (
            <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1 mb-1">
              <span className="truncate max-w-[150px]">Titre: {searchTerm}</span>
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-500 hover:text-gray-700 active:text-gray-900 p-0.5 rounded-full"
                aria-label="Supprimer le filtre de titre"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {statusFilter && (
            <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1 mb-1">
              <span>Statut: {statusFilter}</span>
              <button
                onClick={() => setStatusFilter("")}
                className="text-gray-500 hover:text-gray-700 active:text-gray-900 p-0.5 rounded-full"
                aria-label="Supprimer le filtre de statut"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {typeFilter && (
            <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1 mb-1">
              <span>Type: {typeFilter}</span>
              <button
                onClick={() => setTypeFilter("")}
                className="text-gray-500 hover:text-gray-700 active:text-gray-900 p-0.5 rounded-full"
                aria-label="Supprimer le filtre de type"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 sm:pt-6 pb-3 px-4 sm:px-7">
        {loading ? (
          <div className="flex justify-center p-8">
            <p className="text-gray-600 animate-pulse">Chargement des données...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center p-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Mobile and tablet view with cards (shown on small and medium screens) */}
            <div className="lg:hidden">
              {filteredMaintenances.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredMaintenances.map((maintenance) =>
                    renderMobileCard(maintenance)
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune maintenance ne correspond aux critères de recherche
                </div>
              )}
            </div>

            {/* Desktop view with table (hidden on small and medium screens) */}
            <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-gray-600 text-theme-xs">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 text-theme-xs">
                        Titre
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 text-theme-xs">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 text-theme-xs">
                        Date planifiée
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 text-theme-xs">
                        Technicien
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 text-theme-xs">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-right text-gray-600 text-theme-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaintenances.length > 0 ? (
                      filteredMaintenances.map((maintenance) => {
                        const status = mapMaintenanceStatusToDisplay(
                          maintenance.statut
                        );
                        return (
                          <tr
                            key={maintenance._id}
                            className="border-b border-gray-100"
                          >
                            <td className="px-4 py-4 text-theme-xs">
                              {maintenance._id}
                            </td>
                            <td className="px-4 py-4">
                              {editingId === maintenance._id ? (
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
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
                                  <span className="block text-theme-xs">
                                    {maintenance.titre}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-theme-sm">
                              {maintenance.typeIntervention}
                            </td>
                            <td className="px-4 py-4 text-theme-sm">
                              {formatDate(maintenance.datePlanifiee)}
                            </td>
                            <td className="px-4 py-4 text-theme-sm">
                              {maintenance.technicien
                                ? `${maintenance.technicien.nom} ${maintenance.technicien.prenom}`
                                : "-"}
                            </td>
                            <td className="px-4 py-4">
                              {editingId === maintenance._id ? (
                                <select
                                  className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
                                  value={editValues.statut}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      statut: e.target.value,
                                    })
                                  }
                                >
                                  <option value="">
                                    Sélectionner un statut
                                  </option>
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
                                    className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200"
                                    title="Enregistrer"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                    title="Annuler"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEdit(maintenance)}
                                  className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
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
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          Aucune maintenance ne correspond aux critères de
                          recherche
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-6 gap-3">
              <div className="text-sm text-gray-500 text-center md:text-left">
                Affichage de {filteredMaintenances.length} sur{" "}
                {pagination.totalMaintenances} maintenances
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`p-2 rounded-md flex-1 md:flex-none flex justify-center ${
                    pagination.page <= 1
                      ? "text-gray-300 cursor-not-allowed bg-gray-50"
                      : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                  aria-label="Page précédente"
                >
                  <FiChevronLeft size={18} />
                </button>
                <span className="text-sm whitespace-nowrap px-2">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`p-2 rounded-md flex-1 md:flex-none flex justify-center ${
                    pagination.page >= pagination.totalPages
                      ? "text-gray-300 cursor-not-allowed bg-gray-50"
                      : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                  aria-label="Page suivante"
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
