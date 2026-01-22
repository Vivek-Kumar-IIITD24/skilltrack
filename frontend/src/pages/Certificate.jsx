import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function Certificate() {
  const { skillId } = useParams();
  const [cert, setCert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/user-skills/${skillId}/certificate`)
      .then(res => setCert(res.data))
      .catch((err) => {
        // ✅ Improved Debugging: Show the actual error message from the backend
        const message = err.response?.data || "Verification failed. Connection issue.";
        alert(message); 
        navigate("/dashboard");
      });
  }, [skillId, navigate]);

  if (!cert) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-xl animate-pulse font-mono">
        Verifying Completion Stats...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      {/* Print Controls */}
      <div className="mb-8 space-x-4 no-print">
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
        >
          Download PDF / Print
        </button>
        <button 
          onClick={() => navigate("/dashboard")} 
          className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          Back to Dashboard
        </button>
      </div>
      
      {/* Certificate UI */}
      <div className="bg-white w-full max-w-[900px] aspect-[1.414/1] p-12 border-[16px] border-double border-blue-900 shadow-2xl flex flex-col items-center justify-between text-center relative overflow-hidden">
        
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <span className="text-[15rem] font-black rotate-12">VERIFIED</span>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-serif text-blue-900 uppercase tracking-tighter">Certificate of Achievement</h1>
          <div className="h-1 w-40 bg-blue-900 mx-auto"></div>
        </div>

        <div className="space-y-4">
          <p className="text-xl text-gray-500 italic">This honor is officially presented to</p>
          <h2 className="text-5xl font-black text-gray-900 border-b-4 border-gray-100 pb-2 px-12 inline-block">
            {cert.studentName}
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-lg text-gray-500 leading-relaxed">
            For successfully demonstrating professional mastery and completing all requirements for
          </p>
          <h3 className="text-4xl font-black text-blue-800 uppercase tracking-widest bg-blue-50 px-6 py-2 rounded-lg border border-blue-100">
            {cert.skillName}
          </h3>
        </div>
        
        <div className="w-full flex justify-between items-end mt-12 px-12 border-t pt-8 border-gray-100">
          <div className="text-left">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Date of Issue</p>
            <p className="font-mono text-gray-800">{cert.completionDate}</p>
          </div>
          <div className="text-center">
             <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center text-white mb-2 shadow-inner border-4 border-white">
                <span className="text-3xl">⭐</span>
             </div>
             <p className="text-[10px] text-gray-400 font-black tracking-tighter uppercase">SkillTrack Verified</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Certificate UID</p>
            <p className="font-mono text-gray-800 text-xs">{cert.certificateId}</p>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; padding: 0; }
          .bg-white { box-shadow: none; border-width: 10px; }
        }
      `}</style>
    </div>
  );
}

export default Certificate;