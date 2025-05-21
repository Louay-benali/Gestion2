import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import logger from "./utils/logger.js"; // <<-- Import du logger
import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import commandeRoutes from "./routes/commande.js";
import interventionRoutes from "./routes/intervention.js";
import machineRoutes from "./routes/machine.js";
import panneRoutes from "./routes/panne.js";
import pieceRoutes from "./routes/piece.js";
import utilisateurRoutes from "./routes/user.js";
import authRoutes from "./routes/auth.js";
import demandeRoutes from "./routes/demande.js";
import tacheRoutes from "./routes/Tache.js";
import maintenanceRoutes from "./routes/maintenance.js";

dotenv.config();

const app = express();
const port = process.env.PORT;
const portfront = process.env.PORTFRONT;

app.use(
  cors({
    origin: portfront,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Middleware to sanitize request URLs and remove double slashes
app.use((req, res, next) => {
  req.url = req.url.replace(/\/+/g, "/"); // Replace multiple slashes with a single slash
  next();
});

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("✅ Connecté à MongoDB"))
  .catch((error) =>
    logger.error(`❌ Erreur de connexion à MongoDB : ${error.message}`)
  );

// Routes
app.use("/auth", authRoutes);
app.use("/user", utilisateurRoutes);
app.use("/piece", pieceRoutes);
app.use("/panne", panneRoutes);
app.use("/machine", machineRoutes);
app.use("/intervention", interventionRoutes);
app.use("/commande", commandeRoutes);
app.use("/demande", demandeRoutes);
app.use("/tache", tacheRoutes);
app.use("/maintenance", maintenanceRoutes);

app.use(errorHandler);

// Démarrer le serveur
app.listen(port, () => {
  logger.info(`🚀 Serveur lancé sur http://localhost:${port}`);
});
