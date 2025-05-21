import { useState } from "react";
import { resetPassword } from "../services/authService";
import { toast, Bounce } from "react-toastify";
import { useNavigate } from "react-router-dom";

const useResetPassword = (token) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({ token, password });

      toast.success("Mot de passe réinitialisé avec succès", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });

      
      setTimeout(() => {
        navigate("/");
      }, 2000);
      return response.data;
    } catch (err) {
      const msg = err.response ? err.response.data.message : "Erreur serveur";
      toast.error(`Erreur : ${msg}`, {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    handleResetPassword,
  };
};

export default useResetPassword;
