import { Filter, Clock, Check, X } from "lucide-react";
import SearchInput from "./SearchInput";

export default function SearchAndFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
      <div className="flex items-center">
        <div className="relative">
          <SearchInput
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={`flex items-center px-3 py-1.5 rounded-md ${
            statusFilter === "tous"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setStatusFilter("tous")}
        >
          <Filter className="h-4 w-4 mr-1" />
          Toutes
        </button>
        <button
          className={`flex items-center px-3 py-1.5 rounded-md ${
            statusFilter === "en_attente"
              ? "bg-yellow-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setStatusFilter("en_attente")}
        >
          <Clock className="h-4 w-4 mr-1" />
          En attente
        </button>
        <button
          className={`flex items-center px-3 py-1.5 rounded-md ${
            statusFilter === "validee"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setStatusFilter("validee")}
        >
          <Check className="h-4 w-4 mr-1" />
          Validées
        </button>
        <button
          className={`flex items-center px-3 py-1.5 rounded-md ${
            statusFilter === "rejetee"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setStatusFilter("rejetee")}
        >
          <X className="h-4 w-4 mr-1" />
          Rejetées
        </button>
      </div>
    </div>
  );
}
