import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ProtectedRoute from "./ProtectedRoutes";

const AppRoutes = ({ isAuthenticated }) => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route */}
      <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
