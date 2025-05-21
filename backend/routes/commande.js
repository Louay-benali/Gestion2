import express from "express";
import {
  getAllCommandes,
  getCommandeById,
  createCommande,
  updateCommande,
  deleteCommande,
  validerCommande,
  verifierReceptionPieces,
} from "../controllers/commande.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

// 📌 Routes CRUD pour les commandes
router.post("/",authorize(["magasinier"]), createCommande); 
router.get("/", authorize(["magasinier"]), getAllCommandes);
router.get("/:id", getCommandeById); // Obtenir une commande par ID
// Créer une commande
router.put("/:id", updateCommande); // Mettre à jour une commande
router.delete("/:id", deleteCommande); // Supprimer une commande

// 📌 Routes pour gérer les commandes
router.put("/:idCommande/valider", authorize(["magasinier"]), validerCommande); // Valider une commande
router.put(
  "/:idCommande/verifier-reception",
  authorize(["magasinier"]),
  verifierReceptionPieces
);

export default router;
