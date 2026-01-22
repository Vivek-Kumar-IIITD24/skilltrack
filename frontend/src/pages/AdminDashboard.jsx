import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post("/skills", { name, description });
      setMessage("✅ Skill added successfully!");
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Error adding skill:", error);
      setMessage("❌ Failed to add skill.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 p-8 text-white">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Add Skill Form */}
        <div className="bg-gray-700 p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-blue-400">Add New Skill</h2>
          
          {message && (
            <div className={`p-3 mb-4 rounded ${message.includes("✅") ? "bg-green-800" : "bg-red-800"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleAddSkill} className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-300">Skill Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="e.g. Python Programming"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:border-blue-500 h-32"
                placeholder="Short description of the skill..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition"
            >
              Save Skill
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;