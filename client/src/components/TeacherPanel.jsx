import React, { useEffect, useState } from "react";
import socket from "../socket";
import { fetchWithAuth } from "../utils/api";

const TeacherPanel = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitted, setSubmitted] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  const [results, setResults] = useState(null);
  const [liveVotes, setLiveVotes] = useState({ total: 0, answered: 0 });
  const [timerDuration, setTimerDuration] = useState(60); // default timer duration in seconds
  const [studentList, setStudentList] = useState([]);
  const [pollHistory, setPollHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClassroom = async () => {
      const res = await fetchWithAuth("/api/classroom/mine");
      const data = await res.json();
      setClassrooms(data);
    };
    fetchClassroom();
  }, []);

  const fetchPollHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/polls");
      const data = await res.json();
      setPollHistory(data);
      setShowHistory(true);
    } catch (error) {
      console.log("Error fetching poll history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (i) => {
    const newOptions = options.filter((_, index) => index !== i);
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClassroom) {
      return alert("Please select a classroom to send the poll to.");
    }
    if (
      !question.trim() ||
      options.filter((option) => option.trim()).length < 2
    ) {
      alert("Please enter a valid question and at least two options.");
      return;
    }
    console.log("emitter: new_question", { question, options, timerDuration });
    // Emit the new question to the server
    socket.emit("new_question", {
      classroomId: selectedClassroom,
      question: question,
      options: options.filter((option) => option.trim()),
      duration: timerDuration,
    });
    setSubmitted(true);
    setLiveVotes({ total: 0, answered: 0 });
  };

  const handleFormReset = () => {
    setQuestion("");
    setOptions(["", ""]);
    setSubmitted(false);
    setResults(null);
  };

  const handleKickStudent = ({ name }) => {
    socket.emit("kick_student", { name });
    setStudentList((prevList) =>
      prevList.filter((student) => student !== name)
    );
  };

  useEffect(() => {
    socket.on("poll_result", (data) => {
      console.log(data);
      setResults(data);
    });

    socket.on("live_votes", (data) => {
      console.log("Live votes:", data);
      setLiveVotes(data);
    });

    return () => {
      socket.off("poll_result");
      socket.off("live_votes");
    };
  }, []);

  useEffect(() => {
    socket.on("student_list", (list) => {
      setStudentList(list);
    });

    return () => socket.off("student_list");
  }, []);

  useEffect(() => {
    socket.emit("request_student_list");

    socket.on("student_list", (list) => {
      setStudentList(list);
    });
    return () => {
      socket.off("student_list");
    };
  }, []);

  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto mt-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          🗳 Create a Poll
        </h2>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            📚 Select Classroom
          </label>
          <select
            value={selectedClassroom}
            onChange={(e) => {
              const classroomId = e.target.value;
              setSelectedClassroom(classroomId);
              socket.emit("join_classroom", classroomId); // ✅ join room
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Classroom --</option>
            {classrooms.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              📝 Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="Enter your question"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  className="flex-grow border border-gray-300 rounded-lg px-4 py-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(i)}
                  className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg"
                >
                  ❌
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-blue-600 font-medium hover:underline mt-2"
            >
              ➕ Add Option
            </button>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              ⏱️ Poll Duration (in seconds)
            </label>
            <input
              type="number"
              min="10"
              step="5"
              value={timerDuration}
              onChange={(e) => setTimerDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={submitted}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              ✅ Submit Poll
            </button>
            <button
              type="button"
              onClick={handleFormReset}
              className="border border-gray-400 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              🔄 Reset
            </button>
          </div>

          {submitted && (
            <div className="text-green-600 mt-2 font-medium">
              ✅ Poll submitted successfully!
            </div>
          )}
        </form>
      </div>

      {/* LIVE VOTE COUNT (visible after submission but before results) */}
      {submitted && !results && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mt-6 shadow">
          <p className="font-medium">🟡 Poll In Progress</p>
          <p className="text-sm mt-1">
            {liveVotes.answered} out of {liveVotes.total} students have
            submitted their answers.
          </p>
        </div>
      )}

      {/* POLL RESULTS (visible after poll ends) */}
      {results && (
        <div className="bg-white p-6 mt-6 rounded-xl shadow-md max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            📊 Poll Results
          </h3>
          <h4 className="font-medium mb-4">{results.question}</h4>

          <ul className="space-y-2">
            {Object.entries(results.results).map(([option, count]) => (
              <li
                key={option}
                className="flex justify-between border-b pb-1 text-gray-700"
              >
                <span>{option}</span>
                <span className="font-medium">{count || 0} votes</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {studentList.length > 0 && (
        <div className="bg-white p-6 mt-6 rounded-xl shadow-md max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            👨‍🎓 Connected Students
          </h3>

          <ul className="space-y-3">
            {studentList.map((name, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
              >
                <span className="font-medium text-gray-700">{name}</span>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                  onClick={() => handleKickStudent({ name })}
                >
                  ❌ Kick
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Toggle + Controls */}
      <div className="mt-8 max-w-2xl mx-auto">
        {showHistory ? (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">🕘 Poll History</h3>
            <div className="space-x-2">
              <button
                onClick={fetchPollHistory}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm transition disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "🔄 Refresh"}
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm transition"
              >
                ❌ Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={fetchPollHistory}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "📜 View Poll History"}
            </button>
          </div>
        )}
      </div>

      {/* Poll List */}
      {showHistory && (
        <div className="bg-white p-4 rounded-xl shadow max-w-2xl mx-auto mt-4 max-h-[300px] overflow-y-auto">
          {pollHistory.length === 0 ? (
            <p className="text-gray-500">No past polls yet.</p>
          ) : (
            <ul className="space-y-4">
              {pollHistory.map((poll, index) => (
                <li
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                >
                  <h4 className="font-medium text-gray-800">{poll.question}</h4>
                  <ul className="ml-4 mt-2 text-sm text-gray-700">
                    {poll.options.map((option, idx) => (
                      <li key={idx}>
                        • {option}: {poll.results?.[option] || 0} votes
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    🗓 {new Date(poll.timestamp).toLocaleString()} — 🧑‍🎓{" "}
                    {poll.answeredCount}/{poll.totalStudents} students answered
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherPanel;
