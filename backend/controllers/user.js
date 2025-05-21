import { Utilisateur } from "../models/user.js";
import bcrypt from "bcrypt";
import logger from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);

// 📌 Obtenir tous les utilisateurs
// 📌 Obtenir tous les utilisateurs avec pagination
export const getAllUsers = async (req, res) => {
  try {
    // 1. Lire les paramètres de pagination (ou mettre des valeurs par défaut)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // 2. Récupérer les utilisateurs avec pagination
    const users = await Utilisateur.find()
      .select("-motDePasse")
      .skip(skip)
      .limit(limit);

    // 3. Compter le nombre total d’utilisateurs
    const totalUsers = await Utilisateur.countDocuments();

    // 4. Répondre avec les données paginées + infos
    res.status(200).json({
      results: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      page,
      limit,
    });
  } catch (error) {
    logger.error(`[GET] /users → ${error.message}`);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📌 Obtenir un utilisateur par ID
export const getUserById = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.params.id).select(
      "-motDePasse"
    );
    if (!user) {
      logger.warn(`[GET] /users/${req.params.id} → Utilisateur non trouvé`);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json(user);
  } catch (error) {
    logger.error(`[GET] /users/${req.params.id} → ${error.message}`);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📌 Créer un utilisateur
export const createUser = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;

    const existingUser = await Utilisateur.findOne({ email });
    if (existingUser) {
      logger.warn(`[POST] /users → Email déjà utilisé: ${email}`);
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);

    const newUser = new Utilisateur({
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      role,
    });

    await newUser.save();
    logger.info(`[POST] /users → Utilisateur créé: ${email}`);
    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    logger.error(`[POST] /users → ${error.message}`);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📌 Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;

    const user = await Utilisateur.findById(req.params.id);
    if (!user) {
      logger.warn(`[PUT] /users/${req.params.id} → Utilisateur non trouvé`);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (email) user.email = email;
    if (role) user.role = role;

    if (motDePasse) {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(motDePasse, salt);
    }

    await user.save();
    logger.info(`[PUT] /users/${req.params.id} → Utilisateur mis à jour`);
    res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
  } catch (error) {
    logger.error(`[PUT] /users/${req.params.id} → ${error.message}`);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📌 Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const user = await Utilisateur.findByIdAndDelete(req.params.id);
    if (!user) {
      logger.warn(`[DELETE] /users/${req.params.id} → Utilisateur non trouvé`);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    logger.info(`[DELETE] /users/${req.params.id} → Utilisateur supprimé`);
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    logger.error(`[DELETE] /users/${req.params.id} → ${error.message}`);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
