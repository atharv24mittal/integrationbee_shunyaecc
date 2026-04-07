import { useEffect, useState } from "react";
import axios from "axios";

export default function Bracket() {
  const [matches, setMatches] = useState([]);

  const API =
    "https://script.google.com/macros/s/AKfycbxDD8G3NiMeM6NvGkXaJ7p0V3EP4R4UtWR3rgcvStKmIxBST8ENvCwtUSTtmRFBOawX/exec";

  useEffect(() => {
    axios.get(API).then((res) => setMatches(res.data));
  }, []);

  // 🔥 QUALIFIERS (FIXED)
  const getQualified = (group) => {
    const groupMatches = matches.filter((m) =>
      m.matchId?.startsWith(group)
    );

    // 🔴 GROUP D FIX
    if (group === "D") {
      const m3 = groupMatches.find((m) => m.matchId === "D-M3");
      const m6 = groupMatches.find((m) => m.matchId === "D-M6");

      return {
        first: m3?.winner || "TBD",
        second: m6?.winner || "TBD",
      };
    }

    const m7 = groupMatches.find((m) => m.matchId?.includes("M7"));
    const m10 = groupMatches.find((m) => m.matchId?.includes("M10"));

    return {
      first: m7?.winner || "TBD",
      second: m10?.winner || "TBD",
    };
  };

  const A = getQualified("A");
  const B = getQualified("B");
  const C = getQualified("C");
  const D = getQualified("D");

  // 🔥 QUARTER FINALS (AUTO GENERATED)
  const QF1 = { t1: A.first, t2: B.second };
  const QF2 = { t1: A.second, t2: B.first };
  const QF3 = { t1: C.first, t2: D.second };
  const QF4 = { t1: C.second, t2: D.first };

  // 🔥 SEMI FINALS (PLACEHOLDER FLOW)
  const SF1 = {
    t1: QF1.t1 && QF1.t2 ? `${QF1.t1} / ${QF1.t2}` : "TBD",
    t2: QF4.t1 && QF4.t2 ? `${QF4.t1} / ${QF4.t2}` : "TBD",
  };

  const SF2 = {
    t1: QF2.t1 && QF2.t2 ? `${QF2.t1} / ${QF2.t2}` : "TBD",
    t2: QF3.t1 && QF3.t2 ? `${QF3.t1} / ${QF3.t2}` : "TBD",
  };

  // 🔥 FINAL
  const FINAL = {
    t1: SF1.t1 !== "TBD" ? "Winner SF1" : "TBD",
    t2: SF2.t1 !== "TBD" ? "Winner SF2" : "TBD",
  };

  return (
    <div className="bracket-container">
      <h1>🏆 Knockout Stage</h1>

      <div className="bracket">

        {/* 🔥 QUARTER FINALS */}
        <div className="round">
          <h2>Quarter Finals</h2>

          <div className="match">{QF1.t1} vs {QF1.t2}</div>
          <div className="match">{QF2.t1} vs {QF2.t2}</div>
          <div className="match">{QF3.t1} vs {QF3.t2}</div>
          <div className="match">{QF4.t1} vs {QF4.t2}</div>
        </div>

        {/* 🔥 SEMI FINALS */}
        <div className="round">
          <h2>Semi Finals</h2>

          <div className="match">{SF1.t1} vs {SF1.t2}</div>
          <div className="match">{SF2.t1} vs {SF2.t2}</div>
        </div>

        {/* 🔥 FINAL */}
        <div className="round">
          <h2>Final</h2>

          <div className="match final">
            {FINAL.t1} vs {FINAL.t2}
          </div>
        </div>
      </div>
    </div>
  );
}