import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Import our API bridge

function Dashboard() {
  const [skills, setSkills] = useState([]); // Store the list of skills
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 1. Fetch Data Automatically on Load
  useEffect(() => {
    fetchMySkills();
  }, []);

  const fetchMySkills = async () => {
    try {
      // Calls GET http://localhost:8081/api/user-skills/me
      const response = await api.get("/user-skills/me"); 
      setSkills(response.data); // Save the real data from Java
    } catch (err) {
      console.error("Failed to fetch skills", err);
      setError("Could not load your progress. Are you logged in?");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">SkillTrack Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold mb-2">My Skills</h2>
            <p className="text-gray-600 text-3xl font-bold">
              {loading ? "..." : skills.length} 
            </p>
            <p className="text-sm text-gray-500">Active skills being tracked</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h2 className="text-xl font-semibold mb-2">Total Progress</h2>
            <p className="text-gray-600 text-3xl font-bold">
               {/* Calculate average progress */}
               {skills.length > 0 
                 ? Math.round(skills.reduce((acc, curr) => acc + curr.progress, 0) / skills.length) 
                 : 0}%
            </p>
            <p className="text-sm text-gray-500">Average completion rate</p>
          </div>
        </div>

        {/* Skills List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Your Learning Path</h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading skills...</div>
          ) : skills.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-2">You haven't started any skills yet.</p>
              <button className="text-blue-600 hover:underline">
                Browse Library (Coming Soon)
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {skills.map((item) => (
                <li key={item.skillId} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">{item.skillName}</h4>
                    <p className="text-gray-500 text-sm">{item.description}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-4">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-700">{item.progress}%</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;