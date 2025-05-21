import { Utilisateur } from "../models/user.js";
import { generateAuthTokens } from "../controllers/token.js";
import { encryptData, decryptData } from "../utils/auth.js";
import { sendApprovalCode, sendEmail } from "../services/email.service.js";
import config from "../config/config.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import logger from "../utils/logger.js";
import Token from "../models/token.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Enregistrer un nouvel utilisateur.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: "http://localhost:3001/auth/google/callback",
    },
    async (token, tokenSecret, profile, done) => {
      try {
        console.log("Profil Google reçu:", JSON.stringify(profile));
        
        // Recherche d'un utilisateur existant avec ce Google ID
        let utilisateur = await Utilisateur.findOne({
          email: profile.emails[0].value,
        });

        if (!utilisateur) {
          // Extraire le nom et prénom avec des valeurs par défaut
          const givenName = profile.name?.familyName || profile.displayName?.split(' ').pop() || "Utilisateur";
          const familyName = profile.name?.givenName || profile.displayName?.split(' ').shift() || "Google";
          
          // Si l'utilisateur n'existe pas, on le crée
          utilisateur = new Utilisateur({
            nom: familyName,
            prenom: givenName,
            email: profile.emails[0].value,
            motDePasse: "00112233@Ab", // mot de passe temporaire (sera hashé automatiquement avec le pre-save)
            role: "operateur", // ou un autre rôle par défaut
            isApproved: true,
          });

          await utilisateur.save();
        }

        return done(null, utilisateur);
      } catch (err) {
        console.error("Erreur dans la stratégie Google:", err);
        return done(err, null);
      }
    }
  )
);
// Sérialisation de l'utilisateur (stockage en session)
passport.serializeUser((utilisateur, done) => {
  done(null, utilisateur.id);
});

// Désérialisation (récupération de l'utilisateur via l'ID stocké)
passport.deserializeUser(async (id, done) => {
  try {
    const utilisateur = await Utilisateur.findById(id);
    done(null, utilisateur);
  } catch (err) {
    done(err, null);
  }
});

export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "http://localhost:5173/" },
    async (err, user) => {
      if (err) {
        console.error("Erreur lors de l'authentification Google :", err);
        return res.redirect("http://localhost:5173/?error=auth_failed");
      }

      if (!user) {
        return res.redirect("http://localhost:5173/?error=user_not_found");
      }

      try {
        // Générer les tokens d'accès (par exemple JWT)
        const tokens = await generateAuthTokens({
          userId: user._id,
          role: user.role,
        });

        // Déterminer l'URL de redirection en fonction du rôle
        let redirectUrl = '/';
        switch (user.role) {
          case "admin":
            redirectUrl = "/admin-dashboard";
            break;
          case "operateur":
            redirectUrl = "/operateur-dashboard";
            break;
          case "responsable":
            redirectUrl = "/responsable-dashboard";
            break;
          case "technicien":
            redirectUrl = "/technicien-dashboard";
            break;
          case "magasinier":
            redirectUrl = "/magasinier-dashboard";
            break;
          default:
            redirectUrl = "/";
        }

        // Créer une page HTML qui stocke les tokens et redirige vers le tableau de bord
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Connexion réussie</title>
          <script>
            // Stocker les tokens dans les cookies
            document.cookie = "accessToken=${tokens.accessToken.token}; path=/; max-age=${60 * 60 * 24 * 7}";
            document.cookie = "refreshToken=${tokens.refreshToken.token}; path=/; max-age=${60 * 60 * 24 * 30}";
            
            // Rediriger vers le frontend avec les tokens
            window.location.href = "http://localhost:5173${redirectUrl}";
          </script>
        </head>
        <body>
          <p>Connexion réussie. Redirection en cours...</p>
        </body>
        </html>
        `;

        // Envoyer la page HTML
        return res.send(html);
      } catch (tokenError) {
        console.error("Erreur lors de la génération des tokens :", tokenError);
        return res.redirect("http://localhost:5173/login?error=token_generation");
      }
    }
  )(req, res, next);
};

export async function register(req, res) {
  const { nom, prenom, email, motDePasse, role } = req.body;

  try {
    const utilisateurExist = await Utilisateur.findOne({ email });
    if (utilisateurExist) {
      logger.warn(
        `[REGISTER] Tentative d'inscription avec email existant: ${email}`
      );
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await encryptData(motDePasse);

    // 🔐 Génération du code d'approbation
    const approvalCode = Math.floor(100000 + Math.random() * 900000).toString();

    const utilisateur = new Utilisateur({
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      role,
      approvalCode,
      isApproved: false,
    });

    await utilisateur.save();

    // 📧 Envoi de l'e-mail
    await sendApprovalCode(email, approvalCode);
    logger.info(
      `[REGISTER] Utilisateur enregistré: ${email}, code d'approbation envoyé.`
    );

    return res.status(201).json({
      message: "Utilisateur enregistré. Code d'approbation envoyé par e-mail.",
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    });
  } catch (error) {
    logger.error(`[REGISTER] Erreur serveur: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de l'enregistrement." });
  }
}

/**
 * Connexion utilisateur.
 */
export async function handleLogin(req, res) {
  const { email, motDePasse } = req.body;

  try {
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      logger.warn(`[LOGIN] Utilisateur non trouvé: ${email}`);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const isPasswordValid = await decryptData(
      motDePasse,
      utilisateur.motDePasse
    );
    if (!isPasswordValid) {
      logger.warn(`[LOGIN] Mot de passe incorrect pour l'email: ${email}`);
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const tokens = await generateAuthTokens({
      userId: utilisateur._id,
      roleId: utilisateur.role,
    });

    utilisateur.refreshToken = tokens.refreshToken.token;
    await utilisateur.save();

    logger.info(`[LOGIN] Connexion réussie: ${email}`);

    return res.status(200).json({
      message: "Connexion réussie.",
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
      tokens,
    });
  } catch (error) {
    logger.error(`[LOGIN] Erreur serveur: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la connexion." });
  }
}

export const signInUsingToken = async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Access token is required");
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (error) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired access token"
      );
    }

    const user = await User.findById(decodedToken.sub);

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    const tokens = await generateAuthTokens({
      userId: user.id,
      roleId: user.role_id,
    });

    res.status(200).send({ user, tokens });
  } catch (error) {
    next(error);
  }
};

// 📌 Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      logger.warn(
        `[FORGOT PASSWORD] Utilisateur introuvable pour l'email : ${email}`
      );
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, 10);

    await new Token({
      userId: utilisateur._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

    const emailContent = `
      <p>Vous avez demandé une réinitialisation de mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetLink}">Réinitialiser le mot de passe</a>
    `;

    await sendEmail(
      utilisateur.email,
      "Demande de réinitialisation de mot de passe",
      emailContent
    );

    logger.info(
      `[FORGOT PASSWORD] Email de réinitialisation envoyé à : ${email}`
    );
    res
      .status(200)
      .json({ message: "Email de réinitialisation envoyé avec succès" });
  } catch (error) {
    logger.error(`[FORGOT PASSWORD] Erreur serveur : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Reset Password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const tokens = await Token.find();
    let userToken = null;

    for (let i = 0; i < tokens.length; i++) {
      const isTokenValid = await bcrypt.compare(token, tokens[i].token);
      if (isTokenValid) {
        userToken = tokens[i];
        break;
      }
    }

    if (!userToken) {
      logger.warn("[RESET PASSWORD] Token invalide ou expiré");
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    const utilisateur = await Utilisateur.findById(userToken.userId);
    if (!utilisateur) {
      logger.warn("[RESET PASSWORD] Utilisateur non trouvé");
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const salt = await bcrypt.genSalt(10);
    utilisateur.motDePasse = await bcrypt.hash(password, salt);

    await utilisateur.save();
    await userToken.deleteOne();

    logger.info(
      `[RESET PASSWORD] Mot de passe réinitialisé pour l'utilisateur : ${utilisateur.email}`
    );
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    logger.error(`[RESET PASSWORD] Erreur serveur : ${error.message}`);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Get User Profile
export const getProfile = async (req, res) => {
  try {
    // L'utilisateur est extrait du middleware d'authentification
    // Nous devons extraire l'ID utilisateur du token JWT
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Token d'authentification requis" });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Décodage du token sans vérification (car déjà vérifié par le middleware)
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    if (!decoded.userId) {
      return res.status(401).json({ message: "Token invalide" });
    }
    
    // Récupération de l'utilisateur
    const utilisateur = await Utilisateur.findById(decoded.userId).select('-motDePasse -refreshToken -approvalCode');
    
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    return res.status(200).json({
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
        isApproved: utilisateur.isApproved
      }
    });
  } catch (error) {
    logger.error(`[GET PROFILE] Erreur: ${error.message}`);
    return res.status(500).json({ message: "Erreur lors de la récupération du profil" });
  }
};
