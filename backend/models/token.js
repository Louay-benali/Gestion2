import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Utilisateur", // Reference to the Utilisateur model
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600, // Token expires after 1 hour
  },
});

const Token = mongoose.model("Token", tokenSchema);
export default Token;
