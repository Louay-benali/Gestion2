import React, { useState, useEffect } from "react";
import {
  FaFileDownload,
  FaChartBar,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import { MdCompare } from "react-icons/md";

const RapportGeneral = () => {
  const [periodeRapport, setPeriodeRapport] = useState("mois");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [pannesRecurrentes, setPannesRecurrentes] = useState([]);
  const [comparaisonInterventions, setComparaisonInterventions] = useState([]);
  const [activeTab, setActiveTab] = useState("rapport");
  const [formatExport, setFormatExport] = useState("pdf");

  // Charger les données dès le montage du composant
  useEffect(() => {
    // Simuler le chargement des données
    setPannesRecurrentes([
      {
        type: "Panne moteur",
        occurences: 12,
        coutMoyen: 350,
        delaiMoyen: 48,
      },
      {
        type: "Fuite hydraulique",
        occurences: 8,
        coutMoyen: 220,
        delaiMoyen: 24,
      },
      {
        type: "Défaillance électronique",
        occurences: 15,
        coutMoyen: 180,
        delaiMoyen: 36,
      },
      {
        type: "Problème de transmission",
        occurences: 6,
        coutMoyen: 420,
        delaiMoyen: 72,
      },
      {
        type: "Usure prématurée",
        occurences: 9,
        coutMoyen: 150,
        delaiMoyen: 18,
      },
    ]);

    setComparaisonInterventions([
      {
        technicien: "Jean Dupont",
        interventionsTotal: 45,
        delaiMoyen: 28,
        coutMoyen: 275,
        tauxReussite: 96,
      },
      {
        technicien: "Marie Lambert",
        interventionsTotal: 38,
        delaiMoyen: 24,
        coutMoyen: 310,
        tauxReussite: 98,
      },
      {
        technicien: "Ahmed Benali",
        interventionsTotal: 52,
        delaiMoyen: 32,
        coutMoyen: 240,
        tauxReussite: 94,
      },
      {
        technicien: "Sophie Martin",
        interventionsTotal: 40,
        delaiMoyen: 26,
        coutMoyen: 290,
        tauxReussite: 95,
      },
    ]);
  }, []);

  const handleFilterChange = () => {
    // Cette fonction peut être utilisée pour actualiser les données
    // en fonction de la période sélectionnée
    if (
      (periodeRapport === "personnalise" && (!dateDebut || !dateFin)) ||
      (periodeRapport === "personnalise" &&
        new Date(dateDebut) > new Date(dateFin))
    ) {
      alert("Veuillez sélectionner des dates valides");
      return;
    }

    // Ici on pourrait recharger les données en fonction du filtre
    console.log("Filtrage appliqué: ", periodeRapport);
  };

  const handleExportRapport = () => {
    // Simulation d'export de rapport
    alert(`Rapport exporté au format ${formatExport.toUpperCase()}`);
  };

  const renderTabs = () => (
    <div className="mb-6">
      <div className="flex border-b border-gray-300">
        <button
          className={`px-4 py-2 font-style ${
            activeTab === "rapport"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("rapport")}
        >
          Rapport périodique
        </button>
        <button
          className={`px-4 py-2 font-style ${
            activeTab === "pannes"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("pannes")}
        >
          Pannes récurrentes
        </button>
        <button
          className={`px-4 py-2 font-style ${
            activeTab === "comparaison"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("comparaison")}
        >
          Comparaison des interventions
        </button>
      </div>
    </div>
  );

  const renderFilterControls = () => (
    <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-style text-gray-700 mb-2">
            Période
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={periodeRapport}
            onChange={(e) => setPeriodeRapport(e.target.value)}
          >
            <option value="semaine">Dernière semaine</option>
            <option value="mois">Dernier mois</option>
            <option value="trimestre">Dernier trimestre</option>
            <option value="annee">Dernière année</option>
            <option value="personnalise">Période personnalisée</option>
          </select>
        </div>

        {periodeRapport === "personnalise" && (
          <>
            <div>
              <label className="block text-sm font-style text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-style text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </>
        )}

        <div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 w-full"
            onClick={handleFilterChange}
          >
            <FaChartBar /> Appliquer
          </button>
        </div>
      </div>
    </div>
  );

  const renderRapportContent = () => (
    <div className="bg-white p-6 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Rapport d'activité -{" "}
          {periodeRapport === "personnalise"
            ? `Du ${dateDebut} au ${dateFin}`
            : getPeriodeLabel()}
        </h2>
        <div className="flex items-center gap-2">
          <select
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={formatExport}
            onChange={(e) => setFormatExport(e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            onClick={handleExportRapport}
          >
            <FaFileDownload /> Exporter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <FaCalendarAlt className="text-blue-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">Total interventions</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">175</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-full">
              <FaExclamationTriangle className="text-yellow-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">Pannes critiques</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600">23</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-full">
              <FaClock className="text-green-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">Délai moyen (h)</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">27.5</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-full">
              <FaMoneyBillWave className="text-purple-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">Coût moyen (€)</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">285</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3 text-gray-800">
            Top 5 des pannes récurrentes
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left">Type de panne</th>
                  <th className="py-2 px-3 text-center">Occurrences</th>
                </tr>
              </thead>
              <tbody>
                {pannesRecurrentes.map((panne, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="py-2 px-3">{panne.type}</td>
                    <td className="py-2 px-3 text-center">
                      {panne.occurences}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3 text-gray-800">
            Statistiques par technicien
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left">Technicien</th>
                  <th className="py-2 px-3 text-center">Interventions</th>
                  <th className="py-2 px-3 text-center">Délai moy. (h)</th>
                </tr>
              </thead>
              <tbody>
                {comparaisonInterventions.map((tech, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="py-2 px-3">{tech.technicien}</td>
                    <td className="py-2 px-3 text-center">
                      {tech.interventionsTotal}
                    </td>
                    <td className="py-2 px-3 text-center">{tech.delaiMoyen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPannesRecurrentes = () => (
    <div className="bg-white p-6 ">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Analyse des pannes récurrentes
      </h2>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-600" /> Points
          d'attention
        </h3>
        <p className="text-gray-700">
          Les pannes suivantes montrent une récurrence significative et méritent
          une attention particulière. Une maintenance préventive ciblée est
          recommandée pour réduire leur fréquence.
        </p>
      </div>

      <div className="overflow-x-auto border border-gray-200 mb-6 rounded-2xl">
        <table className="min-w-full bg-white ">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">
                Type de panne
              </th>
              <th className="py-3 px-4 border-b border-gray-200 text-center text-gray-600">
                Occurrences
              </th>
              <th className="py-3 px-4 border-b border-gray-200 text-center text-gray-600">
                Coût moyen (€)
              </th>
              <th className="py-3 px-4 border-b border-gray-200 text-center text-gray-600">
                Délai moyen (h)
              </th>
              <th className="py-3 px-4 border-b border-gray-200 text-center text-gray-600">
                Tendance
              </th>
            </tr>
          </thead>
          <tbody>
            {pannesRecurrentes.map((panne, index) => (
              <tr
                key={index}
                className={
                  panne.occurences > 10
                    ? "bg-gray-50"
                    : index % 2 === 0
                    ? "bg-gray-50"
                    : ""
                }
              >
                <td className="py-3 px-4 border-b border-gray-200 font-style">
                  {panne.type}
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  {panne.occurences}
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  {panne.coutMoyen}
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  {panne.delaiMoyen}
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  {index % 2 === 0 ? (
                    <span className="text-red-500">↑ +8%</span>
                  ) : (
                    <span className="text-green-500">↓ -5%</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3 text-gray-800">
            Distribution par machine
          </h3>
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">
              Graphique de distribution des pannes par machine
            </p>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3 text-gray-800">
            Évolution temporelle
          </h3>
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">
              Graphique d'évolution des pannes dans le temps
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComparaisonInterventions = () => (
    <div className="bg-white p-6 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Comparaison des délais et coûts d'intervention
        </h2>
        <div>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            onClick={handleExportRapport}
          >
            <FaFileDownload /> Exporter cette analyse
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <MdCompare className="text-blue-600" size={20} /> Analyse comparative
        </h3>
        <p className="text-gray-700">
          Ce tableau compare les performances des techniciens en termes de
          délais moyens d'intervention, coûts associés et taux de réussite des
          réparations.
        </p>
      </div>

      <div className="overflow-x-auto border border-gray-200 mb-6 rounded-2xl">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">
                Technicien
              </th>
              <th className="py-3 px-4 border-b border-gray-200 text-center text-gray-600">
                Interventions totales
              </th>
              <th className="py-3 px-4 border-b border-gray-200 text-center text-gray-600">
                Délai moyen (h)
              </th>
              <th className="py-3 px-4 border-b border-gray-200 text-center text-gray-600">
                Coût moyen (€)
              </th>
              <th className="py-3 px-4 border-b border-gray-200 text-center text-gray-600">
                Taux de réussite (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {comparaisonInterventions.map((tech, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="py-3 px-4 border-b border-gray-200 text-gray-800">
                  {tech.technicien}
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center text-gray-800">
                  {tech.interventionsTotal}
                </td>
                <td
                  className={`py-3 px-4 border-b border-gray-200 text-center `}
                >
                  {tech.delaiMoyen}
                </td>
                <td
                  className={`py-3 px-4 border-b border-gray-200 text-center ${
                    tech.coutMoyen < 250
                      ? "text-green-600 font-semibold"
                      : tech.coutMoyen > 300
                      ? "text-red-600 font-semibold"
                      : "text-green-600 font-semibold"
                  }`}
                >
                  {tech.coutMoyen}
                </td>
                <td
                  className={`py-3 px-4 border-b border-gray-200 text-center ${
                    tech.tauxReussite > 95
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }`}
                >
                  {tech.tauxReussite}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3 text-gray-800">
            Comparaison des délais
          </h3>
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">
              Graphique de comparaison des délais d'intervention
            </p>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3 text-gray-800">
            Comparaison des coûts
          </h3>
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">
              Graphique de comparaison des coûts d'intervention
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Fonction utilitaire pour obtenir le libellé de la période
  const getPeriodeLabel = () => {
    switch (periodeRapport) {
      case "semaine":
        return "Dernière semaine";
      case "mois":
        return "Dernier mois";
      case "trimestre":
        return "Dernier trimestre";
      case "annee":
        return "Dernière année";
      default:
        return "";
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6 pl-6 pt-6 text-gray-800">
        Analyse et Rapports
      </h1>

      {/* Filtre intégré directement dans la vue du rapport */}
      {renderFilterControls()}

      {/* Navigation par onglets */}
      {renderTabs()}

      {/* Contenu des onglets */}
      {activeTab === "rapport" && renderRapportContent()}
      {activeTab === "pannes" && renderPannesRecurrentes()}
      {activeTab === "comparaison" && renderComparaisonInterventions()}
    </div>
  );
};

export default RapportGeneral;
