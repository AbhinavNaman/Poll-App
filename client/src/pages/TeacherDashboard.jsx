import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';
import TeacherPanel from '../components/TeacherPanel';
import { logout } from '../utils/auth';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchClassrooms = async () => {
    const res = await fetchWithAuth('/api/classroom/mine');
    const data = await res.json();
    setClassrooms(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetchWithAuth('/api/classroom', {
      method: 'POST',
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Classroom created!');
      setForm({ name: '', description: '' });
      fetchClassrooms();
    } else {
      alert('❌ ' + data.error);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  console.log(classrooms)


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">👨‍🏫 Teacher Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
  
      {/* Create Classroom Form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📘 Create a New Classroom</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            name="name"
            placeholder="Classroom Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            ➕ Create Classroom
          </button>
        </form>
      </div>
  
      {/* Classroom List */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🏫 Your Classrooms</h2>
        {classrooms.length === 0 ? (
          <p className="text-gray-500">No classrooms created yet.</p>
        ) : (
          <ul className="space-y-4">
            {classrooms.map((cls) => (
              <li key={cls._id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">{cls.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{cls.description}</p>
                <Link
                  to={`/teacher/classroom/${cls._id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  🔧 Manage Classroom
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
  
      {/* Poll Panel Navigation */}
      <div className="mt-10 text-center">
        <Link
          to="/teacher/panel"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          🗳️ Go to Poll Panel
        </Link>
      </div>
    </div>
  );
  
};

export default TeacherDashboard;
