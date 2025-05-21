import Demande from "../models/demande.js";
import logger from "../utils/logger.js";
import { Utilisateur } from "../models/user.js";
import Piece from "../models/piece.js";
import { sendEmail } from "../services/email.service.js";

// 📌 Suivre l'état des demandes
export const getDemandes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const demandes = await Demande.find()
      .populate("demandeur", "nom prenom email")
      .populate("pieces.piece", "nomPiece quantite dateDemande ")
      .skip(skip)
      .limit(limit);

    const totalDemandes = await Demande.countDocuments();

    // Formater les demandes selon le modèle attendu
    const formattedDemandes = demandes.map((demande) => ({
      id: demande._id,
      description: demande.description,
      status: demande.status,
      dateDemande: demande.dateDemande,
      demandeur: demande.demandeur
        ? {
            id: demande.demandeur._id,
            nom: demande.demandeur.nom,
            prenom: demande.demandeur.prenom,
            email: demande.demandeur.email,
          }
        : null,
      pieces: demande.pieces.map((pieceItem) => ({
        pieceId: pieceItem.piece?._id || null,
        nomPiece: pieceItem.piece?.nomPiece || null,
        quantite: pieceItem.quantite,
        reference: pieceItem.piece?.reference || null,
        designation: pieceItem.piece?.designation || null,
      })),
    }));

    res.status(200).json({
      results: formattedDemandes,
      totalDemandes,
      totalPages: Math.ceil(totalDemandes / limit),
      page,
      limit,
    });

    logger.info(
      `[DEMANDE] Récupération de toutes les demandes (${demandes.length}) avec pagination`
    );
  } catch (error) {
    logger.error(`[DEMANDE] Erreur récupération demandes : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📌 Valider une demande
export const validerDemande = async (req, res) => {
  try {
    const { idDemande } = req.params;
    const demande = await Demande.findById(idDemande);

    if (!demande) {
      logger.warn(`[DEMANDE] Demande non trouvée : ${idDemande}`);
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    demande.status = "Validée";
    await demande.save();

    logger.info(`[DEMANDE] Demande validée : ${idDemande}`);
    res.status(200).json({ message: "Demande validée avec succès", demande });
  } catch (error) {
    logger.error(`[DEMANDE] Erreur validation demande : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📌 Rejeter une demande
export const rejeterDemande = async (req, res) => {
  try {
    const { idDemande } = req.params;
    const demande = await Demande.findById(idDemande);

    if (!demande) {
      logger.warn(`[DEMANDE] Demande non trouvée : ${idDemande}`);
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    demande.status = "Rejetée";
    await demande.save();

    logger.info(`[DEMANDE] Demande rejetée : ${idDemande}`);
    res.status(200).json({ message: "Demande rejetée avec succès", demande });
  } catch (error) {
    logger.error(`[DEMANDE] Erreur rejet demande : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


export const createDemande = async (req, res) => {
  try {
    const { description, pieces } = req.body;
    const userId = req.user.id; // Récupérer l'ID de l'utilisateur depuis le token

    if (!description || !pieces || pieces.length === 0) {
      logger.warn("[DEMANDE] Champs requis manquants : description ou pièces");
      return res.status(400).json({
        message: "Description et pièces sont requis.",
      });
    }

    // Vérifier que chaque pièce contient un `nomPiece` valide
    for (const [index, item] of pieces.entries()) {
      if (!item.nomPiece) {
        logger.warn(
          `[DEMANDE] La pièce à l'index ${index} ne contient pas de \`nomPiece\`.`
        );
        return res.status(400).json({
          message: `La pièce à l'index ${index} doit contenir un \`nomPiece\`.`,
        });
      }

      // Vérifier que la pièce existe réellement par son nom
      const existingPiece = await Piece.findOne({ nomPiece: item.nomPiece });
      if (!existingPiece) {
        logger.warn(`[DEMANDE] Pièce non trouvée à l'index ${index}: ${item.nomPiece}`);
        return res.status(404).json({
          message: `Pièce non trouvée à l'index ${index}: ${item.nomPiece}.`,
        });
      }

      // Vérifier que la quantité demandée est valide
      if (!item.quantite || item.quantite <= 0) {
        logger.warn(`[DEMANDE] Quantité invalide à l'index ${index}`);
        return res.status(400).json({
          message: `Quantité invalide à l'index ${index}.`,
        });
      }
    }

    // Créer la nouvelle demande avec l'ID de l'utilisateur du token
    const newDemande = new Demande({
      description,
      demandeur: userId,
      pieces: await Promise.all(pieces.map(async (item) => {
        // Trouver l'ID de la pièce à partir de son nom
        const piece = await Piece.findOne({ nomPiece: item.nomPiece });
        return {
          piece: piece._id, // On stocke toujours l'ID dans la base de données
          quantite: item.quantite,
        };
      })),
    });
    await newDemande.save();

    // Récupérer les magasiniers pour envoi d'email
    const magasiniers = await Utilisateur.find({ role: "magasinier" });

    if (magasiniers && magasiniers.length > 0) {
      // Liste des emails des magasiniers
      const magasiniersEmails = magasiniers.map((mag) => mag.email);

      // Préparer les détails des pièces pour l'email
      const piecesDetails = pieces.map(pieceItem => {
        return `
          <tr>
            <td>${pieceItem.nomPiece || "N/A"}</td>
            <td>${pieceItem.quantite}</td>
          </tr>
        `;
      }).join("");

      // Contenu de l'email
      const emailSubject = `Nouvelle demande de pièces - ${newDemande._id}`;
      const emailBody = `
        <h2>Nouvelle demande de pièces</h2>
        <p><strong>Demandeur:</strong> ${req.user.prenom} ${req.user.nom}</p>
        <p><strong>Date de la demande:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Description:</strong> ${description}</p>
        <h3>Pièces demandées:</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>Nom de la pièce</th>
              <th>Quantité</th>
            </tr>
          </thead>
          <tbody>
            ${piecesDetails}
          </tbody>
        </table>
        <p>Veuillez traiter cette demande dès que possible.</p>
      `;

      // Envoyer l'email à tous les magasiniers
      await sendEmail(magasiniersEmails, emailSubject, emailBody);

      logger.info(
        `[DEMANDE] Notification envoyée aux magasiniers pour la demande : ${newDemande._id}`
      );
    } else {
      logger.warn(
        `[DEMANDE] Aucun magasinier trouvé pour envoyer la notification`
      );
    }

    logger.info(
      `[DEMANDE] Nouvelle demande créée par l'utilisateur : ${req.user.nom}`
    );
    res
      .status(201)
      .json({ message: "Demande créée avec succès", demande: newDemande });
  } catch (error) {
    logger.error(`[DEMANDE] Erreur création demande : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Supprimer une demande
export const deleteDemande = async (req, res) => {
  try {
    const { idDemande } = req.params;

    const demande = await Demande.findByIdAndDelete(idDemande);

    if (!demande) {
      logger.warn(
        `[DEMANDE] Demande non trouvée pour suppression : ${idDemande}`
      );
      return res.status(404).json({ message: "Demande non trouvée." });
    }

    logger.info(`[DEMANDE] Demande supprimée : ${idDemande}`);
    res.status(200).json({ message: "Demande supprimée avec succès" });
  } catch (error) {
    logger.error(`[DEMANDE] Erreur suppression demande : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📌 Consulter les demandes de pièces des techniciens
export const consulterDemandesTechniciens = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const demandes = await Demande.find({})
      .populate("demandeur", "nom prenom email")
      .populate("pieces.piece", "nomPiece quantite reference designation")
      .skip(skip)
      .limit(limit);

    const totalDemandes = await Demande.countDocuments();

    // Transform the response to match the expected structure
    const formattedDemandes = demandes.map((demande) => ({
      ...demande.toObject(),
      pieces: demande.pieces.map((pieceItem) => ({
        pieceId: pieceItem.piece._id,
        nomPiece: pieceItem.piece.nomPiece,
        quantite: pieceItem.quantite,
        reference: pieceItem.piece.reference,
        designation: pieceItem.piece.designation,
      })),
    }));

    res.status(200).json({
      results: formattedDemandes,
      totalDemandes,
      totalPages: Math.ceil(totalDemandes / limit),
      page,
      limit,
    });

    logger.info(
      `[DEMANDE] Récupération des demandes de pièces des techniciens (${demandes.length}) avec pagination`
    );
  } catch (error) {
    logger.error(
      `[DEMANDE] Erreur récupération des demandes des techniciens : ${error.message}`
    );
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des demandes.",
      error: error.message,
    });
  }
};

// 📌 Vérifier la disponibilité des pièces demandées
export const verifierDisponibilitePieces = async (req, res) => {
  try {
    const { idDemande } = req.params;

    const demande = await Demande.findById(idDemande).populate(
      "pieces.pieceId"
    );
    if (!demande) {
      logger.warn(`[DEMANDE] Demande non trouvée : ${idDemande}`);
      return res.status(404).json({ message: "Demande non trouvée." });
    }

    const disponibilite = demande.pieces.map((piece) => ({
      pieceId: piece.pieceId._id,
      nomPiece: piece.pieceId.nomPiece,
      quantiteDemandee: piece.quantite,
      quantiteDisponible: piece.pieceId.quantite,
      disponible: piece.pieceId.quantite >= piece.quantite,
    }));

    logger.info(
      `[DEMANDE] Vérification de la disponibilité des pièces pour la demande : ${idDemande}`
    );
    res.status(200).json({ disponibilite });
  } catch (error) {
    logger.error(
      `[DEMANDE] Erreur vérification disponibilité des pièces : ${error.message}`
    );
    res.status(500).json({
      message: "Erreur serveur lors de la vérification des pièces.",
      error,
    });
  }
};

// 📌 Suivre l'approbation d'une demande
export const suivreApprobationDemande = async (req, res) => {
  try {
    const { idDemande } = req.params;

    const demande = await Demande.findById(idDemande)
      .populate("demandeur", "nom prenom email")
      .populate("pieces.pieceId", "nomPiece quantite");

    if (!demande) {
      logger.warn(`[DEMANDE] Demande non trouvée : ID ${idDemande}`);
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    logger.info(
      `[DEMANDE] Suivi de l'approbation de la demande : ID ${idDemande}`
    );
    res.status(200).json({
      message: "Suivi de l'approbation récupéré avec succès",
      demande: {
        id: demande._id,
        description: demande.description,
        status: demande.status,
        pieces: demande.pieces,
        dateDemande: demande.dateDemande,
        demandeur: demande.demandeur,
      },
    });
  } catch (error) {
    logger.error(`[DEMANDE] Erreur suivi de l'approbation : ${error.message}`);
    res
      .status(500)
      .json({ message: "Erreur lors du suivi de l'approbation", error });
  }
};

// 📌 Récupérer les demandes d'un technicien spécifique
export const getDemandesByTechnicien = async (req, res) => {
  try {
    const technicienId = req.user.id; // Récupération de l'ID depuis le token
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const demandes = await Demande.find({ demandeur: technicienId })
      .populate("demandeur", "nom prenom email")
      .populate("pieces.piece", "nomPiece quantite reference designation")
      .skip(skip)
      .limit(limit);

    const totalDemandes = await Demande.countDocuments({
      demandeur: technicienId,
    });

    const formattedDemandes = demandes.map((demande) => ({
      id: demande._id,
      description: demande.description,
      status: demande.status,
      dateDemande: demande.dateDemande,
      demandeur: demande.demandeur
        ? {
            id: demande.demandeur._id,
            nom: demande.demandeur.nom,
            prenom: demande.demandeur.prenom,
            email: demande.demandeur.email,
          }
        : null,
      pieces: demande.pieces.map((pieceItem) => ({
        pieceId: pieceItem.piece?._id || null,
        nomPiece: pieceItem.piece?.nomPiece || null,
        quantite: pieceItem.quantite,
        reference: pieceItem.piece?.reference || null,
        designation: pieceItem.piece?.designation || null,
      })),
    }));

    res.status(200).json({
      results: formattedDemandes,
      totalDemandes,
      totalPages: Math.ceil(totalDemandes / limit),
      page,
      limit,
    });

    logger.info(
      `[DEMANDE] Récupération des demandes du technicien ${technicienId} (${demandes.length}) avec pagination`
    );
  } catch (error) {
    logger.error(
      `[DEMANDE] Erreur récupération demandes technicien : ${error.message}`
    );
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
