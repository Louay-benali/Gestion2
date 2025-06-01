import React, { useState, useEffect } from "react";
import { MdAdd, MdRemove, MdShoppingCart, MdInfo } from "react-icons/md";
import SearchInput from "./SearchInput";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../contexts/AuthContext";
import useWindowSize from "../hooks/useWindowSize";

const PasserCommandeForm = () => {
  // Récupérer l'utilisateur connecté
  const { user } = useAuth();
  
  // États du formulaire
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('catalogue'); // 'catalogue' ou 'panier'
  
  // Utilisation du hook useWindowSize pour détecter les écrans mobiles et tablettes
  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= 640;
  const isTablet = windowSize.width > 640 && windowSize.width <= 1023;

  // Charger les pièces depuis l'API au chargement du composant
  useEffect(() => {
    const fetchPieces = async () => {
      try {
        const token = Cookies.get("accessToken");
        const response = await axios.get("http://localhost:3001/piece", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
        
        if (response.data && response.data.results) {
          setPieces(response.data.results);
        } else {
          console.error("Format de réponse inattendu:", response.data);
          setPieces([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des pièces:", error);
        toast.error("Impossible de charger les pièces", {
          position: "bottom-center",
          autoClose: 3000,
          theme: "light",
          transition: Bounce,
        });
        setPieces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPieces();
  }, []);

  // Transformer les pièces en format catalogue
  const catalogItems = pieces.map(piece => ({
    id: piece._id,
    reference: piece._id.substring(0, 8),  // Utiliser une partie de l'ID comme référence
    name: piece.nomPiece,
    quantity: piece.quantite,
    etat: piece.etat
  }));

  // Filtrage des articles du catalogue
  const filteredItems = catalogItems.filter(
    (item) =>
      (searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fonction pour ajouter un article à la commande
  const addItemToOrder = (item) => {
    const existingItem = selectedItems.find((i) => i.id === item.id);

    if (existingItem) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  // Fonction pour mettre à jour la quantité d'un article
  const updateItemQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setSelectedItems(selectedItems.filter((item) => item.id !== id));
    } else {
      setSelectedItems(
        selectedItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  // Calcul du total des quantités
  const orderTotalQuantity = selectedItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Fonction pour soumettre la commande au backend
  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      toast.error("Veuillez sélectionner au moins un article", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Créer la commande principale
      const commandeResponse = await axios.post(
        "http://localhost:3001/commande",
        {
          magasinier: user.id,  // Utiliser l'ID de l'utilisateur connecté
          fournisseur: "Fournisseur standard",  // Utiliser une valeur fixe puisque le modèle de pièce n'a pas de fournisseur
          statut: "En attente",  // Utiliser les valeurs de l'enum StatutEnum (la valeur et non la clé)
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        }
      );

      const commandeId = commandeResponse.data.commande._id;

      // Comme il n'y a pas de modèle pour les lignes de commande,
      // on pourrait stocker les informations dans localStorage pour référence future
      const commandeDetails = {
        id: commandeId,
        date: new Date().toISOString(),
        articles: selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          etat: item.etat
        })),
        totalQuantity: orderTotalQuantity
      };
      
      // Stocker les détails de la commande dans localStorage
      const commandes = JSON.parse(localStorage.getItem("commandes") || "[]");
      commandes.push(commandeDetails);
      localStorage.setItem("commandes", JSON.stringify(commandes));

      toast.success("Commande créée avec succès!", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
      
      setSuccessMessage("Commande créée avec succès!");
      setSelectedItems([]);
      setIsConfirmationModalOpen(false);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la création de la commande";
      
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
      
      console.error("Erreur lors de la soumission de la commande:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
        Passer une Commande de Réapprovisionnement
      </h2>

      {/* Message de succès */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Onglets pour mobile */}
      {isMobile && (
        <div className="flex mb-4 border-b border-gray-200">
          <button
            className={`flex-1 py-2 px-4 text-center ${viewMode === 'catalogue' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setViewMode('catalogue')}
          >
            Catalogue
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center ${viewMode === 'panier' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setViewMode('panier')}
          >
            Panier {selectedItems.length > 0 && <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">{selectedItems.length}</span>}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Catalogue de pièces */}
        <div className={`lg:col-span-2 ${isMobile && viewMode !== 'catalogue' ? 'hidden' : ''}`}>
          <div className="mb-3 sm:mb-4 flex flex-col md:flex-row space-y-3 sm:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <SearchInput
                type="text"
                placeholder={isMobile ? "Rechercher..." : "Rechercher une pièce..."}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Vue desktop avec tableau */}
          <div className="hidden sm:block bg-white p-4 rounded-lg border border-gray-100 max-h-96 overflow-y-auto shadow-sm">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-300 text-gray-700">
                  <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">Référence</th>
                  <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">Nom</th>
                  <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">Quantité</th>
                  <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">État</th>
                  <th className="py-2 px-2 sm:px-3 text-center text-xs sm:text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm">{item.reference}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm">{item.name}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm">{item.quantity}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm">{item.etat}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-center">
                      <button
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 active:bg-blue-700 inline-flex items-center justify-center transition-colors duration-150"
                        onClick={() => addItemToOrder(item)}
                        aria-label="Ajouter au panier"
                      >
                        <MdAdd size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <p className="text-center py-4 text-gray-500 text-sm">
                Aucun article trouvé
              </p>
            )}
          </div>
          
          {/* Vue mobile avec cartes */}
          <div className="sm:hidden bg-white rounded-lg border border-gray-100 max-h-[calc(100vh-250px)] overflow-y-auto shadow-sm">
            {filteredItems.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-500">Réf: {item.reference}</p>
                      </div>
                      <button
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 active:bg-blue-700 inline-flex items-center justify-center transition-colors duration-150"
                        onClick={() => addItemToOrder(item)}
                        aria-label="Ajouter au panier"
                      >
                        <MdAdd size={20} />
                      </button>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <span>Quantité: {item.quantity}</span>
                      <span>État: {item.etat}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500 text-sm">
                Aucun article trouvé
              </p>
            )}
          </div>
        </div>

        {/* Panier de commande */}
        <div className={`bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 ${isMobile && viewMode !== 'panier' ? 'hidden' : ''}`}>
          <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center">
            <MdShoppingCart className="mr-2" />
            Votre Commande {selectedItems.length > 0 && <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">{selectedItems.length}</span>}
          </h3>

          {selectedItems.length === 0 ? (
            <div className="text-center py-4 text-gray-500 flex flex-col items-center">
              <MdInfo size={24} className="mb-2 text-gray-400" />
              <p className="text-sm">Votre panier est vide</p>
              {isMobile && (
                <button 
                  className="mt-3 text-blue-600 text-sm border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50"
                  onClick={() => setViewMode('catalogue')}
                >
                  Voir le catalogue
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="max-h-48 sm:max-h-56 overflow-y-auto mb-3 sm:mb-4 custom-scrollbar">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start sm:items-center mb-2 pb-2 border-b border-gray-200"
                  >
                    <div className="flex-1 pr-2">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.reference}</p>
                      <p className="text-xs text-gray-500">
                        Dispo: {item.quantity} | État: {item.etat}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        className="bg-gray-200 p-1 rounded hover:bg-gray-300 active:bg-gray-400 transition-colors duration-150"
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity - 1)
                        }
                        aria-label="Diminuer la quantité"
                      >
                        <MdRemove size={16} />
                      </button>
                      <span className="mx-1 sm:mx-2 w-6 sm:w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        className="bg-gray-200 p-1 rounded hover:bg-gray-300 active:bg-gray-400 transition-colors duration-150"
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity + 1)
                        }
                        aria-label="Augmenter la quantité"
                      >
                        <MdAdd size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-3 sm:pt-4 mb-3 sm:mb-4">
                <div className="flex justify-between font-medium text-base sm:text-lg mt-2 sm:mt-4">
                  <span>Quantité totale :</span>
                  <span>{orderTotalQuantity} pièces</span>
                </div>
              </div>

              <button
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:bg-blue-300 text-sm sm:text-base font-medium"
                onClick={() => setIsConfirmationModalOpen(true)}
                disabled={selectedItems.length === 0 || isLoading}
              >
                {isLoading ? "Traitement en cours..." : "Passer la commande"}
              </button>
              
              {isMobile && (
                <button 
                  className="w-full mt-2 text-blue-600 text-sm border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"
                  onClick={() => setViewMode('catalogue')}
                >
                  Retour au catalogue
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmation */}
      {isConfirmationModalOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-xl">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Confirmer la commande
            </h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">
              Êtes-vous sûr de vouloir passer cette commande ?
            </p>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            <div className="max-h-32 sm:max-h-40 overflow-y-auto mb-3 sm:mb-4 custom-scrollbar bg-gray-50 p-2 rounded-lg">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center mb-2 text-xs sm:text-sm"
                >
                  <span className="font-medium">{item.name}</span>
                  <span>
                    Quantité: {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-3 sm:pt-4 mb-3 sm:mb-4">
              <div className="flex justify-between font-semibold text-sm sm:text-base">
                <span>Quantité totale:</span>
                <span>{orderTotalQuantity} pièces</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-2">
                Fournisseur: Fournisseur standard
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2">
              <button
                className="bg-gray-300 text-gray-800 px-3 sm:px-4 py-2 rounded hover:bg-gray-400 active:bg-gray-500 transition-colors text-sm sm:text-base"
                onClick={() => setIsConfirmationModalOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 transition-colors text-sm sm:text-base font-medium"
                onClick={handleSubmitOrder}
                disabled={isLoading}
              >
                {isLoading ? "Traitement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasserCommandeForm;
