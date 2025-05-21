import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdBuild } from "react-icons/md";
import Loader from "./AuthForm/Loader";

const CreateInterventionForm = () => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [machines, setMachines] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [interventionData, setInterventionData] = useState({
    technicien: "",
    machine: "",
    type: "Maintenance",
    status: "En cours",
    scheduledDate: "",
    rapport: ""
  });

  // Charger la liste des machines et techniciens au chargement du composant
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
    setInterventionData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!interventionData.technicien) {
      errors.technicien = "Veuillez sélectionner un technicien";
    }
    
    if (!interventionData.machine) {
      errors.machine = "Veuillez sélectionner une machine";
    }
    
    if (!interventionData.scheduledDate) {
      errors.scheduledDate = "Veuillez définir une date planifiée";
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
      const token = Cookies.get("accessToken");
      
      const formData = {
        ...interventionData,
        dateDebut: new Date().toISOString() // Date actuelle comme date de début
      };
      
      await axios.post(
        "http://localhost:3001/intervention",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      
      toast.success("Intervention créée avec succès!", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
      
      // Réinitialiser le formulaire
      setInterventionData({
        technicien: "",
        machine: "",
        type: "Maintenance",
        status: "En cours",
        scheduledDate: "",
        rapport: ""
      });
      
    } catch (error) {
      console.error("Erreur lors de la création de l'intervention:", error);
      const errorMessage = error.response?.data?.message || "Une erreur est survenue";
      toast.error(`Erreur: ${errorMessage}`, {
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
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
          <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Créer une nouvelle intervention
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Remplissez le formulaire pour créer une nouvelle intervention
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-sm rounded-xl border border-gray-200">
            <div className="flex flex-wrap -mx-2.5">
              {/* Sélection du technicien */}
              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Technicien
                </label>
                <select
                  name="technicien"
                  value={interventionData.technicien}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
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
                  <p className="mt-1 text-xs text-red-500">{validationErrors.technicien}</p>
                )}
              </div>

              {/* Sélection de la machine */}
              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Machine
                </label>
                <select
                  name="machine"
                  value={interventionData.machine}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
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
                {validationErrors.machine && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.machine}</p>
                )}
              </div>

              {/* Type d'intervention */}
              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Type d'intervention
                </label>
                <select
                  name="type"
                  value={interventionData.type}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Réparation">Réparation</option>
                </select>
              </div>

              {/* Statut */}
              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  name="status"
                  value={interventionData.status}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="En cours">En cours</option>
                  <option value="Completé">Completé</option>
                  <option value="Reporté">Reporté</option>
                </select>
              </div>

              {/* Date planifiée */}
              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Date planifiée
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={interventionData.scheduledDate}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                {validationErrors.scheduledDate && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.scheduledDate}</p>
                )}
              </div>
              
              {/* Rapport initial (optionnel) */}
              <div className="w-full px-2.5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Rapport initial (optionnel)
                </label>
                <textarea
                  name="rapport"
                  rows="5"
                  placeholder="Description initiale de l'intervention à effectuer..."
                  value={interventionData.rapport}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 placeholder:text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  style={{ minHeight: "120px" }}
                />
              </div>

              {/* Bouton de soumission */}
              <div className="w-full px-2.5 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-md ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transition-colors"
                  }`}
                >
                  {loading ? "Création en cours..." : "Créer l'intervention"}
                  {!loading && <MdBuild size={20} />}
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

export default CreateInterventionForm;
