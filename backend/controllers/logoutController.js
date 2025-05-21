import { Utilisateur } from '../models/user.js';


/**
 * Fonction pour gérer la déconnexion d'un utilisateur.
 * @param {Object} req - La requête contenant les cookies et headers.
 * @param {Object} res - La réponse qui sera envoyée.
 * @returns {void}
 */
export async function handleLogout(req, res) {
  try {
    // Récupérer le token d'authentification depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    let userId = null;
    
    // Si on a un token d'authentification, on extrait l'ID utilisateur
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Décodage du token sans vérification (car on veut juste l'ID utilisateur)
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded.userId;
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error.message);
      }
    }

    // Si on a l'ID utilisateur, on supprime le refreshToken de l'utilisateur
    if (userId) {
      const utilisateur = await Utilisateur.findById(userId);
      if (utilisateur) {
        utilisateur.refreshToken = '';
        await utilisateur.save();
        console.log(`Déconnexion de l'utilisateur: ${utilisateur.email}`);
      }
    }

    // Supprimer les cookies côté client
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    
    return res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Erreur lors de la déconnexion de l'utilisateur:", error.message);
    return res.status(500).json({ message: "Erreur serveur lors de la déconnexion." });
  }
}
