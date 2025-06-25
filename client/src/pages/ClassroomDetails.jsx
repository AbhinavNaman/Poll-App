import { useParams } from "react-router-dom";
import { fetchWithAuth } from "../utils/api";
import React, { useEffect, useState } from "react";

const ClassroomDetails = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const { classroomId } = useParams();
    const [polls, setPolls] = useState([]);

    const fetchPollHistory = async () => {
        const res = await fetchWithAuth(`/api/classroom/${classroomId}/polls`);
        const data = await res.json();
        setPolls(data);
    };

    useEffect(() => {
        fetchPollHistory();
    }, []);


    console.log('classroomId', classroomId);

    const fetchPendingRequests = async () => {
        const res = await fetchWithAuth(`/api/classroom/${classroomId}/requests`);
        const data = await res.json();
        console.log('data', data);
        if (res.ok) {
            setPendingRequests(data);
        } else {
            alert('❌ ' + data.error);
        }
    }

    useEffect(() => {
        fetchPendingRequests();
    }, [])

    const approveStudent = async (studentId) => {
        const res = await fetchWithAuth(`/api/classroom/${classroomId}/approve/${studentId}`, {
            method: 'PATCH',
        });

        const data = await res.json();

        if (res.ok) {
            alert('Approved');
            fetchPendingRequests();
        }
        else {
            alert('❌ ' + data.error);
        }
    }

    console.log('pendingRequests', pendingRequests);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">🧑‍🏫 Manage Classroom</h2>
      
            {/* Pending Requests Section */}
            <section className="bg-white p-6 rounded-xl shadow mb-10">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">⏳ Pending Join Requests</h3>
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500">No pending requests.</p>
              ) : (
                <ul className="space-y-4">
                  {pendingRequests.map((student) => (
                    <li
                      key={student._id}
                      className="flex justify-between items-center border rounded-lg p-4"
                    >
                      <span className="text-gray-800 font-medium">
                        {student.name} <span className="text-gray-500">({student.email})</span>
                      </span>
                      <button
                        onClick={() => approveStudent(student._id)}
                        className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 transition"
                      >
                        ✅ Approve
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
      
            {/* Poll History Section */}
            <section className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 Poll History</h3>
              {polls.length === 0 ? (
                <p className="text-gray-500">No polls conducted yet.</p>
              ) : (
                <ul className="space-y-6">
                  {polls.map((poll) => (
                    <li
                      key={poll._id}
                      className="border rounded-lg p-4 shadow-sm bg-gray-50"
                    >
                      <h4 className="text-lg font-semibold text-gray-800">{poll.question}</h4>
                      <ul className="ml-4 mt-2 list-disc text-gray-700">
                        {poll.options.map((opt, i) => (
                          <li key={i}>
                            {opt} — {poll.results?.[opt] || 0} votes
                          </li>
                        ))}
                      </ul>
                      <div className="text-sm text-gray-500 mt-2">
                        🕒 {new Date(poll.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      );
      
}

export default ClassroomDetails;