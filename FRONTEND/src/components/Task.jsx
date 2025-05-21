import React, { useState, useEffect } from "react";
import { MoreHorizontal, Calendar, MessageSquare } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const TaskBoard = () => {
  const [loading, setLoading] = useState(true);
  const [swimLanes, setSwimLanes] = useState({
    todo: { title: "To Do", tasks: [] },
    progress: { title: "In Progress", tasks: [] },
    completed: { title: "Completed", tasks: [] },
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "Non planifié";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const fetchTasks = async () => {
    try {
      const technicienId = Cookies.get("userId");
      const page = 1;
      const limit = 100; // Charger toutes les tâches
  
      const response = await axios.get(
        `http://localhost:3001/intervention/taches/${technicienId}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        }
      );
  
      const tasks = response.data.results;
  
      // Réinitialiser les tableaux de tâches
      const tasksByStatus = {
        todo: { title: "To Do", tasks: [] },
        progress: { title: "In Progress", tasks: [] },
        completed: { title: "Completed", tasks: [] },
      };
  
      // Mapper le statut du backend au statut frontend
      tasks.forEach((task) => {
        let status;
        switch (task.status) {
          case "Completé":
            status = "completed";
            break;
          case "En cours":
            status = "progress";
            break;
          case "Reporté":
          default:
            status = "todo";
            break;
        }
  
        tasksByStatus[status].tasks.push({
          id: task._id,
          title: task.description,
          date: formatDate(task.scheduledDate),
          status: task.status,
          priorite: task.priorite,
          machine: task.machine?.nomMachine || "Machine non spécifiée",
          type: task.type
        });
      });
  
      setSwimLanes(tasksByStatus);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
      toast.error("Erreur lors du chargement des tâches");
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Mapping du statut frontend au statut backend
      let backendStatus;
      switch (newStatus) {
        case "completed":
          backendStatus = "Completé";
          break;
        case "progress":
          backendStatus = "En cours";
          break;
        case "todo":
        default:
          backendStatus = "Reporté";
          break;
      }

      await axios.put(
        `http://localhost:3001/intervention/${taskId}`,
        { status: backendStatus },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        }
      );

      // Rafraîchir les tâches après la mise à jour
      fetchTasks();
      toast.success("Statut de la tâche mis à jour");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Échec de la mise à jour du statut");
    }
  };

  const handleDragStart = (e, taskId, currentStatus) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceStatus", currentStatus);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");
    
    if (sourceStatus !== targetStatus) {
      updateTaskStatus(taskId, targetStatus);
    }
  };

  const SwimLane = ({ title, tasks, type }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getBadgeStyle = () => {
      switch (type) {
        case "progress":
          return "bg-orange-100 text-orange-700";
        case "completed":
          return "bg-green-100 text-green-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    };

    return (
      <div 
        className="swim-lane flex flex-col gap-5 p-4 xl:p-6 bg-white border-r border-gray-200"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, type)}
      >
        <div className="mb-1 flex items-center justify-between">
          <h3 className="flex items-center gap-3 text-base font-medium text-gray-800">
            {title}
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getBadgeStyle()}`}
            >
              {tasks.length}
            </span>
          </h3>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              <MoreHorizontal size={20} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 z-40 w-32 rounded-lg border border-gray-200 bg-white p-2 shadow-md">
                <ul className="space-y-1">
                  <li className="text-sm text-gray-700 hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">
                    Trier
                  </li>
                  <li className="text-sm text-gray-700 hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">
                    Filtrer
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} laneType={type} />
          ))}
        </div>
      </div>
    );
  };

  const TaskItem = ({ task, laneType }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task.id, laneType)}
      className="task rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="w-full">
          <h4 className="mb-3 text-base text-gray-800 font-medium">
            {task.title}
          </h4>
          <p className="mb-3 text-sm text-gray-600">
            Machine: {task.machine}
            {task.type && <span className="ml-2">({task.type})</span>}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar size={16} />
              {task.date}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                task.priorite === "haute"
                  ? "bg-red-100 text-red-700"
                  : task.priorite === "moyenne"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {task.priorite}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <h1 className="pb-6 text-2xl font-bold text-gray-700 font-style">
        Mes Tâches Assignées
      </h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Chargement des tâches...</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <SwimLane
              title={swimLanes.todo.title}
              tasks={swimLanes.todo.tasks}
              type="todo"
            />
            <SwimLane
              title={swimLanes.progress.title}
              tasks={swimLanes.progress.tasks}
              type="progress"
            />
            <SwimLane
              title={swimLanes.completed.title}
              tasks={swimLanes.completed.tasks}
              type="completed"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;