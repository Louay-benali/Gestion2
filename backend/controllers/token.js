import { generateToken, generateExpires, verifyToken } from '../utils/auth.js';
import config from '../config/config.js';

/**
 * Fonction pour générer l'Access Token et le Refresh Token.
 * @param {Object} userData - Contient les données de l'utilisateur, comme son ID et son rôle.
 * @returns {Object} - Contient les deux tokens (Access et Refresh) ainsi que leurs dates d'expiration.
 */
export async function generateAuthTokens({ userId, roleId }) {
  try {
    // Générer l'expiration de l'AccessToken en millisecondes (en minutes)
    const accessTokenExpires = generateExpires(config.jwt.accessExpirationMinutes, 'minutes');
  
    // Générer l'Access Token
    const accessToken = generateToken(
      { userId, roleId },
      accessTokenExpires,
      config.jwt.secret  
    );
    

    // Générer l'expiration du RefreshToken en millisecondes (en jours)
    const refreshTokenExpires = generateExpires(config.jwt.refreshExpirationDays, 'days');
  
    // Générer le Refresh Token
     const refreshToken = generateToken(
      { userId },
      refreshTokenExpires,
      config.jwt.secret
    );

    // Retourner les deux tokens avec leurs dates d'expiration
    return {
      accessToken: {
        token: accessToken,
        expiresAt: new Date(accessTokenExpires).toISOString(),
      },
      
      refreshToken: {
        token: refreshToken,
        expiresAt: new Date(refreshTokenExpires).toISOString(),
      },
    };
  } catch (error) {
    console.error("Erreur lors de la génération des tokens :", error.message);
    throw new Error("Impossible de générer les tokens.");
  }
}

