import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/user/Home';
import Post from './pages/user/Post';
import Profile from './pages/user/Profile';
import Event from './pages/user/Event';
import Leaderboard from './pages/user/Leaderboard';
import DashboardReports from './pages/admin/DashboardReports';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEvents from './pages/admin/ManageEvents';
import ManageLeaderboard from './pages/admin/ManageLeaderboard';

function App() {
  const { pathname } = useLocation();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/post" element={<ProtectedRoute><Post /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Event /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><DashboardReports /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><ManageEvents /></ProtectedRoute>} />
          <Route path="/admin/leaderboard" element={<ProtectedRoute><ManageLeaderboard /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
