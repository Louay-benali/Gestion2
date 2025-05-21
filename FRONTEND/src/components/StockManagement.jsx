import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdEdit, MdDeleteForever, MdWarning } from "react-icons/md";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StockManagement = () => {
  // State pour les données de stock
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalStocks: 0,
  });

  // État des modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Stock actuel en cours d'édition/suppression
  const [currentStock, setCurrentStock] = useState(null);

  // Données du formulaire pour un nouveau stock
  const [formData, setFormData] = useState({
    pieceId: "",
    quantiteDisponible: 0,
    quantiteMinimale: 5,
  });

  // Liste des pièces pour le formulaire
  const [pieces, setPieces] = useState([]);

  // Récupérer les stocks depuis le backend
  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/stock?page=${pagination.page}&limit=${pagination.limit}`,
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

      // Vérification des données avant de les utiliser
      if (data && data.results && Array.isArray(data.results)) {
        setStocks(data.results);
        setPagination({
          ...pagination,
          totalPages: data.totalPages || 1,
          totalStocks: data.totalStocks || 0,
        });
      } else {
        throw new Error("Format de données invalide");
      }

      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des stocks: ${err.message}`);
      console.error("Failed to fetch stocks:", err);
      toast.error("Erreur lors du chargement des stocks");
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des pièces pour le formulaire
  const fetchPieces = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/piece",
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

      // Vérification des données avant de les utiliser
      if (data && data.results && Array.isArray(data.results)) {
        setPieces(data.results);
      } else {
        throw new Error("Format de données invalide pour les pièces");
      }
    } catch (err) {
      console.error("Failed to fetch pieces:", err);
      toast.error("Erreur lors du chargement des pièces");
    }
  };

  // Charger les stocks au montage du composant et lors des changements de pagination
  useEffect(() => {
    fetchStocks();
  }, [pagination.page, pagination.limit]);

  // Charger les pièces au montage du composant
  useEffect(() => {
    fetchPieces();
  }, []);

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "pieceId" ? value : Number(value),
    });
  };

  // Gérer les changements pour le stock actuel
  const handleCurrentStockChange = (e) => {
    const { name, value } = e.target;
    setCurrentStock({
      ...currentStock,
      [name]: name === "pieceId" ? value : Number(value),
    });
  };

  // Ajouter un nouveau stock
  const handleAddStock = async () => {
    try {
      const response = await fetch("http://localhost:3001/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          pieceId: formData.pieceId,
          quantiteDisponible: formData.quantiteDisponible,
          quantiteMinimale: formData.quantiteMinimale
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Réinitialiser le formulaire
      setFormData({
        pieceId: "",
        quantiteDisponible: 0,
        quantiteMinimale: 5,
      });
      
      setIsAddModalOpen(false);
      toast.success("Stock ajouté avec succès");
      fetchStocks();
    } catch (err) {
      console.error("Failed to add stock:", err);
      toast.error(`Erreur lors de l'ajout: ${err.message}`);
    }
  };

  // Mettre à jour un stock existant
  const handleUpdateStock = async () => {
    try {
      const response = await fetch(`http://localhost:3001/stock/${currentStock._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          quantiteDisponible: currentStock.quantiteDisponible,
          quantiteMinimale: currentStock.quantiteMinimale
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      setIsEditModalOpen(false);
      toast.success("Stock mis à jour avec succès");
      fetchStocks();
    } catch (err) {
      console.error("Failed to update stock:", err);
      toast.error(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };

  // Supprimer un stock
  const handleDeleteStock = async () => {
    try {
      const response = await fetch(`http://localhost:3001/stock/${currentStock._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      setIsDeleteModalOpen(false);
      toast.success("Stock supprimé avec succès");
      fetchStocks();
    } catch (err) {
      console.error("Failed to delete stock:", err);
      toast.error(`Erreur lors de la suppression: ${err.message}`);
    }
  };

  // Fonction pour obtenir la couleur en fonction du niveau de stock
  const getStockLevelColor = (stock) => {
    if (stock.alerteStockBas) {
      return "bg-red-100 text-red-800";
    } else if (stock.quantiteDisponible <= stock.quantiteMinimale) {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-green-100 text-green-800";
  };

  // Fonction pour obtenir le texte du niveau de stock
  const getStockLevelText = (stock) => {
    if (stock.alerteStockBas) {
      return "Critique";
    } else if (stock.quantiteDisponible <= stock.quantiteMinimale) {
      return "Bas";
    }
    return "Normal";
  };

  // Pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Stocks</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <IoMdAdd className="mr-2" /> Ajouter un Stock
        </button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Tableau des stocks */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pièce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité Disponible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité Minimale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière Mise à Jour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stocks.length > 0 ? (
                stocks.map((stock) => (
                  <tr key={stock._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stock.piece ? stock.piece.nomPiece : "Pièce inconnue"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">{stock.quantiteDisponible}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-500">{stock.quantiteMinimale}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStockLevelColor(stock)}`}>
                        {getStockLevelText(stock)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(stock.derniereMiseAJour).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setCurrentStock(stock);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentStock(stock);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <MdDeleteForever size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Aucun stock trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-700">
          Affichage de{" "}
          <span className="font-medium">
            {stocks.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
          </span>{" "}
          à{" "}
          <span className="font-medium">
            {Math.min(pagination.page * pagination.limit, pagination.totalStocks)}
          </span>{" "}
          sur <span className="font-medium">{pagination.totalStocks}</span> stocks
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`px-3 py-1 rounded-md ${
              pagination.page === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Précédent
          </button>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className={`px-3 py-1 rounded-md ${
              pagination.page === pagination.totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Modal pour ajouter un stock */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Ajouter un Stock</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pièce
                </label>
                <select
                  name="pieceId"
                  value={formData.pieceId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner une pièce</option>
                  {pieces.map((piece) => (
                    <option key={piece._id} value={piece._id}>
                      {piece.nomPiece}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité Disponible
                </label>
                <input
                  type="number"
                  name="quantiteDisponible"
                  value={formData.quantiteDisponible}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité Minimale
                </label>
                <input
                  type="number"
                  name="quantiteMinimale"
                  value={formData.quantiteMinimale}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddStock}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour modifier un stock */}
      {isEditModalOpen && currentStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Modifier le Stock</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pièce
                </label>
                <input
                  type="text"
                  value={currentStock.piece ? currentStock.piece.nomPiece : "Pièce inconnue"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité Disponible
                </label>
                <input
                  type="number"
                  name="quantiteDisponible"
                  value={currentStock.quantiteDisponible}
                  onChange={handleCurrentStockChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité Minimale
                </label>
                <input
                  type="number"
                  name="quantiteMinimale"
                  value={currentStock.quantiteMinimale}
                  onChange={handleCurrentStockChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateStock}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour supprimer un stock */}
      {isDeleteModalOpen && currentStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center text-red-600 mb-4">
              <MdWarning size={24} className="mr-2" />
              <h2 className="text-xl font-bold">Confirmer la suppression</h2>
            </div>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer le stock de{" "}
              <span className="font-semibold">
                {currentStock.piece ? currentStock.piece.nomPiece : "cette pièce"}
              </span>
              ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteStock}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default StockManagement;
