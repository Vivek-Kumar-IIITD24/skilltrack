import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Award, Download, ArrowLeft } from 'lucide-react';

const Certificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/user-skills/${courseId}/certificate`)
       .then(res => setData(res.data))
       .catch(err => alert("Complete the course to unlock certificate."));
  }, [courseId]);

  if (!data) return <div style={{padding:'50px', textAlign:'center'}}>Loading Certificate...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
          <ArrowLeft />
      </button>

      <div style={{ background: 'white', padding: '10px', borderRadius: '20px', width: '100%', maxWidth: '800px' }}>
        <div style={{ border: '4px dashed #2563eb', borderRadius: '15px', padding: '40px', textAlign: 'center' }}>
            <Award size={80} color="#eab308" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', letterSpacing: '2px', margin: '0' }}>CERTIFICATE</h1>
            <p style={{ fontSize: '1.2rem', color: '#64748b', letterSpacing: '1px', margin: '0 0 30px 0' }}>OF COMPLETION</p>

            <p style={{ color: '#94a3b8' }}>This is to certify that</p>
            <h2 style={{ fontSize: '2rem', color: '#2563eb', margin: '10px 0' }}>{data.studentName}</h2>
            <p style={{ color: '#94a3b8' }}>has successfully completed the course</p>
            <h3 style={{ fontSize: '1.5rem', color: '#1e293b', margin: '10px 0 40px 0' }}>{data.skillName}</h3>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b' }}>
                <span>Date: {data.completionDate}</span>
                <span>ID: {data.certificateId}</span>
            </div>
        </div>
      </div>

      <button onClick={() => window.print()} style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
          <Download size={20} /> Download PDF
      </button>
    </div>
  );
};

export default Certificate;