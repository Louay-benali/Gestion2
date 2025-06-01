import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdEdit, MdDeleteForever, MdSecurity } from "react-icons/md";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useWindowSize from "../hooks/useWindowSize";

const UserManagement = () => {
  // State for users data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalUsers: 0,
  });

  // Form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Current user being edited/deleted/assigned roles
  const [currentUser, setCurrentUser] = useState(null);

  // Utilisation du hook useWindowSize pour détecter les écrans mobiles et tablettes
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024;

  // New user form data
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    role: "operateur"
  });

  // Available roles from the backend enum
  const roles = ["operateur", "technicien", "magasinier", "responsable", "admin"];

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/user?page=${pagination.page}&limit=${pagination.limit}`,
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

      setUsers(data.results);
      setPagination({
        ...pagination,
        totalPages: data.totalPages || 1,
        totalUsers: data.totalUsers || 0,
      });

      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des utilisateurs: ${err.message}`);
      console.error("Failed to fetch users:", err);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount and when pagination changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle current user input changes
  const handleCurrentUserChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: value,
    });
  };

  // Add a new user
  const handleAddUser = async () => {
    try {
      const response = await fetch("http://localhost:3001/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          motDePasse: formData.motDePasse,
          role: formData.role
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

    // Reset form
    setFormData({
        nom: "",
        prenom: "",
      email: "",
        motDePasse: "",
        role: "operateur"
    });
      
    setIsAddModalOpen(false);
      toast.success("Utilisateur ajouté avec succès");
      fetchUsers();
    } catch (err) {
      console.error("Failed to add user:", err);
      toast.error(`Erreur lors de l'ajout: ${err.message}`);
    }
  };

  // Update existing user
  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`http://localhost:3001/user/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nom: currentUser.nom,
          prenom: currentUser.prenom,
          email: currentUser.email,
          role: currentUser.role
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

    setIsEditModalOpen(false);
      toast.success("Utilisateur mis à jour avec succès");
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
      toast.error(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`http://localhost:3001/user/${currentUser._id}`, {
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
      toast.success("Utilisateur supprimé avec succès");
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error(`Erreur lors de la suppression: ${err.message}`);
    }
  };

  // Update user roles
  const handleUpdateRole = async () => {
    try {
      const response = await fetch(`http://localhost:3001/user/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nom: currentUser.nom,
          prenom: currentUser.prenom,
          email: currentUser.email,
          role: currentUser.role
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

    setIsRoleModalOpen(false);
      toast.success("Rôle mis à jour avec succès");
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role:", err);
      toast.error(`Erreur lors de la mise à jour du rôle: ${err.message}`);
    }
  };

  // Get translated role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "operateur":
        return "Opérateur";
      case "technicien":
        return "Technicien";
      case "magasinier":
        return "Magasinier";
      case "responsable":
        return "Responsable";
      case "admin":
        return "Administrateur";
      default:
        return role;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className={`${isMobile ? 'p-4' : isTablet ? 'p-5' : 'p-6'} flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between items-${isMobile ? 'start' : 'center'} border-b border-gray-300 gap-3`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>Gestion des Utilisateurs</h2>
        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200 ${isMobile ? 'w-full' : 'w-auto'} justify-${isMobile ? 'center' : 'start'}`}
          onClick={() => setIsAddModalOpen(true)}
          aria-label="Ajouter un utilisateur"
        >
          <IoMdAdd className="mr-1" /> {isMobile ? "Ajouter" : isTablet ? "Ajouter" : "Ajouter un Utilisateur"}
        </button>
      </div>

      {/* Display error message if there is an error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-b border-red-100">
          <p>{error}</p>
        </div>
      )}

      {/* Show loading state */}
      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <div className="text-gray-500">Chargement des utilisateurs...</div>
        </div>
      ) : (
        <>
      {/* Users Table/Cards */}
      {!isMobile ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={`${isTablet ? 'px-3' : 'px-6'} py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  Utilisateur
                </th>
                <th className={`${isTablet ? 'px-3 hidden md:table-cell' : 'px-6'} py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  Email
                </th>
                <th className={`${isTablet ? 'px-3' : 'px-6'} py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  Rôle
                </th>
                <th className={`${isTablet ? 'px-3' : 'px-6'} py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                    <tr key={user._id}>
                  <td className={`${isTablet ? 'px-3 py-3' : 'px-6 py-4'} whitespace-nowrap`}>
                    <div className="flex items-center">
                      <img
                        className={`${isTablet ? 'h-8 w-8' : 'h-10 w-10'} rounded-full`}
                        src={`https://ui-avatars.com/api/?name=${user.nom}+${user.prenom}&background=random`}
                        alt={`${user.nom} ${user.prenom}`}
                      />
                      <div className={`${isTablet ? 'ml-2' : 'ml-4'}`}>
                        <div className={`${isTablet ? 'text-xs' : 'text-sm'} font-medium text-gray-900`}>
                          {user.nom} {user.prenom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`${isTablet ? 'px-3 py-3 hidden md:table-cell' : 'px-6 py-4'} whitespace-nowrap text-sm text-gray-500`}>
                    {user.email}
                  </td>
                  <td className={`${isTablet ? 'px-3 py-3' : 'px-6 py-4'} whitespace-nowrap`}>
                    <span
                      className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className={`${isTablet ? 'px-3 py-3' : 'px-6 py-4'} whitespace-nowrap text-sm font-medium`}>
                    <div className={`flex ${isTablet ? 'space-x-1' : 'space-x-2'}`}>
                      <button
                        className="text-gray-600 hover:text-blue-900"
                        onClick={() => {
                          setCurrentUser(user);
                          setIsEditModalOpen(true);
                        }}
                        aria-label="Modifier l'utilisateur"
                      >
                        <MdEdit size={20} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          setCurrentUser(user);
                          setIsDeleteModalOpen(true);
                        }}
                        aria-label="Supprimer l'utilisateur"
                      >
                        <MdDeleteForever size={20} />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => {
                          setCurrentUser(user);
                          setIsRoleModalOpen(true);
                        }}
                        aria-label="Gérer le rôle de l'utilisateur"
                      >
                        <MdSecurity size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 py-2 space-y-3">
          {users.map((user) => (
            <div key={user._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full mr-3"
                    src={`https://ui-avatars.com/api/?name=${user.nom}+${user.prenom}&background=random`}
                    alt={`${user.nom} ${user.prenom}`}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.nom} {user.prenom}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {getRoleDisplayName(user.role)}
                </div>
              </div>
              <div className="flex justify-end space-x-2 border-t border-gray-100 pt-3">
                <button
                  className="bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setCurrentUser(user);
                    setIsEditModalOpen(true);
                  }}
                  aria-label="Modifier l'utilisateur"
                >
                  <MdEdit size={18} />
                </button>
                <button
                  className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors"
                  onClick={() => {
                    setCurrentUser(user);
                    setIsDeleteModalOpen(true);
                  }}
                  aria-label="Supprimer l'utilisateur"
                >
                  <MdDeleteForever size={18} />
                </button>
                <button
                  className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200 transition-colors"
                  onClick={() => {
                    setCurrentUser(user);
                    setIsRoleModalOpen(true);
                  }}
                  aria-label="Gérer le rôle de l'utilisateur"
                >
                  <MdSecurity size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

          {/* Pagination Controls */}
          <div className={`${isMobile ? 'px-4' : isTablet ? 'px-5' : 'px-6'} py-4 bg-gray-50 border-t border-gray-200 flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-between gap-3`}>
            <div className={`text-sm text-gray-700 ${isMobile ? 'text-center w-full' : 'text-left w-auto'}`}>
              Page {pagination.page} / {pagination.totalPages || 1}
            </div>
            <div className={`flex space-x-2 ${isMobile ? 'w-full justify-center' : 'w-auto'}`}>
              <button
                className={`${isMobile ? 'py-2 flex-1' : isTablet ? 'px-3 py-1' : 'px-4 py-1'} border border-gray-300 rounded-md text-sm disabled:opacity-50 transition-colors duration-200`}
                disabled={pagination.page <= 1}
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                aria-label="Page précédente"
              >
                Précédent
              </button>
              <button
                className={`${isMobile ? 'py-2 flex-1' : isTablet ? 'px-3 py-1' : 'px-4 py-1'} border border-gray-300 rounded-md text-sm disabled:opacity-50 transition-colors duration-200`}
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                aria-label="Page suivante"
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg shadow-lg ${isMobile ? 'p-4' : isTablet ? 'p-5' : 'p-6'} w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
                Ajouter un Nouvel Utilisateur
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Dupont"
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                </label>
                <input
                  type="text"
                    name="prenom"
                    value={formData.prenom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Jean"
                />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="jean.dupont@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                      {getRoleDisplayName(role)}
                      </option>
                    ))}
                  </select>
              </div>
            </div>
            <div className={`mt-6 ${isMobile ? 'flex flex-col space-y-2' : 'flex justify-end space-x-3'}`}>
              <button
                className={`${isMobile ? 'order-1 w-full' : 'px-4'} py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200`}
                onClick={handleAddUser}
                aria-label="Ajouter l'utilisateur"
              >
                Ajouter
              </button>
              <button
                className={`${isMobile ? 'order-2 w-full' : 'px-4'} py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200`}
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Annuler"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && currentUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg shadow-lg ${isMobile ? 'p-4' : isTablet ? 'p-5' : 'p-6'} w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
                Modifier l'Utilisateur
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={currentUser.nom}
                    onChange={handleCurrentUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                </label>
                <input
                  type="text"
                    name="prenom"
                    value={currentUser.prenom}
                  onChange={handleCurrentUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={currentUser.email}
                  onChange={handleCurrentUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                  </label>
                  <select
                    name="role"
                    value={currentUser.role}
                    onChange={handleCurrentUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                      {getRoleDisplayName(role)}
                      </option>
                    ))}
                  </select>
              </div>
            </div>
            <div className={`mt-6 ${isMobile ? 'flex flex-col space-y-2' : 'flex justify-end space-x-3'}`}>
              <button
                className={`${isMobile ? 'order-1 w-full' : 'px-4'} py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200`}
                onClick={handleUpdateUser}
                aria-label="Enregistrer les modifications"
              >
                Enregistrer
              </button>
              <button
                className={`${isMobile ? 'order-2 w-full' : 'px-4'} py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200`}
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Annuler"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && currentUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg shadow-lg ${isMobile ? 'p-4' : isTablet ? 'p-5' : 'p-6'} w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
                Supprimer l'Utilisateur
              </h3>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <strong>{currentUser.nom} {currentUser.prenom}</strong> ? Cette action est irréversible.
            </p>
            <div className={`mt-6 ${isMobile ? 'flex flex-col space-y-2' : 'flex justify-end space-x-3'}`}>
              <button
                className={`${isMobile ? 'order-1 w-full' : 'px-4'} py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200`}
                onClick={handleDeleteUser}
                aria-label="Confirmer la suppression"
              >
                Supprimer
              </button>
              <button
                className={`${isMobile ? 'order-2 w-full' : 'px-4'} py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200`}
                onClick={() => setIsDeleteModalOpen(false)}
                aria-label="Annuler"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && currentUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg shadow-lg ${isMobile ? 'p-4' : isTablet ? 'p-5' : 'p-6'} w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-4`}>
              Gérer le Rôle Utilisateur
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilisateur
                </label>
                <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                  <img
                    className="h-8 w-8 rounded-full mr-2"
                    src={`https://ui-avatars.com/api/?name=${currentUser.nom}+${currentUser.prenom}&background=random`}
                    alt={`${currentUser.nom} ${currentUser.prenom}`}
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {currentUser.nom} {currentUser.prenom}
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  name="role"
                  value={currentUser.role}
                  onChange={handleCurrentUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {getRoleDisplayName(role)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions associées
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                  <p>Les permissions sont automatiquement attribuées selon le rôle sélectionné.</p>
                </div>
              </div>
            </div>
            <div className={`mt-6 ${isMobile ? 'flex flex-col space-y-2' : 'flex justify-end space-x-3'}`}>
              <button
                className={`${isMobile ? 'order-1 w-full' : 'px-4'} py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200`}
                onClick={handleUpdateRole}
                aria-label="Mettre à jour le rôle"
              >
                Mettre à jour
              </button>
              <button
                className={`${isMobile ? 'order-2 w-full' : 'px-4'} py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200`}
                onClick={() => setIsRoleModalOpen(false)}
                aria-label="Annuler"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default UserManagement;
