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
    rapport: "",
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
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        // Vérifier la structure de la réponse et extraire les machines
        const machineData = machineResponse.data;
        if (
          machineData &&
          machineData.results &&
          Array.isArray(machineData.results)
        ) {
          setMachines(machineData.results);
        } else {
          console.error(
            "Format de réponse inattendu pour les machines:",
            machineData
          );
          setMachines([]);
        }

        // Récupérer les techniciens
        const technicienResponse = await axios.get(
          "http://localhost:3001/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        // Vérifier la structure de la réponse et extraire les techniciens
        const techData = technicienResponse.data;
        if (techData && techData.results && Array.isArray(techData.results)) {
          // Filtrer pour ne garder que les techniciens
          const techniciensList = techData.results.filter(
            (user) => user.role === "technicien"
          );
          setTechniciens(techniciensList);
        } else {
          console.error(
            "Format de réponse inattendu pour les techniciens:",
            techData
          );
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
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
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
        dateDebut: new Date().toISOString(), // Date actuelle comme date de début
      };

      await axios.post("http://localhost:3001/intervention", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

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
        rapport: "",
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'intervention:", error);
      const errorMessage =
        error.response?.data?.message || "Une erreur est survenue";
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
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-0">
        <div className="border border-gray-300 p-4 sm:p-6 md:p-10 bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm">
          <h1 className="pb-4 sm:pb-6 text-xl sm:text-2xl font-bold text-gray-700 font-style">
            Crée nouvelle intervention
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-300 pt-4 sm:pt-6">
              {/* Technicien */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technicien
                </label>
                <select
                  name="technicien"
                  value={interventionData.technicien}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
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
                  <p className="mt-1 text-xs text-red-500">
                    {validationErrors.technicien}
                  </p>
                )}
              </div>
              {/* Machine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine
                </label>
                <select
                  name="machine"
                  value={interventionData.machine}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
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
                  <p className="mt-1 text-xs text-red-500">
                    {validationErrors.machine}
                  </p>
                )}
              </div>
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'intervention
                </label>
                <select
                  name="type"
                  value={interventionData.type}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Réparation">Réparation</option>
                </select>
              </div>
              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  name="status"
                  value={interventionData.status}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                >
                  <option value="En cours">En cours</option>
                  <option value="Completé">Completé</option>
                  <option value="Reporté">Reporté</option>
                </select>
              </div>
              {/* Date planifiée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date planifiée
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={interventionData.scheduledDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                />
                {validationErrors.scheduledDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {validationErrors.scheduledDate}
                  </p>
                )}
              </div>
              {/* Rapport initial */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rapport initial (optionnel)
                </label>
                <textarea
                  name="rapport"
                  rows="4"
                  placeholder="Description initiale de l'intervention à effectuer..."
                  value={interventionData.rapport}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white placeholder:text-gray-300"
                  style={{ minHeight: "100px" }}
                />
              </div>
            </div>
            {/* Bouton de soumission */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-md ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 transition-colors"
                }`}
              >
                {loading ? "Création en cours..." : "Créer l'intervention"}
                {!loading && <MdBuild size={20} />}
              </button>
            </div>
          </form>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default CreateInterventionForm;
