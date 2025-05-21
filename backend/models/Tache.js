import mongoose from "mongoose";

const tacheSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    technicien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: false,
    },
    type: {
      type: String,
      enum: ["Maintenance", "Réparation"],
      required: true,
    },
    status: {
      type: String,
      enum: ["À faire", "En cours", "Terminée", "Validée"],
      default: "À faire",
    },
    priorite: {
      type: String,
      enum: ["Basse", "Moyenne", "Haute", "Urgente"],
      default: "Moyenne",
    },
    deadline: {
      type: Date,
      required: false,
    },
    interventionLiee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Intervention",
      required: false,
    },
    observations: {
      type: String,
      default: "",
    },
    validePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      default: null,
    }
  },
  { timestamps: true }
);

const Tache = mongoose.model("Tache", tacheSchema);

export default Tache;