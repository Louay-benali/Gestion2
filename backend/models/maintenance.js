import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    datePlanifiee: {
      type: Date,
      required: true
    },
    Machine: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine"
    }],
    typeMaintenance: {
      type: String,
      enum: ["Préventive", "Corrective", "Prédictive"],
      required: true
    },
    technicien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true
    },
    statut: {
      type: String,
      enum: ["Planifiée", "En cours", "Terminée", "Annulée"],
      default: "Planifiée"
    },
    pieceUtilisees: [{
      piece: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Piece"
      },
      quantite: {
        type: Number,
        default: 1
      }
    }],
    observations: {
      type: String
    },
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Maintenance", maintenanceSchema); 