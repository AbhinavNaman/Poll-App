import React, { useEffect, useState } from 'react';
import socket from '../socket';
import StudentNamePrompt from '../components/StudentNamePrompt';
import StudentPoll from '../components/StudentPoll';
import { logout } from '../utils/auth';
import { fetchWithAuth } from '../utils/api';

const StudentDashboard = () => {
  const [studentName, setStudentName] = useState(sessionStorage.getItem('studentName') || null);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [pollResult, setPollResult] = useState(null);
  const [pollKey, setPollKey] = useState(0);

  const [classrooms, setClassrooms] = useState([]);
  const [requestedIds, setRequestedIds] = useState(new Set());  

  const fetchClassrooms = async () => {
    const res = await fetchWithAuth('/api/classroom/all');
    const data = await res.json();
    setClassrooms(data);
  };

  const requestToJoin = async (classroomId) => {
    const res = await fetchWithAuth(`/api/classroom/${classroomId}/join`, {
      method: 'POST',
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Request sent!');
      setRequestedIds((prev) => new Set(prev.add(classroomId)));
    } else {
      alert('❌ ' + data.error);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

//////////////////////////////////////////////////////////////

  useEffect(() => {
    if (studentName) {
      socket.emit('student_joined', { name: studentName });
      sessionStorage.setItem('studentName', studentName);
    }
  }, [studentName]);

  useEffect(() => {
    socket.on('poll', (data) => {
      setCurrentPoll(data);
      setPollKey(Date.now());
    });
    return () => socket.off('poll');
  }, []);

  useEffect(() => {
    socket.on('poll_result', (data) => {
      setPollResult(data);
    });
    return () => socket.off('poll_result');
  }, []);

  console.log(currentPoll, 'currentPoll');

  useEffect(() => {
    const fetchMyClassrooms = async () => {
      const res = await fetchWithAuth('/api/classroom/student/mine');
      const data = await res.json();

      console.log(data);
  
      // Join each classroom room
      data.forEach(cls => {
        socket.emit('join_classroom', cls._id);
      });
    };
  
    fetchMyClassrooms();
  }, []);



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🎓 Student Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
  
      {!studentName ? (
        <div className="max-w-md mx-auto">
          <StudentNamePrompt onNameSubmit={setStudentName} />
        </div>
      ) : (
        <>
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">📚 Available Classrooms</h2>
            {classrooms.length === 0 ? (
              <p className="text-gray-500">No classrooms available right now.</p>
            ) : (
              <ul className="space-y-4">
                {classrooms.map((cls) => (
                  <li
                    key={cls._id}
                    className="bg-white p-4 rounded-lg shadow border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{cls.name}</h3>
                    <p className="text-gray-600">{cls.description}</p>
                    <button
                      onClick={() => requestToJoin(cls._id)}
                      disabled={requestedIds.has(cls._id)}
                      className={`mt-3 px-4 py-2 rounded-lg text-white transition ${
                        requestedIds.has(cls._id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {requestedIds.has(cls._id) ? '⏳ Requested' : 'Request to Join'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
  
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">🗳️ Active Poll</h2>
            {currentPoll ? (
              <StudentPoll
                key={pollKey}
                question={currentPoll.question}
                options={currentPoll.options}
                studentName={studentName}
                pollResult={pollResult}
                duration={currentPoll?.duration || 60}
                onKick={() => {
                  sessionStorage.removeItem('studentName');
                  setStudentName(null);
                }}
              />
            ) : (
              <p className="text-gray-500">No active poll yet. Please wait...</p>
            )}
          </div>
        </>
      )}
    </div>
  );
  
};

export default StudentDashboard;
