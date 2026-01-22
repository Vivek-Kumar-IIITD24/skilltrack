import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import Hook
import api from "../services/api";

function Library() {
  const [skills, setSkills] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // ✅ Initialize Hook

  // 1. Fetch all available skills on load
  useEffect(() => {
    api.get("/skills")
      .then((res) => setSkills(res.data))
      .catch((err) => console.error("Error loading library:", err));
  }, []);

  // 2. Handle "Enroll" click
  const enrollSkill = async (skillId) => {
    const userId = localStorage.getItem("userId"); // Get saved ID
    
    try {
      await api.post("/user-skills/assign", {
        userId: userId,
        skillId: skillId,
        progress: 0 // Start at 0%
      });
      setMessage("Enrolled successfully! Check your Dashboard.");
    } catch (error) {
      setMessage("Could not enroll. You might already have this skill.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* ✅ Header with Back Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Skill Library</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        {/* Status Message */}
        {message && (
          <div className={`p-4 mb-6 rounded ${message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <div key={skill.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{skill.name}</h3>
              <p className="text-gray-600 mb-4 h-12 overflow-hidden">{skill.description}</p>
              <button 
                onClick={() => enrollSkill(skill.id)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Library;