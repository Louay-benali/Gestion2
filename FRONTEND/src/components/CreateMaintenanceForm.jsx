import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdEngineering } from "react-icons/md";
import Loader from "./AuthForm/Loader";

const CreateMaintenanceForm = () => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [machines, setMachines] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState({
    titre: "",
    description: "",
    datePlanifiee: "",
    technicien: "", // Changé de nomTechnicien à technicien pour l'ID du technicien
    Machine: "",
    typeMaintenance: "Préventive"
  });

  // Charger la liste des machines au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("accessToken");
        
        // Récupérer les machines
        const machineResponse = await axios.get(
          "http://localhost:3001/machine",
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }
        );
        
        // Vérifier la structure de la réponse et extraire les machines
        const machineData = machineResponse.data;
        if (machineData && machineData.results && Array.isArray(machineData.results)) {
          setMachines(machineData.results);
        } else {
          console.error("Format de réponse inattendu pour les machines:", machineData);
          setMachines([]);
        }

        // Récupérer les techniciens
        const technicienResponse = await axios.get(
          "http://localhost:3001/user",
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }
        );
        
        // Vérifier la structure de la réponse et extraire les techniciens
        const techData = technicienResponse.data;
        if (techData && techData.results && Array.isArray(techData.results)) {
          // Filtrer pour ne garder que les techniciens
          const techniciensList = techData.results.filter(user => user.role === 'technicien');
          setTechniciens(techniciensList);
        } else {
          console.error("Format de réponse inattendu pour les techniciens:", techData);
          setTechniciens([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Impossible de charger les données nécessaires", {
          position: "bottom-center",
          autoClose: 3000,
          theme: "light",
          transition: Bounce,
        });
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!maintenanceData.technicien) {
      errors.technicien = "Veuillez sélectionner un technicien";
    }
    
    if (!maintenanceData.Machine) {
      errors.Machine = "Veuillez sélectionner une machine";
    }
    
    if (!maintenanceData.datePlanifiee) {
      errors.datePlanifiee = "Veuillez définir une date planifiée";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        "http://localhost:3001/maintenance",
        maintenanceData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        }
      );
  
      console.log("Maintenance créée avec succès :", response.data);
  
      toast.success("Maintenance planifiée avec succès !", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
  
      // Réinitialiser le formulaire
      setMaintenanceData({
        titre: "",
        description: "",
        datePlanifiee: "",
        technicien: "",
        Machine: "",
        typeMaintenance: "Préventive",
      });
      
      // Réinitialiser les erreurs de validation
      setValidationErrors({});
    } catch (err) {
      const msg = err.response?.data.message || "Erreur serveur";
      toast.error(`Erreur : ${msg}`, {
        position: "bottom-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-0">
        <div className="border border-gray-300 p-4 sm:p-6 md:p-10 bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm">
          <h1 className="pb-4 sm:pb-6 text-xl sm:text-2xl font-bold text-gray-700 font-style">
            Planifier une Maintenance
          </h1>
          <div className="p-3 sm:p-5 space-y-4 sm:space-y-6 border-t bg-white dark:border-gray-300">
            <form onSubmit={handleSubmit}>
              <div className="-mx-2.5 flex flex-wrap gap-y-3 sm:gap-y-5">
                <div className="w-full px-2.5">
                  <label className="mb-1 sm:mb-1.5 block text-xs sm:text-sm font-medium text-gray-700">
                    Titre
                  </label>
                  <input
                    type="text"
                    name="titre"
                    value={maintenanceData.titre}
                    onChange={handleChange}
                    placeholder="Titre de la maintenance"
                    className="h-10 sm:h-11 w-full rounded-md sm:rounded-lg border border-gray-300 bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>

                <div className="w-full px-2.5 sm:w-1/2">
                  <label className="mb-1 sm:mb-1.5 block text-xs sm:text-sm font-medium text-gray-700">
                    Technicien
                  </label>
                  <select
                    name="technicien"
                    value={maintenanceData.technicien}
                    onChange={handleChange}
                    required
                    className="h-10 sm:h-11 w-full rounded-md sm:rounded-lg border border-gray-300 bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="">Sélectionner un technicien</option>
                    {Array.isArray(techniciens) && techniciens.length > 0 ? (
                      techniciens.map((tech) => (
                        <option key={tech._id} value={tech._id}>
                          {tech.nom} {tech.prenom}
                        </option>
                      ))
                    ) : (
                      <option value="">Aucun technicien disponible</option>
                    )}
                  </select>
                  {validationErrors.technicien && (
                    <div className="mt-1 text-xs text-red-500">
                      {validationErrors.technicien}
                    </div>
                  )}
                </div>

                <div className="w-full px-2.5 sm:w-1/2">
                  <label className="mb-1 sm:mb-1.5 block text-xs sm:text-sm font-medium text-gray-700">
                    Machine
                  </label>
                  <select
                    name="Machine"
                    value={maintenanceData.Machine}
                    onChange={handleChange}
                    required
                    className="h-10 sm:h-11 w-full rounded-md sm:rounded-lg border border-gray-300 bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="">Sélectionner une machine</option>
                    {Array.isArray(machines) && machines.length > 0 ? (
                      machines.map((machine) => (
                        <option key={machine._id} value={machine._id}>
                          {machine.nomMachine}
                        </option>
                      ))
                    ) : (
                      <option value="">Aucune machine disponible</option>
                    )}
                  </select>
                  {validationErrors.Machine && (
                    <div className="mt-1 text-xs text-red-500">
                      {validationErrors.Machine}
                    </div>
                  )}
                </div>

                {/* Type de maintenance */}
                <div className="w-full px-2.5 sm:w-1/2">
                  <label className="mb-1 sm:mb-1.5 block text-xs sm:text-sm font-medium text-gray-700">
                    Type de maintenance
                  </label>
                  <select
                    name="typeMaintenance"
                    value={maintenanceData.typeMaintenance}
                    onChange={handleChange}
                    required
                    className="h-10 sm:h-11 w-full rounded-md sm:rounded-lg border border-gray-300 bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="Préventive">Préventive</option>
                    <option value="Corrective">Corrective</option>
                    <option value="Prédictive">Prédictive</option>
                  </select>
                </div>

                {/* Date planifiée */}
                <div className="w-full px-2.5 sm:w-1/2">
                  <label className="mb-1 sm:mb-1.5 block text-xs sm:text-sm font-medium text-gray-700">
                    Date planifiée
                  </label>
                  <input
                    type="datetime-local"
                    name="datePlanifiee"
                    value={maintenanceData.datePlanifiee}
                    onChange={handleChange}
                    required
                    className="h-10 sm:h-11 w-full rounded-md sm:rounded-lg border border-gray-300 bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10"
                  />
                  {validationErrors.datePlanifiee && (
                    <div className="mt-1 text-xs text-red-500">
                      {validationErrors.datePlanifiee}
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <div className="w-full px-2.5">
                  <label className="mb-1 sm:mb-1.5 block text-xs sm:text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    placeholder="Description détaillée de la maintenance à effectuer..."
                    value={maintenanceData.description}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md sm:rounded-lg border border-gray-300 bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10"
                    style={{ minHeight: "100px" }}
                  />
                </div>

                {/* Bouton de soumission */}
                <div className="w-full px-2.5 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white rounded-md ${
                      loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transition-colors"
                    }`}
                  >
                    {loading ? "Création en cours..." : "Planifier la maintenance"}
                    {!loading && <MdEngineering size={18} className="hidden sm:block" />}
                  </button>
                </div>
              </div>
            </form>
          </div>
          <ToastContainer />
        </div>
      </div>
    </>
  );
};

export default CreateMaintenanceForm;
