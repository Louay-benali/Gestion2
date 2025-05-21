// Couleur selon le statut
export const getStatusColor = (statut) => {
  switch (statut) {
    case "en_attente":
      return "bg-yellow-100 text-yellow-800";
    case "validee":
      return "bg-green-100 text-green-800";
    case "rejetee":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Texte du statut
export const getStatusText = (statut) => {
  switch (statut) {
    case "en_attente":
      return "En attente";
    case "validee":
      return "Validée";
    case "rejetee":
      return "Rejetée";
    default:
      return statut;
  }
};

// Couleur selon la priorité
export const getPriorityColor = (priorite) => {
  switch (priorite) {
    case "critique":
      return "bg-red-100 text-red-800";
    case "haute":
      return "bg-orange-100 text-orange-800";
    case "moyenne":
      return "bg-blue-100 text-blue-800";
    case "basse":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
    