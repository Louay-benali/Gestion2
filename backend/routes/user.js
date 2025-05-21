import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/user.js";
import { authorize } from "../middleware/auth.js"; // Middleware d'autorisation

const router = express.Router();

// 📌 Routes CRUD pour les utilisateurs (réservé aux administrateurs)
router.get("/", getAllUsers); // Obtenir tous les utilisateurs
router.get("/:id", authorize(["admin"]), getUserById); // Obtenir un utilisateur par ID
router.post("/", authorize(["admin"]), createUser); // Créer un utilisateur
router.put("/:id", authorize(["admin"]), updateUser); // Mettre à jour un utilisateur
router.delete("/:id", authorize(["admin"]), deleteUser); // Supprimer un utilisateur



export default router;
