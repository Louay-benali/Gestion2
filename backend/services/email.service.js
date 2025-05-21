import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/config.js"; // ⬅️ On importe la config

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Création du transporteur avec Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Fonction générique pour envoyer un mail
export const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"Emka System" <${config.smtp.from}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé :", info.messageId);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi :", error);
  }
};

// Fonction pour envoyer un code d'approbation
export const sendApprovalCode = async (to, approvalCode) => {
  const subject = "Code d'approbation de votre compte";

  const templatePath = path.join(__dirname, "../templates/approvalEmailTemplate.html");
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");
  htmlTemplate = htmlTemplate.replace("{{approvalCode}}", approvalCode);

  await sendEmail(to, subject, htmlTemplate);
};
