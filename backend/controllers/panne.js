// controllers/panneController.js
import Panne from "../models/panne.js";
import Machine from "../models/machine.js";
import { Utilisateur } from "../models/user.js";
import logger from "../utils/logger.js";
import { sendEmail } from "../services/email.service.js";

// Créer une nouvelle panne
export const createPanne = async (req, res) => {
  try {
    const { nomMachine, responsableNom, description, dateDeclaration } = req.body;

    // Récupérer l'ID de l'opérateur et le rôle depuis le token
    const { role, id: operateurId } = req.user;

    // Vérification si l'utilisateur a un rôle autorisé pour déclarer une panne
    if (role !== "operateur" && role !== "technicien") {
      return res.status(403).json({ message: "Accès interdit : rôle non autorisé" });
    }

    // Vérification existence machine par son nom au lieu de son ID
    const existingMachine = await Machine.findOne({ nomMachine });
    if (!existingMachine) {
      logger.warn(`[PANNE] Machine non trouvée : Nom ${nomMachine}`);
      return res.status(404).json({ message: "Machine non trouvée" });
    }

    // Vérification existence responsable par son nom et prénom
    // Supposons que responsableNom est au format "Nom Prénom" ou "Nom Prénom1 Prénom2"
    const parts = responsableNom.split(' ');
    
    // Le premier élément est le nom, le reste forme le prénom composé
    if (parts.length < 2) {
      logger.warn(`[PANNE] Format de nom et prénom invalide : ${responsableNom}`);
      return res.status(400).json({ message: "Format de nom et prénom invalide. Utilisez le format 'Nom Prénom'" });
    }
    
    const nom = parts[0];
    const prenom = parts.slice(1).join(' '); // Combine tous les éléments restants en un seul prénom
    
    const responsibleUser = await Utilisateur.findOne({ 
      nom: nom,
      prenom: prenom
    });
    if (!responsibleUser) {
      logger.warn(`[PANNE] Responsable non trouvé : Nom ${responsableNom}`);
      return res
        .status(404)
        .json({ message: `Responsable non trouvé : Nom ${responsableNom}` });
    }

    const responsibleEmail = responsibleUser.email;

    // Saisir les détails d'une panne
    const newPanne = new Panne({
      description,
      operateur: operateurId,
      machine: existingMachine._id, // Utiliser l'ID de la machine trouvée par son nom
      dateDeclaration: dateDeclaration || new Date(),
      etat: "Ouverte", // Par défaut, la panne est ouverte
    });

    await newPanne.save();

    // Envoyer une alerte au responsable par email
    const emailSubject = `Nouvelle panne déclarée sur la machine ${existingMachine.nomMachine}`;
    const emailBody = `
      <p>Une nouvelle panne a été déclarée :</p>
      <ul>
        <li><strong>Description :</strong> ${description}</li>
        <li><strong>Machine :</strong> ${existingMachine.nomMachine}</li>
        <li><strong>Opérateur :</strong> ${req.user.nom} ${req.user.prenom}</li>
        <li><strong>Date :</strong> ${new Date().toISOString()}</li>
      </ul>
    `;
    await sendEmail(responsibleEmail, emailSubject, emailBody);

    logger.info(
      `[PANNE] Alerte envoyée pour la panne déclarée sur la machine : ${existingMachine.nomMachine}`
    );

    res.status(201).json({
      message: "Panne déclarée avec succès",
      panne: newPanne,
    });

    logger.info(`[PANNE] Nouvelle panne déclarée : ${newPanne._id}`);
  } catch (error) {
    logger.error(`[PANNE] Erreur déclaration panne : ${error.message}`);
    res.status(500).json({
      message: "Erreur lors de la déclaration de la panne",
      error,
    });
  }
};



// Obtenir toutes les pannes avec pagination
export const getPannes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Récupérer le total des pannes pour la pagination
    const totalPannes = await Panne.countDocuments();
    
    // Récupérer les pannes avec les informations de l'opérateur et de la machine
    const pannes = await Panne.find()
      .populate({
        path: 'operateur',
        select: 'nom prenom role' // Sélectionnez les champs dont vous avez besoin
      })
      .populate({
        path: 'machine',
        select: 'nomMachine modele etat' // Sélectionnez les champs dont vous avez besoin
      })
      .sort({ createdAt: -1 }) // Tri par date de création (descendant)
      .skip(skip)
      .limit(limit);
    
    return res.status(200).json({
      success: true,
      results: pannes,
      page,
      limit,
      totalPannes,
      totalPages: Math.ceil(totalPannes / limit)
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des pannes:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des pannes",
      error: error.message
    });
  }
};
// Obtenir une panne par ID
export const getPanneById = async (req, res) => {
  try {
    const { idPanne } = req.params;
    const panne = await Panne.findById(idPanne).populate("operateur machine");
    if (!panne) {
      logger.warn(`[PANNE] Panne non trouvée pour ID : ${idPanne}`);
      return res.status(404).json({ message: "Panne non trouvée" });
    }
    logger.info(`[PANNE] Détail de la panne récupéré : ID ${idPanne}`);
    res.status(200).json(panne);
  } catch (error) {
    logger.error(
      `[PANNE] Erreur récupération panne ID ${req.params.idPanne} : ${error.message}`
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la panne", error });
  }
};

// Mettre à jour une panne
export const updatePanne = async (req, res) => {
  try {
    const { idPanne } = req.params;
    const { description, etat, operateur, machine, dateDeclaration } = req.body;

    const existingOperateur = await Utilisateur.findById(operateur);
    if (!existingOperateur) {
      logger.warn(`[PANNE] Opérateur non trouvé : ID ${operateur}`);
      return res.status(404).json({ message: "Opérateur non trouvé" });
    }

    // Vérification existence machine
    const existingMachine = await Machine.findById(machine);
    if (!existingMachine) {
      logger.warn(`[PANNE] Machine non trouvée : ID ${machine}`);
      return res.status(404).json({ message: "Machine non trouvée" });
    }

    const updatedPanne = await Panne.findByIdAndUpdate(
      idPanne,
      { description, etat, operateur, machine, dateDeclaration },
      { new: true }
    );
    if (!updatedPanne) {
      logger.warn(
        `[PANNE] Mise à jour échouée, panne non trouvée : ID ${idPanne}`
      );
      return res.status(404).json({ message: "Panne non trouvée" });
    }
    logger.info(`[PANNE] Panne mise à jour : ID ${idPanne}`);
    res
      .status(200)
      .json({ message: "Panne mise à jour avec succès", panne: updatedPanne });
  } catch (error) {
    logger.error(
      `[PANNE] Erreur mise à jour panne ID ${req.params.idPanne} : ${error.message}`
    );
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour de la panne", error });
  }
};

// Supprimer une panne
export const deletePanne = async (req, res) => {
  try {
    const { idPanne } = req.params;
    const deletedPanne = await Panne.findByIdAndDelete(idPanne);
    if (!deletedPanne) {
      logger.warn(
        `[PANNE] Suppression échouée, panne non trouvée : ID ${idPanne}`
      );
      return res.status(404).json({ message: "Panne non trouvée" });
    }
    logger.info(`[PANNE] Panne supprimée : ID ${idPanne}`);
    res.status(200).json({ message: "Panne supprimée avec succès" });
  } catch (error) {
    logger.error(
      `[PANNE] Erreur suppression panne ID ${req.params.idPanne} : ${error.message}`
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la panne", error });
  }
};

// Confirmer la résolution d'une panne
export const confirmerResolution = async (req, res) => {
  try {
    const { idPanne } = req.params;

    const panne = await Panne.findById(idPanne);
    if (!panne) {
      logger.warn(`[PANNE] Panne non trouvée : ID ${idPanne}`);
      return res.status(404).json({ message: "Panne non trouvée" });
    }

    panne.etat = "Résolue";
    await panne.save();

    logger.info(`[PANNE] Panne confirmée comme "résolue" : ID ${idPanne}`);
    res.status(200).json({ message: "Panne résolue avec succès", panne });
  } catch (error) {
    logger.error(
      `[PANNE] Erreur confirmation résolution panne : ${error.message}`
    );
    res.status(500).json({
      message: "Erreur lors de la confirmation de la résolution",
      error,
    });
  }
};

// Obtenir les pannes les plus récurrentes
export const getMostRecurrentPannes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5; // Limiter le nombre de résultats (par défaut 5)

    const recurrentPannes = await Panne.aggregate([
      {
        $group: {
          _id: "$description", // Grouper par description
          count: { $sum: 1 }, // Compter le nombre d'occurrences
        },
      },
      { $sort: { count: -1 } }, // Trier par ordre décroissant de fréquence
      { $limit: limit }, // Limiter les résultats
    ]);

    res.status(200).json({
      message: "Pannes les plus récurrentes récupérées avec succès",
      results: recurrentPannes,
    });
  } catch (error) {
    logger.error(
      `[PANNE] Erreur récupération pannes récurrentes : ${error.message}`
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des pannes récurrentes",
      error,
    });
  }
};