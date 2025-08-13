import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaRobot, FaSyncAlt } from "react-icons/fa";

const API_URL = "http://127.0.0.1:8000/api";

function AiSuggestion({ token }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSuggestions = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      // Replace with your actual AI suggestion endpoint
      const res = await axios.get(`${API_URL}/suggest-task/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      setError("Failed to fetch AI suggestions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [token]);

  return (
    <div className="ai-suggestion-card">
      <div className="ai-suggestion-header">
        <FaRobot size={24} color="#00bcd4" />
        <h3>AI Task Suggestions</h3>
        <button
          onClick={fetchSuggestions}
          className="button button-secondary refresh-button"
          disabled={loading}
          title="Refresh Suggestions"
        >
          <FaSyncAlt />
        </button>
      </div>

      {loading && <p className="loading-text">Generating suggestions...</p>}

      {error && <p className="error-text">{error}</p>}

      {!loading && !error && suggestions.length === 0 && (
        <p>No suggestions available. Add or complete tasks to get recommendations.</p>
      )}

      <ul className="suggestions-list">
        {suggestions.map((suggestion, i) => (
          <li key={i} className="suggestion-item">
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AiSuggestion;
