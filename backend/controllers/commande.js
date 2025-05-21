import Commande from "../models/commande.js";
import { Utilisateur } from "../models/user.js";
import logger from "../utils/logger.js";

// 📌 Obtenir toutes les commandes
export const getAllCommandes = async (req, res) => {
  try {
    // 1. Lire les paramètres de pagination (ou mettre des valeurs par défaut)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // 2. Récupérer les commandes avec pagination
    const commandes = await Commande.find()
      .populate("magasinier", "nom prenom email")
      .skip(skip)
      .limit(limit);

    // 3. Compter le nombre total de commandes
    const totalCommandes = await Commande.countDocuments();

    // 4. Répondre avec les données paginées + infos
    res.status(200).json({
      results: commandes,
      totalCommandes,
      totalPages: Math.ceil(totalCommandes / limit),
      page,
      limit,
    });
  } catch (error) {
    logger.error(
      `[COMMANDE] Erreur récupération toutes les commandes : ${error.message}`
    );
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📌 Obtenir une commande par ID
export const getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id).populate(
      "magasinier",
      "nom prenom email"
    );
    if (!commande) {
      logger.warn(`[COMMANDE] Commande non trouvée : ${req.params.id}`);
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    logger.info(`[COMMANDE] Commande récupérée : ${req.params.id}`);
    res.status(200).json(commande);
  } catch (error) {
    logger.error(`[COMMANDE] Erreur récupération commande : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📌 Créer une commande
export const createCommande = async (req, res) => {
  try {
    const { magasinier, fournisseur, statut } = req.body;

    const existingMagasigner = await Utilisateur.findById(magasinier);
    if (!existingMagasigner) {
      logger.warn(`[COMMANDE] magasinier non trouvé : ID ${magasinier}`);
      return res.status(404).json({ message: "magasinier non trouvé" });
    }

    if (!magasinier || !fournisseur) {
      logger.warn("[COMMANDE] Champs requis manquants lors de la création");
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const nouvelleCommande = new Commande({
      magasinier,
      fournisseur,
      statut,
    });

    await nouvelleCommande.save();
    logger.info(`[COMMANDE] Nouvelle commande créée par ${magasinier}`);
    res
      .status(201)
      .json({
        message: "Commande créée avec succès",
        commande: nouvelleCommande,
      });
  } catch (error) {
    logger.error(`[COMMANDE] Erreur création commande : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📌 Mettre à jour une commande
export const updateCommande = async (req, res) => {
  try {
    const { magasinier, fournisseur, statut } = req.body;

    const existingMagasigner = await Utilisateur.findById(magasinier);
    if (!existingMagasigner) {
      logger.warn(`[COMMANDE] magasinier non trouvé : ID ${magasinier}`);
      return res.status(404).json({ message: "magasinier non trouvé" });
    }

    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      logger.warn(
        `[COMMANDE] Commande à mettre à jour non trouvée : ${req.params.id}`
      );
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    if (magasinier) commande.magasinier = magasinier;
    if (fournisseur) commande.fournisseur = fournisseur;
    if (statut) commande.statut = statut;

    await commande.save();
    logger.info(`[COMMANDE] Commande mise à jour : ${req.params.id}`);
    res
      .status(200)
      .json({ message: "Commande mise à jour avec succès", commande });
  } catch (error) {
    logger.error(`[COMMANDE] Erreur mise à jour commande : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📌 Supprimer une commande
export const deleteCommande = async (req, res) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);
    if (!commande) {
      logger.warn(
        `[COMMANDE] Commande à supprimer non trouvée : ${req.params.id}`
      );
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    logger.info(`[COMMANDE] Commande supprimée : ${req.params.id}`);
    res.status(200).json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    logger.error(`[COMMANDE] Erreur suppression commande : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export const validerCommande = async (req, res) => {
  try {
    const idCommande = req.params.idCommande;

    const commande = await Commande.findById(idCommande);
    if (!commande) {
      logger.warn(`[COMMANDE] Commande non trouvée : ${idCommande}`);
      return res.status(404).json({ message: "Commande non trouvée." });
    }

    commande.statut = "Validée";
    await commande.save();

    logger.info(`[COMMANDE] Commande validée : ${idCommande}`);
    res
      .status(200)
      .json({ message: "Commande validée avec succès.", commande });
  } catch (error) {
    logger.error(`[COMMANDE] Erreur validation commande : ${error.message}`);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la validation de la commande.",
        error,
      });
  }
};

// 📌 Vérifier la réception des pièces livrées
export const verifierReceptionPieces = async (req, res) => {
  try {
    const idCommande = req.params.idCommande;

    const commande = await Commande.findById(idCommande);
    if (!commande) {
      logger.warn(`[COMMANDE] Commande non trouvée : ${idCommande}`);
      return res.status(404).json({ message: "Commande non trouvée." });
    }

    // Mettre à jour le statut de la commande à "Livrée"
    commande.statut = "Livrée";
    commande.receptionVerifiee = true;
    await commande.save();

    logger.info(
      `[COMMANDE] Réception vérifiée pour la commande : ${idCommande}`
    );
    res
      .status(200)
      .json({
        message: "Réception des pièces vérifiée avec succès.",
        commande,
      });
  } catch (error) {
    logger.error(`[COMMANDE] Erreur vérification réception : ${error.message}`);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la vérification de la réception.",
        error,
      });
  }
};