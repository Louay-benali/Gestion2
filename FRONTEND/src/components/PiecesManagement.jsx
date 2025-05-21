import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdEdit, MdDeleteForever, MdWarning } from "react-icons/md";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Mapping des états de pièces
const EtatPieceEnum = {
  Disponible: "Disponible",
  NonDisponible: "Non Disponible",
};

const PiecesManagement = () => {
  // State pour les données de pièces
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalPieces: 0,
  });

  // État des modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Pièce actuelle en cours d'édition/suppression
  const [currentPiece, setCurrentPiece] = useState(null);

  // Données du formulaire pour une nouvelle pièce
  const [formData, setFormData] = useState({
    nomPiece: "",
    quantite: 0,
    etat: EtatPieceEnum.Disponible,
  });

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
        setPagination({
          ...pagination,
          totalPages: data.totalPages || 1,
          totalPieces: data.totalPieces || 0,
        });
      } else {
        throw new Error("Format de données invalide");
      }

      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des pièces: ${err.message}`);
      console.error("Failed to fetch pieces:", err);
      toast.error("Erreur lors du chargement des pièces");
    } finally {
      setLoading(false);
    }
  };

  // Charger les pièces au montage du composant et lors des changements de pagination
  useEffect(() => {
    fetchPieces();
  }, [pagination.page, pagination.limit]);

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantite" ? Number(value) : value,
    });
  };

  // Gérer les changements pour la pièce actuelle
  const handleCurrentPieceChange = (e) => {
    const { name, value } = e.target;
    setCurrentPiece({
      ...currentPiece,
      [name]: name === "quantite" ? Number(value) : value,
    });
  };

  // Ajouter une nouvelle pièce
  const handleAddPiece = async () => {
    try {
      const response = await fetch("http://localhost:3001/piece", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nomPiece: formData.nomPiece,
          quantite: formData.quantite,
          etat: formData.etat
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Réinitialiser le formulaire
      setFormData({
        nomPiece: "",
        quantite: 0,
        etat: EtatPieceEnum.Disponible,
      });
      
      setIsAddModalOpen(false);
      toast.success("Pièce ajoutée avec succès");
      fetchPieces();
    } catch (err) {
      console.error("Failed to add piece:", err);
      toast.error(`Erreur lors de l'ajout: ${err.message}`);
    }
  };

  // Mettre à jour une pièce existante
  const handleUpdatePiece = async () => {
    try {
      const response = await fetch(`http://localhost:3001/piece/${currentPiece._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nomPiece: currentPiece.nomPiece,
          quantite: currentPiece.quantite,
          etat: currentPiece.etat
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      setIsEditModalOpen(false);
      toast.success("Pièce mise à jour avec succès");
      fetchPieces();
    } catch (err) {
      console.error("Failed to update piece:", err);
      toast.error(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };

  // Supprimer une pièce
  const handleDeletePiece = async () => {
    try {
      const response = await fetch(`http://localhost:3001/piece/${currentPiece._id}`, {
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
      toast.success("Pièce supprimée avec succès");
      fetchPieces();
    } catch (err) {
      console.error("Failed to delete piece:", err);
      toast.error(`Erreur lors de la suppression: ${err.message}`);
    }
  };

  // Fonction pour obtenir la couleur en fonction de l'état de la pièce
  const getStatusColor = (etat) => {
    switch (etat) {
      case EtatPieceEnum.Disponible:
        return "bg-green-100 text-green-800";
      case EtatPieceEnum.NonDisponible:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Pièces</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <IoMdAdd className="mr-2" /> Ajouter une Pièce
        </button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Tableau des pièces */}
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
                  Nom de la Pièce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  État
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pieces.length > 0 ? (
                pieces.map((piece) => (
                  <tr key={piece._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">{piece.nomPiece}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-500">{piece.quantite}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(piece.etat)}`}>
                        {piece.etat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setCurrentPiece(piece);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentPiece(piece);
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
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Aucune pièce trouvée
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
            {pieces.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
          </span>{" "}
          à{" "}
          <span className="font-medium">
            {Math.min(pagination.page * pagination.limit, pagination.totalPieces)}
          </span>{" "}
          sur <span className="font-medium">{pagination.totalPieces}</span> pièces
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

      {/* Modal pour ajouter une pièce */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Ajouter une Pièce</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la Pièce
                </label>
                <input
                  type="text"
                  name="nomPiece"
                  value={formData.nomPiece}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité
                </label>
                <input
                  type="number"
                  name="quantite"
                  value={formData.quantite}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  État
                </label>
                <select
                  name="etat"
                  value={formData.etat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={EtatPieceEnum.Disponible}>{EtatPieceEnum.Disponible}</option>
                  <option value={EtatPieceEnum.NonDisponible}>{EtatPieceEnum.NonDisponible}</option>
                </select>
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
                onClick={handleAddPiece}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour modifier une pièce */}
      {isEditModalOpen && currentPiece && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Modifier la Pièce</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la Pièce
                </label>
                <input
                  type="text"
                  name="nomPiece"
                  value={currentPiece.nomPiece}
                  onChange={handleCurrentPieceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité
                </label>
                <input
                  type="number"
                  name="quantite"
                  value={currentPiece.quantite}
                  onChange={handleCurrentPieceChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  État
                </label>
                <select
                  name="etat"
                  value={currentPiece.etat}
                  onChange={handleCurrentPieceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={EtatPieceEnum.Disponible}>{EtatPieceEnum.Disponible}</option>
                  <option value={EtatPieceEnum.NonDisponible}>{EtatPieceEnum.NonDisponible}</option>
                </select>
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
                onClick={handleUpdatePiece}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour supprimer une pièce */}
      {isDeleteModalOpen && currentPiece && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center text-red-600 mb-4">
              <MdWarning size={24} className="mr-2" />
              <h2 className="text-xl font-bold">Confirmer la suppression</h2>
            </div>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer la pièce{" "}
              <span className="font-semibold">
                {currentPiece.nomPiece}
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
                onClick={handleDeletePiece}
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

export default PiecesManagement;
