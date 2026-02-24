import { useState, useEffect } from "react";
import api from "../services/api"; // Ensure you have an API service configured

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
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">🏆 Top Learners</h1>
            
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="w-full text-left table-auto">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider w-24 text-center">Rank</th>
                            <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Learner</th>
                            <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-right">Skills Mastered</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user, index) => (
                            <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-full font-bold
                                        ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                                          index === 1 ? 'bg-gray-100 text-gray-600' :
                                          index === 2 ? 'bg-orange-100 text-orange-600' : 'text-gray-500'}
                                    `}>
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 shrink-0">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-blue-600">
                                    {user.completedSkills}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No users found yet. Start completing skills to appear here!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
