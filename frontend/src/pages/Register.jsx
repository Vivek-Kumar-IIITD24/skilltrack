import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Note: We use the same URL structure as Login
      const response = await fetch("https://skilltrack-backend-qlr5.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        alert("Registration successful! Please log in.");
        navigate("/"); // Redirect to Login page
      } else {
        const message = await response.text();
        setError(message || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-96 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-blue-600">
          Student Registration
        </h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Name</label>
            <input
              type="text"
              className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 font-bold text-white hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="cursor-pointer font-bold text-blue-600 hover:underline"
            onClick={() => navigate("/")}
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;