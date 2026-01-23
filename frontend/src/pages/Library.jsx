import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Library() {
  const [allSkills, setAllSkills] = useState([]);
  const [mySkillIds, setMySkillIds] = useState(new Set()); // Store IDs of enrolled skills
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      // 1. Get ALL available skills
      const skillsRes = await api.get("/skills");
      
      // 2. Get the skills I have already enrolled in
      // We use a try-catch here because if the user isn't logged in, this might fail, 
      // but we still want to show the library.
      let enrolledIds = new Set();
      if (userId) {
        try {
          const mySkillsRes = await api.get("/user-skills/me");
          // Extract just the skill IDs into a Set for fast lookup
          enrolledIds = new Set(mySkillsRes.data.map(item => item.skillId));
        } catch (e) {
          console.log("Could not fetch user skills (maybe not logged in)");
        }
      }

      setAllSkills(skillsRes.data);
      setMySkillIds(enrolledIds);

    } catch (err) {
      console.error("Error fetching library:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (skillId) => {
    if (!userId) {
      alert("Please log in to enroll!");
      navigate("/");
      return;
    }

    try {
      await api.post("/user-skills/enroll", {
        userId: userId, // technically backend gets this from token, but we send it to be safe
        skillId: skillId
      });
      
      alert("Enrolled successfully! Redirecting to Dashboard...");
      navigate("/dashboard");
    } catch (err) {
      // If the backend says "Already enrolled", we catch it here too
      alert(err.response?.data || "Enrollment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Skill Library</h1>
            <p className="text-gray-500 text-sm mt-1">Explore and enroll in new learning paths</p>
          </div>
          <button 
            onClick={() => navigate("/dashboard")} 
            className="bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition shadow-lg"
          >
            ← My Dashboard
          </button>
        </div>

        {/* Search Bar (Visual Only for now) */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex gap-4">
          <input 
            type="text" 
            placeholder="Search by skill name or description..." 
            className="flex-1 bg-transparent outline-none text-gray-700 font-medium ml-2"
          />
        </div>

        {loading ? (
           <div className="text-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
             <p className="text-gray-500">Loading library...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSkills.map((skill) => {
              const isEnrolled = mySkillIds.has(skill.id); // Check if enrolled

              return (
                <div key={skill.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {skill.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide ${
                        skill.level === 'Beginner' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {skill.level}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        {skill.category}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                      {skill.description}
                    </p>
                  </div>

                  {/* ✅ SMART BUTTON LOGIC */}
                  {isEnrolled ? (
                    <button 
                      onClick={() => navigate("/dashboard")}
                      className="w-full bg-green-50 text-green-600 border border-green-200 py-3 rounded-xl font-bold hover:bg-green-100 transition flex items-center justify-center gap-2"
                    >
                      <span>✓</span> Continue Learning
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleEnroll(skill.id)}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Library;