import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherPanel from './components/TeacherPanel';
import StudentDashboard from './pages/StudentDashboard';
import PrivateRoute from './components/PrivateRoute';
import ClassroomDetails from './pages/ClassroomDetails';
import LoggedInLayout from './components/LoggedInLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<LoggedInLayout />}>

        <Route
          path="/teacher/dashboard"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path='/teacher/panel'
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <TeacherPanel />
            </PrivateRoute>
          }
        />

        <Route
          path='/teacher/classroom/:classroomId'
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <ClassroomDetails />
            </PrivateRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
          </Route>
      </Routes>
    </Router>
  );
}

export default App;
