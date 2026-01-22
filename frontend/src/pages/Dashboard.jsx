import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // 1. Delete token
    navigate("/"); // 2. Go back to Login
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">SkillTrack Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold mb-2">My Skills</h2>
            <p className="text-gray-600">You are tracking 0 skills.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h2 className="text-xl font-semibold mb-2">Progress</h2>
            <p className="text-gray-600">Your current streak is 0 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;