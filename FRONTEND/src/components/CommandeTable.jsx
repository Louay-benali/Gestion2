import React, { useState, useEffect } from "react";
import { MdSearch, MdVisibility, MdCheck, MdRefresh } from "react-icons/md";
import useWindowSize from "../hooks/useWindowSize";
import SearchInput from "../components/SearchInput.jsx";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CommandeTable = () => {
  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);

  // États pour les données et le chargement
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Utilisation du hook useWindowSize pour détecter les écrans mobiles et tablettes
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024;

  // Charger les commandes depuis l'API
  useEffect(() => {
    const fetchCommandes = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = Cookies.get("accessToken");
        const response = await axios.get(
          `http://localhost:3001/commande?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.data && response.data.results) {
          setCommandes(response.data.results);
          setTotalPages(response.data.totalPages || 1);
        } else {
          console.error("Format de réponse inattendu:", response.data);
          setCommandes([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        setError("Impossible de charger les commandes");
        setCommandes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [page, refreshTrigger]);

  // Récupérer les détails d'une commande
  const fetchCommandeDetails = async (id) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(`http://localhost:3001/commande/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails de la commande ${id}:`,
        error
      );
      toast.error("Impossible de récupérer les détails de la commande", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
      return null;
    }
  };

  // Convertir le statut du backend au format d'affichage
  const getDisplayStatus = (backendStatus) => {
    switch (backendStatus) {
      case "En attente":
        return "en attente";
      case "Validée":
        return "en transit";
      case "Livrée":
        return "livrée";
      default:
        return backendStatus.toLowerCase();
    }
  };

  // Filtrage des commandes
  const filteredCommandes = commandes.filter((commande) => {
    // Convertir le statut du backend au format d'affichage
    const displayStatus = getDisplayStatus(commande.statut);

    return (
      (statusFilter === "all" || displayStatus === statusFilter) &&
      (commande._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commande.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Fonction pour ouvrir le modal de détails
  const handleViewDetails = async (commande) => {
    // Récupérer les détails complets de la commande depuis l'API
    const commandeDetails = await fetchCommandeDetails(commande._id);

    if (commandeDetails) {
      // Utiliser directement les détails de la commande du backend
      setSelectedCommande(commandeDetails);
      setIsDetailsModalOpen(true);
    }
  };

  // Fonction pour valider la réception d'une commande
  const handleConfirmDelivery = async (id) => {
    try {
      const token = Cookies.get("accessToken");
      await axios.put(
        `http://localhost:3001/commande/${id}/verifier-reception`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Réception de la commande confirmée avec succès", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });

      // Rafraîchir la liste des commandes
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(
        `Erreur lors de la confirmation de la réception de la commande ${id}:`,
        error
      );
      toast.error("Impossible de confirmer la réception de la commande", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  // Fonction pour valider une commande (changer son statut de "En attente" à "Validée")
  const handleValidateOrder = async (id) => {
    try {
      const token = Cookies.get("accessToken");
      await axios.put(
        `http://localhost:3001/commande/${id}/valider`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Commande validée avec succès", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });

      // Rafraîchir la liste des commandes
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(
        `Erreur lors de la validation de la commande ${id}:`,
        error
      );
      toast.error("Impossible de valider la commande", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  // Fonction pour obtenir la classe de couleur en fonction du statut
  const getStatusColorClass = (status) => {
    switch (status) {
      case "en attente":
        return "text-amber-600 bg-amber-100";
      case "en transit":
        return "text-blue-600 bg-blue-100";
      case "livrée":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Suivi des Commandes
      </h2>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-1/2">
          <SearchInput
            type="text"
            placeholder={isMobile ? "Rechercher..." : "Rechercher une commande..."}
            className={`w-full md:w-[400px] pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMobile ? 'text-sm' : ''}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Rechercher une commande"
          />
        </div>

        <div className="flex items-center">
          <span className={`mr-2 ${isMobile ? 'text-sm' : ''}`}>Statut:</span>
          <select
            className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMobile ? 'text-sm' : ''}`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous</option>
            <option value="en attente">En attente</option>
            <option value="en transit">En transit</option>
            <option value="livrée">Livrée</option>
          </select>
        </div>
      </div>

      {/* Tableau des commandes */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          {!isMobile ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="border-b border-b-gray-200 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left ">ID</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Fournisseur</th>
                    <th className="py-3 px-4 text-left">Magasinier</th>
                    <th className="py-3 px-4 text-left">Statut</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCommandes.length > 0 ? (
                    filteredCommandes.map((commande) => (
                      <tr key={commande._id}>
                        <td className="py-3 px-4">{commande._id}</td>
                        <td className="py-3 px-4">
                          {new Date(commande.dateCommande).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">{commande.fournisseur}</td>
                        <td className="py-3 px-4">
                          {commande.magasinier
                            ? `${commande.magasinier.nom} ${commande.magasinier.prenom}`
                            : "Non assigné"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(
                              getDisplayStatus(commande.statut)
                            )}`}
                          >
                            {commande.statut}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => handleViewDetails(commande)}
                              title="Voir les détails"
                              aria-label="Voir les détails de la commande"
                            >
                              <MdVisibility size={20} />
                            </button>
                            {commande.statut === "Validée" && (
                              <button
                                className="text-green-500 hover:text-green-700"
                                onClick={() =>
                                  handleConfirmDelivery(commande._id)
                                }
                                title="Confirmer la réception"
                                aria-label="Confirmer la réception de la commande"
                              >
                                <MdCheck size={20} />
                              </button>
                            )}
                            {commande.statut === "En attente" && (
                              <button
                                className="text-amber-500 hover:text-amber-700"
                                onClick={() => handleValidateOrder(commande._id)}
                                title="Valider la commande"
                                aria-label="Valider la commande"
                              >
                                <MdCheck size={20} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-500">
                        Aucune commande trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommandes.length > 0 ? (
                filteredCommandes.map((commande) => (
                  <div key={commande._id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium truncate max-w-[60%]">{commande._id}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(
                          getDisplayStatus(commande.statut)
                        )}`}
                      >
                        {commande.statut}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm">{new Date(commande.dateCommande).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fournisseur</p>
                        <p className="text-sm truncate">{commande.fournisseur}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Magasinier</p>
                        <p className="text-sm">
                          {commande.magasinier
                            ? `${commande.magasinier.nom} ${commande.magasinier.prenom}`
                            : "Non assigné"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        className="bg-blue-100 text-blue-600 p-2 rounded-full flex items-center justify-center"
                        onClick={() => handleViewDetails(commande)}
                        aria-label="Voir les détails de la commande"
                      >
                        <MdVisibility size={18} />
                      </button>
                      {commande.statut === "Validée" && (
                        <button
                          className="bg-green-100 text-green-600 p-2 rounded-full flex items-center justify-center"
                          onClick={() => handleConfirmDelivery(commande._id)}
                          aria-label="Confirmer la réception de la commande"
                        >
                          <MdCheck size={18} />
                        </button>
                      )}
                      {commande.statut === "En attente" && (
                        <button
                          className="bg-amber-100 text-amber-600 p-2 rounded-full flex items-center justify-center"
                          onClick={() => handleValidateOrder(commande._id)}
                          aria-label="Valider la commande"
                        >
                          <MdCheck size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Aucune commande trouvée
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
                <button
                  className={`px-3 py-1 border rounded-md disabled:opacity-50 ${isMobile ? 'text-sm' : ''}`}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  aria-label="Page précédente"
                >
                  Précédent
                </button>
                <span className={`px-3 py-1 border rounded-md bg-gray-100 ${isMobile ? 'text-center text-sm' : ''}`}>
                  {page} / {totalPages}
                </span>
                <button
                  className={`px-3 py-1 border rounded-md disabled:opacity-50 ${isMobile ? 'text-sm' : ''}`}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  aria-label="Page suivante"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {filteredCommandes.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">Aucune commande trouvée</p>
        </div>
      )}

      {/* Modal de détails */}
      {isDetailsModalOpen && selectedCommande && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg ${isMobile ? 'p-4' : 'p-6'} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold truncate pr-2`}>
                Détails de la commande {selectedCommande._id}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700 p-1"
                onClick={() => setIsDetailsModalOpen(false)}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mb-4`}>
              <div>
                <p className="text-sm text-gray-500">Date de commande</p>
                <p>
                  {new Date(selectedCommande.dateCommande).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fournisseur</p>
                <p>{selectedCommande.fournisseur}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(
                    getDisplayStatus(selectedCommande.statut)
                  )}`}
                >
                  {selectedCommande.statut}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Magasinier</p>
                <p>
                  {selectedCommande.magasinier
                    ? `${selectedCommande.magasinier.nom} ${selectedCommande.magasinier.prenom}`
                    : "Non assigné"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium mb-2 ${isMobile ? 'text-sm' : ''}`}>Articles commandés</h4>
              {selectedCommande.pieces && selectedCommande.pieces.length > 0 ? (
                isMobile ? (
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {selectedCommande.pieces.map((piece) => (
                      <div key={piece._id} className="border rounded p-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <p className="text-xs text-gray-500">ID</p>
                            <p className="text-sm truncate">{piece._id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Quantité</p>
                            <p className="text-sm">{piece.quantite}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Nom</p>
                            <p className="text-sm">{piece.nomPiece}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantité
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedCommande.pieces.map((piece) => (
                        <tr key={piece._id}>
                          <td className="py-2 px-3">{piece._id}</td>
                          <td className="py-2 px-3">{piece.nomPiece}</td>
                          <td className="py-2 px-3">{piece.quantite}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                <p className="text-gray-500 italic">
                  Aucun article associé à cette commande
                </p>
              )}
            </div>

            <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end space-x-2'}`}>
              {selectedCommande.statut === "Validée" && (
                <button
                  className={`bg-green-500 text-white ${isMobile ? 'w-full' : 'px-4'} py-2 rounded hover:bg-green-600 transition-colors duration-200`}
                  onClick={() => {
                    handleConfirmDelivery(selectedCommande._id);
                    setIsDetailsModalOpen(false);
                  }}
                  aria-label="Confirmer la réception de la commande"
                >
                  Confirmer la réception
                </button>
              )}
              {selectedCommande.statut === "En attente" && (
                <button
                  className={`bg-amber-500 text-white ${isMobile ? 'w-full' : 'px-4'} py-2 rounded hover:bg-amber-600 transition-colors duration-200`}
                  onClick={() => {
                    handleValidateOrder(selectedCommande._id);
                    setIsDetailsModalOpen(false);
                  }}
                  aria-label="Valider la commande"
                >
                  Valider la commande
                </button>
              )}
              <button
                className={`bg-gray-300 text-gray-800 ${isMobile ? 'w-full' : 'px-4'} py-2 rounded hover:bg-gray-400 transition-colors duration-200`}
                onClick={() => setIsDetailsModalOpen(false)}
                aria-label="Fermer le modal"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandeTable;
