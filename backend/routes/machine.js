// routes/machineRoutes.js
import express from "express";
import {
  createMachine,
  getMachines,
  getMachineById,
  updateMachine,
  deleteMachine,
  getMachineStatus,
  filterMachines, // Import de la méthode filterMachines
} from "../controllers/machine.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authorize(["admin"]), createMachine);
router.get("/status", authorize(["operateur"]), getMachineStatus);
router.get("/", authorize(["admin", "operateur","technicien","responsable"]), getMachines);
router.get("/filter",authorize(["technicien"]), filterMachines); // Route pour filtrer les machines
router.get("/:idMachine", authorize(["admin"]), getMachineById);
router.put("/:idMachine", authorize(["admin","responsable"]), updateMachine);
router.delete("/:idMachine", authorize(["admin"]), deleteMachine);
export default router;
