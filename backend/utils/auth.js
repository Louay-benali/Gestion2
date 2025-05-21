import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';  // Utilisation de bcryptjs au lieu de bcrypt
import config from '../config/config.js';
import dotenv from "dotenv";

dotenv.config();


const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS)
// Fonction pour générer un token JWT
export function generateToken(data, expiresMs, secret) {
  const token = jwt.sign(
    { exp: Math.floor(expiresMs / 1000), ...data },
    secret
  );
  return token;
}

// Fonction pour vérifier un token JWT
export async function verifyToken(token) {
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    return payload;
  } catch (err) {
    throw new Error(`Invalid token: ${err}`);
  }
}

// Fonction pour chiffrer des données (ex: mot de passe)
export async function encryptData(string) {
  const salt = await bcrypt.genSalt(saltRounds);   // bcryptjs génère un sel
  const hashedString = await bcrypt.hash(string, salt);  // bcryptjs effectue le hachage
  return hashedString;
}

// Fonction pour comparer une chaîne de caractères avec un mot de passe hashé
export async function decryptData(string, hashedString) {
  const isValid = await bcrypt.compare(string, hashedString);  // bcryptjs compare les mots de passe
  return isValid;
}

// Fonction pour définir un cookie HTTP-only
export function setCookie(res, cookieName, cookieValue, expiresMs) {
  res.cookie(cookieName, cookieValue, {
    httpOnly: true,
    expires: new Date(expiresMs),
  });
}

// Fonction pour décoder un token JWT sans vérifier sa validité
export function decode(token) {
  try {
    const { secret } = config.jwt;
    return jwt.verify(token, secret);
  } catch (e) {
    return undefined;
  }
}

// Fonction pour générer l'expiration d'un token (en fonction des minutes ou des jours)
export function generateExpires(value, type) {
  const now = Date.now(); // Temps actuel en millisecondes
  let expiresIn;

  if (type === 'minutes') {
    expiresIn = now + value * 60 * 1000; // Convertir les minutes en millisecondes
  } else if (type === 'hours') {
    expiresIn = now + value * 60 * 60 * 1000; // Convertir les heures en millisecondes
  } else if (type === 'days') {
    expiresIn = now + value * 24 * 60 * 60 * 1000; // Convertir les jours en millisecondes
  } else {
    throw new Error('Type non valide pour generateExpires');
  }

  return expiresIn;
}
