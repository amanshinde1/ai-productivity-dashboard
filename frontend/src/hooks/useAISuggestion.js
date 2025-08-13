// src/hooks/useAISuggestion.js
import { useState } from "react";
import { apiClient } from "../services/api";
import { mockSuggestions } from "../constants/aiSuggestions";

export default function useAISuggestion() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchSuggestion = async () => {
    setLoading(true);

    // If mock/demo mode (e.g. for recruiter, static deploy), skip backend and pick local tip
    if (process.env.REACT_APP_USE_MOCK === "true") {
      const randomTip = mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)];
      setData({
        suggestion: randomTip,
        message: "AI suggestions are not live in demo mode—but here’s a useful tip!"
      });
      setLoading(false);
      return;
    }

    // Otherwise—hit the backend for a real suggestion or fallback to backend demo logic
    try {
      const res = await apiClient.get("/ai-suggestion/");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch AI suggestion:", err);
      setData({
        suggestion: "Unable to fetch suggestion right now.",
        message: "Please try again later."
      });
    }
    setLoading(false);
  };

  return { loading, data, fetchSuggestion };
}
