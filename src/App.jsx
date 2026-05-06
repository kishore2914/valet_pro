import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import ValetDashboard from './pages/valet/Dashboard';
import Pipeline from './pages/valet/Pipeline';
import Staff from './pages/valet/Staff';
import Incidents from './pages/valet/Incidents';
import AdminAnalytics from './pages/admin/Analytics';
import ClientManagement from './pages/admin/Clients';
import Settings from './pages/valet/Settings';
import Security from './pages/admin/Security';
import GlobalSettings from './pages/admin/GlobalSettings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import Payment from './pages/Payment';
import About from './pages/About';
import Legal from './pages/Legal';



const ProtectedRoute = ({ children, allowedRole }) => {
  const { session, userRole, loading } = useAuth();
  
  if (loading) return <div>Loading Application...</div>;
  
  if (!session) return <Navigate to="/login" replace />;
  
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/valet'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/payment" element={<Payment />} />
            
            {/* Valet In-Charge Routes */}
            <Route path="/valet" element={
              <ProtectedRoute allowedRole="valet">
                <DashboardLayout role="valet" />
              </ProtectedRoute>
            }>
              <Route index element={<ValetDashboard />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="staff" element={<Staff />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Platform Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRole="admin">
                <DashboardLayout role="admin" />
              </ProtectedRoute>
            }>
              <Route index element={<AdminAnalytics />} />
              <Route path="clients" element={<ClientManagement />} />
              <Route path="security" element={<Security />} />
              <Route path="settings" element={<GlobalSettings />} />
            </Route>

            <Route path="/about" element={<About />} />
            <Route path="/legal/:type" element={<Legal />} />

            {/* Default Route */}
            <Route path="/" element={<LandingPage />} />

          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
