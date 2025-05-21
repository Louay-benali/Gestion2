import mongoose from "mongoose";
import StatutEnum from "../models/statut.js";

const commandeSchema = new mongoose.Schema(
  {
    magasinier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    fournisseur: { type: String, required: true },
    statut: {
      type: String,
      enum: [StatutEnum.enattente, StatutEnum.validee, StatutEnum.livree],
      required: true,
    },
    receptionVerifiee: { type: Boolean, default: false },
    dateCommande: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Commande = mongoose.model("Commande", commandeSchema);
export default Commande;
