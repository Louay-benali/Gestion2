import React from "react";
import Chart from "react-apexcharts";

const RevenueCard = () => {
  const radialOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -100,
        endAngle: 100,
        hollow: {
          size: "65%",
        },
        track: {
          background: "#F0F0F0",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "28px",
            fontWeight: 600,
            color: "#1F2937",
          },
          total: {
            show: true,
            label: "June Goals",
            fontSize: "14px",
            fontWeight: 500,
            color: "#6B7280",
            formatter: () => "", // Required to make it render
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#2563EB"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["June Goals"],
    legend: {
      show: false,
    },
  };

  const radialSeries = [90];

  const stats = [
    { label: "Marketing", value: "$30,569.00", progress: 85 },
    { label: "Sales", value: "$20,486.00", progress: 55 },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-full w-full">
      <h3 className="text-lg font-semibold text-gray-800">Estimated Revenue</h3>
      <p className="text-sm text-gray-500 mt-1">
        Target you've set for each month
      </p>

      <div className="mt-6 flex items-center justify-center">
        <div className="w-[240px]">
          <Chart
            options={radialOptions}
            series={radialSeries}
            type="radialBar"
            height={200}
          />
        </div>
      </div>

      <div className="border-t border-gray-300 mt-6 space-y-5 pt-6">
        {stats.map((item) => (
          <div key={item.label}>
            <p className="mb-2 text-sm text-gray-500">{item.label}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-base font-sans font-bold text-gray-800">
                  {item.value}
                </p>
              </div>
              <div className="flex w-full max-w-[140px] items-center gap-3">
                <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200">
                  <div
                    className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-blue-600 text-xs font-medium text-white transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {item.progress}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueCard;
