import mongoose from "mongoose";
import bcrypt from "bcrypt";
import RolesEnum from "../models/role.js";

const { Schema, model } = mongoose;

const utilisateurSchema = new Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: {
      type: String,
      enum: [RolesEnum.operateur, RolesEnum.technicien, RolesEnum.magasinier, RolesEnum.responsable, RolesEnum.admin],
      required: true,
    },
    approvalCode: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    refreshToken: { type: String },
  },
  { timestamps: true }
);
export const Utilisateur = model("Utilisateur", utilisateurSchema);