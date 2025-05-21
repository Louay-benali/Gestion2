import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/AuthForm/Loader";
import SearchInput from "./SearchInput";

const CreerRapportIntervention = () => {
  const [loading, setLoading] = useState(false);
  const [pieces, setPieces] = useState([]);
  const [rapport, setRapport] = useState({
    interventionId: "",
    observations: "",
    nomPieces: [{ nom: "", quantite: "" }]
  });
  
  // Charger la liste des pièces au chargement du composant
  useEffect(() => {
    const fetchPieces = async () => {
      try {
        const token = Cookies.get("accessToken");
        
        // Récupérer les pièces
        const response = await axios.get(
          "http://localhost:3001/piece",
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }
        );
        
        setPieces(response.data.results || []);
      } catch (error) {
        console.error("Erreur lors du chargement des pièces:", error);
        toast.error("Impossible de charger la liste des pièces", {
          position: "bottom-center",
          autoClose: 3000,
          theme: "light",
          transition: Bounce,
        });
      }
    };

    fetchPieces();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRapport((prev) => ({ ...prev, [name]: value }));
  };

  const handlePieceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPieces = [...rapport.nomPieces];
    updatedPieces[index][name] = value;
    setRapport((prev) => ({ ...prev, nomPieces: updatedPieces }));
  };

  const addPiece = () => {
    setRapport((prev) => ({
      ...prev,
      nomPieces: [...prev.nomPieces, { nom: "", quantite: "" }]
    }));
  };

  const removePiece = (index) => {
    const updatedPieces = rapport.nomPieces.filter((_, i) => i !== index);
    setRapport((prev) => ({ ...prev, nomPieces: updatedPieces }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation des champs
    if (!rapport.interventionId || rapport.nomPieces.length === 0) {
      toast.error("L'ID d'intervention et au moins une pièce sont requis", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      setLoading(false);
      return;
    }

    try {
      // Appel API
      await axios.post(
        "http://localhost:3001/intervention/rapport",
        {
          idIntervention: rapport.interventionId,
          nomPieces: rapport.nomPieces.map(p => ({
            nom: p.nom,
            quantite: parseInt(p.quantite)
          })),
          observations: rapport.observations
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Rapport d'intervention créé avec succès", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });

      // Reset form
      setRapport({
        interventionId: "",
        observations: "",
        nomPieces: [{ nom: "", quantite: "" }]
      });
    } catch (error) {
      console.error("Erreur détaillée:", error.response || error);
      const msg = error.response?.data?.message || "Erreur de connexion au serveur";

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
      <div className="w-full max-w-3xl mx-auto bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm sm:shadow-md mt-2 sm:mt-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4">
          Créer un rapport d'intervention
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="w-full">
            <label className="block text-gray-700 text-sm sm:text-base font-medium mb-1">
              ID Intervention
            </label>
            <input
              type="text"
              name="interventionId"
              value={rapport.interventionId}
              onChange={handleChange}
              className="w-full border rounded-md sm:rounded-lg px-2 sm:px-4 py-1 sm:py-2 border-gray-300 bg-transparent text-xs sm:text-sm shadow-theme-xs transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10"
              placeholder="Entrez l'ID d'intervention"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm sm:text-base font-medium mb-1">
              Pièces utilisées
            </label>
            {rapport.nomPieces.map((piece, index) => (
              <div key={index} className="flex items-center gap-4 mb-3">
                <select
                  name="nom"
                  value={piece.nom}
                  onChange={(e) => handlePieceChange(index, e)}
                  className="flex-1 border rounded-md px-3 py-1 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10"
                  required
                >
                  <option value="">Sélectionner une pièce</option>
                  {pieces.map((p) => (
                    <option key={p._id} value={p.nomPiece}>
                      {p.nomPiece} (Qté disponible: {p.quantite})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="quantite"
                  min={1}
                  value={piece.quantite}
                  onChange={(e) => handlePieceChange(index, e)}
                  placeholder="Qté"
                  className="w-20 sm:w-24 border rounded-md px-3 py-1 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10"
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removePiece(index)}
                    className="text-red-600 hover:text-red-800 text-xs sm:text-sm"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPiece}
              className="text-blue-600 hover:underline text-xs sm:text-sm"
            >
              + Ajouter une pièce
            </button>
          </div>

          <div className="w-full">
            <label className="block text-gray-700 text-sm sm:text-base font-medium mb-1">
              Observations
            </label>
            <textarea
              name="observations"
              value={rapport.observations}
              onChange={handleChange}
              rows={window.innerWidth < 640 ? 3 : 4}
              className="w-full border rounded-md sm:rounded-lg px-2 sm:px-4 py-1 sm:py-2 border-gray-300 bg-transparent text-xs sm:text-sm shadow-theme-xs transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10"
              placeholder="Décris les étapes réalisées, anomalies constatées, recommandations..."
            />
          </div>

          <div className="flex justify-end mt-4 sm:mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white text-sm sm:text-base px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg hover:bg-blue-700 transition"
            >
              Valider et envoyer
            </button>
          </div>
        </form>
        <ToastContainer/>
      </div>
    </>
  );
};

export default CreerRapportIntervention;