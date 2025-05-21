import React, { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import { Filter, X, Settings, Save, XCircle } from "lucide-react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import Cookies from "js-cookie";

// Function to map backend machine states to UI display states
const mapMachineStateToStatus = (etat) => {
  switch (etat) {
    case "Fonctionnelle":
      return "Fonctionnelle";
    case "En panne":
      return "En panne";
    case "Maintenance":
      return "Maintenance";
    default:
      return etat;
  }
};

// Status style logic for different machine states
const getStatusStyles = (status) => {
  // Convert status to lowercase for case-insensitive comparison
  const lowercaseStatus = status ? status.toLowerCase() : "";

  switch (lowercaseStatus) {
    case "fonctionnelle":
      return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
    case "en panne":
      return "bg-orange-50 dark:bg-orange-500/15 text-amber-700 dark:text-amber-400";
    case "maintenance":
      return "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400";
    default:
      return "bg-gray-50 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400";
  }
};

const MachineTable = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalMachines: 0,
  });
  const [isAnyFilterActive, setIsAnyFilterActive] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    nomMachine: "",
    dataSheet: "",
    etat: "",
  });

  const fetchMachines = async () => {
    try {
      setLoading(true);

      // Construire l'URL avec les paramètres de filtrage
      let url = `http://localhost:3001/machine?page=${pagination.page}&limit=${pagination.limit}`;

      if (searchTerm) {
        url += `&nomMachine=${encodeURIComponent(searchTerm)}`;
      }

      if (statusFilter) {
        url += `&etat=${encodeURIComponent(statusFilter)}`;
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

      setMachines(data.results);
      setPagination({
        ...pagination,
        totalPages: data.totalPages,
        totalMachines: data.totalMachines,
      });

      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des données: ${err.message}`);
      console.error("Failed to fetch machines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  // Check if any filter is active
  useEffect(() => {
    setIsAnyFilterActive(statusFilter !== "" || searchTerm !== "");
  }, [statusFilter, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination({ ...pagination, page: 1 });
  };

  const resetFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Start editing a machine
  const startEdit = (machine) => {
    setEditingId(machine._id);
    setEditValues({
      nomMachine: machine.nomMachine || "",
      dataSheet: machine.dataSheet || "",
      etat: machine.etat || "",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Save edited machine
  const saveEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/machine/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nomMachine: editValues.nomMachine,
          datasheet: editValues.dataSheet,
          etat: editValues.etat,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Refresh the data
      fetchMachines();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update machine:", err);
      alert(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };

  // Utiliser les véritables états de machine du backend
  const statusOptions = ["Fonctionnelle", "En panne", "Maintenance"];

  // Render a card view for mobile displays
  const renderMobileCard = (machine) => {
    const status = mapMachineStateToStatus(machine.etat);
    
    if (editingId === machine._id) {
      return (
        <div key={machine._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {machine._id}</div>
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(machine._id)}
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
                Nom de la machine
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200"
                value={editValues.nomMachine}
                onChange={(e) =>
                  setEditValues({ ...editValues, nomMachine: e.target.value })
                }
                placeholder="Nom de la machine"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Fiche Technique
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200"
                value={editValues.dataSheet}
                onChange={(e) =>
                  setEditValues({ ...editValues, dataSheet: e.target.value })
                }
                placeholder="Fiche technique"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                État
              </label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-200"
                value={editValues.etat}
                onChange={(e) =>
                  setEditValues({ ...editValues, etat: e.target.value })
                }
              >
                <option value="">Sélectionner un état</option>
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
      <div key={machine._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {machine._id}</div>
          <div className="flex items-center gap-2">
            <p className={`${getStatusStyles(status)} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}>
              {status}
            </p>
            <button
              onClick={() => startEdit(machine)}
              className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              title="Modifier"
            >
              <MdEdit size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Machine:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{machine.nomMachine}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Fiche Technique:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{machine.dataSheet}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border py-4 rounded-3xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="px-4 sm:px-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-semibold dark:text-white">
          Tableau des Machines
        </h1>
        <div className="flex gap-2 justify-between w-full sm:w-auto">
          <SearchInput
            className="flex-1 sm:w-48 md:w-72"
            placeholder="Rechercher par nom..."
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
                État de la machine
              </label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white w-full"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="">Tous les états</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
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
              <span className="dark:text-gray-300">Nom: {searchTerm}</span>
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
              <span className="dark:text-gray-300">État: {statusFilter}</span>
              <button
                onClick={() => setStatusFilter("")}
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
              {machines.length > 0 ? (
                machines.map((machine) => renderMobileCard(machine))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucune machine ne correspond aux critères de recherche
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
                        Machine
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Fiche Technique
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        État
                      </th>
                      <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 text-theme-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.length > 0 ? (
                      machines.map((machine) => {
                        const status = mapMachineStateToStatus(machine.etat);
                        return (
                          <tr
                            key={machine._id}
                            className="border-b border-gray-100 dark:border-gray-700"
                          >
                            <td className="px-4 py-4 text-theme-xs dark:text-gray-300">
                              {machine._id}
                            </td>
                            <td className="px-4 py-4">
                              {editingId === machine._id ? (
                                <input
                                  type="text"
                                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 w-full"
                                  value={editValues.nomMachine}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      nomMachine: e.target.value,
                                    })
                                  }
                                  placeholder="Nom de la machine"
                                />
                              ) : (
                                <div className="flex items-center gap-3">
                                  <span className="block text-theme-xs dark:text-gray-300">
                                    {machine.nomMachine}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-theme-sm dark:text-gray-300">
                              {editingId === machine._id ? (
                                <input
                                  type="text"
                                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 w-full"
                                  value={editValues.dataSheet}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      dataSheet: e.target.value,
                                    })
                                  }
                                  placeholder="Fiche technique"
                                />
                              ) : (
                                machine.dataSheet
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {editingId === machine._id ? (
                                <select
                                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 w-full"
                                  value={editValues.etat}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      etat: e.target.value,
                                    })
                                  }
                                >
                                  <option value="">Sélectionner un état</option>
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
                              {editingId === machine._id ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => saveEdit(machine._id)}
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
                                  onClick={() => startEdit(machine)}
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
                          colSpan="5"
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          Aucune machine ne correspond aux critères de recherche
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                Affichage de {machines.length} sur{" "}
                {pagination.totalMachines} machines
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

export default MachineTable;