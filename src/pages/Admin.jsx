import { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [matches, setMatches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [group, setGroup] = useState("A");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);

  const API =
    "https://script.google.com/macros/s/AKfycbxDD8G3NiMeM6NvGkXaJ7p0V3EP4R4UtWR3rgcvStKmIxBST8ENvCwtUSTtmRFBOawX/exec";

  // 🔥 Fetch Matches
  const fetchData = async () => {
    try {
      const res = await axios.get(API);
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 Filter by group
  useEffect(() => {
    const data = matches
      .filter((m) => m.matchId?.startsWith(group))
      .sort((a, b) => a.matchId.localeCompare(b.matchId));

    setFiltered(data);
    setSelectedMatch(null);
    setWinner("");
  }, [group, matches]);

  // 🔥 Update winner (FIXED ✅)
  const updateWinner = async () => {
    if (!selectedMatch || !winner) return;

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("matchId", selectedMatch.matchId);
      params.append("winner", winner);

      await axios.post(API, params);

      alert("✅ Winner Updated!");
      fetchData();
      setWinner("");
    } catch (err) {
      console.error(err);
      alert("❌ Error updating");
    }

    setLoading(false);
  };

  return (
    <div className="admin-container">
      <h1>⚙ Admin Panel</h1>

      {/* 🔥 GROUP SELECT */}
      <div className="section">
        <label>Select Group</label>
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="A">Group A</option>
          <option value="B">Group B</option>
          <option value="C">Group C</option>
          <option value="D">Group D</option>
        </select>
      </div>

      {/* 🔥 MATCH SELECT */}
      <div className="section">
        <label>Select Match</label>
        <select
          onChange={(e) => {
            const match = filtered.find(
              (m) => m.matchId === e.target.value
            );
            setSelectedMatch(match);
            setWinner(""); // reset winner on change
          }}
        >
          <option value="">-- Select Match --</option>
          {filtered.map((m) => (
            <option key={m.matchId} value={m.matchId}>
              {m.matchId} ({m.stage})
            </option>
          ))}
        </select>
      </div>

      {/* 🔥 MATCH DETAILS */}
      {selectedMatch && (
        <div className="card">
          <h3>{selectedMatch.matchId}</h3>

          <p>
            {selectedMatch.team1} vs {selectedMatch.team2}
            {selectedMatch.team3 &&
              selectedMatch.team3 !== "—" &&
              ` vs ${selectedMatch.team3}`}
          </p>

          <p>
            📍 {selectedMatch.venue} | ⏰ {selectedMatch.time}
          </p>

          <p>
            Current Winner:{" "}
            <b>{selectedMatch.winner || "TBD"}</b>
          </p>

          {/* 🔥 WINNER SELECT */}
          <select
            value={winner}
            onChange={(e) => setWinner(e.target.value)}
          >
            <option value="">-- Select Winner --</option>

            {selectedMatch.team1 !== "—" && (
              <option value={selectedMatch.team1}>
                {selectedMatch.team1}
              </option>
            )}

            {selectedMatch.team2 !== "—" && (
              <option value={selectedMatch.team2}>
                {selectedMatch.team2}
              </option>
            )}

            {selectedMatch.team3 &&
              selectedMatch.team3 !== "—" && (
                <option value={selectedMatch.team3}>
                  {selectedMatch.team3}
                </option>
              )}
          </select>

          <button
            onClick={updateWinner}
            disabled={!winner || loading}
            className="update-btn"
          >
            {loading ? "Updating..." : "Update Winner"}
          </button>
        </div>
      )}
    </div>
  );
}