import React, { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import { Filter, X, Save, XCircle } from "lucide-react";
import { Calendar, Wrench } from "lucide-react";
import { MdEdit } from "react-icons/md";
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
      return "bg-emerald-50 text-emerald-600";
    case "En cours":
      return "bg-blue-50 text-blue-600";
    case "Reporté":
      return "bg-orange-50 text-amber-700";
    default:
      return "bg-blue-50 text-blue-600";
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
    case "reparation":
      return <Wrench size={16} className="text-orange-500" />;
    default:
      return <Wrench size={16} className="text-gray-500" />;
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
        // Check if techData is an array before using map
        if (Array.isArray(techData)) {
          setTechniciensList(
            techData.map((tech) => ({
              id: tech._id,
              nom: `${tech.prenom} ${tech.nom}`,
            }))
          );
        } else if (
          techData &&
          techData.results &&
          Array.isArray(techData.results)
        ) {
          // Handle case where API returns {results: [...]} structure
          setTechniciensList(
            techData.results.map((tech) => ({
              id: tech._id,
              nom: `${tech.prenom} ${tech.nom}`,
            }))
          );
        } else {
          console.error("Unexpected techData format:", techData);
          setTechniciensList([]);
        }
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
        // Check if machineData has the expected structure before using map
        if (
          machineData &&
          machineData.results &&
          Array.isArray(machineData.results)
        ) {
          setMachinesList(
            machineData.results.map((machine) => ({
              id: machine._id,
              nom: machine.nomMachine,
            }))
          );
        } else if (Array.isArray(machineData)) {
          // Handle case where API returns array directly
          setMachinesList(
            machineData.map((machine) => ({
              id: machine._id,
              nom: machine.nomMachine,
            }))
          );
        } else {
          console.error("Unexpected machineData format:", machineData);
          setMachinesList([]);
        }
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
    // If there's a search term, check both machine name and technician name
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase().trim();
      
      // Check if machine name matches
      const machineNameMatches = intervention.machineNom && 
        intervention.machineNom.toLowerCase().includes(search);
      
      // Check if technician name matches
      const technicianNameMatches = intervention.technicienNom && 
        intervention.technicienNom.toLowerCase().includes(search);
      
      // If neither machine name nor technician name matches, exclude this intervention
      if (!machineNameMatches && !technicianNameMatches) {
        return false;
      }
    }
    
    // At this point, the intervention passes the machine name search filter
    // Now check other filters
    
    // Check type filter
    if (filters.type !== "" && intervention.type) {
      if (intervention.type.toLowerCase() !== filters.type.toLowerCase()) {
        return false; // Type doesn't match filter
      }
    }
    
    // Check technician filter
    if (filters.technicien !== "" && intervention.technicien) {
      if (intervention.technicien._id !== filters.technicien) {
        return false; // Technician doesn't match filter
      }
    }
    
    // If we got here, the intervention passes all filters
    return true;
  });

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    console.log('Search term changed to:', value);
    setSearchTerm(value);
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

  // Start editing an intervention
  const startEdit = (intervention) => {
    setEditingId(intervention._id);
    setEditValues({
      machine: intervention.machineNom || "",
      technicien: intervention.technicienNom || "",
      status: intervention.status || "En cours", // Default to "En cours" if status is null/undefined
      type: intervention.type || "Maintenance", // Default to "Maintenance" if type is null/undefined
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Format the type to match backend expectations (capitalize first letter)
  const formatTypeForBackend = (type) => {
    if (!type) return "Maintenance";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // Save edited intervention
  const saveEdit = async (id) => {
    try {
      // Format the type to match backend expectations
      const formattedType = formatTypeForBackend(editValues.type);

      // Extract just the machine name from the full name (remove any ID or extra info)
      const machineName = editValues.machine.split(" - ")[0];

      // Extract just the last name from the full technician name
      // The backend expects just the 'nom' field, not the full name
      const technicianName = editValues.technicien.split(" ").pop();

      console.log("Sending update with:", {
        nomMachine: machineName,
        nomTechnicien: technicianName,
        type: formattedType,
        status: editValues.status,
      });

      const response = await fetch(`http://localhost:3001/intervention/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nomMachine: machineName,
          nomTechnicien: technicianName,
          type: formattedType,
          status: editValues.status,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API response error: ${response.status} - ${errorData.message || ""}`
        );
      }

      // Refresh the data
      fetchInterventions();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update intervention:", err);
      alert(`Erreur lors de la mise à jour: ${err.message}`);
    }
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

  // Render a card for mobile and tablet view of an intervention
  const renderInterventionCard = (intervention) => {
    if (editingId === intervention._id) {
      return (
        <div
          key={intervention._id}
          className="p-4 border rounded-lg mb-4 bg-white shadow-sm hover:shadow transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="text-xs text-gray-500 truncate max-w-[150px]">
              ID: {intervention._id}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(intervention._id)}
                className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200 active:bg-green-300 transition-colors"
                title="Enregistrer"
                aria-label="Enregistrer les modifications"
              >
                <Save size={16} />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300 transition-colors"
                title="Annuler"
                aria-label="Annuler les modifications"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">
                Machine
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={editValues.machine}
                onChange={(e) =>
                  setEditValues({ ...editValues, machine: e.target.value })
                }
                placeholder="Nom de la machine"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Type</label>
              <select
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={editValues.type}
                onChange={(e) =>
                  setEditValues({ ...editValues, type: e.target.value })
                }
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Réparation">Réparation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">
                Technicien
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={editValues.technicien}
                onChange={(e) =>
                  setEditValues({ ...editValues, technicien: e.target.value })
                }
                placeholder="Nom du technicien"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Status</label>
              <select
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={editValues.status}
                onChange={(e) =>
                  setEditValues({ ...editValues, status: e.target.value })
                }
              >
                <option value="Completé">Completé</option>
                <option value="En cours">En cours</option>
                <option value="Reporté">Reporté</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={intervention._id}
        className="p-4 border rounded-lg mb-4 bg-white shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="text-xs text-gray-500 truncate max-w-[150px]">
            ID: {intervention._id}
          </div>
          <button
            onClick={() => startEdit(intervention)}
            className="p-1.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 active:bg-blue-300 transition-colors"
            title="Modifier"
            aria-label="Modifier l'intervention"
          >
            <MdEdit size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
          <div>
            <div className="text-xs text-gray-500 font-medium">Machine</div>
            <div className="text-sm font-medium break-words">{intervention.machineNom}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500 font-medium">Date</div>
            <div className="text-sm font-medium">
              {intervention.formattedDate}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 font-medium">Type</div>
            <div className="flex items-center gap-2 text-sm font-medium">
              {getInterventionTypeIcon(intervention.type)}
              <span>{formatTypeDisplay(intervention.type)}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 font-medium">Status</div>
            <p
              className={`${getStatusStyles(
                intervention.status
              )} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium mt-1`}
            >
              {mapInterventionStateToStatus(intervention.status)}
            </p>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 font-medium">Technicien</div>
          <div className="text-sm font-medium break-words">
            {intervention.technicienNom}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border py-4 rounded-3xl border-gray-200 bg-white">
      <div className="px-4 md:px-5 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-xl font-semibold text-center md:text-left">Historique des Interventions</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <SearchInput
            className="w-full md:w-64 lg:w-72"
            placeholder="Rechercher par machine ou technicien..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button
            className={`border p-2 rounded-lg min-w-[40px] flex flex-row gap-2 items-center justify-center transition-colors ${
              showFilters
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "border-gray-300 hover:bg-gray-50 active:bg-gray-100"
            }`}
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filtrer les interventions"
          >
            <Filter size={18} />
            <span className="md:inline hidden">Filtrer</span>
          </button>
        </div>
      </div>

      {/* Filter section */}
      {showFilters && (
        <div className="px-4 md:px-5 pb-4 border-t border-gray-200 pt-4">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 md:items-center">
            <div className="flex flex-col gap-1 w-full md:w-auto md:min-w-48">
              <label className="text-sm text-gray-600 font-medium">
                Type d'intervention
              </label>
              <select
                className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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

            <div className="flex flex-col gap-1 w-full md:w-auto md:min-w-48">
              <label className="text-sm text-gray-600 font-medium">Technicien</label>
              <select
                className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 active:text-red-900 mt-2 md:mt-6 py-1.5 px-2 rounded-lg transition-colors hover:bg-red-50 active:bg-red-100 w-full md:w-auto justify-center md:justify-start"
                onClick={resetFilters}
                aria-label="Réinitialiser tous les filtres"
              >
                <X size={14} />
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6 pb-3 px-4 md:px-7">
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
            {/* Desktop View - Table (visible only on large screens) */}
            <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                        ID Intervention
                      </th>
                      <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                        Machine
                      </th>
                      <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                        Type
                      </th>
                      <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                        Technicien
                      </th>
                      <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                        Date
                      </th>
                      <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right sm:px-6 text-gray-600 text-theme-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInterventions.length > 0 ? (
                      filteredInterventions.map((intervention) => (
                        <tr
                          key={intervention._id}
                          className="border-b border-gray-100"
                        >
                          <td className="px-5 py-4 sm:px-6 text-theme-xs">
                            {intervention._id}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {editingId === intervention._id ? (
                              <input
                                type="text"
                                className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
                                value={editValues.machine}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    machine: e.target.value,
                                  })
                                }
                                placeholder="Nom de la machine"
                              />
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="block text-theme-xs">
                                  {intervention.machineNom}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {editingId === intervention._id ? (
                              <select
                                className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
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
                                <span className="text-theme-sm">
                                  {formatTypeDisplay(intervention.type)}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {editingId === intervention._id ? (
                              <input
                                type="text"
                                className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
                                value={editValues.technicien}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    technicien: e.target.value,
                                  })
                                }
                                placeholder="Nom du technicien"
                              />
                            ) : (
                              <span className="text-theme-sm">
                                {intervention.technicienNom}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 sm:px-6 text-theme-sm">
                            {intervention.formattedDate}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {editingId === intervention._id ? (
                              <select
                                className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
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
                          <td className="px-5 py-4 sm:px-6 text-right">
                            {editingId === intervention._id ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => saveEdit(intervention._id)}
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
                                onClick={() => startEdit(intervention)}
                                className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                                title="Modifier"
                              >
                                <MdEdit size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-5 py-8 text-center text-gray-500"
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

            {/* Mobile and Tablet View - Cards */}
            <div className="lg:hidden">
              {filteredInterventions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredInterventions.map((intervention) =>
                    renderInterventionCard(intervention)
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Aucune intervention trouvée avec les critères sélectionnés
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-6 gap-3">
              <div className="text-sm text-gray-500 text-center md:text-left">
                Affichage de {filteredInterventions.length} sur{" "}
                {pagination.totalInterventions} interventions
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

export default InterventionTable;
