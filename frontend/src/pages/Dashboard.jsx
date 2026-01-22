import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [enrolledSkills, setEnrolledSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchMySkills();
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

  const handleProgressChange = async (skillId, newProgress) => {
    try {
      // ✅ Calls the new /update endpoint we created in the backend
      await api.put("/user-skills/update", {
        userId: userId,
        skillId: skillId,
        progress: parseInt(newProgress),
      });
      
      // Update local state to show change immediately
      setEnrolledSkills((prev) =>
        prev.map((s) =>
          s.skillId === skillId ? { ...s, progress: newProgress } : s
        )
      );
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
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Learning Path</h1>
          <div className="space-x-4">
            <button onClick={() => navigate("/library")} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
              Browse Library
            </button>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading your skills...</p>
        ) : enrolledSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledSkills.map((skill) => (
              <div key={skill.skillId} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{skill.skillName}</h2>
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                    skill.progress >= 100 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {skill.progress >= 100 ? "Completed" : "In Progress"}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-6 line-clamp-2">{skill.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>Progress</span>
                    <span>{skill.progress}%</span>
                  </div>
                  
                  {/* 🎚️ Progress Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.progress}
                    onChange={(e) => handleProgressChange(skill.skillId, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div style={{ width: `${skill.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">You haven't enrolled in any skills yet.</p>
            <button onClick={() => navigate("/library")} className="text-blue-600 font-bold hover:underline">
              Visit the Library to start learning →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;