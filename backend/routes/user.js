import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateProfileImage
} from "../controllers/user.js";
import upload from "../middleware/upload.js";
import { authorize } from "../middleware/auth.js"; // Middleware d'autorisation

const router = express.Router();

// 📌 Routes CRUD pour les utilisateurs (réservé aux administrateurs)
router.get("/", getAllUsers); // Obtenir tous les utilisateurs
router.get("/:id", authorize(["admin"]), getUserById); // Obtenir un utilisateur par ID
router.post("/", authorize(["admin"]), createUser); // Créer un utilisateur
router.put("/:id", authorize(["admin","technicien"]), updateUser); // Mettre à jour un utilisateur
router.delete("/:id", authorize(["admin"]), deleteUser); // Supprimer un utilisateur

// 📌 Route pour mettre à jour la photo de profil (accessible à l'utilisateur connecté et aux administrateurs)
router.put("/:id/profile-image", upload.single('profileImage'), updateProfileImage);

export default router;
