import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { toast, Bounce } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/AuthForm/Loader";
import useWindowSize from "../hooks/useWindowSize";
import { X } from "lucide-react";

const DemandePiece = () => {
  const [loading, setLoading] = useState(false);
  const [pieces, setPieces] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    pieces: [{ nomPiece: "", quantite: "" }],
  });
  
  // Utilisation du hook useWindowSize pour détecter les écrans mobiles et tablettes
  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= 640;
  const isTablet = windowSize.width > 640 && windowSize.width <= 1023;
  
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePieceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPieces = [...formData.pieces];
    updatedPieces[index][name] = value;
    setFormData((prev) => ({ ...prev, pieces: updatedPieces }));
  };

  const addPiece = () => {
    setFormData((prev) => ({
      ...prev,
      pieces: [...prev.pieces, { nomPiece: "", quantite: "" }],
    }));
  };

  const removePiece = (index) => {
    const updatedPieces = formData.pieces.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, pieces: updatedPieces }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!formData.description || formData.pieces.length === 0) {
      toast.error("La description et les pièces sont requises", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/demande",
        {
          description: formData.description,
          pieces: formData.pieces.map((p) => ({
            nomPiece: p.nomPiece,
            quantite: parseInt(p.quantite),
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Demande créée avec succès", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });

      // Reset form
      setFormData({
        description: "",
        pieces: [{ nomPiece: "", quantite: "" }],
      });
    } catch (error) {
      console.error("Erreur détaillée:", error.response || error);
      const msg =
        error.response?.data?.message || "Erreur de connexion au serveur";

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
      <div className="max-w-4xl mx-auto border border-gray-300 p-4 sm:p-6 md:p-10 bg-white rounded-xl sm:rounded-2xl md:rounded-3xl transition-all duration-200">
        <h1 className="pb-4 sm:pb-6 text-xl sm:text-2xl font-bold text-gray-700">
          Créer une Demande de Pièces
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows={isMobile ? "3" : "4"}
              value={formData.description}
              onChange={handleChange}
              placeholder="Détaillez votre demande..."
              className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block mb-3 sm:mb-4 text-sm font-medium text-gray-700">
              Pièces demandées
            </label>
            {formData.pieces.map((pieceItem, index) => (
              <div key={index} className={`${isMobile ? 'flex flex-col' : 'flex items-center'} gap-2 sm:gap-4 mb-3 pb-3 ${index > 0 ? 'border-b border-gray-100' : ''}`}>
                <div className={`${isMobile ? 'w-full' : 'flex-1'} mb-2 sm:mb-0`}>
                  <select
                    name="nomPiece"
                    value={pieceItem.nomPiece}
                    onChange={(e) => handlePieceChange(index, e)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    <option value="">{isMobile ? "Sélectionner" : "Sélectionner une pièce"}</option>
                    {pieces.map((p) => (
                      <option key={p._id} value={p.nomPiece}>
                        {p.nomPiece} (Qté: {p.quantite})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={`${isMobile ? 'flex w-full' : ''} items-center gap-2 sm:gap-4`}>
                  <input
                    type="number"
                    name="quantite"
                    min={1}
                    value={pieceItem.quantite}
                    onChange={(e) => handlePieceChange(index, e)}
                    placeholder="Quantité"
                    className={`${isMobile ? 'flex-1' : 'w-24'} h-10 px-3 border border-gray-300 rounded-md text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                    required
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePiece(index)}
                      className="flex items-center justify-center h-10 px-2 sm:px-3 text-red-600 hover:text-red-800 text-sm bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                      aria-label="Supprimer cette pièce"
                    >
                      {isMobile ? <X size={18} /> : "Supprimer"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addPiece}
              className="text-blue-600 hover:bg-blue-50 hover:underline text-sm py-2 px-3 rounded-md transition-colors duration-200 flex items-center"
            >
              <span className="mr-1">+</span> Ajouter {isMobile ? "" : "une pièce"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 text-sm sm:text-base font-medium mt-2 sm:mt-4"
          >
            {loading ? "Envoi en cours..." : "Envoyer la demande"}
          </button>
        </form>
        <ToastContainer/>
      </div>
    </>
  );
};

export default DemandePiece;
