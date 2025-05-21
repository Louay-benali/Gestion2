import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const StatisticsSection = () => {
  const [timeframe, setTimeframe] = useState("Monthly");

  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Interventions Réalisées",
        data: [180, 190, 180, 160, 180, 175, 180, 220, 230, 215, 230, 225],
        borderColor: "rgb(66, 133, 244)",
        backgroundColor: "rgba(66, 133, 244, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Pannes Déclarées",
        data: [40, 35, 45, 40, 50, 45, 85, 90, 100, 120, 140, 135],
        borderColor: "rgba(189, 189, 189, 0.8)",
        backgroundColor: "rgba(189, 189, 189, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "white",
        titleColor: "#333",
        bodyColor: "#666",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          title: () => null,
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: "#6b7280",
        },
        border: {
          display: false,
        },
      },
      y: {
        min: 0,
        max: 250,
        ticks: {
          stepSize: 50,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
          color: "#6b7280",
          padding: 8,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col shadow-sm h-full w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Statistiques</h2>
          <p className="text-xs text-gray-500">
            Suivi mensuel des interventions
          </p>
        </div>

        <div className="flex bg-gray-50 rounded-lg p-1">
          {["Monthly", "Quarterly", "Annually"].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                timeframe === period
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {period === "Monthly"
                ? "Mensuel"
                : period === "Quarterly"
                ? "Trimestriel"
                : "Annuel"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-900">156</span>
            <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded">
              +23.2%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Interventions Moyennes / Mois
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-900">42</span>
            <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">
              -12.3%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Pannes Moyennes / Mois</p>
        </div>
      </div>

      <div className="flex-1 h-[250px] min-h-[250px] w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StatisticsSection;
