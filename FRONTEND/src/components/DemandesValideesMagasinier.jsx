import React, { useState, useEffect } from "react";
import {
  Search,
  Settings,
  XCircle,
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

const DemandesValideesMagasinier = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
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

  // Récupérer les demandes validées depuis l'API
  const fetchDemandesValidees = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/demande?page=${pagination.page}&limit=${pagination.limit}&status=${EtatDemandeEnum.validee}`,
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
    fetchDemandesValidees();
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

    const matchesDemandeurFilter =
      filters.demandeur === "" ||
      (demande.demandeur && demande.demandeur.id === filters.demandeur);

    return matchesSearch && matchesDemandeurFilter;
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
      demandeur: "",
    });
  };

  // Vérifier si des filtres sont actifs
  useEffect(() => {
    setIsAnyFilterActive(filters.demandeur !== "");
  }, [filters]);

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

  // Marquer une demande comme traitée (à implémenter côté backend)
  const marquerCommeTraitee = async (id) => {
    try {
      // Cette fonction est à implémenter selon les besoins du magasinier
      // Par exemple, pour marquer qu'une demande a été préparée
      alert("Fonctionnalité à implémenter: Marquer comme traitée");
      
      // Exemple de code pour l'API (à adapter)
      /*
      const response = await fetch(
        `http://localhost:3001/demande/${id}/traiter`,
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
      fetchDemandesValidees();
      */
    } catch (err) {
      console.error("Failed to mark demande as processed:", err);
      alert(`Erreur lors du traitement: ${err.message}`);
    }
  };

  return (
    <div className="border py-4 rounded-3xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="px-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold dark:text-white">
          Demandes Validées à Traiter
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
                          Etat
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
                              <td className="px-5 py-4 sm:px-6 text-sm">
                                <div className="flex items-center">
                                  <span className={`px-1 py-1 rounded-full text-xs ${getStatusStyles(EtatDemandeEnum.validee)}`}>
                                    {EtatDemandeEnum.validee}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {expandedDemandeId === demande.id && (
                              <tr className="bg-gray-50 dark:bg-gray-700/30">
                                <td colSpan="5" className="px-5 py-4 sm:px-6">
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
                                    {demande.description && (
                                      <div className="mt-3">
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          Description:
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {demande.description}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            Aucune demande validée trouvée
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Vue mobile */}
            {isSmallScreen && (
              <div className="space-y-4">
                {filteredDemandes.length > 0 ? (
                  filteredDemandes.map((demande) => (
                    <div
                      key={demande.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => toggleExpand(demande.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              ID: {demande.id.substring(0, 8)}...
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(demande.dateDemande)}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyles(EtatDemandeEnum.validee)}`}>
                              {EtatDemandeEnum.validee}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Pièces:</span>{" "}
                            {formatPiecesDisplay(demande.pieces)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Demandeur:</span>{" "}
                            {demande.demandeur
                              ? `${demande.demandeur.prenom} ${demande.demandeur.nom}`
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {expandedDemandeId === demande.id && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pièces demandées:
                          </h4>
                          <div className="space-y-2">
                            {demande.pieces.map((piece, index) => (
                              <div
                                key={index}
                                className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                              >
                                <p className="text-sm">
                                  <span className="font-medium">Nom:</span>{" "}
                                  {piece.nomPiece || "N/A"}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Référence:</span>{" "}
                                  {piece.reference || "N/A"}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Désignation:
                                  </span>{" "}
                                  {piece.designation || "N/A"}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Quantité:</span>{" "}
                                  {piece.quantite}
                                </p>
                              </div>
                            ))}
                          </div>
                          {demande.description && (
                            <div className="mt-3">
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description:
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {demande.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Aucune demande validée trouvée
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredDemandes.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Affichage de{" "}
                  <span className="font-medium">
                    {Math.min(
                      (pagination.page - 1) * pagination.limit + 1,
                      pagination.totalDemandes
                    )}
                  </span>{" "}
                  à{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalDemandes
                    )}
                  </span>{" "}
                  sur{" "}
                  <span className="font-medium">{pagination.totalDemandes}</span>{" "}
                  demandes
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`p-2 rounded-lg ${
                      pagination.page === 1
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`p-2 rounded-lg ${
                      pagination.page === pagination.totalPages
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DemandesValideesMagasinier;