import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library"; // ✅ Import
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Certificate from "./pages/Certificate";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/library" element={<Library />} /> {/* ✅ Add Route */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/certificate/:skillId" element={<Certificate />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
}

export default App;