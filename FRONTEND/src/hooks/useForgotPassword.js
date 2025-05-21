// src/hooks/useForgotPassword.js
import { useState } from "react";
import {forgotPassword} from "../services/authService";
import { toast, Bounce } from "react-toastify";

const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await forgotPassword({ email });

      toast.success("Email de réinitialisation envoyé avec succès !", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });

      setEmail("");
      return response.data;
    } catch (err) {
      const msg = err.response ? err.response.data.message : "Erreur serveur";
      toast.error(`Erreur : ${msg}`, {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, loading, handleForgotPassword };
};

export default useForgotPassword;
