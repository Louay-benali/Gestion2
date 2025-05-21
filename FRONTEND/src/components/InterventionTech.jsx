import React, { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import { Filter, X, Calendar, Wrench } from "lucide-react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Cookies from "js-cookie";

// Map backend intervention status to UI display status
const mapInterventionStateToStatus = (status) => {
  return status || "En cours"; // Default to "En cours" if status is null/undefined
};

// Status style logic for different intervention states
const getStatusStyles = (status) => {
  switch (status) {
    case "Completé":
      return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
    case "En cours":
      return "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400";
    case "Reporté":
      return "bg-orange-50 dark:bg-orange-500/15 text-amber-700 dark:text-amber-400";
    default:
      return "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400";
  }
};

// Helper to get icons for intervention types
const getInterventionTypeIcon = (type) => {
  // Convert type to lowercase for case-insensitive comparison
  const lowerType = type ? type.toLowerCase() : "";

  switch (lowerType) {
    case "maintenance":
      return <Calendar size={16} className="text-blue-500" />;
    case "réparation":
      return <Wrench size={16} className="text-orange-500" />;
  }
};

const InterventionTable = () => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalInterventions: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    technicien: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    machine: "",
    technicien: "",
    status: "",
    type: "",
  });
  const [techniciensList, setTechniciensList] = useState([]);
  const [machinesList, setMachinesList] = useState([]);
  const [isAnyFilterActive, setIsAnyFilterActive] = useState(false);

  // Fetch interventions from backend
  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/intervention?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        }
      );

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      const data = await response.json();

      // Process the data to match our component's needs
      const processedData = data.results.map((intervention) => ({
        ...intervention,
        machineNom: intervention.machine?.nomMachine || "N/A",
        technicienNom: intervention.technicien
          ? `${intervention.technicien.prenom} ${intervention.technicien.nom}`
          : "N/A",
        formattedDate: new Date(intervention.createdAt).toLocaleDateString(
          "fr-FR",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        ),
      }));

      setInterventions(processedData);
      setPagination({
        ...pagination,
        totalPages: data.totalPages,
        totalInterventions: data.totalInterventions,
      });

      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des données: ${err.message}`);
      console.error("Failed to fetch interventions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available technicians and machines for the filters and edit form
  const fetchReferenceData = async () => {
    try {
      // Fetch technicians
      const techResponse = await fetch("http://localhost:3001/user", {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        withCredentials: true,
      });

      if (techResponse.ok) {
        const techData = await techResponse.json();
        setTechniciensList(
          techData.map((tech) => ({
            id: tech._id,
            nom: `${tech.prenom} ${tech.nom}`,
          }))
        );
      }

      // Fetch machines
      const machineResponse = await fetch("http://localhost:3001/machine", {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        withCredentials: true,
      });

      if (machineResponse.ok) {
        const machineData = await machineResponse.json();
        setMachinesList(
          machineData.results.map((machine) => ({
            id: machine._id,
            nom: machine.nomMachine,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch reference data:", err);
    }
  };

  useEffect(() => {
    fetchInterventions();
    fetchReferenceData();
  }, [pagination.page, pagination.limit]);

  // Filter interventions based on search and filters
  const filteredInterventions = interventions.filter((intervention) => {
    const matchesSearch =
      searchTerm === "" ||
      (intervention._id &&
        intervention._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (intervention.machineNom &&
        intervention.machineNom
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (intervention.technicienNom &&
        intervention.technicienNom
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesTypeFilter =
      filters.type === "" ||
      (intervention.type &&
        intervention.type.toLowerCase() === filters.type.toLowerCase());

    const matchesTechFilter =
      filters.technicien === "" ||
      (intervention.technicien &&
        intervention.technicien._id === filters.technicien);

    return matchesSearch && matchesTypeFilter && matchesTechFilter;
  });

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle pagination changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      type: "",
      technicien: "",
    });
  };

  // Check if any filter is active
  useEffect(() => {
    setIsAnyFilterActive(filters.type !== "" || filters.technicien !== "");
  }, [filters]);

  // Format the type to match backend expectations (capitalize first letter)
  const formatTypeForBackend = (type) => {
    if (!type) return "Maintenance";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // Format the displayed type with proper capitalization
  const formatTypeDisplay = (type) => {
    if (!type) return "N/A";

    // Format type for display with first letter capitalized
    const formattedType =
      type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

    // Handle special case for "Réparation"
    if (formattedType.toLowerCase() === "reparation") {
      return "Réparation";
    }

    return formattedType;
  };

  // Render a card view for mobile displays
  const renderMobileCard = (intervention) => {
    return (
      <div key={intervention._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {intervention._id}</div>
          <p className={`${getStatusStyles(intervention.status)} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}>
            {mapInterventionStateToStatus(intervention.status)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Machine:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{intervention.machineNom}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Type:</span>
            <div className="flex items-center gap-2">
              {getInterventionTypeIcon(intervention.type)}
              <span className="text-sm text-gray-800 dark:text-gray-200">
                {formatTypeDisplay(intervention.type)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Technicien:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{intervention.technicienNom}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Date:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{intervention.formattedDate}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border py-4 rounded-3xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="px-4 sm:px-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-semibold dark:text-white">
          Historique des Interventions
        </h1>
        <div className="flex gap-2 justify-between w-full sm:w-auto">
          <SearchInput
            className="flex-1 sm:w-48 md:w-72"
            placeholder="Rechercher..."
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
                Type d'intervention
              </label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white w-full"
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <option value="">Tous les types</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Réparation">Réparation</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-40">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Technicien
              </label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white w-full"
                value={filters.technicien}
                onChange={(e) =>
                  setFilters({ ...filters, technicien: e.target.value })
                }
              >
                <option value="">Tous les techniciens</option>
                {techniciensList.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.nom}
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
              {filteredInterventions.length > 0 ? (
                filteredInterventions.map((intervention) => renderMobileCard(intervention))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucune intervention trouvée avec les critères sélectionnés
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
                        ID Intervention
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Machine
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Technicien
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-theme-xs">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInterventions.length > 0 ? (
                      filteredInterventions.map((intervention) => (
                        <tr
                          key={intervention._id}
                          className="border-b border-gray-100 dark:border-gray-700"
                        >
                          <td className="px-4 py-4 text-theme-xs dark:text-gray-300">
                            {intervention._id}
                          </td>
                          <td className="px-4 py-4">
                            {editingId === intervention._id ? (
                              <select
                                className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 w-full"
                                value={editValues.machine}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    machine: e.target.value,
                                  })
                                }
                              >
                                <option value="">
                                  Sélectionner une machine
                                </option>
                                {machinesList.map((machine) => (
                                  <option key={machine.id} value={machine.id}>
                                    {machine.nom}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="block text-theme-xs dark:text-gray-300">
                                  {intervention.machineNom}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {editingId === intervention._id ? (
                              <select
                                className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 w-full"
                                value={editValues.type}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    type: e.target.value,
                                  })
                                }
                              >
                                <option value="Maintenance">Maintenance</option>
                                <option value="Réparation">Réparation</option>
                              </select>
                            ) : (
                              <div className="flex items-center gap-2">
                                {getInterventionTypeIcon(intervention.type)}
                                <span className="text-theme-sm dark:text-gray-300">
                                  {formatTypeDisplay(intervention.type)}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {editingId === intervention._id ? (
                              <select
                                className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 w-full"
                                value={editValues.technicien}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    technicien: e.target.value,
                                  })
                                }
                              >
                                <option value="">
                                  Sélectionner un technicien
                                </option>
                                {techniciensList.map((tech) => (
                                  <option key={tech.id} value={tech.id}>
                                    {tech.nom}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-theme-sm dark:text-gray-300">
                                {intervention.technicienNom}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-theme-sm dark:text-gray-300">
                            {intervention.formattedDate}
                          </td>
                          <td className="px-4 py-4">
                            {editingId === intervention._id ? (
                              <select
                                className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 w-full"
                                value={editValues.status}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    status: e.target.value,
                                  })
                                }
                              >
                                <option value="Completé">Completé</option>
                                <option value="En cours">En cours</option>
                                <option value="Reporté">Reporté</option>
                              </select>
                            ) : (
                              <p
                                className={`${getStatusStyles(
                                  intervention.status
                                )} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}
                              >
                                {mapInterventionStateToStatus(
                                  intervention.status
                                )}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          Aucune intervention trouvée avec les critères
                          sélectionnés
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                Affichage de {filteredInterventions.length} sur{" "}
                {pagination.totalInterventions} interventions
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

export default InterventionTable;