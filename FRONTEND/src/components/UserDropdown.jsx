import { FiUser } from "react-icons/fi";
import { RiLogoutBoxLine } from "react-icons/ri";
import useLogout from "../hooks/useLogout";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Link } from "react-router-dom";

const UserDropdown = () => {
  const handleLogout = useLogout();
  const { user } = useAuth();

  return (
    <div className="absolute right-0 mt-2 w-[240px] rounded-xl bg-white shadow-lg border border-gray-200 z-50">
      {/* User Info Section */}
      <div className="p-4 border-b border-gray-200">
        <h5 className="text-[14px] font-medium text-gray-900">
          {user ? `${user.prenom} ${user.nom}` : "Utilisateur"}
        </h5>
        <p className="text-[14px] text-gray-500">
          {user ? user.email : "email@exemple.com"}
        </p>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        <Link 
          to="/profile" 
          className="w-full flex items-center px-3 py-2 text-[14px] text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <FiUser className="mr-2" />
          Modifier le profil
        </Link>
      </div>

      {/* Sign Out Section */}
      <div className="p-2 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-[14px] text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <RiLogoutBoxLine className="mr-2" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;