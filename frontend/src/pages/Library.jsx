import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Library() {
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 1. Fetch all available skills on load
  useEffect(() => {
    api.get("/skills")
      .then((res) => setSkills(res.data))
      .catch((err) => console.error("Error loading library:", err));
  }, []);

  // 2. Handle "Enroll" click
  const enrollSkill = async (skillId) => {
    const userId = localStorage.getItem("userId");
    
    try {
      await api.post("/user-skills/assign", {
        userId: userId,
        skillId: skillId,
        progress: 0
      });
      setMessage("✅ Enrolled successfully! Check your Dashboard.");
    } catch (error) {
      setMessage("❌ Could not enroll. You might already have this skill.");
    }
  };

  // 3. Search Logic: Filter skills based on name, description, or level
  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (skill.level && skill.level.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Skill Library</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* 🔍 Search Input Field */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by name, level, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
          />
        </div>
        
        {/* Status Message */}
        {message && (
          <div className={`p-4 mb-6 rounded text-center font-medium ${message.includes("✅") ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <div key={skill.id} className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow flex flex-col justify-between border border-gray-200">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">{skill.name}</h3>
                    {/* ✅ Skill Level Badge */}
                    <span className={`ml-2 px-2 py-1 rounded text-[10px] uppercase font-black tracking-wider whitespace-nowrap ${
                      skill.level === 'Advanced' ? 'bg-red-100 text-red-700 border border-red-200' : 
                      skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                      'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {skill.level || "Beginner"}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6 text-sm line-clamp-3 leading-relaxed">
                    {skill.description}
                  </p>
                </div>
                <button 
                  onClick={() => enrollSkill(skill.id)}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-bold shadow-sm"
                >
                  Enroll Now
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-400 text-xl font-medium">No skills found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Library;