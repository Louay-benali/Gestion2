import React, { useState, useEffect } from "react";
import {
  Search,
  Settings,
  XCircle,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Cookies from "js-cookie";

// État des demandes basé sur le modèle backend
const EtatDemandeEnum = {
  enAttente: "En attente",
  validee: "Validée",
  rejetee: "Rejetée",
};

// Styles pour les différents états de demande
const getStatusStyles = (status) => {
  switch (status) {
    case EtatDemandeEnum.enAttente:
      return "bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400";
    case EtatDemandeEnum.validee:
      return "bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400";
    case EtatDemandeEnum.rejetee:
      return "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400";
    default:
      return "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400";
  }
};

// Composant SearchInput personnalisé
const SearchInput = ({ className, placeholder, value, onChange }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search size={16} className="text-gray-400" />
      </div>
      <input
        type="text"
        className="w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

const DemandeTable = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    demandeur: "",
  });
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalDemandes: 0,
  });
  const [isAnyFilterActive, setIsAnyFilterActive] = useState(false);
  const [demandeurs, setDemandeurs] = useState([]);
  const [expandedDemandeId, setExpandedDemandeId] = useState(null);

  // Vérification de la taille d'écran lors du montage et du redimensionnement
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Récupérer les demandes depuis l'API
  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/demande?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      const data = await response.json();

      setDemandes(data.results);
      setPagination({
        ...pagination,
        totalPages: data.totalPages,
        totalDemandes: data.totalDemandes,
      });

      // Extraire la liste unique des demandeurs pour les filtres
      const uniqueDemandeurs = [
        ...new Map(
          data.results
            .filter((d) => d.demandeur)
            .map((d) => [
              d.demandeur.id,
              {
                id: d.demandeur.id,
                nom: `${d.demandeur.prenom} ${d.demandeur.nom}`,
              },
            ])
        ).values(),
      ];
      setDemandeurs(uniqueDemandeurs);

      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des données: ${err.message}`);
      console.error("Failed to fetch demandes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant et à chaque changement de page
  useEffect(() => {
    fetchDemandes();
  }, [pagination.page, pagination.limit]);

  // Filtrer les demandes en fonction de la recherche et des filtres
  const filteredDemandes = demandes.filter((demande) => {
    const matchesSearch =
      searchTerm === "" ||
      (demande.id &&
        demande.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (demande.description &&
        demande.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (demande.demandeur &&
        `${demande.demandeur.prenom} ${demande.demandeur.nom}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatusFilter =
      filters.status === "" || demande.status === filters.status;

    const matchesDemandeurFilter =
      filters.demandeur === "" ||
      (demande.demandeur && demande.demandeur.id === filters.demandeur);

    return matchesSearch && matchesStatusFilter && matchesDemandeurFilter;
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
      status: "",
      demandeur: "",
    });
  };

  // Vérifier si des filtres sont actifs
  useEffect(() => {
    setIsAnyFilterActive(filters.status !== "" || filters.demandeur !== "");
  }, [filters]);

  // Valider une demande
  const validerDemande = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3001/demande/${id}/valider`,
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
      fetchDemandes();
    } catch (err) {
      console.error("Failed to validate demande:", err);
      alert(`Erreur lors de la validation: ${err.message}`);
    }
  };

  // Rejeter une demande
  const rejeterDemande = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3001/demande/${id}/rejeter`,
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
      fetchDemandes();
    } catch (err) {
      console.error("Failed to reject demande:", err);
      alert(`Erreur lors du rejet: ${err.message}`);
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Basculer l'expansion des détails de la demande
  const toggleExpand = (id) => {
    setExpandedDemandeId(expandedDemandeId === id ? null : id);
  };

  // Formater l'affichage des pièces
  const formatPiecesDisplay = (pieces) => {
    if (!pieces || pieces.length === 0) return "Aucune pièce";
    const firstPiece = pieces[0];
    const remaining = pieces.length - 1;
    return (
      <>
        <span>{firstPiece.nomPiece || firstPiece.reference || "N/A"}</span>
        {remaining > 0 && (
          <span className="text-gray-500 text-xs ml-1">(+{remaining})</span>
        )}
      </>
    );
  };

  return (
    <div className="border py-4 rounded-3xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="px-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold dark:text-white">
          Demandes de Pièces
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
            <Settings size={18} />
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
                État
              </label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">Tous les états</option>
                <option value={EtatDemandeEnum.enAttente}>
                  {EtatDemandeEnum.enAttente}
                </option>
                <option value={EtatDemandeEnum.validee}>
                  {EtatDemandeEnum.validee}
                </option>
                <option value={EtatDemandeEnum.rejetee}>
                  {EtatDemandeEnum.rejetee}
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-40">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Demandeur
              </label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
                value={filters.demandeur}
                onChange={(e) =>
                  setFilters({ ...filters, demandeur: e.target.value })
                }
              >
                <option value="">Tous les demandeurs</option>
                {demandeurs.map((demandeur) => (
                  <option key={demandeur.id} value={demandeur.id}>
                    {demandeur.nom}
                  </option>
                ))}
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
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-sm">
                          ID
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-sm">
                          Pièces
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-sm">
                          Demandeur
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-sm">
                          Date
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-sm">
                          État
                        </th>
                        <th className="px-5 py-3 text-right sm:px-6 text-gray-600 dark:text-gray-300 text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDemandes.length > 0 ? (
                        filteredDemandes.map((demande) => (
                          <React.Fragment key={demande.id}>
                            <tr
                              className={`border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                expandedDemandeId === demande.id
                                  ? "bg-gray-50 dark:bg-gray-700/50"
                                  : ""
                              }`}
                              onClick={() => toggleExpand(demande.id)}
                            >
                              <td className="px-5 py-4 sm:px-6 text-sm dark:text-gray-300">
                                {demande.id.substring(0, 8)}...
                              </td>
                              <td className="px-5 py-4 sm:px-6 text-sm dark:text-gray-300">
                                {formatPiecesDisplay(demande.pieces)}
                              </td>
                              <td className="px-5 py-4 sm:px-6 text-sm dark:text-gray-300">
                                {demande.demandeur
                                  ? `${demande.demandeur.prenom} ${demande.demandeur.nom}`
                                  : "N/A"}
                              </td>
                              <td className="px-5 py-4 sm:px-6 text-sm dark:text-gray-300">
                                {formatDate(demande.dateDemande)}
                              </td>
                              <td className="px-5 py-4 sm:px-6">
                                <p
                                  className={`${getStatusStyles(
                                    demande.status
                                  )} inline-block rounded-full px-2 py-0.5 text-sm font-medium`}
                                >
                                  {demande.status}
                                </p>
                              </td>
                              <td className="px-5 py-4 sm:px-6 text-right">
                                <div
                                  className="flex justify-end gap-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {demande.status ===
                                    EtatDemandeEnum.enAttente && (
                                    <>
                                      <button
                                        onClick={() =>
                                          validerDemande(demande.id)
                                        }
                                        className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                        title="Valider"
                                      >
                                        <Check size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          rejeterDemande(demande.id)
                                        }
                                        className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                        title="Rejeter"
                                      >
                                        <X size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {expandedDemandeId === demande.id && (
                              <tr className="bg-gray-50 dark:bg-gray-700/30">
                                <td colSpan="6" className="px-5 py-4 sm:px-6">
                                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Pièces demandées:
                                    </h4>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead>
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                              Nom
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                              Référence
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                              Désignation
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                              Quantité
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                          {demande.pieces.map(
                                            (piece, index) => (
                                              <tr key={index}>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                                                  {piece.nomPiece || "N/A"}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                                                  {piece.reference || "N/A"}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                                                  {piece.designation || "N/A"}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                                                  {piece.quantite}
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            Aucune demande trouvée avec les critères
                            sélectionnés
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
                {filteredDemandes.length > 0 ? (
                  filteredDemandes.map((demande) => (
                    <div
                      key={demande.id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm dark:text-white">
                          {formatPiecesDisplay(demande.pieces)}
                        </span>
                        <p
                          className={`${getStatusStyles(
                            demande.status
                          )} inline-block rounded-full px-2 py-0.5 text-xs font-medium`}
                        >
                          {demande.status}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Demandeur</p>
                          <p className="text-sm dark:text-gray-300">
                            {demande.demandeur
                              ? `${demande.demandeur.prenom} ${demande.demandeur.nom}`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm dark:text-gray-300">
                            {formatDate(demande.dateDemande)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(demande.id)}
                        className="w-full py-2 mt-1 text-sm text-blue-600 dark:text-blue-400 border-t border-gray-200 dark:border-gray-700"
                      >
                        {expandedDemandeId === demande.id
                          ? "Masquer les détails"
                          : "Voir les pièces demandées"}
                      </button>

                      {expandedDemandeId === demande.id && (
                        <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pièces demandées:
                          </h4>
                          {demande.pieces.map((piece, index) => (
                            <div
                              key={index}
                              className="mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                            >
                              <div className="grid grid-cols-2 gap-1">
                                <div>
                                  <p className="text-xs text-gray-500">Nom</p>
                                  <p className="text-sm dark:text-gray-300">
                                    {piece.nomPiece || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Référence
                                  </p>
                                  <p className="text-sm dark:text-gray-300">
                                    {piece.reference || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Désignation
                                  </p>
                                  <p className="text-sm dark:text-gray-300">
                                    {piece.designation || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Quantité
                                  </p>
                                  <p className="text-sm dark:text-gray-300">
                                    {piece.quantite}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {demande.status === EtatDemandeEnum.enAttente && (
                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => validerDemande(demande.id)}
                            className="px-3 py-1 rounded bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 text-sm flex gap-1 items-center"
                          >
                            <Check size={14} />
                            Valider
                          </button>
                          <button
                            onClick={() => rejeterDemande(demande.id)}
                            className="px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 text-sm flex gap-1 items-center"
                          >
                            <X size={14} />
                            Rejeter
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
                    Aucune demande trouvée avec les critères sélectionnés
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Affichage de {filteredDemandes.length} sur{" "}
                {pagination.totalDemandes} demandes
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
                  <ChevronLeft size={18} />
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
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DemandeTable;
