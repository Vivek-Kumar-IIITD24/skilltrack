import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const [skills, setSkills] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [category, setCategory] = useState("General"); // ✅ NEW: Category state
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
    fetchAnalytics();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await api.get("/skills");
      setSkills(res.data);
    } catch (err) { console.error("Error loading skills:", err); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/user-skills/admin/all");
      setAnalytics(res.data);
    } catch (err) { console.error("Error loading analytics:", err); }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      // ✅ Now sending 'category' to the backend
      await api.post("/skills", { name, description, level, category });
      setMessage("✅ Skill added successfully!");
      setName(""); 
      setDescription(""); 
      setLevel("Beginner");
      setCategory("General");
      fetchSkills();
    } catch (error) { 
      setMessage("❌ Failed to add skill. Ensure name is unique."); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold tracking-tight">Admin Console</h1>
          <button onClick={handleLogout} className="px-6 py-2 bg-red-600 rounded-full font-bold hover:bg-red-700 transition">
            Logout
          </button>
        </div>

        {/* --- Section 1: Skill Management --- */}
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-blue-400">Create New Skill</h2>
          {message && <div className="p-3 mb-4 rounded bg-gray-700 text-center font-bold">{message}</div>}
          
          <form onSubmit={handleAddSkill} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <input
              type="text" placeholder="Skill Name" value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none" required
            />
            
            <select 
              value={level} onChange={(e) => setLevel(e.target.value)}
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* ✅ NEW: Category Input Field */}
            <input
              type="text" placeholder="Category (e.g. Frontend)" value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none" required
            />

            <input
              type="text" placeholder="Description" value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none" required
            />

            <button type="submit" className="lg:col-span-4 bg-blue-600 py-3 rounded-lg font-black uppercase hover:bg-blue-500 transition shadow-lg">
              Publish Skill
            </button>
          </form>
        </div>

        {/* --- Section 2: Skill Inventory List --- */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 bg-gray-750 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-blue-400">Skill Inventory</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300 uppercase text-xs font-bold">
              <tr>
                <th className="p-4">Skill Name</th>
                <th className="p-4">Category</th> {/* ✅ NEW Column */}
                <th className="p-4">Level</th>
                <th className="p-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {skills.map((skill) => (
                <tr key={skill.id} className="hover:bg-gray-750 transition">
                  <td className="p-4 font-bold text-white">{skill.name}</td>
                  <td className="p-4 text-blue-300 font-medium">{skill.category || "General"}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-[10px] font-black bg-gray-900 border border-gray-600 uppercase">
                      {skill.level}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{skill.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Section 3: Student Progress Analytics --- */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 bg-gray-750 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-green-400">Student Progress Tracking</h2>
            <p className="text-gray-400 text-sm">Monitor real-time skill completion across all users</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 uppercase text-xs font-bold">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Skill</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {analytics.length > 0 ? (
                  analytics.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-750 transition">
                      <td className="p-4 font-medium text-white">{entry.studentName}</td>
                      <td className="p-4 text-blue-300">{entry.skillName}</td>
                      <td className="p-4 w-1/4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full transition-all duration-1000" 
                              style={{ width: `${entry.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-mono">{entry.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          entry.status === 'COMPLETED' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-gray-500 italic">No student activity recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;