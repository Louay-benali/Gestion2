import express from "express";
import { register, handleLogin } from "../controllers/authController.js";
import { refreshTokenController } from "../controllers/refreshController.js";
import { handleLogout } from "../controllers/logoutController.js";
import { googleLogin, googleCallback, getProfile } from "../controllers/authController.js";
import { approveUser } from "../services/approve.js"; // Import the approveUser function
import { resetPassword } from "../controllers/authController.js"; // Import the resetPassword function
import { forgotPassword } from "../controllers/authController.js"; // Import the forgotPassword function

const router = express.Router();

// Routes publiques
router.post("/register", register);
router.post("/login", handleLogin);

router.post("/refresh-token", refreshTokenController);

router.post("/logout", handleLogout);

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

// Route pour récupérer le profil utilisateur
router.get("/profile", getProfile);

// Route pour approuver un utilisateur
router.post("/approve", approveUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword); // ✅ Reset password


export default router;
