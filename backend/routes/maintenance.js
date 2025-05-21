import express from "express";
import {
  getAllMaintenances,
  getMaintenancesByTechnicien,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  ajouterPieces,
  changerStatut,
  deleteMaintenance,
  getHistoriqueInterventions,
  getMaintenancesPlanifiees
} from "../controllers/maintenance.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

// Routes publiques ou avec vérification d'authentification dans le contrôleur
router.get("/",authorize(["technicien","responsable"]), getAllMaintenances);
router.get("/planifiees", getMaintenancesPlanifiees);
router.get("/:id", getMaintenanceById);

// Routes nécessitant une autorisation
router.get("/technicien/:technicienId", authorize(["technicien", "responsable"]), getMaintenancesByTechnicien);
router.get("/technicien", authorize(["technicien"]), getMaintenancesByTechnicien);
router.get("/machine/:machineId/historique", authorize(["technicien", "responsable"]), getHistoriqueInterventions);

// Créer une maintenance (responsable uniquement)
router.post("/", authorize(["responsable"]), createMaintenance);

// Mettre à jour une maintenance (responsable ou technicien assigné)
router.put("/:id", authorize(["responsable", "technicien"]), updateMaintenance);

// Ajouter des pièces utilisées (technicien assigné)
router.post("/:id/pieces", authorize(["technicien"]), ajouterPieces);

// Changer le statut d'une maintenance (technicien assigné ou responsable)
router.patch("/:id/statut", authorize(["technicien", "responsable"]), changerStatut);

// Supprimer une maintenance (responsable uniquement)
router.delete("/:id", authorize(["responsable"]), deleteMaintenance);

export default router; 