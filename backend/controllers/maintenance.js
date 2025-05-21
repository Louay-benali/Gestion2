import Maintenance from "../models/maintenance.js";
import { Utilisateur } from "../models/user.js";
import Machine from "../models/machine.js";
import Piece from "../models/piece.js";

// Obtenir toutes les maintenances avec pagination
export const getAllMaintenances = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const maintenances = await Maintenance.find()
      .populate("technicien", "nom prenom")
      .populate("Machine", "nom")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMaintenances = await Maintenance.countDocuments();

    res.status(200).json({
      results: maintenances,
      totalMaintenances,
      totalPages: Math.ceil(totalMaintenances / limit),
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les maintenances d'un technicien spécifique
export const getMaintenancesByTechnicien = async (req, res) => {
  try {
    const technicienId = req.params.technicienId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const maintenances = await Maintenance.find({ technicien: technicienId })
      .populate("technicien", "nom prenom")
      .populate("Machine", "nom")
      .populate("pieceUtilisees.piece", "nom reference")
      .sort({ datePlanifiee: 1 })
      .skip(skip)
      .limit(limit);

    const totalMaintenances = await Maintenance.countDocuments({ technicien: technicienId });

    res.status(200).json({
      results: maintenances,
      totalMaintenances,
      totalPages: Math.ceil(totalMaintenances / limit),
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une maintenance par son ID
export const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate("technicien", "nom prenom")
      .populate("Machine", "nom")
      .populate("pieceUtilisees.piece");

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance non trouvée" });
    }

    res.status(200).json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer une nouvelle maintenance
export const createMaintenance = async (req, res) => {
  try {
    const {
      titre,
      description,
      datePlanifiee,
      Machine: machineInput,
      typeMaintenance,
      technicien,
      observations
    } = req.body;

    // Vérifier si le technicien existe par son ID
    const technicienExists = await Utilisateur.findById(technicien);
    if (!technicienExists) {
      return res.status(404).json({ message: `Technicien non trouvé avec l'ID: ${technicien}` });
    }

    // Vérifier si la machine existe
    // Gérer le cas où machineInput est un ID unique ou un tableau
    const machineIds = Array.isArray(machineInput) ? machineInput : [machineInput];
    
    for (const machineId of machineIds) {
      if (!machineId) continue; // Ignorer les valeurs vides
      
      const machineExists = await Machine.findById(machineId);
      if (!machineExists) {
        return res.status(404).json({ message: `Machine ${machineId} non trouvée` });
      }
    }

    const nouvelleMaintenance = new Maintenance({
      titre,
      description,
      datePlanifiee,
      Machine: machineIds, // Utiliser le tableau d'IDs de machines
      typeMaintenance,
      technicien, // Utiliser directement l'ID du technicien
      observations,
      statut: "Planifiée"
    });

    const maintenanceSaved = await nouvelleMaintenance.save();
    res.status(201).json(maintenanceSaved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une maintenance
export const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si la maintenance existe
    const maintenanceExists = await Maintenance.findById(id);
    if (!maintenanceExists) {
      return res.status(404).json({ message: "Maintenance non trouvée" });
    }

    // Vérifier les relations
    if (updateData.technicien) {
      const technicienExists = await Utilisateur.findById(updateData.technicien);
      if (!technicienExists) {
        return res.status(404).json({ message: "Technicien non trouvé" });
      }
    }

    if (updateData.Machine) {
      for (const machineId of updateData.Machine) {
        const machineExists = await Machine.findById(machineId);
        if (!machineExists) {
          return res.status(404).json({ message: `Machine ${machineId} non trouvée` });
        }
      }
    }

    const maintenanceUpdated = await Maintenance.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("technicien", "nom prenom")
     .populate("Machine", "nom");

    res.status(200).json(maintenanceUpdated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ajouter des pièces utilisées à une maintenance
export const ajouterPieces = async (req, res) => {
  try {
    const { id } = req.params;
    const { pieceUtilisees } = req.body;

    const maintenance = await Maintenance.findById(id);
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance non trouvée" });
    }

    // Vérifier que les pièces existent
    for (const item of pieceUtilisees) {
      const pieceExists = await Piece.findById(item.piece);
      if (!pieceExists) {
        return res.status(404).json({ message: `Pièce ${item.piece} non trouvée` });
      }
    }

    // Ajouter les pièces à la maintenance
    maintenance.pieceUtilisees = [...maintenance.pieceUtilisees, ...pieceUtilisees];
    
    await maintenance.save();
    
    const maintenanceUpdated = await Maintenance.findById(id)
      .populate("technicien", "nom prenom")
      .populate("Machine", "nom")
      .populate("pieceUtilisees.piece");

    res.status(200).json(maintenanceUpdated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Changer le statut d'une maintenance
export const changerStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, observations } = req.body;

    // Vérifier si le statut est valide
    const statutsValides = ["Planifiée", "En cours", "Terminée", "Annulée"];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ 
        message: "Statut invalide. Les statuts valides sont: Planifiée, En cours, Terminée, Annulée" 
      });
    }

    const maintenance = await Maintenance.findById(id);
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance non trouvée" });
    }

    maintenance.statut = statut;
    
    if (observations) {
      maintenance.observations = observations;
    }

    await maintenance.save();
    
    const maintenanceUpdated = await Maintenance.findById(id)
      .populate("technicien", "nom prenom")
      .populate("Machine", "nom");

    res.status(200).json(maintenanceUpdated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une maintenance
export const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenanceDeleted = await Maintenance.findByIdAndDelete(id);
    if (!maintenanceDeleted) {
      return res.status(404).json({ message: "Maintenance non trouvée" });
    }

    res.status(200).json({ message: "Maintenance supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir l'historique des interventions pour une machine
export const getHistoriqueInterventions = async (req, res) => {
  try {
    const { machineId } = req.params;
    
    const maintenances = await Maintenance.find({ 
      Machine: machineId,
      statut: "Terminée"
    })
    .populate("technicien", "nom prenom")
    .populate("pieceUtilisees.piece")
    .sort({ updatedAt: -1 });

    res.status(200).json(maintenances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les maintenances planifiées par période
export const getMaintenancesPlanifiees = async (req, res) => {
  try {
    const { debut, fin } = req.query;
    
    const query = { statut: "Planifiée" };
    
    if (debut) {
      query.datePlanifiee = { $gte: new Date(debut) };
    }
    
    if (fin) {
      if (!query.datePlanifiee) {
        query.datePlanifiee = {};
      }
      query.datePlanifiee.$lte = new Date(fin);
    }
    
    const maintenances = await Maintenance.find(query)
      .populate("technicien", "nom prenom")
      .populate("Machine", "nom")
      .sort({ datePlanifiee: 1 });

    res.status(200).json(maintenances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 