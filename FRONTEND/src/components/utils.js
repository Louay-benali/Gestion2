/**
 * Utility functions for the Demandes components
 */

/**
 * Returns the appropriate color class based on the status
 * @param {string} status - The status of the request
 * @returns {string} - Tailwind CSS classes for the status badge
 */
export function getStatusColor(status) {
  switch (status) {
    case "en_attente":
      return "bg-yellow-100 text-yellow-800";
    case "validee":
      return "bg-green-100 text-green-800";
    case "rejetee":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Returns the display text for a status
 * @param {string} status - The status code
 * @returns {string} - Human-readable status text
 */
export function getStatusText(status) {
  switch (status) {
    case "en_attente":
      return "En attente";
    case "validee":
      return "Validée";
    case "rejetee":
      return "Rejetée";
    default:
      return "Inconnu";
  }
}

/**
 * Returns the appropriate color class based on the priority
 * @param {string} priority - The priority level
 * @returns {string} - Tailwind CSS classes for the priority badge
 */
export function getPriorityColor(priority) {
  switch (priority) {
    case "critique":
      return "bg-red-100 text-red-800";
    case "haute":
      return "bg-orange-100 text-orange-800";
    case "moyenne":
      return "bg-blue-100 text-blue-800";
    case "basse":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
