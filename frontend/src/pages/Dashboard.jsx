import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [enrolledSkills, setEnrolledSkills] = useState([]);
  const [stats, setStats] = useState(null); // ✅ NEW: Stats state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchMySkills();
    fetchStats(); // ✅ NEW: Fetch stats on load
  }, []);

  const fetchMySkills = async () => {
    try {
      const res = await api.get("/user-skills/me");
      setEnrolledSkills(res.data);
    } catch (err) {
      console.error("Error fetching enrolled skills:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch student summary stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/user-skills/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleProgressChange = async (skillId, newProgress) => {
    try {
      await api.put("/user-skills/update", {
        userId: userId,
        skillId: skillId,
        progress: parseInt(newProgress),
      });
      
      setEnrolledSkills((prev) =>
        prev.map((s) =>
          s.skillId === skillId ? { ...s, progress: parseInt(newProgress) } : s
        )
      );
      
      // Refresh stats dynamically when progress changes
      fetchStats(); 
    } catch (err) {
      alert("Failed to update progress");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">My Learning Path</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {stats?.userName || "Student"}</p>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
             <button 
              onClick={() => navigate("/leaderboard")} 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition shadow-lg shadow-orange-200 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              🏆 Leaderboard
            </button>

            <button 
              onClick={() => navigate("/profile")} 
              className="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm"
            >
              My Profile
            </button>
            <button 
              onClick={() => navigate("/library")} 
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Browse Library
            </button>
            <button 
              onClick={handleLogout} 
              className="bg-red-50 text-red-600 border border-red-100 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* --- ✅ NEW: Quick Stats Summary --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Enrolled Skills</p>
            <p className="text-4xl font-black text-gray-800">{stats?.totalEnrolled || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Mastered</p>
            <p className="text-4xl font-black text-green-500">{stats?.completed || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Avg. Progress</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-black text-blue-600">{stats?.averageProgress || 0}</p>
              <span className="text-lg font-bold text-gray-400 mb-1">%</span>
            </div>
          </div>
          <button 
            onClick={() => navigate("/leaderboard")}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center group h-32 hover:scale-[1.02] transition-transform"
          >
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Current Status</span>
            <span className="text-white font-black flex items-center gap-2 group-hover:text-yellow-400 transition-colors">
              VIEW RANKING <span className="text-xl">👉</span>
            </span>
          </button>
        </div>

        {/* --- Skill Cards Grid --- */}
        {loading ? (
          <div className="text-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
             <p className="text-gray-500 font-medium">Loading your journey...</p>
          </div>
        ) : enrolledSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {enrolledSkills.map((skill) => (
              <div key={skill.skillId} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{skill.skillName}</h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      skill.progress >= 100 ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"
                    }`}>
                      {skill.progress >= 100 ? "Completed" : "In Progress"}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-2">{skill.description}</p>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span>Progress</span>
                      <span>{skill.progress}%</span>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.progress}
                      onChange={(e) => handleProgressChange(skill.skillId, e.target.value)}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    
                    <div className="relative pt-2">
                      <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-gray-100">
                        <div 
                          style={{ width: `${skill.progress}%` }} 
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                             skill.progress >= 100 ? "bg-green-500" : "bg-blue-600"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {skill.progress >= 100 ? (
                  <button 
                    onClick={() => navigate(`/certificate/${skill.skillId}`)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all font-black uppercase tracking-widest shadow-lg shadow-orange-100 transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>🎓</span> Claim Certificate
                  </button>
                ) : (
                  <div className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl text-center text-xs font-bold uppercase tracking-widest border border-gray-100">
                    Finish to unlock certificate
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Start Your Journey</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't enrolled in any skills yet. Visit the library to choose your first path.</p>
            <button 
              onClick={() => navigate("/library")} 
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Browse Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;