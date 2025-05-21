import express from "express";
import {
  creerIntervention,
  getAllInterventions,
  getInterventionById,
  updateIntervention,
  deleteIntervention,
  filterInterventions,
  defineInterventionSchedule,
  assignTechnician,
  getTachesAssignees,
  addObservation,
  createRapportIntervention,
} from "../controllers/intervention.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

// 📌 CRUD des interventions
router.post("/",authorize(["responsable"]), creerIntervention); // ✅ Créer une intervention
router.post(
  "/rapport",
  authorize(["technicien"]),
  createRapportIntervention
);

router.post("/assign-technician", authorize(["responsable"]), assignTechnician); // ✅ Assigner un technicien
router.post("/schedule", authorize(["responsable"]), defineInterventionSchedule); // ✅ Définir un calendrier d'intervention
router.get("/", authorize(["responsable", "technicien", "operateur"]), getAllInterventions); // ✅ Récupérer toutes les interventions
router.get(
  "/filter",
  authorize(["responsable", "technicien"]),
  filterInterventions
); // ✅ Filtrer les interventions

router.get(
  "/taches/:technicienId",
  authorize(["technicien"]),
  getTachesAssignees
); // Consulter les tâches assignées

router.get("/:id", authorize(["responsable", "technicien"]), getInterventionById); // ✅ Récupérer une intervention par ID
router.put("/:id", authorize(["responsable","technicien"]), updateIntervention); // ✅ Modifier une intervention
router.put("/:id/observation", authorize(["technicien"]), addObservation); // Mentionner des observations
router.delete("/:id", deleteIntervention); // ✅ Supprimer une intervention

export default router;
