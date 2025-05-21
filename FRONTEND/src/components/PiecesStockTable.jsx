import React, { useState, useEffect } from "react";
import SearchInput from "./SearchInput";
import { Filter, X } from "lucide-react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Cookies from "js-cookie";

// Mapping des états de pièces
const EtatPieceEnum = {
  Disponible: "Disponible",
  NonDisponible: "Non Disponible",
};

// Style selon l'état de la pièce
const getStatusStyle = (status) => {
  switch (status) {
    case EtatPieceEnum.Disponible:
      return "bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400";
    case EtatPieceEnum.NonDisponible:
      return "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400";
    default:
      return "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400";
  }
};

const PiecesStockTable = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ etat: "" });
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnyFilterActive, setIsAnyFilterActive] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalPieces: 0,
  });

  // Vérifier si l'écran est petit pour l'affichage mobile
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Récupérer les pièces depuis le backend
  const fetchPieces = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/piece?page=${pagination.page}&limit=${pagination.limit}`,
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
      
      setPieces(data.results || []);
      setPagination({
        ...pagination,
        totalPages: data.totalPages || 1,
        totalPieces: data.totalPieces || 0,
      });
      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des données: ${err.message}`);
      console.error("Failed to fetch pieces:", err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les pièces à l'initialisation et au changement de page
  useEffect(() => {
    fetchPieces();
  }, [pagination.page, pagination.limit]);

  // Filtrer les pièces selon la recherche et les filtres
  const filteredPieces = pieces.filter((piece) => {
    const matchesSearch = searchTerm === "" || 
      (piece.nomPiece && piece.nomPiece.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEtatFilter = filters.etat === "" || 
      (piece.etat && piece.etat === filters.etat);
    
    return matchesSearch && matchesEtatFilter;
  });

  // Vérifier si des filtres sont actifs
  useEffect(() => {
    setIsAnyFilterActive(filters.etat !== "");
  }, [filters]);

  // Gérer la pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({ etat: "" });
  };

  // Gérer la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="border py-4 rounded-3xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="px-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold dark:text-white">Pièces en Stock</h1>
        <div className="flex gap-2 justify-end w-full sm:w-auto">
          <SearchInput
            className="w-full sm:w-48 md:w-72"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button
            className={`border p-2 rounded-lg sm:w-24 flex flex-row gap-2 items-center justify-center transition-colors ${
              showFilters
                ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filtrer
          </button>
        </div>
      </div>

      {/* Section des filtres */}
      {showFilters && (
        <div className="px-5 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col gap-1 min-w-40">
              <label className="text-sm text-gray-600 dark:text-gray-300">État</label>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
                value={filters.etat}
                onChange={(e) => setFilters({ ...filters, etat: e.target.value })}
              >
                <option value="">Tous les états</option>
                <option value={EtatPieceEnum.Disponible}>{EtatPieceEnum.Disponible}</option>
                <option value={EtatPieceEnum.NonDisponible}>{EtatPieceEnum.NonDisponible}</option>
              </select>
            </div>

            {isAnyFilterActive && (
              <button
                className="mt-6 flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                onClick={resetFilters}
              >
                <X size={14} />
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      )}

      {/* Vue Bureau */}
      {!isSmallScreen && (
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
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="max-w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-theme-xs">
                          ID Pièce
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-theme-xs">
                          Nom
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-theme-xs">
                          Quantité
                        </th>
                        <th className="px-5 py-3 text-left sm:px-6 text-gray-600 dark:text-gray-300 text-theme-xs">
                          État
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPieces.length > 0 ? (
                        filteredPieces.map((piece) => (
                          <tr
                            key={piece._id}
                            className="border-b border-gray-100 dark:border-gray-700"
                          >
                            <td className="px-5 py-4 sm:px-6 text-theme-xs dark:text-gray-300">
                              {piece._id}
                            </td>
                            <td className="px-5 py-4 sm:px-6 text-theme-sm dark:text-gray-300">
                              {piece.nomPiece}
                            </td>
                            <td className="px-5 py-4 sm:px-6 text-theme-sm dark:text-gray-300">
                              {piece.quantite}
                            </td>
                            <td className="px-5 py-4 sm:px-6">
                              <p
                                className={`${getStatusStyle(
                                  piece.etat
                                )} inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium`}
                              >
                                {piece.etat}
                              </p>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            Aucune pièce trouvée avec les critères sélectionnés
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Affichage de {filteredPieces.length} sur {pagination.totalPieces} pièces
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
      )}

      {/* Vue Mobile */}
      {isSmallScreen && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-3 px-4">
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
              <div className="grid grid-cols-1 gap-4">
                {filteredPieces.length > 0 ? (
                  filteredPieces.map((piece) => (
                    <div
                      key={piece._id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm dark:text-white">{piece.nomPiece}</span>
                        <span
                          className={`${getStatusStyle(
                            piece.etat
                          )} inline-block rounded-full px-2 py-0.5 text-xs font-medium`}
                        >
                          {piece.etat}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">ID</p>
                        <p className="text-sm dark:text-gray-300">{piece._id}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Quantité</p>
                        <p className="text-sm dark:text-gray-300">{piece.quantite}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-gray-400">
                    Aucune pièce trouvée avec les critères sélectionnés
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page {pagination.page} sur {pagination.totalPages}
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
      )}
    </div>
  );
};

export default PiecesStockTable;