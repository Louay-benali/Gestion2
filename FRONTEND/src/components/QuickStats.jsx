import React from "react";
import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";

const QuickStats = () => {
  const stats = [
    {
      title: "Maintenances en cours",
      value: "8",
      icon: <FiActivity className="w-6 h-6 text-blue-500" />,
      change: "+2.5%",
      changeType: "increase",
      subtitle: "From last month",
    },
    {
      title: "Pannes non résolues",
      value: "3",
      icon: <FiAlertCircle className="w-6 h-6 text-red-500" />,
      change: "-1.1%",
      changeType: "decrease",
      subtitle: "From last month",
    },
    {
      title: "Disponibilité machines",
      value: "92%",
      icon: <FiCheckCircle className="w-6 h-6 text-green-500" />,
      change: "+3.2%",
      changeType: "increase",
      subtitle: "From last month",
    },
    {
      title: "Maintenances prévues",
      value: "12",
      icon: <FiCalendar className="w-6 h-6 text-purple-500" />,
      change: "Cette semaine",
      changeType: "neutral",
      subtitle: "From last month",
    },
    {
      title: "KPI Maintenance",
      value: "87%",
      icon: <FiTrendingUp className="w-6 h-6 text-indigo-500" />,
      change: "+5.4%",
      changeType: "increase",
      subtitle: "From last month",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* First row - 3 cards */}
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base text-gray-600">{stats[0].title}</h3>
          {stats[0].icon}
        </div>
        <h3 className="text-3xl font-semibold text-gray-900">
          {stats[0].value}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-medium text-green-600">
            {stats[0].change}
          </span>
          <span className="text-sm text-gray-500">{stats[0].subtitle}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base text-gray-600">{stats[1].title}</h3>
          {stats[1].icon}
        </div>
        <h3 className="text-3xl font-semibold text-gray-900">
          {stats[1].value}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-medium text-red-600">
            {stats[1].change}
          </span>
          <span className="text-sm text-gray-500">{stats[1].subtitle}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base text-gray-600">{stats[2].title}</h3>
          {stats[2].icon}
        </div>
        <h3 className="text-3xl font-semibold text-gray-900">
          {stats[2].value}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-medium text-green-600">
            {stats[2].change}
          </span>
          <span className="text-sm text-gray-500">{stats[2].subtitle}</span>
        </div>
      </div>

      {/* Second row - 2 cards */}
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow md:col-span-1 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base text-gray-600">{stats[3].title}</h3>
          {stats[3].icon}
        </div>
        <h3 className="text-3xl font-semibold text-gray-900">
          {stats[3].value}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-medium text-gray-600">
            {stats[3].change}
          </span>
          <span className="text-sm text-gray-500">{stats[3].subtitle}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base text-gray-600">{stats[4].title}</h3>
          {stats[4].icon}
        </div>
        <h3 className="text-3xl font-semibold text-gray-900">
          {stats[4].value}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-medium text-green-600">
            {stats[4].change}
          </span>
          <span className="text-sm text-gray-500">{stats[4].subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
