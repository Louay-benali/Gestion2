import React, { useState, useEffect } from "react";
import { Save, XCircle, Filter, X } from "lucide-react";
import { MdEdit } from "react-icons/md";
import Cookies from "js-cookie";
import SearchInput from "./SearchInput";

const CostDurationManagement = () => {
  const [interventions, setInterventions] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("interventions");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    cost: "",
    duration: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isAnyFilterActive, setIsAnyFilterActive] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch interventions from backend
  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/intervention`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        withCredentials: true,
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      const data = await response.json();
      setInterventions(data.results);
      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des données: ${err.message}`);
      console.error("Failed to fetch interventions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch maintenances from backend
  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/maintenance`, {
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
      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des données: ${err.message}`);
      console.error("Failed to fetch maintenances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "interventions") {
      fetchInterventions();
    } else {
      fetchMaintenances();
    }
  }, [activeTab]);

  // Start editing an item
  const startEdit = (item) => {
    setEditingId(item._id);
    setEditValues({
      cost: item.cost || "",
      duration: item.duration || "",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues({
      ...editValues,
      [name]: value,
    });
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setIsAnyFilterActive(false);
  };

  // Filter interventions based on search term and status
  const filteredInterventions = interventions.filter((intervention) => {
    // Check if machine name matches search term
    const matchesSearch =
      searchTerm === "" ||
      (intervention.machine?.nomMachine &&
        intervention.machine.nomMachine
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    // Check if status matches filter
    const matchesStatus =
      statusFilter === "" || intervention.status === statusFilter;

    // Intervention must match all active filters
    return matchesSearch && matchesStatus;
  });

  // Filter maintenances based on search term and status
  const filteredMaintenances = maintenances.filter((maintenance) => {
    // Check if title matches search term
    const matchesSearch =
      searchTerm === "" ||
      (maintenance.titre &&
        maintenance.titre.toLowerCase().includes(searchTerm.toLowerCase()));

    // Check if status matches filter
    const matchesStatus =
      statusFilter === "" || maintenance.statut === statusFilter;

    // Maintenance must match all active filters
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setIsAnyFilterActive(searchTerm !== "" || statusFilter !== "");
  }, [searchTerm, statusFilter]);

  // Save edited intervention
  const saveInterventionEdit = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3001/intervention/${id}/cost-duration`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          body: JSON.stringify({
            cost: parseFloat(editValues.cost),
            duration: parseInt(editValues.duration),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Update local state
      setInterventions(
        interventions.map((item) =>
          item._id === id
            ? {
                ...item,
                cost: parseFloat(editValues.cost),
                duration: parseInt(editValues.duration),
              }
            : item
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating intervention:", error);
      setError(`Erreur de mise à jour: ${error.message}`);
    }
  };

  // Save edited maintenance
  const saveMaintenanceEdit = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3001/maintenance/${id}/cost-duration`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          body: JSON.stringify({
            cost: parseFloat(editValues.cost),
            duration: parseInt(editValues.duration),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Update local state
      setMaintenances(
        maintenances.map((item) =>
          item._id === id
            ? {
                ...item,
                cost: parseFloat(editValues.cost),
                duration: parseInt(editValues.duration),
              }
            : item
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating maintenance:", error);
      setError(`Erreur de mise à jour: ${error.message}`);
    }
  };

  // Render intervention table
  const renderInterventionTable = () => {
    if (loading) return <div className="text-center py-4">Chargement...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;
    if (filteredInterventions.length === 0)
      return (
        <div className="text-center py-4">Aucune intervention trouvée</div>
      );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Machine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technicien
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coût (DH)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée (heures)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInterventions.map((intervention) => (
              <tr key={intervention._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {intervention.machine?.nomMachine || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {intervention.type || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {intervention.technicien
                    ? `${intervention.technicien.prenom} ${intervention.technicien.nom}`
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(
                      intervention.status
                    )}`}
                  >
                    {intervention.status || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === intervention._id ? (
                    <input
                      type="number"
                      name="cost"
                      value={editValues.cost}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-24"
                      min="0"
                      step="0.01"
                    />
                  ) : intervention.cost ? (
                    `${intervention.cost.toFixed(2)} DH`
                  ) : (
                    "Non défini"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === intervention._id ? (
                    <input
                      type="number"
                      name="duration"
                      value={editValues.duration}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-24"
                      min="0"
                    />
                  ) : intervention.duration ? (
                    `${intervention.duration} h`
                  ) : (
                    "Non défini"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  {editingId === intervention._id ? (
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => saveInterventionEdit(intervention._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(intervention)}
                      className="text-indigo-600 hover:text-indigo-900 mx-auto"
                    >
                      <MdEdit size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render maintenance table
  const renderMaintenanceTable = () => {
    if (loading) return <div className="text-center py-4">Chargement...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;
    if (filteredMaintenances.length === 0)
      return <div className="text-center py-4">Aucune maintenance trouvée</div>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technicien
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coût (DH)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée (heures)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMaintenances.map((maintenance) => (
              <tr key={maintenance._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {maintenance.titre || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {maintenance.typeMaintenance || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {maintenance.technicien
                    ? `${maintenance.technicien.prenom} ${maintenance.technicien.nom}`
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMaintenanceStatusStyles(
                      maintenance.statut
                    )}`}
                  >
                    {maintenance.statut || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === maintenance._id ? (
                    <input
                      type="number"
                      name="cost"
                      value={editValues.cost}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-24"
                      min="0"
                      step="0.01"
                    />
                  ) : maintenance.cost ? (
                    `${maintenance.cost.toFixed(2)} DH`
                  ) : (
                    "Non défini"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === maintenance._id ? (
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => saveMaintenanceEdit(maintenance._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(maintenance)}
                      className="text-indigo-600 hover:text-indigo-900 mx-auto"
                    >
                      <MdEdit size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper functions for styling
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

  const getMaintenanceStatusStyles = (status) => {
    switch (status) {
      case "Planifiée":
        return "bg-blue-50 text-blue-600";
      case "En cours":
        return "bg-amber-50 text-amber-600";
      case "Terminée":
        return "bg-emerald-50 text-emerald-600";
      case "Annulée":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  // Options for status filters
  const interventionStatusOptions = ["Completé", "En cours", "Reporté"];
  const maintenanceStatusOptions = [
    "Planifiée",
    "En cours",
    "Terminée",
    "Annulée",
  ];

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des Coûts et Durées</h2>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "interventions"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("interventions")}
        >
          Interventions
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "maintenances"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("maintenances")}
        >
          Maintenances
        </button>
      </div>

      {/* Search and filter section */}
      <div className="px-4 sm:px-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2 justify-between w-full sm:w-auto">
          <SearchInput
            className="flex-1 sm:w-48 md:w-72"
            placeholder={
              activeTab === "interventions"
                ? "Rechercher par machine..."
                : "Rechercher par titre..."
            }
            value={searchTerm}
            onChange={handleSearch}
          />
          <button
            className={`border p-2 rounded-lg sm:w-24 flex flex-row gap-1 items-center justify-center transition-colors ${
              showFilters
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "border-gray-300 hover:bg-gray-50"
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
        <div className="px-4 sm:px-5 pb-4 border-t border-gray-200 pt-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
            <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-40">
              <label className="text-sm text-gray-600">Statut</label>
              <select
                className="border border-gray-300 rounded-lg p-2 text-sm bg-white w-full"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {activeTab === "interventions"
                  ? interventionStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))
                  : maintenanceStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
              </select>
            </div>

            {isAnyFilterActive && (
              <button
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 mt-2 sm:mt-6"
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
          <span className="text-sm text-gray-500">Filtres actifs:</span>
          {searchTerm && (
            <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span>
                {activeTab === "interventions" ? "Machine" : "Titre"}:{" "}
                {searchTerm}
              </span>
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {statusFilter && (
            <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span>Statut: {statusFilter}</span>
              <button
                onClick={() => setStatusFilter("")}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {activeTab === "interventions"
        ? renderInterventionTable()
        : renderMaintenanceTable()}
    </div>
  );
};

export default CostDurationManagement;
