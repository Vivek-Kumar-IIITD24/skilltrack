import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [userSkills, setUserSkills] = useState([]);
  const navigate = useNavigate();

  // 1. Load Skills
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = () => {
    api.get("/user-skills/me")
      .then((res) => setUserSkills(res.data))
      .catch((err) => console.error("Error loading skills:", err));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  // ✅ 2. Handle Progress Update
  const updateProgress = async (skillId, currentProgress, change) => {
    const newProgress = Math.min(100, Math.max(0, currentProgress + change)); // Limit between 0 and 100
    const userId = localStorage.getItem("userId");

    try {
      await api.put("/user-skills/update", {
        userId: userId,
        skillId: skillId,
        progress: newProgress
      });
      // Reload data to show new progress
      fetchSkills();
    } catch (error) {
      console.error("Failed to update progress", error);
    }
  };

  const completed = userSkills.filter(s => s.status === "COMPLETED").length;
  const inProgress = userSkills.length - completed;
  const totalProgress = userSkills.length > 0
    ? Math.round(userSkills.reduce((acc, curr) => acc + curr.progress, 0) / userSkills.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">SkillTrack Dashboard</h1>
          <div className="flex gap-4">
            <button onClick={() => navigate("/library")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Browse Library
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h2 className="text-gray-500 font-medium">My Skills</h2>
            <p className="text-3xl font-bold text-gray-800">{userSkills.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h2 className="text-gray-500 font-medium">Total Progress</h2>
            <p className="text-3xl font-bold text-gray-800">{totalProgress}%</p>
          </div>
        </div>

        {/* Learning Path */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Learning Path</h2>
          
          {userSkills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You haven't started any skills yet.
            </div>
          ) : (
            <div className="space-y-6">
              {userSkills.map((skill) => (
                <div key={skill.skillId} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{skill.skillName}</h3>
                      <p className="text-sm text-gray-500">{skill.description}</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{skill.progress}%</span>
                  </div>

                  {/* Progress Bar & Buttons */}
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updateProgress(skill.skillId, skill.progress, -10)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 font-bold"
                    >-</button>
                    
                    <div className="flex-1 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>

                    <button 
                      onClick={() => updateProgress(skill.skillId, skill.progress, 10)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 font-bold"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;