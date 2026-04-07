import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const API =
    "https://script.google.com/macros/s/AKfycbxDD8G3NiMeM6NvGkXaJ7p0V3EP4R4UtWR3rgcvStKmIxBST8ENvCwtUSTtmRFBOawX/exec";

  // 🔥 FETCH DATA (WITH CACHE SAVE)
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);

      setMatches(res.data);
      setLastUpdate(Date.now());

      // 🔥 SAVE CACHE
      localStorage.setItem("matches_cache", JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOAD FROM CACHE FIRST (INSTANT LOAD)
  useEffect(() => {
    const cached = localStorage.getItem("matches_cache");

    if (cached) {
      setMatches(JSON.parse(cached));
      setLoading(false);
    }

    fetchData();

    // 🔥 REDUCED API CALLS (10 sec)
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 LIVE CLOCK
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const groups = ["A", "B", "C", "D"];

  const matchMap = {};
  matches.forEach((m) => {
    const key = m.matchId?.split("-")[1];
    if (key) matchMap[key] = m;
  });

  const resolveTeam = (team) => {
    if (!team) return "";

    if (team.startsWith("Winner")) {
      const id = team.split(" ")[1];
      return matchMap[id]?.winner || team;
    }

    if (team.startsWith("Loser")) {
      const id = team.split(" ")[1];
      const match = matchMap[id];

      if (!match || !match.winner) return team;

      const teams = [match.team1, match.team2, match.team3].filter(
        (t) => t && t !== "—"
      );

      return teams.find((t) => t !== match.winner) || team;
    }

    return team;
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    return new Date(`1970/01/01 ${timeStr}`);
  };

  const getGroupMatches = (group) =>
    matches
      .filter((m) => m.matchId?.startsWith(group))
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));

  const currentMatch = matches.find((m) => {
    const t = parseTime(m.time);
    if (!t) return false;
    return Math.abs(currentTime - t) < 5 * 60 * 1000;
  });

  const nextMatch = matches
    .map((m) => ({ ...m, t: parseTime(m.time) }))
    .filter((m) => m.t && m.t > currentTime)
    .sort((a, b) => a.t - b.t)[0];

  const getCountdown = () => {
    if (!nextMatch) return "";
    const diff = nextMatch.t - currentTime;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const getQualified = (group) => {
    const groupMatches = matches.filter((m) =>
      m.matchId?.startsWith(group)
    );

    if (group === "D") {
      const m3 = groupMatches.find((m) => m.matchId === "D-M3");
      const m6 = groupMatches.find((m) => m.matchId === "D-M6");

      return {
        first: m3?.winner,
        second: m6?.winner,
      };
    }

    const m7 = groupMatches.find((m) => m.matchId?.includes("M7"));
    const m10 = groupMatches.find((m) => m.matchId?.includes("M10"));

    return {
      first: m7?.winner,
      second: m10?.winner,
    };
  };

  // 🔥 KNOCKOUT MATCHES
  const knockoutIds = [
    "QF1","QF2","QF3","QF4",
    "SF1","SF2",
    "FINAL","THIRD"
  ];

  const knockoutMatches = knockoutIds
    .map((id) => matches.find((m) => m.matchId === id))
    .filter(Boolean);

  return (
    <div className="container">
      <h1>🏆 Live Tournament</h1>

      {/* 🔥 LOADING */}
      {loading && <div className="loading">Loading...</div>}

      <p className="update-time">
        🔄 Last Updated: {new Date(lastUpdate).toLocaleTimeString()}
      </p>

      {currentMatch && (
        <div className="live-banner">
          🔴 LIVE: {resolveTeam(currentMatch.team1)} vs{" "}
          {resolveTeam(currentMatch.team2)}
        </div>
      )}

      {nextMatch && (
        <div className="countdown">
          ⏱ Next Match in: {getCountdown()}
        </div>
      )}

      {/* 🔥 GROUPS */}
      {groups.map((g) => {
        const groupMatches = getGroupMatches(g);
        const q = getQualified(g);

        return (
          <div key={g} className="group">
            <h2>Group {g}</h2>

            <div className="qualifiers">
              🥇 {q.first || "TBD"} &nbsp;&nbsp;
              🥈 {q.second || "TBD"}
            </div>

            {groupMatches.map((m, i) => {
              const t1 = resolveTeam(m.team1);
              const t2 = resolveTeam(m.team2);
              const t3 = resolveTeam(m.team3);

              return (
                <div
                  className={`card ${
                    currentMatch?.matchId === m.matchId ? "live" : ""
                  }`}
                  key={i}
                >
                  <div className="top">
                    <span>{m.matchId}</span>
                    <span>{m.time}</span>
                  </div>

                  <div className="teams">
                    <div className={m.winner === t1 ? "winner glow" : ""}>
                      {t1}
                    </div>

                    <div className="vs">vs</div>

                    <div className={m.winner === t2 ? "winner glow" : ""}>
                      {t2}
                    </div>

                    {t3 && t3 !== "—" && (
                      <>
                        <div className="vs">vs</div>
                        <div className={m.winner === t3 ? "winner glow" : ""}>
                          {t3}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bottom">
                    <span>📍 {m.venue}</span>
                    <span className="result">
                      🏆 {m.winner || "TBD"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* 🔥 KNOCKOUT SECTION */}
      <div className="group">
        <h2>🏆 Knockouts</h2>

        {knockoutMatches.map((m, i) => {
          const t1 = resolveTeam(m.team1);
          const t2 = resolveTeam(m.team2);

          return (
            <div className="card" key={i}>
              <div className="top">
                <span>{m.matchId} ({m.stage})</span>
                <span>{m.time}</span>
              </div>

              <div className="teams">
                <div className={m.winner === t1 ? "winner glow" : ""}>
                  {t1}
                </div>

                <div className="vs">vs</div>

                <div className={m.winner === t2 ? "winner glow" : ""}>
                  {t2}
                </div>
              </div>

              <div className="bottom">
                <span>📍 {m.venue}</span>
                <span className="result">
                  🏆 {m.winner || "TBD"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
