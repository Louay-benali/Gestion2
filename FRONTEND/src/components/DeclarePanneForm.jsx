import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TbAlertTriangle } from "react-icons/tb";
import Loader from "../components/AuthForm/Loader";
import axios from "axios";

const DeclarePanneForm = () => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [responsables, setResponsables] = useState([]);
  const [machines, setMachines] = useState([]);
  const [panneData, setState] = useState({
    nomMachine: "", // Nom de la machine (pas l'ID)
    responsableNom: "", // Nom complet du responsable (pas l'ID)
    description: "",
    dateDeclaration: new Date().toISOString().split('T')[0],
  });

  // Charger la liste des responsables au chargement du composant
  useEffect(() => {
    const fetchResponsables = async () => {
      try {
        const token = Cookies.get("accessToken");
        
        // Récupérer les utilisateurs
        const response = await axios.get(
          "http://localhost:3001/user",
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }
        );
        
        // Vérifier la structure de la réponse et extraire les responsables
        const userData = response.data;
        if (userData && userData.results && Array.isArray(userData.results)) {
          // Filtrer pour ne garder que les responsables
          const responsablesList = userData.results.filter(user => user.role === 'responsable');
          setResponsables(responsablesList);
        } else {
          console.error("Format de réponse inattendu pour les utilisateurs:", userData);
          setResponsables([]);
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
        
        // Vérifier la structure de la réponse et extraire les machines
        const machineData = machineResponse.data;
        if (machineData && machineData.results && Array.isArray(machineData.results)) {
          setMachines(machineData.results);
        } else {
          console.error("Format de réponse inattendu pour les machines:", machineData);
          setMachines([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des responsables:", error);
        toast.error("Impossible de charger la liste des responsables", {
          position: "bottom-center",
          autoClose: 3000,
          theme: "light",
          transition: Bounce,
        });
      }
    };

    fetchResponsables();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!panneData.responsableNom) {
      errors.responsableNom = "Veuillez sélectionner un responsable";
    }
    
    if (!panneData.nomMachine) {
      errors.nomMachine = "Veuillez sélectionner une machine";
    }
    
    if (!panneData.description) {
      errors.description = "Veuillez fournir une description de la panne";
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
        "http://localhost:3001/panne",
        panneData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        }
      );
  
      console.log("Panne créée avec succès :", response.data);
  
      toast.success("Panne déclarée avec succès !", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
  
      // Réinitialiser le formulaire mais conserver la date actuelle
      setState({
        nomMachine: "",
        responsableNom: "",
        description: "",
        dateDeclaration: new Date().toISOString().split('T')[0],
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
      <div className="max-w-3xl mx-auto border border-gray-300 p-10 bg-white rounded-3xl">
        <h1 className="pb-6 text-2xl font-bold text-gray-700 font-style">
          Déclarer une Panne
        </h1>
        <div className="p-5 space-y-6 border-t bg-white dark:border-gray-300 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="-mx-2.5 flex flex-wrap gap-y-5">
              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Machine
                </label>
                <select
                  name="nomMachine"
                  value={panneData.nomMachine}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Sélectionner une machine</option>
                  {Array.isArray(machines) && machines.length > 0 ? (
                    machines.map((machine) => (
                      <option key={machine._id} value={machine.nomMachine}>
                        {machine.nomMachine}
                      </option>
                    ))
                  ) : (
                    <option value="">Aucune machine disponible</option>
                  )}
                </select>
                {validationErrors.nomMachine && (
                  <div className="mt-1 text-xs text-red-500">
                    {validationErrors.nomMachine}
                  </div>
                )}
              </div>

              <div className="w-full px-2.5 xl:w-1/2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Responsable
                </label>
                <select
                  name="responsableNom"
                  value={panneData.responsableNom}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Sélectionner un responsable</option>
                  {Array.isArray(responsables) && responsables.length > 0 ? (
                    responsables.map((resp) => (
                      <option key={resp._id} value={`${resp.nom} ${resp.prenom}`}>
                        {resp.nom} {resp.prenom}
                      </option>
                    ))
                  ) : (
                    <option value="">Aucun responsable disponible</option>
                  )}
                </select>
                {validationErrors.responsableNom && (
                  <div className="mt-1 text-xs text-red-500">
                    {validationErrors.responsableNom}
                  </div>
                )}
              </div>

              <div className="w-full px-2.5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 ">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="5"
                  placeholder="Détaillez la nature de la panne..."
                  value={panneData.description}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  style={{ minHeight: "120px" }}
                  required
                />
                {validationErrors.description && (
                  <div className="mt-1 text-xs text-red-500">
                    {validationErrors.description}
                  </div>
                )}
              </div>

              <div className="w-full px-2.5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 ">
                  Date de la panne
                </label>
                <input
                  type="date"
                  name="dateDeclaration"
                  value={panneData.dateDeclaration}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  required
                />
                {validationErrors.dateDeclaration && (
                  <div className="mt-1 text-xs text-red-500">
                    {validationErrors.dateDeclaration}
                  </div>
                )}
              </div>

              <div className="w-full px-2.5 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-md ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {loading ? "Traitement..." : "Déclarer la panne"}
                  {!loading && <TbAlertTriangle size={20} />}
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

export default DeclarePanneForm;