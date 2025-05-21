import mongoose from "mongoose";
import EtatPiece from "../models/etatpiece.js"; // Importer les états possibles

const pieceSchema = new mongoose.Schema({
  nomPiece: { type: String, required: true },
  quantite: { type: Number, required: true },
  etat: {
    type: String,
    enum: [EtatPiece.Disponible, EtatPiece.NonDisponible],
    required: true,
  },
});

const Piece = mongoose.model("Piece", pieceSchema);
export default Piece;
