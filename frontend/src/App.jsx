import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

//Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

//Main pages
import Home from './pages/main/Home';
import LogMeal from './pages/main/LogMeal';
import LogWorkout from './pages/main/LogWorkout';

//Social pages
import CreatePost from './pages/social/CreatePost';
import PostDetail from './pages/social/PostDetail';
import Feed from './pages/social/Feed';
import Search from './pages/social/Search';
import Profile from './pages/social/Profile';
import MyProfile from './pages/social/MyProfile';
import Notifications from './pages/social/Notifications';

//Admin pages
import AdminStats from './pages/admin/AdminStats';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPosts from './pages/admin/AdminPosts';

//Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

//Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!user.is_admin) return <Navigate to="/home" />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/log-meal" element={<ProtectedRoute><LogMeal /></ProtectedRoute>} />
      <Route path="/log-workout" element={<ProtectedRoute><LogWorkout /></ProtectedRoute>} />
      <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
      <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/stats" element={<AdminRoute><AdminStats /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/posts" element={<AdminRoute><AdminPosts /></AdminRoute>} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;