import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SidebarAdmin from './components/layout/SidebarAdmin';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/user/Home';
import Post from './pages/user/Post';
import Profile from './pages/user/Profile';
import Event from './pages/user/Event';
import Leaderboard from './pages/user/Leaderboard';
import Marketplace from './pages/user/Marketplace';
import MarketplaceDetail from './pages/user/MarketplaceDetail';
import MyMarketplace from './pages/user/MyMarketplace';
import DashboardReports from './pages/admin/DashboardReports';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEvents from './pages/admin/ManageEvents';
import ManageLeaderboard from './pages/admin/ManageLeaderboard';
import ManageMarketplace from './pages/admin/ManageMarketplace';

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

  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex bg-background text-on-background">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
            <Routes>
              <Route path="/admin" element={<ProtectedRoute><DashboardReports /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
              <Route path="/admin/events" element={<ProtectedRoute><ManageEvents /></ProtectedRoute>} />
              <Route path="/admin/leaderboard" element={<ProtectedRoute><ManageLeaderboard /></ProtectedRoute>} />
              <Route path="/admin/marketplace" element={<ProtectedRoute><ManageMarketplace /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </div>
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
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/marketplace/my-items" element={<ProtectedRoute><MyMarketplace /></ProtectedRoute>} />
          <Route path="/marketplace/:id" element={<ProtectedRoute><MarketplaceDetail /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
