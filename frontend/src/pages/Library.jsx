import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Library() {
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All"); // ✅ NEW: Category state
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/skills")
      .then((res) => setSkills(res.data))
      .catch((err) => console.error("Error loading library:", err));
  }, []);

  // ✅ Extract unique categories from the skill list for the dropdown
  const categories = ["All", ...new Set(skills.map(s => s.category || "General"))];

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

  // ✅ 3. Updated Logic: Filter by Search AND Category
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || skill.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Skill Library</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* 🔍 Search & Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search for skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
          />
          
          {/* ✅ Category Filter Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-4 rounded-lg border border-gray-300 shadow-sm bg-white text-gray-700 font-medium outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {message && (
          <div className={`p-4 mb-6 rounded text-center font-medium ${message.includes("✅") ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <div key={skill.id} className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow flex flex-col justify-between border border-gray-200 relative">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-gray-800">{skill.name}</h3>
                    <span className={`px-2 py-1 rounded text-[9px] uppercase font-black ${
                      skill.level === 'Advanced' ? 'bg-red-100 text-red-700' : 
                      skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                  {/* ✅ Show Category Tag */}
                  <p className="text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-2">
                    {skill.category || "General"}
                  </p>
                  <p className="text-gray-600 mb-6 text-sm line-clamp-3">
                    {skill.description}
                  </p>
                </div>
                <button 
                  onClick={() => enrollSkill(skill.id)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-bold"
                >
                  Enroll Now
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-400 text-lg">No skills found in "{selectedCategory}" matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Library;