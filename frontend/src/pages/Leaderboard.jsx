import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Leaderboard() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/user-skills/leaderboard")
      .then((res) => {
        setRankings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading leaderboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-20 text-blue-600 font-bold">Ranking the masters...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            GLOBAL LEADERBOARD
          </h1>
          <button 
            onClick={() => navigate("/dashboard")} 
            className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-full hover:bg-gray-700 transition font-bold text-sm"
          >
            ← Dashboard
          </button>
        </div>

        {/* Podium Section (Top 3) */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-12">
          {rankings.slice(0, 3).map((student, index) => {
            const isFirst = index === 0;
            return (
              <div 
                key={index} 
                className={`flex flex-col items-center p-6 rounded-2xl border-t-4 shadow-2xl transition-transform hover:scale-105 ${
                  isFirst ? "bg-gray-800 border-yellow-500 h-80 w-64 order-2" : 
                  index === 1 ? "bg-gray-800 border-gray-400 h-64 w-56 order-1" : 
                  "bg-gray-800 border-orange-600 h-56 w-56 order-3"
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 font-black ${
                  isFirst ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"
                }`}>
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold truncate w-full text-center">{student.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{student.completions} Skills Mastered</p>
                <div className="mt-auto bg-gray-900 w-full p-3 rounded-xl text-center">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Avg. Progress</span>
                  <p className="text-2xl font-black">{student.avgProgress}%</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* List Section (The rest) */}
        <div className="bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-750 border-b border-gray-700">
              <tr>
                <th className="p-5 text-xs font-black uppercase text-gray-500">Rank</th>
                <th className="p-5 text-xs font-black uppercase text-gray-500">Student</th>
                <th className="p-5 text-xs font-black uppercase text-gray-500 text-center">Completions</th>
                <th className="p-5 text-xs font-black uppercase text-gray-500 text-right">Avg. Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {rankings.map((student, index) => (
                <tr key={index} className="hover:bg-gray-750 transition group">
                  <td className="p-5 font-mono text-gray-500">#{index + 1}</td>
                  <td className="p-5 font-bold group-hover:text-blue-400 transition-colors">{student.name}</td>
                  <td className="p-5 text-center">
                    <span className="bg-gray-900 px-3 py-1 rounded-full text-xs font-black text-green-400">
                      {student.completions}
                    </span>
                  </td>
                  <td className="p-5 text-right font-black text-blue-400">{student.avgProgress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Leaderboard;