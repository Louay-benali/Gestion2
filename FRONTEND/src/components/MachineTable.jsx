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
      return "bg-emerald-50  text-emerald-600 ";
    case "en panne":
      return "bg-orange-50  text-amber-700 ";
    case "maintenance":
      return "bg-red-50  text-red-600 ";
    default:
      return "bg-gray-50 text-gray-600 ";
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

      console.log(`[DEBUG] Fetching URL: ${url}`); // Debug log

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        credentials: "include",
      });

      console.log(`[DEBUG] Response status: ${response.status}`); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DEBUG] Response error: ${errorText}`);
        throw new Error(
          `API response error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log(`[DEBUG] Response data:`, data); // Debug log

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
  // Filter machines based on search term and other filters
  const filteredMachines = machines.filter((machine) => {
    // Check if machine name matches search term
    const matchesSearch = 
      searchTerm === "" ||
      (machine.nomMachine &&
        machine.nomMachine.toLowerCase().includes(searchTerm.toLowerCase()));

    // Check if machine status matches filter
    const matchesStatusFilter =
      statusFilter === "" ||
      (machine.etat === statusFilter);

    // Machine must match both search term and status filter
    return matchesSearch && matchesStatusFilter;
  });

  useEffect(() => {
    setIsAnyFilterActive(statusFilter !== "" || searchTerm !== "");
  }, [statusFilter, searchTerm]);

  const handleSearch = (e) => {
    const value = e.target.value;
    console.log(`[DEBUG] Search term: "${value}"`); // Debug log
    setSearchTerm(value);
    // Reset to first page when searching
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusFilter = (status) => {
    console.log(`[DEBUG] Status filter: "${status}"`); // Debug log
    setStatusFilter(status);
    setPagination({ ...pagination, page: 1 });
  };

  const resetFilters = () => {
    console.log("[DEBUG] Resetting filters"); // Debug log
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
      console.log(`[DEBUG] Updating machine ${id} with:`, editValues); // Debug log

      const response = await fetch(`http://localhost:3001/machine/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nomMachine: editValues.nomMachine,
          dataSheet: editValues.dataSheet, // Fixed: using dataSheet instead of datasheet
          etat: editValues.etat,
        }),
        credentials: "include",
      });

      console.log(`[DEBUG] Update response status: ${response.status}`); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DEBUG] Update error response: ${errorText}`);
        throw new Error(
          `API response error: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`[DEBUG] Update successful:`, result); // Debug log

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
        <div
          key={machine._id}
          className="bg-white  rounded-lg shadow-sm p-4 mb-4 border border-gray-200 "
        >
          <div className="flex justify-between items-start mb-3">
            <div className="text-xs text-gray-500 ">ID: {machine._id}</div>
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(machine._id)}
                className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 "
                title="Enregistrer"
              >
                <Save size={16} />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 "
                title="Annuler"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500  mb-1">
                Nom de la machine
              </label>
              <input
                type="text"
                className="w-full border border-gray-300  rounded p-2 text-sm bg-white "
                value={editValues.nomMachine}
                onChange={(e) =>
                  setEditValues({ ...editValues, nomMachine: e.target.value })
                }
                placeholder="Nom de la machine"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500  mb-1">
                Fiche Technique
              </label>
              <input
                type="text"
                className="w-full border border-gray-300  rounded p-2 text-sm bg-white "
                value={editValues.dataSheet}
                onChange={(e) =>
                  setEditValues({ ...editValues, dataSheet: e.target.value })
                }
                placeholder="Fiche technique"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500  mb-1">État</label>
              <select
                className="w-full border border-gray-300  rounded p-2 text-sm bg-white "
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
      <div
        key={machine._id}
        className="bg-white  rounded-lg shadow-sm p-4 mb-4 border border-gray-200 "
      >
        <div className="flex justify-between items-start mb-3">
          <div className="text-xs text-gray-500 ">ID: {machine._id}</div>
          <div className="flex items-center gap-2">
            <p
              className={`${getStatusStyles(
                status
              )} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}
            >
              {status}
            </p>
            <button
              onClick={() => startEdit(machine)}
              className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 "
              title="Modifier"
            >
              <MdEdit size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 ">Machine:</span>
            <span className="text-sm text-gray-800 ">{machine.nomMachine}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 ">
              Fiche Technique:
            </span>
            <span className="text-sm text-gray-800 ">{machine.dataSheet}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border py-4 rounded-3xl border-gray-200  bg-white ">
      <div className="px-4 sm:px-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-semibold ">
          Tableau des Machines
        </h1>
        <div className="flex gap-2 justify-between w-full sm:w-auto">
          <SearchInput
            className="flex-1 sm:w-48 md:w-72"
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log("[DEBUG] Enter pressed, fetching machines"); // Debug log
                fetchMachines();
              }
            }}
          />
          <button
            className={`border p-2 rounded-lg sm:w-24 flex flex-row gap-1 items-center justify-center transition-colors ${
              showFilters
                ? "bg-blue-100 border-blue-300 text-blue-700 "
                : "border-gray-300 hover:bg-gray-50   "
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
        <div className="px-4 sm:px-5 pb-4 border-t border-gray-200  pt-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
            <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-40">
              <label className="text-sm text-gray-600 ">
                État de la machine
              </label>
              <select
                className="border border-gray-300  rounded-lg p-2 text-sm bg-white w-full"
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
                className="flex items-center gap-1 text-sm text-red-600  hover:text-red-800 mt-2 sm:mt-6"
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
          <span className="text-sm text-gray-500 ">Filtres actifs:</span>
          {searchTerm && (
            <div className="bg-gray-100  rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span className="">Nom: {searchTerm}</span>
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-500  hover:text-gray-700 "
              >
                <X size={14} />
              </button>
            </div>
          )}
          {statusFilter && (
            <div className="bg-gray-100  rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span className="">État: {statusFilter}</span>
              <button
                onClick={() => setStatusFilter("")}
                className="text-gray-500  hover:text-gray-700 "
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-200  pt-4 sm:pt-6 pb-3 px-4 sm:px-7">
        {loading ? (
          <div className="flex justify-center p-8">
            <p className="">Chargement des données...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center p-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Mobile view with cards (shown on small screens) */}
            <div className="md:hidden">
              {filteredMachines.length > 0 ? (
                filteredMachines.map((machine) => renderMobileCard(machine))
              ) : (
                <div className="text-center py-8 text-gray-500 ">
                  Aucune machine ne correspond aux critères de recherche
                </div>
              )}
            </div>

            {/* Desktop view with table (hidden on small screens) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-gray-600 text-theme-xs">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 text-theme-xs">
                        Machine
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 text-theme-xs">
                        Fiche Technique
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 text-theme-xs">
                        État
                      </th>
                      <th className="px-4 py-3 text-right text-gray-600 text-theme-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMachines.length > 0 ? (
                      filteredMachines.map((machine) => {
                        const status = mapMachineStateToStatus(machine.etat);
                        return (
                          <tr
                            key={machine._id}
                            className="border-b border-gray-100"
                          >
                            <td className="px-4 py-4 text-theme-xs text-gray-700">
                              {machine._id}
                            </td>
                            <td className="px-4 py-4">
                              {editingId === machine._id ? (
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded p-1 text-sm bg-white text-gray-800 w-full"
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
                                  <span className="block text-theme-xs text-gray-700">
                                    {machine.nomMachine}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-theme-sm text-gray-700">
                              {editingId === machine._id ? (
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded p-1 text-sm bg-white text-gray-800 w-full"
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
                                  className="border border-gray-300 rounded p-1 text-sm bg-white text-gray-800 w-full"
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
                                  onClick={() => startEdit(machine)}
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
                          colSpan="5"
                          className="px-4 py-8 text-center text-gray-500 "
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
              <div className="text-sm text-gray-500  text-center sm:text-left">
                {searchTerm ? (
                  `Affichage de ${filteredMachines.length} machine(s) correspondant à "${searchTerm}"`
                ) : (
                  `Affichage de ${machines.length} sur ${pagination.totalMachines} machines`
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`p-2 rounded-md ${
                    pagination.page <= 1
                      ? "text-gray-300 "
                      : "text-gray-600  hover:bg-gray-100 "
                  }`}
                >
                  <FiChevronLeft size={18} />
                </button>
                <span className="text-sm ">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`p-2 rounded-md ${
                    pagination.page >= pagination.totalPages
                      ? "text-gray-300 "
                      : "text-gray-600  hover:bg-gray-100 "
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
