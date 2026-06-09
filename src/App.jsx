import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocaleProvider } from './context/LocaleContext';
import DashboardLayout from './layouts/DashboardLayout';
import ValetDashboard from './pages/valet/Dashboard';
import Pipeline from './pages/valet/Pipeline';
import FloorMap from './pages/valet/FloorMap';
import Customers from './pages/valet/Customers';
import Staff from './pages/valet/Staff';
import Schedule from './pages/valet/Schedule';
import Bookings from './pages/valet/Bookings';
import Messaging from './pages/valet/Messaging';
import Forecast from './pages/valet/Forecast';
import Reports from './pages/valet/Reports';
import Incidents from './pages/valet/Incidents';
import AdminAnalytics from './pages/admin/Analytics';
import ClientManagement from './pages/admin/Clients';
import Settings from './pages/valet/Settings';
import Security from './pages/admin/Security';
import GlobalSettings from './pages/admin/GlobalSettings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import ChoosePlan from './pages/ChoosePlan';
import Payment from './pages/Payment';
import About from './pages/About';
import Legal from './pages/Legal';



const ProtectedRoute = ({ children, allowedRole }) => {
  const { session, userRole, loading } = useAuth();
  
  if (loading) return <div>Loading Application...</div>;
  
  if (!session) return <Navigate to="/login" replace />;
  
  if (allowedRole && userRole !== allowedRole) {
    // Special case: valet_staff is allowed in valet routes
    if (allowedRole === 'valet' && userRole === 'valet_staff') {
      return children;
    }
    return <Navigate to={userRole === 'admin' ? '/admin' : '/valet'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/choose-plan" element={<ChoosePlan />} />
              <Route path="/payment" element={<Payment />} />
              
              {/* Valet In-Charge Routes */}
              <Route path="/valet" element={
                <ProtectedRoute allowedRole="valet">
                  <DashboardLayout role="valet" />
                </ProtectedRoute>
              }>
                <Route index element={<ValetDashboard />} />
                <Route path="pipeline" element={<Pipeline />} />
                <Route path="floor-map" element={<FloorMap />} />
                <Route path="customers" element={<Customers />} />
                <Route path="staff" element={<Staff />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="messaging" element={<Messaging />} />
                <Route path="forecast" element={<Forecast />} />
                <Route path="reports" element={<Reports />} />
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
    </LocaleProvider>
  );
}

export default App;
