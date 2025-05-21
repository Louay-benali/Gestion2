import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast, Bounce } from 'react-toastify';
import { logout as logoutService } from '../services/authService';

const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Appeler l'API de déconnexion
      await logoutService();
      
      // Nettoyer le contexte et les cookies
      logout();
      
      toast.success('Déconnexion réussie !', {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      
      // Même en cas d'erreur, on nettoie le contexte local
      logout();
      
      toast.error('Problème lors de la déconnexion', {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      navigate('/', { replace: true });
    }
  };

  return handleLogout;
};

export default useLogout; 