import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TbUserCheck } from "react-icons/tb";
import Loader from "../components/AuthForm/Loader";
import axios from "axios";

const AssignTechnicianForm = () => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [assignData, setAssignData] = useState({
    interventionId: "",
    technicianNom: "",
  });

  // Pas besoin de charger la liste des techniciens car on utilise un champ texte

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssignData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Validate technicianNom format
    if (name === 'technicianNom' && value.trim() !== '') {
      const nameParts = value.trim().split(' ');
      if (nameParts.length < 2) {
        setValidationErrors(prev => ({ 
          ...prev, 
          technicianNom: "Format invalide. Utilisez le format 'Nom Prénom'"
        }));
      } else {
        setValidationErrors(prev => ({ ...prev, technicianNom: null }));
      }
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Vérifier le format du nom du technicien
    if (assignData.technicianNom) {
      const nameParts = assignData.technicianNom.trim().split(' ');
      if (nameParts.length < 2) {
        errors.technicianNom = "Format invalide. Utilisez le format 'Nom Prénom'";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Valider le formulaire avant soumission
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/intervention/assign-technician",
        {
          interventionId: assignData.interventionId,
          technicianNom: assignData.technicianNom // Envoyer directement le nom et prénom du technicien
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        }
      );

      console.log("Technicien assigné avec succès :", response.data);

      toast.success("Technicien assigné avec succès !", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });

      setAssignData({
        interventionId: "",
        technicianNom: "",
      });
      
      // Réinitialiser les erreurs de validation
      setValidationErrors({});
    } catch (err) {
      const msg = err.response?.data.message || "Erreur serveur";
      toast.error(`Erreur : ${msg}`, {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      console.error("Erreur lors de l'assignation :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="max-w-3xl mx-auto border border-gray-300 p-10 bg-white rounded-3xl">
        <h1 className="pb-6 text-2xl font-bold text-gray-700 font-style">
          Assigner un Technicien
        </h1>
        <div className="p-5 space-y-6 border-t bg-white dark:border-gray-300 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="-mx-2.5 flex flex-wrap gap-y-5">
              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  ID de l'Intervention
                </label>
                <input
                  type="text"
                  name="interventionId"
                  value={assignData.interventionId}
                  onChange={handleChange}
                  placeholder="Ex: 64a7b3c2e5f..."
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 placeholder:text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  required
                />
              </div>

              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Technicien (Nom Prénom)
                </label>
                <input
                  type="text"
                  name="technicianNom"
                  value={assignData.technicianNom}
                  onChange={handleChange}
                  placeholder="Entrez le nom et prénom du technicien"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  required
                />
                {validationErrors.technicianNom && (
                  <div className="mt-1 text-xs text-red-500">
                    {validationErrors.technicianNom}
                  </div>
                )}
              </div>

              <div className="w-full px-2.5 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-md ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Traitement..." : "Assigner le technicien"}
                  {!loading && <TbUserCheck size={20} />}
                </button>
              </div>
            </div>
          </form>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default AssignTechnicianForm;
