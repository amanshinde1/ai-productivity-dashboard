// src/components/DailySummaryChart.js


import React from 'react';
import { Bar } from 'react-chartjs-2';
import { BASE_CHART_OPTIONS, COLORS } from '../config/config';

/**
 * DailySummaryChart renders a bar chart visualizing the daily summary focus time.
 * @param {object} props
 * @param {object} props.dailySummary - Object with focus work, breaks, meetingTime data
 */
const DailySummaryChart = ({ dailySummary }) => {
  if (!dailySummary) return null;

  const { focusWork = { hours: 0, minutes: 0 }, breaks = { hours: 0, minutes: 0 }, meetingTime = { hours: 0, minutes: 0 } } = dailySummary;

  // Convert each time object into minutes for chart data
  const focusWorkMinutes = focusWork.hours * 60 + focusWork.minutes;
  const breakMinutes = breaks.hours * 60 + breaks.minutes;
  const meetingMinutes = meetingTime.hours * 60 + meetingTime.minutes;

  const data = {
    labels: ['Focus Work', 'Breaks', 'Meeting'],
    datasets: [
      {
        label: 'Minutes',
        data: [focusWorkMinutes, breakMinutes, meetingMinutes],
        backgroundColor: [COLORS.primary, COLORS.warning, COLORS.secondary],
        borderRadius: 4,
        barPercentage: 0.5,
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
    <div className="daily-summary-chart" style={{ height: '250px' }}>
      <h3>Daily Summary</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default DailySummaryChart;

