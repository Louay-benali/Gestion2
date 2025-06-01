import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import useWindowSize from "../hooks/useWindowSize";

const EditInfo = ({ userInfo, addressInfo, onChange, onClose, onSave, isLoading = false }) => {
  // Utilisation du hook useWindowSize pour détecter les écrans mobiles et tablettes
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024;
    return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl w-full max-w-3xl ${isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'} shadow-lg ${isMobile ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4 md:mb-6">
          <div>
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-800 mb-1`}>
              Modifier le profil
            </h2>
            <p className="text-sm text-gray-500">
              Mettez à jour vos informations personnelles.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <IoCloseOutline />
          </button>
        </div>

        {/* Personal Info Fields */}
        <div className="space-y-3 md:space-y-4">
          <h3 className="font-medium text-gray-700">Informations personnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[
              { name: "firstName", label: "Prénom" },
              { name: "lastName", label: "Nom" },
              { name: "email", label: "Email" },
              { name: "phone", label: "Téléphone" }
            ].map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm text-gray-600 mb-1">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  type="text"
                  name={field.name}
                  value={userInfo[field.name]}
                  onChange={onChange}
                  className={`w-full border border-gray-300 rounded-lg ${isMobile ? 'px-3 py-2' : 'px-4 py-2'} ${field.name === "email" ? 'bg-gray-50' : ''}`}
                  readOnly={field.name === "email"}
                  aria-label={field.label}
                />
              </div>
            ))}
            
            <div>
              <label htmlFor="role" className="block text-sm text-gray-600 mb-1">Rôle</label>
              <input
                id="role"
                type="text"
                name="role"
                value={userInfo.role}
                readOnly
                className={`w-full border border-gray-300 rounded-lg ${isMobile ? 'px-3 py-2' : 'px-4 py-2'} bg-gray-50`}
                aria-label="Rôle"
              />
            </div>
          
            
          </div>

          {/* Address Info Fields */}
          <h3 className="font-medium text-gray-700 pt-4 md:pt-6">Adresse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[
              { name: "Country", label: "Pays" },
              { name: "City", label: "Ville" }
            ].map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm text-gray-600 mb-1">{field.label}</label>
                <input
                  id={field.name}
                  type="text"
                  name={field.name}
                  value={addressInfo[field.name]}
                  onChange={onChange}
                  className={`w-full border border-gray-300 rounded-lg ${isMobile ? 'px-3 py-2' : 'px-4 py-2'}`}
                  aria-label={field.label}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={`mt-6 md:mt-8 flex ${isMobile ? 'flex-col' : 'flex-row justify-end'} gap-3`}>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`${isMobile ? 'w-full order-2' : ''} px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className={`${isMobile ? 'w-full order-1 mb-2' : ''} px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInfo;