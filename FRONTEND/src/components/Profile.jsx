import React, { useState, useContext, useEffect } from "react";
import { Camera, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { AuthContext } from "../contexts/AuthContext.jsx";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

const Profile = ({ Name, Bio, City, Id }) => {
  const { user, apiBaseUrl, refreshUserProfile } = useContext(AuthContext);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Charger l'image de profil depuis le serveur si disponible
  useEffect(() => {
    if (user && user.profileImage) {
      setImageUrl(`${apiBaseUrl}${user.profileImage}`);
    }
  }, [user, apiBaseUrl]);

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      // Afficher l'image localement d'abord pour un retour visuel immédiat
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
      
      // Envoyer l'image au serveur
      await uploadImage(e.target.files[0]);
    }
  };
  
  const uploadImage = async (file) => {
    if (!user || !user.id) {
      setUploadError("Utilisateur non connecté");
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await fetch(`${apiBaseUrl}/user/${user.id}/profile-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du téléchargement');
      }
      
      const data = await response.json();
      
      // Mettre à jour l'URL de l'image avec le chemin retourné par le serveur
      setImageUrl(`${apiBaseUrl}${data.profileImage}`);
      
      // Rafraîchir les informations de l'utilisateur dans le contexte
      if (refreshUserProfile) {
        refreshUserProfile();
      }
      
      toast.success("Photo de profil mise à jour avec succès");
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      setUploadError(error.message);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-5 mb-6 border border-gray-300 bg-white rounded-2xl dark:border-gray-300 lg:p-6 font-style">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full group">
            {imageUrl ? (
              <img src={imageUrl} alt="user" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Camera size={24} className="text-gray-400" />
              </div>
            )}
            {uploading ? (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Upload size={24} className="text-white animate-pulse" />
              </div>
            ) : (
              <label htmlFor="image-upload" className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all duration-200">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-xl font-bold text-gray-800">+</span>
                </div>
              </label>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={uploading}
            />
            {uploadError && (
              <div className="absolute -bottom-6 left-0 right-0 text-xs text-red-500 flex items-center justify-center">
                <AlertCircle size={12} className="mr-1" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 xl:text-left">
              {Name}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500">
                {Bio}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 xl:block"></div>
              <p className="text-sm text-gray-500">
                {City}
              </p>
              {Id && (
                <>
                  <div className="hidden h-3.5 w-px bg-gray-300 xl:block"></div>
                  <p className="text-sm text-gray-500">
                    ID: {Id}
                  </p>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default Profile;