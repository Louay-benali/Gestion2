import { useState } from "react";
import { register, login, googleAuth } from "../services/authService";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAuth as useAuthContext } from "../contexts/AuthContext.jsx";

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginContext } = useAuthContext();

  const handleSignUp = async (data) => {
    setLoading(true);
    try {
      await register(data);
      toast.success("Inscription réussie !", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      navigate("/email-verification", { state: { email: data.email } });
    } catch (err) {
      const msg = err.response?.data.message || "Erreur serveur";
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

  const handleSignIn = async (data) => {
    setLoading(true);
    try {
      const res = await login(data);
      console.log("res.data", res.data); 
      const { tokens, utilisateur } = res.data;
      const role = utilisateur.role;

      // Use the context to store user data and tokens
      loginContext(utilisateur, tokens);
      
      toast.success("Connexion réussie !", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
  
      // Redirection en fonction du rôle
      switch (role) {
        case "admin":
          navigate("/admin-dashboard", { replace: true });
          break;
        case "operateur":
          navigate("/operateur-dashboard", { replace: true });
          break;
        case "responsable":
          navigate("/responsable-dashboard", { replace: true });
          break;
        case "technicien":
          navigate("/technicien-dashboard", { replace: true });
          break;
        case "magasinier":
          navigate("/magasinier-dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true }); // redirection par défaut
      }
    } catch (err) {
      const msg = err.response?.data.message || "Erreur serveur";
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
  
  const handleGoogleSignIn = () => {
    googleAuth();
  }
  
  return { handleSignUp, handleSignIn, handleGoogleSignIn, loading };
};

export default useAuth;
