// src/components/FocusedWorkingMode.js
import React from 'react';

const FocusedWorkingMode = ({
  isRunning,
  timeLeft,
  isWorkSession,
  formatTimerTime,
  onStart,
  onPause,
  onReset,
  onToggleSession,
}) => {
  return (
    <section className="focused-working-mode">
      <h2>{isWorkSession ? 'Focus Time' : 'Break Time'}</h2>
      <div className="timer-display" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {formatTimerTime(timeLeft)}
      </div>
      <div className="timer-controls">
        {isRunning ? (
          <button onClick={onPause} aria-label="Pause Timer">
            Pause
          </button>
        ) : (
          <button onClick={onStart} aria-label="Start Timer">
            Start
          </button>
        )}
        <button onClick={onReset} aria-label="Reset Timer">
          Reset
        </button>
        <button onClick={onToggleSession} aria-label="Toggle Session">
          Switch to {isWorkSession ? 'Break' : 'Focus'}
        </button>
      </div>
    </section>
  );
};

export default FocusedWorkingMode;
