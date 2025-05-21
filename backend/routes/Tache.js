import express from "express";
import {
  getAllTaches,
  getTachesByTechnicien,
  getTacheById,
  createTache,
  updateTache,
  deleteTache,
  validerTache,
  getTachesByType,
  getTachesByIntervention,
  getTachesByMachine
} from "../controllers/Tache.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();


// Obtenir toutes les tâches
router.get("/", getAllTaches);

// Obtenir les tâches d'un technicien
router.get("/technicien", authorize(["technicien"]), getTachesByTechnicien);
router.get("/technicien/:technicienId", authorize(["technicien"]), getTachesByTechnicien);

// Obtenir les tâches par type
router.get("/type/:type", getTachesByType);

// Obtenir les tâches liées à une intervention
router.get("/intervention/:interventionId", getTachesByIntervention);

// Obtenir les tâches par machine
router.get("/machine/:machineId", getTachesByMachine);

// Obtenir une tâche spécifique
router.get("/:id", getTacheById);

// Créer une nouvelle tâche
router.post("/",authorize(["responsable"]), createTache);

// Mettre à jour une tâche
router.put("/:id", updateTache);

// Supprimer une tâche
router.delete("/:id", deleteTache);

// Valider une tâche
router.patch("/:id/valider", validerTache);

export default router;