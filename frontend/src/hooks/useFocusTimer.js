// src/hooks/useFocusTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';

const WORK_DURATION = 25 * 60;  // 25 minutes in seconds
const BREAK_DURATION = 5 * 60;  // 5 minutes in seconds

const useFocusTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const timerRef = useRef(null);

  // Format seconds into mm:ss
  const formatTimerTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  // Start or resume the timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  // Pause the timer
  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    }
  };

  // Reset the timer to the current session type duration
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isWorkSession ? WORK_DURATION : BREAK_DURATION);
  };

  // Toggle between work and break session
  const toggleSession = () => {
    setIsWorkSession((prev) => !prev);
    setTimeLeft((prevSession) => (prevSession ? BREAK_DURATION : WORK_DURATION));
    setIsRunning(false);
  };

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          // Automatically toggle session when timer ends
          setIsWorkSession((prevSession) => {
            const nextSession = !prevSession;
            setTimeLeft(nextSession ? WORK_DURATION : BREAK_DURATION);
            return nextSession;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  return {
    isRunning,
    timeLeft,
    isWorkSession,
    formatTimerTime,
    startTimer,
    pauseTimer,
    resetTimer,
    toggleSession,
  };
};

export default useFocusTimer;
