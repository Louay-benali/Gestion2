// routes/panneRoutes.js
import express from "express";
import {
  createPanne,
  getPannes,
  getPanneById,
  updatePanne,
  deletePanne,
  confirmerResolution,
  getMostRecurrentPannes,
} from "../controllers/panne.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/",authorize(["operateur","technicien"]) , createPanne); // Corrected syntax for authorize
router.get("/",authorize(["technicien"]), getPannes);
router.get("/:idPanne", getPanneById);
router.put("/:idPanne",authorize(["technicien"]), updatePanne);
router.delete("/:idPanne", deletePanne);
router.put(
  "/:idPanne/confirmer",authorize(["technicien"]), confirmerResolution
);
router.get(
  "/recurrent",
  getMostRecurrentPannes
); 

export default router;
