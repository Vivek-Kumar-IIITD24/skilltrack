function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          SkillTrack is Live! 🚀
        </h1>
        <p className="text-gray-600 text-lg">
          Backend: Connected (Port 8081) <br />
          Frontend: Running (Port 5173)
        </p>
        <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Let's Start Coding
        </button>
      </div>
    </div>
  )
}

export default App