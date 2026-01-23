import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ Added state for Eye Icon
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Send Login Request
      const response = await api.post("/auth/login", {
        email: email,
        password: password
      });

      // 2. ✅ Get Token, User ID, and Role from the response
      const { token, userId, role } = response.data; 

      // 3. ✅ Save everything to the browser for later use
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId); 
      localStorage.setItem("role", role); 
      
      console.log("Login Success! Role:", role); 

      // 4. ✅ Automatic Redirection based on Role
      if (role === "ADMIN") {
        navigate("/admin"); // Redirect Admins to the Command Center
      } else {
        navigate("/dashboard"); // Redirect Students to their Learning Path
      }

    } catch (err) {
      console.error("Login Failed:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          SkillTrack Login
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="manager@test.com"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              // ✅ Toggle between "text" and "password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10" // Added pr-10 for icon space
              required
            />
            {/* ✅ Eye Icon Button */}
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* ✅ Sign Up Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            className="cursor-pointer font-bold text-blue-600 hover:underline"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;