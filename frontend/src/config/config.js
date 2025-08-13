// src/config/config.js

// Common colors used in charts/UI
export const COLORS = {
  primary: '#4A90E2',
  secondary: '#50E3C2',
  error: '#D0021B',
  warning: '#F5A623',
  info: '#9013FE',
  success: '#7ED321',
  grayLight: '#F0F0F0',
  grayDark: '#4A4A4A',
  // Add other brand colors or palette colors here
};

// Default chart options to be reused and extended in specific chart components
export const BASE_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 500,
    easing: 'easeInOutQuad',
  },
  legend: {
    display: true,
    position: 'bottom',
  },
  tooltips: {
    enabled: true,
    mode: 'index',
    intersect: false,
  },
  scales: {
    xAxes: [
      {
        gridLines: { display: false },
      },
    ],
    yAxes: [
      {
        ticks: { beginAtZero: true },
        gridLines: { color: '#eaeaea' },
      },
    ],
  },
};

// CSS animation class names used in various animated UI parts
export const ANIMATION_CLASSES = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  // Add your CSS classes or keyframe animation names here
};

// Icon mapping for various UI items or statuses
export const ICON_MAP = {
  timer: 'mdi-timer',
  work: 'mdi-briefcase',
  break: 'mdi-coffee',
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle',
  deadline: 'mdi-calendar-clock',
  insight: 'mdi-lightbulb-on-outline',
  activity: 'mdi-history',
  // Add other icon keys and values your project uses
};
