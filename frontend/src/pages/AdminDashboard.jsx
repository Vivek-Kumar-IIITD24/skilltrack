import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await api.get("/skills");
      setSkills(res.data);
    } catch (err) {
      console.error("Error loading skills:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post("/skills", { name, description });
      setMessage("✅ Skill added successfully!");
      setName("");
      setDescription("");
      fetchSkills(); // Refresh the list
    } catch (error) {
      setMessage("❌ Failed to add skill.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        await api.delete(`/skills/${id}`);
        fetchSkills(); // Refresh the list
      } catch (err) {
        alert("Failed to delete skill");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition">
            Logout
          </button>
        </div>

        {/* Add Skill Form */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Add New Skill</h2>
          {message && <div className="p-2 mb-4 bg-gray-700 rounded text-center">{message}</div>}
          <form onSubmit={handleAddSkill} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text" placeholder="Skill Name" value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" required
            />
            <input
              type="text" placeholder="Description" value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" required
            />
            <button type="submit" className="md:col-span-2 bg-blue-600 py-3 rounded font-bold hover:bg-blue-500 transition">
              Create Skill
            </button>
          </form>
        </div>

        {/* Skill Table */}
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-4">Skill Name</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="p-4 font-semibold">{skill.name}</td>
                  <td className="p-4 text-gray-400">{skill.description}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(skill.id)}
                      className="text-red-500 hover:text-red-400 font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;