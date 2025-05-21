import jwt from "jsonwebtoken";
import { Utilisateur } from "../models/user.js";
import config from '../config/config.js';

export const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Accès non autorisé, token manquant" });
      }

      const token = authHeader.split(" ")[1];

      // 🔥 Utilisation de la clé secrète depuis config.js
      const decodedToken = jwt.verify(token, config.jwt.secret);
      if (!decodedToken) {
        return res.status(401).json({ message: "Token invalide" });
      }

      const user = await Utilisateur.findById(decodedToken.userId);
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Erreur d'authentification", error: error.message });
    }
  };
};
