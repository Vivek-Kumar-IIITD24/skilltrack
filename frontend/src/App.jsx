import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library"; // ✅ Import
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/library" element={<Library />} /> {/* ✅ Add Route */}
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;