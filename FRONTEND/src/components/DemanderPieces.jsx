import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { toast, Bounce } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/AuthForm/Loader";

const DemandePiece = () => {
  const [loading, setLoading] = useState(false);
  const [pieces, setPieces] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    pieces: [{ nomPiece: "", quantite: "" }],
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
      <div className="max-w-4xl mx-auto border border-gray-300 p-10 bg-white rounded-3xl">
        <h1 className="pb-6 text-2xl font-bold text-gray-700">
          Créer une Demande de Pièces
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Détaillez votre demande..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              required
            />
          </div>

          <div>
            <label className="block mb-4 text-sm font-medium text-gray-700">
              Pièces demandées
            </label>
            {formData.pieces.map((pieceItem, index) => (
              <div key={index} className="flex items-center gap-4 mb-3">
                <select
                  name="nomPiece"
                  value={pieceItem.nomPiece}
                  onChange={(e) => handlePieceChange(index, e)}
                  className="flex-1 h-10 px-3 border border-gray-300 rounded-md text-sm"
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
                  value={pieceItem.quantite}
                  onChange={(e) => handlePieceChange(index, e)}
                  placeholder="Quantité"
                  className="w-24 h-10 px-3 border border-gray-300 rounded-md text-sm"
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removePiece(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPiece}
              className="text-blue-600 hover:underline text-sm"
            >
              + Ajouter une pièce
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Envoyer la demande
          </button>
        </form>
        <ToastContainer/>
      </div>
    </>
  );
};

export default DemandePiece;
