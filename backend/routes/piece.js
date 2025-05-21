// routes/pieceRoutes.js
import express from "express";
import {
  createPiece,
  getPieces,
  getPieceById,
  updatePiece,
  deletePiece,
  getMostUsedPieces,
} from "../controllers/piece.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createPiece);
router.get("/most-used", authorize(["magasinier"]), getMostUsedPieces);
router.get("/", authorize(["magasinier", "technicien"]), getPieces);
router.get("/:idPiece", getPieceById);
router.put("/:idPiece", authorize(["magasinier"]), updatePiece);
router.delete("/:idPiece", deletePiece);


export default router;
