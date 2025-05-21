import {Utilisateur} from "../models/user.js";
import logger from "../utils/logger.js";

export const approveUser = async (req, res) => {
  const { email, approvalCode } = req.body;

  try {
    const utilisateur = await Utilisateur.findOne({ email });

    if (!utilisateur) {
      logger.warn(`[APPROVAL] Utilisateur introuvable pour l'email : ${email}`);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (utilisateur.approvalCode !== approvalCode) {
      logger.warn(`[APPROVAL] Code incorrect pour l'utilisateur : ${email}`);
      return res.status(400).json({ message: "Code d'approbation invalide." });
    }

    utilisateur.isApproved = true;
    utilisateur.approvalCode = undefined;
    await utilisateur.save();

    logger.info(`[APPROVAL] Utilisateur approuvé avec succès : ${email}`);
    return res.status(200).json({ message: "Utilisateur approuvé avec succès." });
  } catch (err) {
    logger.error(`[APPROVAL] Erreur serveur : ${err.message}`);
    return res.status(500).json({ message: "Erreur serveur lors de l'approbation.", error: err.message });
  }
};
