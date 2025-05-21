import { X, Check } from "lucide-react";
import { getStatusColor, getStatusText, getPriorityColor } from "./utils";

export default function DemandeModal({ demande, onClose, onValidation }) {
  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl border border-gray-300 max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Détails de la demande {demande.reference}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Date de demande</p>
            <p className="font-medium">{demande.date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Statut</p>
            <p
              className={`inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(
                demande.statut
              )}`}
            >
              {getStatusText(demande.statut)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Demandeur</p>
            <p className="font-medium">{demande.demandeur}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Priorité</p>
            <p
              className={`inline-block px-2 py-1 rounded-full text-sm ${getPriorityColor(
                demande.priorite
              )}`}
            >
              {demande.priorite.charAt(0).toUpperCase() +
                demande.priorite.slice(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Équipement</p>
            <p className="font-medium">{demande.equipement}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <p className="bg-gray-50 p-3 rounded-md">{demande.description}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Pièces demandées</p>
          <ul className="bg-gray-50 p-3 rounded-md">
            {demande.pieces.map((piece, index) => (
              <li key={index} className="flex items-center py-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {piece}
              </li>
            ))}
          </ul>
        </div>

        {demande.statut === "en_attente" && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => onValidation(demande.id, false)}
              className="px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded-md flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Rejeter
            </button>
            <button
              onClick={() => onValidation(demande.id, true)}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md flex items-center"
            >
              <Check className="h-4 w-4 mr-1" />
              Valider
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
