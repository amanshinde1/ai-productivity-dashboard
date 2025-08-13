// src/components/CategoriesChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { COLORS, BASE_CHART_OPTIONS } from '../config/config';

/**
 * CategoriesChart renders a pie chart showing time distribution among categories.
 * @param {object} props
 * @param {Array} props.categoriesSummary - Array of objects with category and duration{seconds or minutes}
 */
const CategoriesChart = ({ categoriesSummary }) => {
  if (!categoriesSummary || categoriesSummary.length === 0) return null;

  // Extract labels and data
  const labels = categoriesSummary.map((item) => item.category);
  // Assuming duration is in seconds, convert to minutes for display
  const dataValues = categoriesSummary.map((item) => (item.duration ? Math.round(item.duration / 60) : 0));

  // Generate colors dynamically, loop through COLORS or use a fallback color palette
  const colorPalette = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.success,
    COLORS.warning,
    COLORS.error,
    COLORS.info,
    '#845EC2',
    '#D65DB1',
    '#FF6F91',
  ];

  const backgroundColors = labels.map((_, index) => colorPalette[index % colorPalette.length]);

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    ...BASE_CHART_OPTIONS,
    legend: {
      display: true,
      position: 'right',
      labels: {
        boxWidth: 12,
        padding: 8,
      },
    },
    tooltips: {
      enabled: true,
      callbacks: {
        label: function (tooltipItem, chartData) {
          const label = chartData.labels[tooltipItem.index] || '';
          const value = chartData.datasets[0].data[tooltipItem.index] || 0;
          return `${label}: ${value} min`;
        },
      },
    },
  };

  return (
    <div className="categories-chart" style={{ maxWidth: '400px', margin: 'auto' }}>
      <h3>Time by Category</h3>
      <Pie data={data} options={options} />
    </div>
  );
};

export default CategoriesChart;
