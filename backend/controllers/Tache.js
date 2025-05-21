import Tache from "../models/Tache.js";
import {Utilisateur} from "../models/user.js";
import Machine from "../models/machine.js";
import Piece from "../models/piece.js";
import Intervention from "../models/intervention.js";

// Obtenir toutes les tâches
export const getAllTaches = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const taches = await Tache.find()
      .populate("technicien", "nom prenom")
      .populate("machine", "nom reference")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTaches = await Tache.countDocuments();
    
    res.status(200).json({
      results: taches,
      totalTaches,
      totalPages: Math.ceil(totalTaches / limit),
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les tâches d'un technicien spécifique
export const getTachesByTechnicien = async (req, res) => {
  try {
    const technicienId = req.params.technicienId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    
    const taches = await Tache.find({ technicien: technicienId })
      .populate("technicien", "nom prenom")
      .populate("machine", "nom reference")
      .populate("interventionLiee")
      .sort({ priorite: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTaches = await Tache.countDocuments({ technicien: technicienId });
    
    res.status(200).json({
      results: taches,
      totalTaches,
      totalPages: Math.ceil(totalTaches / limit),
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une tâche par son ID
export const getTacheById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tache = await Tache.findById(id)
      .populate("technicien", "nom prenom")
      .populate("machine", "nom reference")
      .populate("interventionLiee")
      .populate("validePar", "nom prenom")
      .populate("pieces.piece");
    
    if (!tache) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    
    res.status(200).json(tache);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer une nouvelle tâche
export const createTache = async (req, res) => {
  try {
    const { 
      titre, 
      description, 
      nomTechnicien, 
      nomMachine, 
      type, 
      status, 
      priorite, 
      deadline, 
      interventionLiee, 
      pieces, 
      observations 
    } = req.body;

    // Trouver le technicien par son nom et prénom
    // Supposons que nomTechnicien est au format "Nom Prénom" ou "Nom Prénom1 Prénom2"
    const parts = nomTechnicien.split(' ');
    
    // Le premier élément est le nom, le reste forme le prénom composé
    if (parts.length < 2) {
      return res.status(400).json({ message: "Format de nom et prénom invalide. Utilisez le format 'Nom Prénom'" });
    }
    
    const nom = parts[0];
    const prenom = parts.slice(1).join(' '); // Combine tous les éléments restants en un seul prénom
    
    const technicien = await Utilisateur.findOne({ 
      nom: nom,
      prenom: prenom
    });
    if (!technicien) {
      return res.status(404).json({ message: `Technicien non trouvé : ${nomTechnicien}` });
    }

    // Trouver la machine par son nom
    let machineId = null;
    if (nomMachine) {
      const machine = await Machine.findOne({ nom: nomMachine });
      if (!machine) {
        return res.status(404).json({ message: "Machine non trouvée" });
      }
      machineId = machine._id;
    }

    // Vérifier si l'intervention liée existe si elle est spécifiée
    if (interventionLiee) {
      const interventionExists = await Intervention.findById(interventionLiee);
      if (!interventionExists) {
        return res.status(404).json({ message: "Intervention non trouvée" });
      }
    }
    
    // Vérifier si les pièces existent si elles sont spécifiées
    if (pieces && pieces.length > 0) {
      for (const item of pieces) {
        const pieceExists = await Piece.findById(item.piece);
        if (!pieceExists) {
          return res.status(404).json({ message: `Pièce ${item.piece} non trouvée` });
        }
      }
    }
    
    const nouvelleTache = new Tache({
      titre,
      description,
      technicien: technicien._id,
      machine: machineId,
      type,
      status: status || "À faire",
      priorite: priorite || "Moyenne",
      deadline,
      interventionLiee,
      pieces,
      observations
    });
    
    const tacheSaved = await nouvelleTache.save();
    
    // Populate the technician and machine fields to get their names
    const populatedTache = await Tache.findById(tacheSaved._id)
      .populate("technicien", "nom prenom")
      .populate("machine", "nom reference");
    
    res.status(201).json(populatedTache);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une tâche
export const updateTache = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Vérifier si la tâche existe
    const tacheExists = await Tache.findById(id);
    if (!tacheExists) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    
    // Vérifier les relations si elles sont mises à jour
    if (updateData.technicien) {
      const technicienExists = await Utilisateur.findById(updateData.technicien);
      if (!technicienExists) {
        return res.status(404).json({ message: "Technicien non trouvé" });
      }
    }
    
    if (updateData.machine) {
      const machineExists = await Machine.findById(updateData.machine);
      if (!machineExists) {
        return res.status(404).json({ message: "Machine non trouvée" });
      }
    }
    
    if (updateData.interventionLiee) {
      const interventionExists = await Intervention.findById(updateData.interventionLiee);
      if (!interventionExists) {
        return res.status(404).json({ message: "Intervention non trouvée" });
      }
    }
    
    if (updateData.validePar) {
      const validateurExists = await Utilisateur.findById(updateData.validePar);
      if (!validateurExists) {
        return res.status(404).json({ message: "Validateur non trouvé" });
      }
    }
    
    const tacheUpdated = await Tache.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("technicien", "nom prenom")
     .populate("machine", "nom reference")
     .populate("interventionLiee")
     .populate("validePar", "nom prenom");
    
    res.status(200).json(tacheUpdated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une tâche
export const deleteTache = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tacheDeleted = await Tache.findByIdAndDelete(id);
    
    if (!tacheDeleted) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    
    res.status(200).json({ message: "Tâche supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Valider une tâche
export const validerTache = async (req, res) => {
  try {
    const { id } = req.params;
    const { validePar, rapport } = req.body;
    
    // Vérifier si la tâche existe
    const tache = await Tache.findById(id);
    if (!tache) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    
    // Vérifier si le validateur existe
    const validateurExists = await Utilisateur.findById(validePar);
    if (!validateurExists) {
      return res.status(404).json({ message: "Validateur non trouvé" });
    }
    
    // Mettre à jour la tâche
    tache.status = "Validée";
    tache.validePar = validePar;
    if (rapport) {
      tache.rapport = rapport;
    }
    
    const tacheValidee = await tache.save();
    
    res.status(200).json(tacheValidee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les tâches par type
export const getTachesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const taches = await Tache.find({ type })
      .populate("technicien", "nom prenom")
      .populate("machine", "nom reference")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTaches = await Tache.countDocuments({ type });

    res.status(200).json({
      results: taches,
      totalTaches,
      totalPages: Math.ceil(totalTaches / limit),
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les tâches liées à une intervention
export const getTachesByIntervention = async (req, res) => {
  try {
    const { interventionId } = req.params;
    const technicienId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const taches = await Tache.find({ 
        interventionLiee: interventionId,
        technicien: technicienId
      })
      .populate("technicien", "nom prenom")
      .populate("machine", "nom reference")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTaches = await Tache.countDocuments({ 
      interventionLiee: interventionId,
      technicien: technicienId
    });

    res.status(200).json({
      results: taches,
      totalTaches,
      totalPages: Math.ceil(totalTaches / limit),
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les tâches par machine
export const getTachesByMachine = async (req, res) => {
  try {
    const { machineId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const taches = await Tache.find({ machine: machineId })
      .populate("technicien", "nom prenom")
      .populate("machine", "nom reference")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTaches = await Tache.countDocuments({ machine: machineId });

    res.status(200).json({
      results: taches,
      totalTaches,
      totalPages: Math.ceil(totalTaches / limit),
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};