import { useState, useEffect } from 'react';
import { getAllUsers, deactivateUser, reactivateUser, makeAdmin, removeAdmin, deleteUser } from '../../api/admin';
import AdminNav from '../../components/AdminNav';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filter, users]);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data.users);
      setFiltered(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];

    // Search filter
    if (search.trim()) {
      result = result.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (filter === 'active') result = result.filter(u => u.is_active);
    if (filter === 'inactive') result = result.filter(u => !u.is_active);

    setFiltered(result);
    setCurrentPage(1);
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateUser(id);
      setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u));
      toast.success('User deactivated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate');
    }
  };

  const handleReactivate = async (id) => {
    try {
      await reactivateUser(id);
      setUsers(users.map(u => u.id === id ? { ...u, is_active: true } : u));
      toast.success('User reactivated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reactivate');
    }
  };

  const handleMakeAdmin = async (id) => {
    try {
      await makeAdmin(id);
      setUsers(users.map(u => u.id === id ? { ...u, is_admin: true } : u));
      toast.success('User is now an admin!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to make admin');
    }
  };

  const handleRemoveAdmin = async (id) => {
  try {
    await removeAdmin(id);
    setUsers(users.map(u => u.id === id ? { ...u, is_admin: false } : u));
    toast.success('Admin access removed');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to remove admin');
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / usersPerPage);
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-900 text-lg font-medium">Loading users... 👥</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="px-4 md:px-8 lg:px-12 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-red-900">User Directory</h2>
        </div>

        {/* Total Members Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 flex items-center justify-between w-64">
          <div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">
              Total Members
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {users.length.toLocaleString()}
            </p>
          </div>
          <span className="text-5xl opacity-10">👥</span>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-3 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm font-medium">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2.5 bg-white rounded-xl text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-900 border border-gray-100"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Username</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Full Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Created Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">

                      {/* Username */}
                      <td className="px-4 py-3">
                        <span className="text-gray-900 font-medium text-sm">@{u.username}</span>
                      </td>

                      {/* Full Name with Avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {getInitials(u.full_name)}
                            </span>
                          </div>
                          <span className="text-gray-700 text-sm">{u.full_name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-gray-500 text-sm">{u.email}</span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.is_admin
                            ? 'bg-red-100 text-red-900'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.is_admin ? 'ADMIN' : 'USER'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-gray-400 text-sm">
                          {new Date(u.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">

                          {/* Make Admin */}
                          {!u.is_admin && (
                            <button
                              onClick={() => handleMakeAdmin(u.id)}
                              title="Make Admin"
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                            >
                              <span className="text-gray-400 hover:text-red-900 text-sm">👤</span>
                            </button>
                          )}

                          {/* Remove Admin */}
                          {u.is_admin && (
                            <button
                              onClick={() => handleRemoveAdmin(u.id)}
                              title="Remove Admin"
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                            >
                              <span className="text-gray-400 hover:text-red-900 text-sm">⬇️</span>
                            </button>
                          )}

                          {/* Deactivate */}
                          {u.is_active && (
                            <button
                              onClick={() => handleDeactivate(u.id)}
                              title="Deactivate"
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                            >
                              <span className="text-gray-400 hover:text-red-900 text-sm">🚫</span>
                            </button>
                          )}

                          {/* Reactivate */}
                          {!u.is_active && (
                            <button
                              onClick={() => handleReactivate(u.id)}
                              title="Reactivate"
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 transition"
                            >
                              <span className="text-gray-400 hover:text-green-600 text-sm">✅</span>
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(u.id)}
                            title="Delete User"
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                          >
                            <span className="text-gray-400 hover:text-red-500 text-sm">🗑️</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {paginatedUsers.length} of {filtered.length} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-50 transition disabled:opacity-40"
            >
              ‹
            </button>
            <span className="px-3 py-1 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-700">
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-50 transition disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;