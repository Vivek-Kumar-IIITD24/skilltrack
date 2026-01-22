import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Profile() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/user-skills/stats")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading stats:", err);
        setLoading(false);
      });
  }, []);

  // ✅ Logic: Determine Mastery Level based on completions
  const getMasteryLevel = (completed) => {
    if (completed >= 10) return { label: "Elite Master", color: "text-purple-600", bg: "bg-purple-100" };
    if (completed >= 5) return { label: "Professional", color: "text-blue-600", bg: "bg-blue-100" };
    if (completed >= 1) return { label: "Rising Star", color: "text-green-600", bg: "bg-green-100" };
    return { label: "Novice Learner", color: "text-gray-600", bg: "bg-gray-100" };
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Calculating your stats...</div>;

  const mastery = getMasteryLevel(stats?.completed || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Student Profile</h1>
          <button onClick={() => navigate("/dashboard")} className="text-blue-600 font-bold hover:underline">
            ← Back to Learning
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 flex items-center gap-6">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-black">
            {stats?.userName?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{stats?.userName}</h2>
            <p className="text-gray-500 font-medium">{stats?.email}</p>
            <div className={`mt-2 inline-block px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest ${mastery.bg} ${mastery.color}`}>
              {mastery.label}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Enrolled</p>
            <p className="text-4xl font-black text-gray-800">{stats?.totalEnrolled}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Completed</p>
            <p className="text-4xl font-black text-green-600">{stats?.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Avg. Progress</p>
            <p className="text-4xl font-black text-blue-600">{stats?.averageProgress}%</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;