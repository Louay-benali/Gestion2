import React, { useState, useEffect } from "react";
import Profile from "../components/Profile";
import PersonalInfo from "../components/PersonalInfo";
import Address from "../components/Address";
import EditInfo from "../components/EditInfo";
import { useAuth } from "../contexts/AuthContext.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

const UserProfile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUserProfile } = useAuth();

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    id: ""
  });

  const [addressInfo, setAddressInfo] = useState({
    PostalCode: "",
    Country: "Tunisia",
    City: "",
    Id: "",
    Address: "",
  });

  // Update userInfo when user data changes in context
  useEffect(() => {
    if (user) {
      setUserInfo({
        firstName: user.prenom || "",
        lastName: user.nom || "",
        email: user.email || "",
        phone: user.telephone || "",
        role: user.role || "",
        id: user.id || ""
      });
      
      // Update address info if address is available
      if (user.adresse) {
        setAddressInfo(prev => ({
          ...prev,
          City: user.adresse.includes("/") ? user.adresse.split("/")[0] : user.adresse,
          Address: user.adresse,
          Id: user.id || "",
        }));
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in userInfo) {
      setUserInfo((prev) => ({ ...prev, [name]: value }));
    } else {
      setAddressInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Préparation des données à envoyer au backend
      const userData = {
        nom: userInfo.lastName,
        prenom: userInfo.firstName,
        telephone: userInfo.phone,
        adresse: `${addressInfo.City}/${addressInfo.Country}`
      };

      // Appel API pour mettre à jour l'utilisateur
      const response = await fetch(`http://localhost:3001/user/${userInfo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Rafraîchir les informations de l'utilisateur dans le contexte
        await refreshUserProfile();
        
        toast.success('Profil mis à jour avec succès');
        setIsModalOpen(false);
      } else {
        toast.error(data.message || 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-2 mb-6 border border-gray-300 rounded-2xl bg-white lg:p-6 font-style">
      <ToastContainer position="center-bottom" autoClose={3000} />
      <h1 className="py-6 text-xl font-medium">Profile</h1>
      <Profile Name={`${userInfo.firstName} ${userInfo.lastName}`} City={addressInfo.City} Bio={userInfo.role} Id={userInfo.id} />
      <PersonalInfo {...userInfo} onEdit={handleEdit} />
      <Address {...addressInfo} onEdit={handleEdit} />
      {isModalOpen && (
        <EditInfo
          userInfo={userInfo}
          addressInfo={addressInfo}
          onChange={handleChange}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default UserProfile;