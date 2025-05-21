import React, { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import { VscSettings } from "react-icons/vsc";
import { XCircle, Save } from "lucide-react";
import { FaRegCheckCircle } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Cookies from "js-cookie";

// État des pannes basé sur le modèle backend
const EtatEnum = {
  ouverte: "Ouverte",
  encours: "En cours",
  resolue: "Résolue",
};

// Styles pour les différents états de panne
const getStatusStyles = (status) => {
  switch (status) {
    case EtatEnum.ouverte:
      return "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400";
    case EtatEnum.encours:
      return "bg-orange-50 dark:bg-orange-500/15 text-amber-700 dark:text-amber-400";
    case EtatEnum.resolue:
      return "bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400";
    default:
      return "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400";
  }
};

const PanneTable = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    machine: "",
    etat: "",
  });
  const [pannes, setPannes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalPannes: 0,
  });
  const [isAnyFilterActive, setIsAnyFilterActive] = useState(false);
  const [machinesList, setMachinesList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    description: "",
    etat: "",
    machine: "",
    operateur: "",
  });

  // Vérification de la taille d'écran lors du montage et du redimensionnement
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Récupérer les pannes depuis l'API
  const fetchPannes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/panne?page=${pagination.page}&limit=${pagination.limit}`,
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

      // Traitement des données pour le composant
      const processedData = data.results.map((panne) => ({
        ...panne,
        machineName: panne.machine?.nomMachine || "N/A",
        operateurName: panne.operateur
          ? `${panne.operateur.prenom} ${panne.operateur.nom}`
          : "N/A",
        formattedDate: new Date(panne.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));

      setPannes(processedData);
      setPagination({
        ...pagination,
        totalPages: data.totalPages,
        totalPannes: data.totalPannes,
      });

      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des données: ${err.message}`);
      console.error("Failed to fetch pannes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des machines pour les filtres et le formulaire d'édition
  const fetchMachines = async () => {
    try {
      const response = await fetch("http://localhost:3001/machine", {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        withCredentials: true,
      });

      if (response.ok) {
        const data = await response.json();
        setMachinesList(
          data.results.map((machine) => ({
            id: machine._id,
            nom: machine.nomMachine,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch machines:", err);
    }
  };

  // Charger les données au montage du composant et à chaque changement de page
  useEffect(() => {
    fetchPannes();
    fetchMachines();
  }, [pagination.page, pagination.limit]);

  // Filtrer les pannes en fonction de la recherche et des filtres
  const filteredPannes = pannes.filter((panne) => {
    const matchesSearch =
      searchTerm === "" ||
      (panne._id &&
        panne._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (panne.description &&
        panne.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (panne.machineName &&
        panne.machineName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMachineFilter =
      filters.machine === "" ||
      (panne.machine && panne.machine._id === filters.machine);

    const matchesEtatFilter =
      filters.etat === "" || (panne.etat && panne.etat === filters.etat);

    return matchesSearch && matchesMachineFilter && matchesEtatFilter;
  });

  // Gérer le changement de page
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      machine: "",
      etat: "",
    });
  };

  // Vérifier si des filtres sont actifs
  useEffect(() => {
    setIsAnyFilterActive(filters.machine !== "" || filters.etat !== "");
  }, [filters]);

  // Commencer l'édition d'une panne
  const startEdit = (panne) => {
    setEditingId(panne._id);
    setEditValues({
      description: panne.description || "",
      etat: panne.etat || EtatEnum.ouverte,
      machine: panne.machine?._id || "",
      operateur: panne.operateur?._id || "",
    });
  };

  // Annuler l'édition
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Enregistrer les modifications d'une panne
  const saveEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/panne/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          description: editValues.description,
          etat: editValues.etat,
          machine: editValues.machine,
          operateur: editValues.operateur || undefined, // Ensure operateur is passed if available
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Rafraîchir les données
      fetchPannes();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update panne:", err);
      alert(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };

  // Mettre à jour les détails de la panne
  const updatePanne = async (id, updatedData) => {
    try {
      // Format the data to match backend expectations
      const formattedData = {
        ...updatedData,
        etat: updatedData.etat || EtatEnum.ouverte, // Default to "Ouverte" if etat is null/undefined
      };

      const response = await fetch(`http://localhost:3001/panne/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify(formattedData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Refresh the data
      fetchPannes();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update panne:", err);
      alert(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };

  // Marquer une panne comme résolue
  const resolvePanne = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3001/panne/${id}/confirmer`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Rafraîchir les données
      fetchPannes();
    } catch (err) {
      console.error("Failed to resolve panne:", err);
      alert(`Erreur lors de la résolution: ${err.message}`);
    }
  };

  return (
    <div className="border py-4 rounded-3xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="px-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold dark:text-white">
          Machines en Panne
        </h1>
        <div className="flex gap-2 justify-end w-full sm:w-auto">
          <SearchInput
            className="w-full sm:w-48 md:w-72"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`border p-2 rounded-lg sm:w-24 flex flex-row gap-2 items-center justify-center transition-colors ${
              showFilters
                ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <VscSettings size={18} />
            Filtrer
          </button>
        </div>
      </div>

      {/* Section des filtres */}
      {showFilters && (
        <div className="px-5 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col gap-1 min-w-40">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Machine
              </label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
                value={filters.machine}
                onChange={(e) =>
                  setFilters({ ...filters, machine: e.target.value })
                }
              >
                <option value="">Toutes les machines</option>
                {machinesList.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-40">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                État
              </label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
                value={filters.etat}
                onChange={(e) =>
                  setFilters({ ...filters, etat: e.target.value })
                }
              >
                <option value="">Tous les états</option>
                <option value={EtatEnum.ouverte}>{EtatEnum.ouverte}</option>
                <option value={EtatEnum.encours}>{EtatEnum.encours}</option>
                <option value={EtatEnum.resolue}>{EtatEnum.resolue}</option>
              </select>
            </div>

            {isAnyFilterActive && (
              <button
                className="mt-6 flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                onClick={resetFilters}
              >
                <XCircle size={14} />
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 pb-3 px-7">
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
            {/* Vue de bureau */}
            {!isSmallScreen && (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-theme-xs">
                          Machine
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-theme-xs">
                          Description
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-theme-xs">
                          Signalé par
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-theme-xs">
                          Date
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-theme-xs">
                          État
                        </th>
                        <th className="px-5 py-3 text-right sm:px-6 text-gray-600 dark:text-gray-300 text-theme-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPannes.length > 0 ? (
                        filteredPannes.map((panne) => (
                          <tr
                            key={panne._id}
                            className="border-b border-gray-100 dark:border-gray-700"
                          >
                            <td className="px-5 py-4 sm:px-6">
                              {editingId === panne._id ? (
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
                                    {panne.machineName}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 sm:px-6">
                              {editingId === panne._id ? (
                                <input
                                  type="text"
                                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 w-full"
                                  value={editValues.description}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                <span className="text-theme-sm dark:text-gray-300">
                                  {panne.description}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 sm:px-6 text-theme-sm dark:text-gray-300">
                              {panne.operateurName}
                            </td>
                            <td className="px-5 py-4 sm:px-6 text-theme-sm dark:text-gray-300">
                              {panne.formattedDate}
                            </td>
                            <td className="px-5 py-4 sm:px-6">
                              {editingId === panne._id ? (
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
                                  <option value={EtatEnum.ouverte}>
                                    {EtatEnum.ouverte}
                                  </option>
                                  <option value={EtatEnum.encours}>
                                    {EtatEnum.encours}
                                  </option>
                                  <option value={EtatEnum.resolue}>
                                    {EtatEnum.resolue}
                                  </option>
                                </select>
                              ) : (
                                <p
                                  className={`${getStatusStyles(
                                    panne.etat
                                  )} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}
                                >
                                  {panne.etat}
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-4 sm:px-6 text-right">
                              {editingId === panne._id ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      updatePanne(panne._id, editValues)
                                    }
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
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => startEdit(panne)}
                                    className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                    title="Modifier"
                                  >
                                    <MdEdit size={18} />
                                  </button>
                                  {panne.etat !== EtatEnum.resolue && (
                                    <button
                                      onClick={() => resolvePanne(panne._id)}
                                      className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                      title="Marquer comme résolu"
                                    >
                                      <FaRegCheckCircle size={18} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            Aucune panne trouvée avec les critères sélectionnés
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Vue mobile responsive */}
            {isSmallScreen && (
              <div className="grid grid-cols-1 gap-4">
                {filteredPannes.length > 0 ? (
                  filteredPannes.map((panne) => (
                    <div
                      key={panne._id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm dark:text-white">
                          {panne.machineName}
                        </span>
                        <div className="flex items-center gap-2">
                          <p
                            className={`${getStatusStyles(
                              panne.etat
                            )} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}
                          >
                            {panne.etat}
                          </p>
                          {panne.etat !== EtatEnum.resolue && (
                            <button
                              onClick={() => resolvePanne(panne._id)}
                              className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30"
                              title="Marquer comme résolu"
                            >
                              <FaRegCheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Description</p>
                          <p className="text-sm dark:text-gray-300">
                            {panne.description}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Signalé par</p>
                          <p className="text-sm dark:text-gray-300">
                            {panne.operateurName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm dark:text-gray-300">
                            {panne.formattedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => startEdit(panne)}
                          className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          title="Modifier"
                        >
                          <MdEdit size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
                    Aucune panne trouvée avec les critères sélectionnés
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Affichage de {filteredPannes.length} sur{" "}
                {pagination.totalPannes} pannes
              </div>
              <div className="flex items-center gap-2">
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

export default PanneTable;
