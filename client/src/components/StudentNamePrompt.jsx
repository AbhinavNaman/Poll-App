import React, { useState, useEffect } from "react";

const StudentNamePrompt = ({ onNameSubmit }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    const existingName = sessionStorage.getItem("studentName");
    if (existingName) {
      onNameSubmit(existingName);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      sessionStorage.setItem("studentName", name.trim());
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-800">
          👋 Enter your name to join the poll
        </h2>
        <input
          type="text"
          id="studentName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Abhinav"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Join
        </button>
      </form>
    </div>
  );
};

export default StudentNamePrompt;
