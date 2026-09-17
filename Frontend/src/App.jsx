import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import GroupDetail from './pages/GroupDetail.jsx';
import StudentAssignments from './pages/StudentAssignments.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminAssignmentDetail from './pages/AdminAssignmentDetail.jsx';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="student">
            <Layout><StudentDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:id"
        element={
          <ProtectedRoute role="student">
            <Layout><GroupDetail /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute role="student">
            <Layout><StudentAssignments /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments/:id"
        element={
          <ProtectedRoute role="admin">
            <Layout><AdminAssignmentDetail /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
