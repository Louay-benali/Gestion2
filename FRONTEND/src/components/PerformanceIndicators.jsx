import { Clock, FileCheck, X } from "lucide-react";

export default function PerformanceIndicators({ demandes }) {
  const enAttente = demandes.filter((d) => d.statut === "en_attente").length;
  const critiques = demandes.filter(
    (d) => d.statut === "en_attente" && d.priorite === "critique"
  ).length;
  const validees = demandes.filter((d) => d.statut === "validee").length;
  const rejetees = demandes.filter((d) => d.statut === "rejetee").length;

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-blue-800">Demandes en attente</h3>
          <Clock className="h-5 w-5 text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-blue-800">{enAttente}</p>
        <p className="text-sm text-blue-600">{critiques} critiques</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-green-800">Demandes validées</h3>
          <FileCheck className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-green-800">{validees}</p>
        <p className="text-sm text-green-600">Cette semaine</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-red-800">Demandes rejetées</h3>
          <X className="h-5 w-5 text-red-500" />
        </div>
        <p className="text-2xl font-bold text-red-800">{rejetees}</p>
        <p className="text-sm text-red-600">Cette semaine</p>
      </div>
    </div>
  );
}
