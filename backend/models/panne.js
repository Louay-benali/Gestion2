import mongoose from "mongoose";
import EtatEnum from "../models/etatpanne.js";

const panneSchema = new mongoose.Schema({
    description: { type: String, required: true },
    etat: {
      type: String,
      enum: [EtatEnum.ouverte, EtatEnum.encours, EtatEnum.resolue],
      required: true,
    },
    operateur: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur", required: true },
    machine: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },
  },
  { timestamps: true }
);
  
  const Panne = mongoose.model("Panne", panneSchema);
  export default Panne;
  