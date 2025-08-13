import React, { useState, useEffect } from "react";
import axios from "axios";

function Profile({ token }) {
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.put("http://127.0.0.1:8000/api/profile/", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setSuccess("Profile updated!");
    } catch {
      setError("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div>
      <h2>Profile</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSave}>
        <label>
          Username:
          <input
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            style={{ display: "block", padding: 6, marginBottom: 10, width: "100%" }}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            style={{ display: "block", padding: 6, marginBottom: 10, width: "100%" }}
          />
        </label>
        <button type="submit" disabled={loading}>
          Save
        </button>
      </form>
    </div>
  );
}

export default Profile;
