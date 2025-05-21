// src/hooks/useEmailVerification.js
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmail } from "../services/authService";
import { toast, Bounce } from "react-toastify";

const useEmailVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      toast.error("Email non fourni. Veuillez réessayer.", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      navigate("/");
    }
  }, [location, navigate]);

  const handleVerifyEmail = async (code) => {
    setLoading(true);
    try {
      const response = await verifyEmail({ email, approvalCode: code });

      toast.success("Email vérifié avec succès !", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });

      setTimeout(() => {
        navigate("/auth");
      }, 1000);

      return response;
    } catch (err) {
      const msg = err.response?.data.message || "Erreur serveur";
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

  return { handleVerifyEmail, loading };
};

export default useEmailVerification;
