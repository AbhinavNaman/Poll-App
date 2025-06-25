import React, { useState, useEffect } from "react";
import socket from "../socket";

const StudentPoll = ({ question, options, studentName, duration, onKick }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timer, setTimer] = useState(duration);
  const [timeExp, setTimeExp] = useState(false);

  useEffect(() => {
    setSubmitted(false);
    setSelectedOption('');
    setResults(null);
    setTimer(duration);
    setTimeExp(false);

    const countDown = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(countDown);
          setTimeExp(true);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countDown);
  }, [question]);

  useEffect(() => {
    socket.on('poll_result', setResults);
    return () => socket.off('poll_result');
  }, []);

  useEffect(() => {
    socket.on('kicked', () => {
      alert("You have been kicked out.");
      onKick?.();
      setSubmitted(true);
      setResults(null);
    });
    return () => socket.off('kicked');
  }, []);

  if (results) {
    return (
      <div className="p-4 bg-white rounded-xl shadow max-w-lg mx-auto mt-8">
        <h3 className="text-lg font-semibold mb-2">📊 Poll Results</h3>
        <h4 className="font-medium mb-4">{results.question}</h4>
        <ul className="space-y-1">
          {Object.entries(results.results).map(([option, count]) => (
            <li key={option}>
              ✅ {option}: {count || 0} votes
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center mt-10 text-lg font-medium text-green-600">
        ✅ Thanks for your response! Waiting for next question...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">{question}</h2>
      <p className="mb-4 text-sm text-gray-600">
        ⏳ Time left: {timer} sec {timeExp && <span className="text-red-500">(Time's up!)</span>}
      </p>

      <div className="space-y-2 mb-4">
        {options?.map((opt, i) => (
          <label key={i} className="flex items-center gap-2">
            <input
              type="radio"
              value={opt}
              checked={selectedOption === opt}
              onChange={() => setSelectedOption(opt)}
              disabled={submitted || timeExp}
              className="accent-green-500"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        onClick={() => {
          if (!selectedOption) return alert("Please select an option");
          socket.emit('submit_poll', {
            question,
            option: selectedOption,
            studentName
          });
          setSubmitted(true);
        }}
        disabled={submitted || timeExp}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
};

export default StudentPoll;
