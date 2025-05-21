import mongoose from "mongoose";
import TypeEnum from "../models/typeintervention.js";

const interventionSchema = new mongoose.Schema(
  {
    technicien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
    },
    rapport: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: [TypeEnum.Maintenance, TypeEnum.Réparation],
      required: true,
    },
    status: {
      type: String,
      enum: ["Completé", "En cours", "Reporté"],
      default: "En cours",
    },
    delai: {
      type: Number, // Assuming delay is stored as a number (e.g., in hours or days)
      required: false, // Optional field
    },
    scheduledDate: {
      type: Date,
      default: null,
      required: false,
    },
    dateDebut: {
      type: Date,
      default: null,
    },
    dateFin: {
      type: Date,
      default: null,
    },
    dateAssignation: {
      type: Date,
      default: null,
    },
    observations: [
      {
        observation: String,
        nomPiece: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Intervention = mongoose.model("Intervention", interventionSchema);
export default Intervention;
