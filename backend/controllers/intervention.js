import Intervention from "../models/intervention.js";
import Machine from "../models/machine.js";
import { Utilisateur } from "../models/user.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";
import { sendEmail } from "../services/email.service.js";

// ✅ 1️⃣ Créer une nouvelle intervention
export const creerIntervention = async (req, res) => {
  try {
    const { technicien, machine, rapport, type, status, dateDebut, dateFin } =
      req.body;

    // Vérification existence technicien
    const existingTechnicien = await Utilisateur.findById(technicien);
    if (!existingTechnicien || existingTechnicien.role !== "technicien") {
      logger.warn(
        `[INTERVENTION] Technicien non trouvé ou rôle invalide : ID ${technicien}`
      );
      return res
        .status(404)
        .json({ message: "Technicien non trouvé ou rôle invalide" });
    }

    // Vérification existence machine
    const existingMachine = await Machine.findById(machine);
    if (!existingMachine) {
      logger.warn(`[INTERVENTION] Machine non trouvée : ID ${machine}`);
      return res.status(404).json({ message: "Machine non trouvée" });
    }

    // Création de l'intervention
    const nouvelleIntervention = new Intervention({
      technicien,
      machine,
      rapport,
      type,
      status: status || "En cours", // Par défaut "en cours"
      dateDebut: dateDebut || new Date(), // Par défaut à la date actuelle
      dateFin,
    });

    await nouvelleIntervention.save();

    logger.info(
      `[INTERVENTION] Intervention créée pour la machine ${machine} par technicien ${technicien}`
    );
    res.status(201).json({
      message: "Intervention créée avec succès",
      intervention: nouvelleIntervention,
    });
  } catch (error) {
    logger.error(`[INTERVENTION] Erreur création : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ 2️⃣ Récupérer toutes les interventions avec pagination
export const getAllInterventions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const interventions = await Intervention.find()
      .populate("technicien", "nom prenom email")
      .populate("machine", "nomMachine etat")
      .skip(skip)
      .limit(limit);

    const totalInterventions = await Intervention.countDocuments();

    res.status(200).json({
      results: interventions,
      totalInterventions,
      totalPages: Math.ceil(totalInterventions / limit),
      page,
      limit,
    });

    logger.info(
      `[INTERVENTION] Récupération de toutes les interventions (${interventions.length}) avec pagination`
    );
  } catch (error) {
    logger.error(
      `[INTERVENTION] Erreur récupération toutes interventions : ${error.message}`
    );
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ 3️⃣ Récupérer une intervention par ID
export const getInterventionById = async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id)
      .populate("technicien", "nom prenom email")
      .populate("machine", "nomMachine etat");

    if (!intervention) {
      logger.warn(
        `[INTERVENTION] Intervention non trouvée avec l'ID : ${req.params.id}`
      );
      return res.status(404).json({ message: "Intervention non trouvée." });
    }

    logger.info(`[INTERVENTION] Intervention récupérée : ${req.params.id}`);
    res.status(200).json(intervention);
  } catch (error) {
    logger.error(
      `[INTERVENTION] Erreur récupération intervention : ${error.message}`
    );
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ 4️⃣ Modifier une intervention
export const updateIntervention = async (req, res) => {
  try {
    const { nomMachine, type, nomTechnicien, status } = req.body;

    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) {
      logger.warn(
        `[INTERVENTION] Intervention non trouvée pour mise à jour : ${req.params.id}`
      );
      return res.status(404).json({ message: "Intervention non trouvée." });
    }

    // Mise à jour des champs autorisés
    if (nomMachine) {
      const existingMachine = await Machine.findOne({ nomMachine });
      if (!existingMachine) {
        logger.warn(`[INTERVENTION] Machine non trouvée : ${nomMachine}`);
        return res.status(404).json({ message: "Machine non trouvée" });
      }
      intervention.machine = existingMachine._id;
    }

    if (nomTechnicien) {
      const existingTechnicien = await Utilisateur.findOne({
        nom: nomTechnicien,
        role: "technicien",
      });
      if (!existingTechnicien) {
        logger.warn(
          `[INTERVENTION] Technicien non trouvé ou rôle invalide : ${nomTechnicien}`
        );
        return res
          .status(404)
          .json({ message: "Technicien non trouvé ou rôle invalide" });
      }
      intervention.technicien = existingTechnicien._id;
    }

    if (type) {
      intervention.type = type;
    }

    if (status) {
      intervention.status = status;
    }

    const interventionModifiee = await intervention.save();
    logger.info(`[INTERVENTION] Intervention mise à jour : ${req.params.id}`);
    res.status(200).json({
      message: "Intervention mise à jour avec succès",
      intervention: interventionModifiee,
    });
  } catch (error) {
    logger.error(
      `[INTERVENTION] Erreur mise à jour intervention : ${error.message}`
    );
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ 5️⃣ Supprimer une intervention
export const deleteIntervention = async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) {
      logger.warn(
        `[INTERVENTION] Intervention non trouvée pour suppression : ${req.params.id}`
      );
      return res.status(404).json({ message: "Intervention non trouvée." });
    }

    await intervention.deleteOne();
    logger.info(`[INTERVENTION] Intervention supprimée : ${req.params.id}`);
    res.status(200).json({ message: "Intervention supprimée avec succès" });
  } catch (error) {
    logger.error(
      `[INTERVENTION] Erreur suppression intervention : ${error.message}`
    );
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ 6️⃣ Filtrer les interventions avec pagination
export const filterInterventions = async (req, res) => {
  const { date, type, technician, page = 1, limit = 5 } = req.query;

  try {
    let filters = {};
    if (date) filters.date = date;
    if (type) filters.type = type;
    if (technician) {
      if (!mongoose.Types.ObjectId.isValid(technician)) {
        return res.status(400).json({ message: "Invalid technician ID." });
      }
      filters.technicien = technician;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const interventions = await Intervention.find(filters)
      .populate("technicien", "nom prenom email")
      .populate("machine", "nomMachine etat")
      .skip(skip)
      .limit(parseInt(limit));

    const totalInterventions = await Intervention.countDocuments(filters);

    logger.info(
      `[INTERVENTION] ${
        interventions.length
      } interventions trouvées avec les filtres : ${JSON.stringify(filters)}`
    );
    res.status(200).json({
      results: interventions,
      totalInterventions,
      totalPages: Math.ceil(totalInterventions / limit),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    logger.error(
      `[INTERVENTION] Erreur lors du filtrage des interventions : ${error.message}`
    );
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


// ✅ 8️⃣ Assigner un technicien à une intervention

export const assignTechnician = async (req, res) => {
  try {
    const { interventionId, technicianNom } = req.body;

    if (!interventionId || !technicianNom) {
      return res.status(400).json({
        message: "Intervention ID and Technician name are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(interventionId)) {
      return res.status(400).json({
        message: "Invalid Intervention ID.",
      });
    }

    const intervention = await Intervention.findById(interventionId);
    if (!intervention) {
      return res.status(404).json({ message: "Intervention not found." });
    }

    // Recherche du technicien par son nom et prénom
    // Supposons que technicianNom est au format "Nom Prénom" ou "Nom Prénom1 Prénom2"
    const parts = technicianNom.split(' ');
    
    // Le premier élément est le nom, le reste forme le prénom composé
    if (parts.length < 2) {
      return res.status(400).json({ message: "Format de nom et prénom invalide. Utilisez le format 'Nom Prénom'" });
    }
    
    const nom = parts[0];
    const prenom = parts.slice(1).join(' '); // Combine tous les éléments restants en un seul prénom
    
    const technician = await Utilisateur.findOne({ 
      nom: nom,
      prenom: prenom,
      role: "technicien"
    });

    if (!technician) {
      return res.status(404).json({
        message: `Technicien non trouvé : ${technicianNom} ou n'a pas le rôle 'technicien'.`,
      });
    }

    if (
      intervention.technicien &&
      intervention.technicien.toString() === technician._id.toString()
    ) {
      return res.status(400).json({
        message: "This intervention is already assigned to this technician.",
      });
    }



    intervention.technicien = technician._id;
    intervention.dateAssignation = new Date();
    await intervention.save();

    // ✅ Envoi d'email au technicien
    if (technician.email) {
      const emailSubject = `Nouvelle intervention assignée - ID: ${intervention._id}`;
      const emailBody = `
        <h2>Nouvelle Intervention Assignée</h2>
        <p><strong>Bonjour ${technician.prenom} ${technician.nom},</strong></p>
        <p>Une nouvelle intervention vous a été assignée.</p>
        <p><strong>ID de l'intervention :</strong> ${intervention._id}</p>
        <p><strong>Date d'assignation :</strong> ${new Date().toLocaleString("fr-FR")}</p>
        <p>Merci de la traiter dès que possible.</p>
      `;

      await sendEmail(technician.email, emailSubject, emailBody);
      console.log(`[EMAIL] Notification envoyée au technicien : ${technician.email}`);
    }

    res.status(200).json({
      message: "Technician assigned successfully.",
      intervention,
    });
  } catch (error) {
    console.error(`[INTERVENTION] Error assigning technician: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ✅ 1️⃣1️⃣ Consulter les tâches assignées

export const getTachesAssignees = async (req, res) => {
  try {
    const { technicienId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const interventions = await Intervention.find({ technicien: technicienId })
      .populate("machine", "nomMachine etat")
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(limit);

    const totalInterventions = await Intervention.countDocuments({
      technicien: technicienId,
    });

    if (!interventions.length) {
      logger.warn(
        `[INTERVENTION] Aucune tâche assignée trouvée pour le technicien : ID ${technicienId}`
      );
      return res.status(404).json({ message: "Aucune tâche assignée trouvée" });
    }

    logger.info(
      `[INTERVENTION] Tâches assignées récupérées pour le technicien : ID ${technicienId}`
    );
    res.status(200).json({
      message: "Tâches assignées récupérées avec succès",
      results: interventions,
      totalInterventions,
      totalPages: Math.ceil(totalInterventions / limit),
      page,
      limit,
    });
  } catch (error) {
    logger.error(
      `[INTERVENTION] Erreur récupération tâches assignées : ${error.message}`
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des tâches assignées",
      error,
    });
  }
};

// Mentionner des observations
export const addObservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { observation, nomPiece } = req.body;

    const intervention = await Intervention.findById(id);
    if (!intervention) {
      logger.warn(`[INTERVENTION] Intervention non trouvée : ID ${id}`);
      return res.status(404).json({ message: "Intervention non trouvée" });
    }

    if (!observation) {
      logger.warn(
        `[INTERVENTION] Observation manquante pour l'intervention : ID ${id}`
      );
      return res.status(400).json({ message: "Observation est requise" });
    }

    intervention.observations = intervention.observations || [];
    intervention.observations.push({ observation, nomPiece });
    await intervention.save();

    logger.info(
      `[INTERVENTION] Observation ajoutée pour l'intervention : ID ${id}`
    );
    res
      .status(200)
      .json({ message: "Observation ajoutée avec succès", intervention });
  } catch (error) {
    logger.error(`[INTERVENTION] Erreur ajout observation : ${error.message}`);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout de l'observation", error });
  }
};

// ✅ 1️⃣2️⃣ Récupérer les statistiques par technicien
export const getTechnicianStatistics = async (req, res) => {
  try {
    const statistics = await Intervention.aggregate([
      {
        $group: {
          _id: "$technicien",
          interventions: { $sum: 1 },
          avgDelay: { $avg: "$delai" },
        },
      },
      {
        $lookup: {
          from: "utilisateurs",
          localField: "_id",
          foreignField: "_id",
          as: "technicienDetails",
        },
      },
      {
        $unwind: "$technicienDetails",
      },
      {
        $project: {
          _id: 0,
          technicien: {
            nom: "$technicienDetails.nom",
            prenom: "$technicienDetails.prenom",
          },
          interventions: 1,
          avgDelay: 1,
        },
      },
    ]);

    res
      .status(200)
      .json({ message: "Statistiques récupérées avec succès", statistics });
  } catch (error) {
    logger.error(
      `[INTERVENTION] Erreur récupération statistiques : ${error.message}`
    );
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Créer un rapport d'intervention
export const createRapportIntervention = async (req, res) => {
  try {
    const { idIntervention, nomPieces, observations } = req.body;

    // Nettoyer et valider l'ID de l'intervention
    const cleanedId = idIntervention.trim();
    if (!mongoose.Types.ObjectId.isValid(cleanedId)) {
      logger.warn(
        `[INTERVENTION] ID d'intervention invalide : ${idIntervention}`
      );
      return res.status(400).json({ message: "ID d'intervention invalide" });
    }

    // Vérifier l'existence de l'intervention avec l'ID nettoyé
    const intervention = await Intervention.findById(cleanedId);
    if (!intervention) {
      logger.warn(
        `[INTERVENTION] Intervention non trouvée : ID ${idIntervention}`
      );
      return res.status(404).json({ message: "Intervention non trouvée" });
    }

    // Mettre à jour l'intervention avec le rapport en tant que chaîne JSON
    intervention.rapport = JSON.stringify({
      nomPieces: nomPieces || [],
      observations: observations || "",
      dateCreation: new Date(),
    });

    // Marquer l'intervention comme terminée
    intervention.status = "Completé";
    intervention.dateFin = new Date();

    await intervention.save();

    // Récupérer les responsables
    const responsables = await Utilisateur.find({ role: "responsable" });

    if (responsables && responsables.length > 0) {
      // Préparer le contenu de l'email
      const emailSubject = `Nouveau rapport d'intervention - ${idIntervention}`;
      const piecesDetails = nomPieces
        .map(
          (piece) =>
            `<tr>
          <td>${piece.nom || "N/A"}</td>
          <td>${piece.quantite || 0}</td>
         </tr>`
        )
        .join("");

      const emailBody = `
        <h2>Nouveau rapport d'intervention</h2>
        <p><strong>ID Intervention:</strong> ${idIntervention}</p>
        <p><strong>Date de fin:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Observations:</strong> ${observations}</p>
        
        <h3>Pièces utilisées:</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>Pièce</th>
              <th>Quantité</th>
            </tr>
          </thead>
          <tbody>
            ${piecesDetails}
          </tbody>
        </table>
      `;

      // Envoyer l'email aux responsables
      const responsablesEmails = responsables.map((resp) => resp.email);
      await sendEmail(responsablesEmails, emailSubject, emailBody);

      logger.info(
        `[INTERVENTION] Rapport envoyé aux responsables pour l'intervention : ${idIntervention}`
      );
    }

    logger.info(
      `[INTERVENTION] Rapport créé pour l'intervention : ${idIntervention}`
    );
    res.status(200).json({
      message: "Rapport d'intervention créé avec succès",
      intervention,
    });
  } catch (error) {
    logger.error(`[INTERVENTION] Erreur création rapport : ${error.message}`);
    res.status(500).json({
      message: "Erreur lors de la création du rapport",
      error: error.message,
    });
  }
};

// ✅ Définir un calendrier d'intervention
export const defineInterventionSchedule = async (req, res) => {
  try {
    const { interventionId, scheduledDate } = req.body;

    // Validation des données
    if (!interventionId || !scheduledDate) {
      logger.warn(`[INTERVENTION] Données manquantes pour la planification`);
      return res.status(400).json({ 
        message: "L'ID de l'intervention et la date planifiée sont requis" 
      });
    }

    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(interventionId)) {
      logger.warn(`[INTERVENTION] ID d'intervention invalide : ${interventionId}`);
      return res.status(400).json({ message: "ID d'intervention invalide" });
    }

    // Vérifier que l'intervention existe
    const intervention = await Intervention.findById(interventionId);
    if (!intervention) {
      logger.warn(`[INTERVENTION] Intervention non trouvée : ID ${interventionId}`);
      return res.status(404).json({ message: "Intervention non trouvée" });
    }

    // Convertir la date planifiée en objet Date
    const scheduledDateTime = new Date(scheduledDate);
    
    // Mettre à jour l'intervention avec la date planifiée en utilisant findByIdAndUpdate
    // pour éviter les problèmes de version
    const updatedIntervention = await Intervention.findByIdAndUpdate(
      interventionId,
      { scheduledDate: scheduledDateTime },
      { new: true, runValidators: true }
    );

    if (!updatedIntervention) {
      logger.warn(`[INTERVENTION] Échec de mise à jour de l'intervention : ID ${interventionId}`);
      return res.status(404).json({ message: "Échec de mise à jour de l'intervention" });
    }
    
    // Si l'intervention a un technicien assigné, envoyer une notification
    if (updatedIntervention.technicien) {
      const technicien = await Utilisateur.findById(updatedIntervention.technicien);
      
      if (technicien && technicien.email) {
        // Récupérer les informations de la machine
        const machine = await Machine.findById(updatedIntervention.machine);
        
        const emailSubject = "Intervention planifiée";
        const emailBody = `
          <h2>Intervention planifiée</h2>
          <p><strong>Bonjour ${technicien.prenom} ${technicien.nom},</strong></p>
          <p>Une intervention a été planifiée pour vous.</p>
          <p><strong>Date planifiée:</strong> ${scheduledDateTime.toLocaleDateString('fr-FR')} à ${scheduledDateTime.toLocaleTimeString('fr-FR')}</p>
          <p><strong>Machine:</strong> ${machine ? machine.nomMachine : 'Non spécifiée'}</p>
          <p><strong>Type d'intervention:</strong> ${updatedIntervention.type}</p>
          <p>Merci de vous préparer pour cette intervention.</p>
        `;
        
        await sendEmail(technicien.email, emailSubject, emailBody);
        logger.info(`[INTERVENTION] Notification envoyée au technicien : ${technicien.email}`);
      }
    }
    
    logger.info(`[INTERVENTION] Calendrier défini pour l'intervention : ${interventionId}`);
    res.status(200).json({
      message: "Calendrier d'intervention défini avec succès",
      intervention: updatedIntervention
    });
  } catch (error) {
    logger.error(`[INTERVENTION] Erreur lors de la définition du calendrier : ${error.message}`);
    res.status(500).json({ 
      message: "Erreur lors de la définition du calendrier d'intervention", 
      error: error.message 
    });
  }
};
