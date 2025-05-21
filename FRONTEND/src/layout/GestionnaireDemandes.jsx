import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import SearchAndFilterBar from "../components/SearchAndFilterBar";
import DemandeModal from "../components/DemandeModal";
import DemandesTable from "../components/DemandesTable";
import PerformanceIndicators from "../components/PerformanceIndicators";

export default function GestionnaireDemandes() {
  // État pour les demandes
  const [demandes, setDemandes] = useState([]);
  const [filteredDemandes, setFilteredDemandes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [demandeSelectionnee, setDemandeSelectionnee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Simulation de données
  useEffect(() => {
    // Données fictives pour les demandes
    const demoData = [
      {
        id: 1,
        reference: "DEM-2025-001",
        date: "2025-04-28",
        demandeur: "Jean Dupont",
        pieces: ["Moteur P-45", "Filtre F-22"],
        statut: "en_attente",
        priorite: "haute",
        equipement: "Machine Alpha-X",
        description: "Remplacement urgent suite à une panne",
      },
      {
        id: 2,
        reference: "DEM-2025-002",
        date: "2025-04-27",
        demandeur: "Sophie Martin",
        pieces: ["Capteur C-11", "Cable E-33", "Joints J-15"],
        statut: "validee",
        priorite: "moyenne",
        equipement: "Système Beta-Y",
        description: "Maintenance préventive planifiée",
      },
      {
        id: 3,
        reference: "DEM-2025-003",
        date: "2025-04-25",
        demandeur: "Michel Lefebvre",
        pieces: ["Carte électronique CE-78"],
        statut: "rejetee",
        priorite: "basse",
        equipement: "Unité Delta-Z",
        description: "Mise à niveau recommandée",
      },
      {
        id: 4,
        reference: "DEM-2025-004",
        date: "2025-04-29",
        demandeur: "Isabelle Roux",
        pieces: ["Pompe P-56", "Valve V-23"],
        statut: "en_attente",
        priorite: "critique",
        equipement: "Système Hydraulique H-7",
        description: "Fuite détectée, intervention urgente nécessaire",
      },
    ];

    setDemandes(demoData);
    setFilteredDemandes(demoData);
  }, []);

  // Filtrer les demandes
  useEffect(() => {
    let filtered = [...demandes];

    // Appliquer le filtre de statut
    if (statusFilter !== "tous") {
      filtered = filtered.filter((demande) => demande.statut === statusFilter);
    }

    // Appliquer la recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (demande) =>
          demande.reference.toLowerCase().includes(query) ||
          demande.demandeur.toLowerCase().includes(query) ||
          demande.equipement.toLowerCase().includes(query) ||
          demande.pieces.some((piece) => piece.toLowerCase().includes(query))
      );
    }

    setFilteredDemandes(filtered);
  }, [statusFilter, searchQuery, demandes]);

  // Gérer la validation ou le rejet d'une demande
  const handleValidation = (id, isApproved) => {
    const updatedDemandes = demandes.map((demande) => {
      if (demande.id === id) {
        return {
          ...demande,
          statut: isApproved ? "validee" : "rejetee",
        };
      }
      return demande;
    });

    setDemandes(updatedDemandes);
    setIsModalOpen(false);
    setDemandeSelectionnee(null);
  };

  // Ouvrir le modal de détails
  const openDemandeDetails = (demande) => {
    setDemandeSelectionnee(demande);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-full mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Gérer les demandes et validations
        </h1>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          <span>Dernière mise à jour: 30 avril 2025 à 10:45</span>
        </div>
      </div>

      {/* Composant pour la recherche et les filtres */}
      <SearchAndFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Composant pour le tableau des demandes */}
      <DemandesTable
        demandes={filteredDemandes}
        openDemandeDetails={openDemandeDetails}
        handleValidation={handleValidation}
      />

      {/* Composant pour le modal de détails */}
      {isModalOpen && demandeSelectionnee && (
        <DemandeModal
          demande={demandeSelectionnee}
          onClose={() => setIsModalOpen(false)}
          onValidation={handleValidation}
        />
      )}

      {/* Composant pour les indicateurs de performance */}
      <PerformanceIndicators demandes={demandes} />
    </div>
  );
}
