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
      return "bg-red-50 text-red-600";
    case EtatEnum.encours:
      return "bg-orange-50 text-amber-700";
    case EtatEnum.resolue:
      return "bg-green-50 text-green-600";
    default:
      return "bg-blue-50 text-blue-600";
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
      setIsSmallScreen(window.innerWidth < 1024); // Augmenter le seuil pour inclure les tablettes
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
    // Prioritize machine name search
    const matchesMachineName = 
      panne.machineName && 
      panne.machineName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Also search by ID and description as fallback
    const matchesOtherFields =
      (panne._id && panne._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (panne.description && panne.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSearch = searchTerm === "" || matchesMachineName || matchesOtherFields;

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
    <div className="border py-4 rounded-3xl border-gray-200 bg-white">
      <div className="px-5 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-xl font-semibold text-center md:text-left dark:text-white">Machines en Panne</h1>
        <div className="flex gap-2 justify-between w-full md:w-auto">
          <SearchInput
            className="flex-1 md:w-64 lg:w-72"
            placeholder="Rechercher par nom de machine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`border p-2 rounded-lg min-w-[40px] flex flex-row gap-1 items-center justify-center transition-colors ${
              showFilters
                ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300"
                : "border-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:text-gray-200"
            }`}
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filtrer les pannes"
          >
            <VscSettings size={18} />
            <span className="hidden md:inline">Filtrer</span>
          </button>
        </div>
      </div>

      {/* Section des filtres */}
      {showFilters && (
        <div className="px-5 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 items-start md:items-center">
            <div className="flex flex-col gap-1 w-full md:w-auto md:min-w-48">
              <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Machine</label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 outline-none"
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

            <div className="flex flex-col gap-1 w-full md:w-auto md:min-w-48">
              <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">État</label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 outline-none"
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
                className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 active:text-red-900 dark:active:text-red-200 mt-2 md:mt-6 py-1.5 px-2 rounded-lg transition-colors hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-900/20 dark:active:bg-red-900/30 w-full md:w-auto justify-center md:justify-start"
                onClick={resetFilters}
                aria-label="Réinitialiser tous les filtres"
              >
                <XCircle size={14} />
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 pb-3 px-4 sm:px-7">
        {loading ? (
          <div className="flex justify-center p-8">
            <p className="dark:text-gray-300 animate-pulse">Chargement des données...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center p-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Vue de bureau */}
            {!isSmallScreen && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                          Machine
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                          Description
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                          Signalé par
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                          Date
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 text-theme-xs">
                          État
                        </th>
                        <th className="px-5 py-3 text-right sm:px-6 text-gray-600 text-theme-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPannes.length > 0 ? (
                        filteredPannes.map((panne) => (
                          <tr
                            key={panne._id}
                            className="border-b border-gray-100"
                          >
                            <td className="px-5 py-4 sm:px-6">
                              {editingId === panne._id ? (
                                <select
                                  className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
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
                                  <span className="block text-theme-xs">
                                    {panne.machineName}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 sm:px-6">
                              {editingId === panne._id ? (
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
                                  value={editValues.description}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                <span className="text-theme-sm">
                                  {panne.description}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 sm:px-6 text-theme-sm">
                              {panne.operateurName}
                            </td>
                            <td className="px-5 py-4 sm:px-6 text-theme-sm">
                              {panne.formattedDate}
                            </td>
                            <td className="px-5 py-4 sm:px-6">
                              {editingId === panne._id ? (
                                <select
                                  className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
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
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => startEdit(panne)}
                                    className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                                    title="Modifier"
                                  >
                                    <MdEdit size={18} />
                                  </button>
                                  {/* FaRegCheckCircle supprimé */}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-8 text-center text-gray-500"
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

            {/* Vue mobile et tablette responsive */}
            {isSmallScreen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPannes.length > 0 ? (
                  filteredPannes.map((panne) => (
                    <div
                      key={panne._id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-medium text-sm dark:text-gray-200 truncate max-w-[150px]">
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
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col md:flex-row md:justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Description:</span>
                          <span className="text-sm text-gray-800 dark:text-gray-200 break-words md:max-w-[60%] md:text-right">{panne.description}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Signalé par:</span>
                          <span className="text-sm text-gray-800 dark:text-gray-200 break-words md:max-w-[60%] md:text-right">{panne.operateurName}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Date:</span>
                          <span className="text-sm text-gray-800 dark:text-gray-200 md:text-right">{panne.formattedDate}</span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => startEdit(panne)}
                          className="p-1.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 active:bg-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          title="Modifier"
                          aria-label="Modifier cette panne"
                        >
                          <MdEdit size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg col-span-full">
                    Aucune panne trouvée avec les critères sélectionnés
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-6 gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
                Affichage de {filteredPannes.length} sur{" "}
                {pagination.totalPannes} pannes
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`p-2 rounded-md flex-1 md:flex-none flex justify-center ${
                    pagination.page <= 1
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                  }`}
                  aria-label="Page précédente"
                >
                  <FiChevronLeft size={18} />
                </button>
                <span className="text-sm dark:text-gray-300 whitespace-nowrap px-2">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`p-2 rounded-md flex-1 md:flex-none flex justify-center ${
                    pagination.page >= pagination.totalPages
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
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

export default PanneTable;
