import { Utilisateur } from '../models/user.js'; // Modèle Utilisateur
import { generateExpires, generateToken, verifyToken } from '../utils/auth.js'; // Fonction pour vérifier les tokens
import config from '../config/config.js'; // Configuration du JWT

// Contrôleur pour gérer la demande de rafraîchissement de l'Access Token
export async function refreshTokenController(req, res) {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(401).send('Token de rafraîchissement manquant'); // Si aucun refreshToken n'est trouvé
    }

    const refreshToken = cookies.jwt;

    // Vérifier la validité du refreshToken en utilisant la fonction verifyToken
    const decodedToken = await verifyToken(refreshToken);
    if (!decodedToken) {
      return res.status(403).send('Refresh Token invalide'); // Si le token est invalide
    }

    // Chercher l'utilisateur dans la base de données en fonction du refreshToken
    const foundUser = await Utilisateur.findOne({ refreshToken });
    if (!foundUser) {
      return res.status(403).send('Utilisateur non trouvé pour ce token de rafraîchissement');
    }

    // Générer uniquement l'Access Token
    const accessTokenExpires = generateExpires(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(
      { userId: foundUser._id, roleId: foundUser.role },
      accessTokenExpires,
      config.jwt.secret
    );

    // Retourner le nouvel accessToken avec sa date d'expiration
    return res.json({
      accessToken: accessToken,
      expiresAt: new Date(accessTokenExpires).toISOString(),
    });

  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token :", error.message);
    return res.status(500).send("Erreur interne du serveur");
  }
}
