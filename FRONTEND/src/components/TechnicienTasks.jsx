import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdAssignment, MdWarning, MdCheckCircle, MdSchedule } from "react-icons/md";

const TechnicienTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);
  const [stats, setStats] = useState({
    total: 0,
    aFaire: 0,
    enCours: 0,
    validees: 0,
    urgentes: 0
  });

  useEffect(() => {
    fetchTasks();
  }, [currentPage]);

  const fetchTasks = async () => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        toast.error("Vous devez être connecté", {
          position: "bottom-center",
          autoClose: 2000,
          theme: "light",
          transition: Bounce,
        });
        return;
      }

      const response = await axios.get(
        `http://localhost:3001/tache/technicien?page=${currentPage}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      setTasks(response.data.results);
      setTotalPages(response.data.totalPages);
      
      // Calculer les statistiques
      const allTasks = response.data.results;
      const stats = {
        total: allTasks.length,
        aFaire: allTasks.filter(task => task.status === "À faire").length,
        enCours: allTasks.filter(task => task.status === "En cours").length,
        validees: allTasks.filter(task => task.status === "Validée").length,
        urgentes: allTasks.filter(task => task.priorite === "Urgente").length
      };
      setStats(stats);
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
      toast.error("Erreur lors de la récupération des tâches", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgente":
        return "bg-red-100 text-red-800";
      case "Haute":
        return "bg-orange-100 text-orange-800";
      case "Moyenne":
        return "bg-yellow-100 text-yellow-800";
      case "Basse":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Validée":
        return "bg-green-100 text-green-800";
      case "En cours":
        return "bg-blue-100 text-blue-800";
      case "À faire":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <MdAssignment className="text-blue-500 text-2xl mr-2" />
            <div>
              <p className="text-sm text-gray-500">Total Tâches</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <MdSchedule className="text-yellow-500 text-2xl mr-2" />
            <div>
              <p className="text-sm text-gray-500">À Faire</p>
              <p className="text-xl font-semibold">{stats.aFaire}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <MdWarning className="text-blue-500 text-2xl mr-2" />
            <div>
              <p className="text-sm text-gray-500">En Cours</p>
              <p className="text-xl font-semibold">{stats.enCours}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <MdCheckCircle className="text-green-500 text-2xl mr-2" />
            <div>
              <p className="text-sm text-gray-500">Validées</p>
              <p className="text-xl font-semibold">{stats.validees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <MdWarning className="text-red-500 text-2xl mr-2" />
            <div>
              <p className="text-sm text-gray-500">Urgentes</p>
              <p className="text-xl font-semibold">{stats.urgentes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Mes Tâches</h2>
        
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucune tâche assignée</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date limite
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {task.titre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{task.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priorite)}`}>
                          {task.priorite}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(task.deadline).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TechnicienTasks; 