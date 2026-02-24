import { useState, useEffect } from "react";
import api from "../api/axios";
import "./Leaderboard.css"; // ✅ Import custom CSS

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await api.get("/leaderboard");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h1 className="leaderboard-title">🏆 Top Learners</h1>
            </div>
            
            <div className="leaderboard-card">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                            <th>Learner</th>
                            <th style={{ textAlign: 'right' }}>Skills Mastered</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.userId} className="leaderboard-row">
                                <td>
                                    <div className={`rank-badge ${
                                        index === 0 ? 'rank-1' : 
                                        index === 1 ? 'rank-2' :
                                        index === 2 ? 'rank-3' : 'rank-other'
                                    }`}>
                                        {index + 1}
                                    </div>
                                </td>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-name">
                                            {user.name}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <span className="skills-count">
                                        {user.completedSkills}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="empty-state">
                        <h3>No data found</h3>
                        <p>Be the first to complete a skill and top the leaderboard!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
