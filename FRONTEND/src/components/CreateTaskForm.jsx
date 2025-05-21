import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTasks } from "react-icons/fa";
import Loader from "./AuthForm/Loader";
import axios from "axios";

const CreateTaskForm = () => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [machines, setMachines] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [taskData, setTaskData] = useState({
    titre: "",
    description: "",
    nomTechnicien: "",
    machine: "",
    type: "",
    status: "À faire",
    priorite: "",
    deadline: "",
    interventionLiee: "",
    pieces: []
  });

  // Types de tâches prédéfinis
  const typesTaches = [
    "Maintenance",
    "Réparation",
  ];

  // Niveaux de priorité
  const priorites = ["Basse", "Moyenne", "Haute", "Urgente"];

  // Statuts de tâche
  const statuts = ["À faire", "En cours", "Terminée", "Validée"];

  // Charger les données au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("accessToken");
        if (!token) {
          toast.error("Vous n'êtes pas connecté", {
            position: "bottom-center",
            autoClose: 2000,
            theme: "light",
            transition: Bounce,
          });
          return;
        }
        
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
        
        setMachines(machineResponse.data.results);

        // Récupérer les interventions existantes (maintenance)
        const interventionsResponse = await axios.get(
          "http://localhost:3001/maintenance",
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }
        );
        
        setInterventions(interventionsResponse.data.results || []);
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
    setTaskData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Validate nomTechnicien format
    if (name === 'nomTechnicien' && value.trim() !== '') {
      const nameParts = value.trim().split(' ');
      if (nameParts.length < 2) {
        setValidationErrors(prev => ({ 
          ...prev, 
          nomTechnicien: "Format invalide. Utilisez le format 'Nom Prénom'"
        }));
      } else {
        setValidationErrors(prev => ({ ...prev, nomTechnicien: null }));
      }
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Vérifier le format du nom du technicien
    if (taskData.nomTechnicien) {
      const nameParts = taskData.nomTechnicien.trim().split(' ');
      if (nameParts.length < 2) {
        errors.nomTechnicien = "Format invalide. Utilisez le format 'Nom Prénom'";
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
      const token = Cookies.get("accessToken");
      if (!token) {
        toast.error("Vous devez être connecté pour créer une tâche", {
          position: "bottom-center",
          autoClose: 2000,
          theme: "light",
          transition: Bounce,
        });
        return;
      }

      // Validation des champs requis
      if (!taskData.titre || !taskData.description || !taskData.nomTechnicien || !taskData.type) {
        toast.error("Veuillez remplir tous les champs obligatoires", {
          position: "bottom-center",
          autoClose: 2000,
          theme: "light",
          transition: Bounce,
        });
        return;
      }
      
      // Préparer les données à envoyer au format attendu par le backend
      const formattedData = {
        titre: taskData.titre,
        description: taskData.description,
        nomTechnicien: taskData.nomTechnicien,
        nomMachine: taskData.machine ? machines.find(m => m._id === taskData.machine)?.nom || "" : "",
        type: taskData.type,
        status: taskData.status || "À faire",
        priorite: taskData.priorite || "Moyenne",
        deadline: taskData.deadline || null,
        // Envoyer l'ID de l'intervention directement sans transformation
        interventionLiee: taskData.interventionLiee && taskData.interventionLiee.trim() !== "" ? taskData.interventionLiee : null,
        pieces: taskData.pieces || []
      };

      console.log("Données envoyées au serveur:", formattedData);

      const response = await axios.post(
        "http://localhost:3001/tache",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          withCredentials: true,
        }
      );
  
      console.log("Tâche créée avec succès :", response.data);
  
      toast.success("Tâche créée avec succès !", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
  
      setTaskData({
        titre: "",
        description: "",
        nomTechnicien: "",
        machine: "",
        type: "",
        status: "À faire",
        priorite: "",
        deadline: "",
        interventionLiee: "",
        pieces: []
      });
      
      // Réinitialiser les erreurs de validation
      setValidationErrors({});
    } catch (err) {
      console.error("Erreur lors de la création de la tâche:", err);
      const msg = err.response?.data?.message || "Erreur serveur";
      toast.error(`Erreur : ${msg}`, {
        position: "bottom-center",
        autoClose: 2000,
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
      <div className="max-w-3xl mx-auto border border-gray-300 p-10 bg-white rounded-3xl">
        <h1 className="pb-6 text-2xl font-bold text-gray-700 font-style">
          Créer une Nouvelle Tâche
        </h1>
        <div className="p-5 space-y-6 border-t bg-white dark:border-gray-300 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="-mx-2.5 flex flex-wrap gap-y-5">
              <div className="w-full px-2.5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Titre<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titre"
                  value={taskData.titre}
                  onChange={handleChange}
                  required
                  placeholder="Titre de la tâche"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 placeholder:text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="w-full px-2.5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description<span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Description détaillée de la tâche..."
                  value={taskData.description}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 placeholder:text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Technicien (Nom Prénom)
                </label>
                <input
                  type="text"
                  name="nomTechnicien"
                  value={taskData.nomTechnicien}
                  onChange={handleChange}
                  placeholder="Entrez le nom et prénom du technicien"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  required
                />
                {validationErrors.nomTechnicien && (
                  <div className="mt-1 text-xs text-red-500">
                    {validationErrors.nomTechnicien}
                  </div>
                )}
              </div>

              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Machine
                </label>
                <select
                  name="machine"
                  value={taskData.machine}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Sélectionner une machine</option>
                  {machines.map((machine) => (
                    <option key={machine._id} value={machine._id}>
                      {machine.nomMachine}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="type"
                  value={taskData.type}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Sélectionner un type</option>
                  {typesTaches.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Priorité
                </label>
                <select
                  name="priorite"
                  value={taskData.priorite}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Sélectionner une priorité</option>
                  {priorites.map((priorite, index) => (
                    <option key={index} value={priorite}>
                      {priorite}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  name="status"
                  value={taskData.status}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  {statuts.map((statut, index) => (
                    <option key={index} value={statut}>
                      {statut}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Date limite
                </label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={taskData.deadline}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Intervention liée (ID)
                </label>
                <input
                  type="text"
                  name="interventionLiee"
                  value={taskData.interventionLiee}
                  onChange={handleChange}
                  placeholder="Entrez l'ID de l'intervention"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>



              <div className="w-full px-2.5 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-md ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Traitement..." : "Créer la tâche"}
                  {!loading && <FaTasks size={20} />}
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

export default CreateTaskForm;