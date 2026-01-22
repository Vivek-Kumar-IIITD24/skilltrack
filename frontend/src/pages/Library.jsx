import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Library() {
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All"); 
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 1. Fetch available skills
  useEffect(() => {
    api.get("/skills")
      .then((res) => setSkills(res.data))
      .catch((err) => console.error("Error loading library:", err));
  }, []);

  // 2. Generate dynamic unique categories list
  const categories = ["All", ...new Set(skills.map(s => s.category || "General"))];

  // 3. Handle enrollment
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

  // 4. Combined Filter Logic
  const filteredSkills = skills.filter((skill) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      skill.name.toLowerCase().includes(searchLower) ||
      skill.description.toLowerCase().includes(searchLower);
    
    const matchesCategory = 
      selectedCategory === "All" || (skill.category || "General") === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Skill Library</h1>
            <p className="text-gray-500 mt-1">Explore and enroll in new learning paths</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all shadow-sm font-semibold"
          >
            ← My Dashboard
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by skill name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700 bg-white"
            />
          </div>
          
          <div className="relative md:w-64">
             <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 shadow-sm bg-white text-gray-700 font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              ▼
            </div>
          </div>
        </div>
        
        {/* Notification Toast */}
        {message && (
          <div className={`p-4 mb-8 rounded-xl text-center font-bold animate-bounce border-2 ${
            message.includes("✅") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <div key={skill.id} className="group bg-white p-7 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between overflow-hidden relative">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{skill.name}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-widest ${
                      skill.level === 'Advanced' ? 'bg-red-100 text-red-700' : 
                      skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                  
                  <p className="text-blue-600 text-[11px] font-black uppercase tracking-widest mb-4 inline-block bg-blue-50 px-2 py-0.5 rounded">
                    {skill.category || "General"}
                  </p>
                  
                  <p className="text-gray-500 mb-8 text-sm leading-relaxed line-clamp-3">
                    {skill.description}
                  </p>
                </div>
                
                <button 
                  onClick={() => enrollSkill(skill.id)}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition-all font-black uppercase tracking-wide shadow-lg shadow-blue-200 active:scale-95"
                >
                  Enroll Now
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-xl font-medium">
                No skills found in <span className="text-gray-600 font-bold">"{selectedCategory}"</span> matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Library;