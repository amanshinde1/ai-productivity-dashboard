// src/components/ProjectsChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { COLORS, BASE_CHART_OPTIONS } from '../config/config';


const ProjectsChart = ({ projectsSummary }) => {
  if (!projectsSummary || projectsSummary.length === 0) return null;

  const labels = projectsSummary.map((item) => item.project);
  const dataValues = projectsSummary.map((item) => (item.duration ? Math.round(item.duration / 60) : 0));

  const colorPalette = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.success,
    COLORS.warning,
    COLORS.error,
    COLORS.info,
    '#FF9671',
    '#FFC75F',
    '#F9F871',
  ];

  const backgroundColors = labels.map((_, index) => colorPalette[index % colorPalette.length]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Minutes Spent',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    ...BASE_CHART_OPTIONS,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            maxTicksLimit: 6,
            stepSize: 15,
          },
          gridLines: {
            display: true,
            color: '#eee',
          },
        },
      ],
      xAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
    },
    legend: {
      display: false,
    },
  };

  return (
    <div className="projects-chart" style={{ height: '300px', maxWidth: '600px', margin: 'auto' }}>
      <h3>Time by Project</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ProjectsChart;
