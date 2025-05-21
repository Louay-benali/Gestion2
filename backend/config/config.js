import dotenv from 'dotenv';
import Joi from 'joi';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Définition du schéma de validation des variables d'environnement
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  PORT: Joi.number().default(3000),
  PORTFRONT: Joi.string().uri().required(),

  MONGODB_URI: Joi.string().uri().required().description('MongoDB URI'),

  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(5),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(1),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(1440),

  COOKIE_EXPIRATION_HOURS: Joi.number().default(24),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  EMAIL_FROM: Joi.string().email().required(),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_PASS: Joi.string().required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),

  SESSION_SECRET: Joi.string().required(),

  BCRYPT_SALT_ROUNDS: Joi.number().default(10),
}).unknown();

// Validation des variables d'environnement
const { value: envVars, error } = envVarsSchema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`Erreur de validation des variables d'environnement: ${error.message}`);
}

// Exporter la configuration
const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  frontPort: envVars.PORTFRONT,
  mongoUri: envVars.MONGODB_URI,

  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: Number(envVars.JWT_ACCESS_EXPIRATION_MINUTES),
    refreshExpirationDays: Number(envVars.JWT_REFRESH_EXPIRATION_DAYS),
    resetPasswordExpirationMinutes: Number(envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES),
  },

  cookie: {
    expirationHours: Number(envVars.COOKIE_EXPIRATION_HOURS),
  },

  smtp: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    from: envVars.EMAIL_FROM,
    user: envVars.EMAIL_USER,
    pass: envVars.EMAIL_PASS,
  },

  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  },

  sessionSecret: envVars.SESSION_SECRET,

  bcryptSaltRounds: Number(envVars.BCRYPT_SALT_ROUNDS),
};

export default config;
