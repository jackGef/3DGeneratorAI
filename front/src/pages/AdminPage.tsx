import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaHome } from 'react-icons/fa';
import '../styles/admin.css';

interface User {
  _id: string;
  email: string;
  userName: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

interface Chat {
  _id: string;
  title: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  totalChats: number;
  recentRegistrations: number;
}

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'admin' | 'recent'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'user-details'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  // Filter users when filter changes
  useEffect(() => {
    if (!users.length) return;
    
    let filtered = users;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    switch (userFilter) {
      case 'active':
        filtered = users.filter(user => user.isActive);
        break;
      case 'admin':
        filtered = users.filter(user => user.roles.includes('admin'));
        break;
      case 'recent':
        filtered = users.filter(user => new Date(user.createdAt) >= weekAgo);
        break;
      default:
        filtered = users;
    }
    
    setFilteredUsers(filtered);
  }, [users, userFilter]);

  const loadStats = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (statType: 'all' | 'active' | 'admin' | 'recent') => {
    setUserFilter(statType);
    setActiveTab('users');
  };

  const loadUserDetails = async (user: User) => {
    try {
      setLoading(true);
      const data = await adminAPI.getUserDetails(user._id);
      setSelectedUser(data.user);
      setUserChats(data.chats);
      setActiveTab('user-details');
    } catch (error) {
      console.error('Failed to load user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRoles: string[]) => {
    const isAdmin = currentRoles.includes('admin');
    const newRoles = isAdmin 
      ? currentRoles.filter(role => role !== 'admin')
      : [...currentRoles, 'admin'];
    
    try {
      await adminAPI.updateUserRoles(userId, newRoles);
      loadUsers(); // Refresh the list
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, roles: newRoles });
      }
    } catch (error) {
      console.error('Failed to update user roles:', error);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const result = await adminAPI.toggleUserStatus(userId);
      loadUsers(); // Refresh the list
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(result.user);
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deleteUser(userId);
      loadUsers(); // Refresh the list
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
        setActiveTab('users');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-page">
      {/* Sidebar Toggle Button */}
      <button 
        className={`admin-sidebar-toggle ${!sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title="Toggle sidebar"
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <h3>3D Generator Admin</h3>
          <button 
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>
        
        <nav className="admin-sidebar-nav">
          <Link to="/" className="sidebar-nav-item">
            <FaHome /> Back to Chat
          </Link>
          <button 
            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
        </div>

        <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="stats-overview">
            <h2>System Statistics</h2>
            {stats && (
              <div className="stats-grid">
                <div className="stat-card clickable" onClick={() => handleStatClick('all')}>
                  <h3>Total Users</h3>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
                <div className="stat-card clickable" onClick={() => handleStatClick('active')}>
                  <h3>Active Users</h3>
                  <div className="stat-value">{stats.activeUsers}</div>
                </div>
                <div className="stat-card clickable" onClick={() => handleStatClick('admin')}>
                  <h3>Admin Users</h3>
                  <div className="stat-value">{stats.adminUsers}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Chats</h3>
                  <div className="stat-value">{stats.totalChats}</div>
                </div>
                <div className="stat-card clickable" onClick={() => handleStatClick('recent')}>
                  <h3>Recent Registrations</h3>
                  <div className="stat-value">{stats.recentRegistrations}</div>
                  <div className="stat-label">Last 7 days</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-management">
            <h2>User Management</h2>
            <div className="filter-tabs">
              <button 
                className={userFilter === 'all' ? 'active' : ''}
                onClick={() => setUserFilter('all')}
              >
                All Users ({users.length})
              </button>
              <button 
                className={userFilter === 'active' ? 'active' : ''}
                onClick={() => setUserFilter('active')}
              >
                Active ({users.filter(u => u.isActive).length})
              </button>
              <button 
                className={userFilter === 'admin' ? 'active' : ''}
                onClick={() => setUserFilter('admin')}
              >
                Admins ({users.filter(u => u.roles.includes('admin')).length})
              </button>
              <button 
                className={userFilter === 'recent' ? 'active' : ''}
                onClick={() => setUserFilter('recent')}
              >
                Recent (7 days)
              </button>
            </div>
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Roles</th>
                      <th>Status</th>
                      <th>Verified</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.email}</td>
                        <td>{user.userName}</td>
                        <td>
                          {user.roles.map(role => (
                            <span key={role} className={`role-badge ${role}`}>
                              {role}
                            </span>
                          ))}
                        </td>
                        <td>
                          <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <span className={`verification-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                            {user.emailVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td className="actions">
                          <button 
                            className="btn-view"
                            onClick={() => loadUserDetails(user)}
                          >
                            View
                          </button>
                          <button 
                            className="btn-toggle-role"
                            onClick={() => toggleUserRole(user._id, user.roles)}
                          >
                            {user.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button 
                            className="btn-toggle-status"
                            onClick={() => toggleUserStatus(user._id)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => deleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'user-details' && selectedUser && (
          <div className="user-details">
            <div className="details-header">
              <button 
                className="btn-back"
                onClick={() => setActiveTab('users')}
              >
                ← Back to Users
              </button>
              <h2>User Details: {selectedUser.email}</h2>
            </div>
            
            <div className="user-info">
              <div className="info-section">
                <h3>Account Information</h3>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Username:</strong> {selectedUser.userName}</p>
                <p><strong>Roles:</strong> {selectedUser.roles.join(', ')}</p>
                <p><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong>Email Verified:</strong> {selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                <p><strong>Created:</strong> {formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
            
            <div className="user-chats">
              <h3>User Chats ({userChats.length})</h3>
              {userChats.length > 0 ? (
                <div className="chats-list">
                  {userChats.map(chat => (
                    <div key={chat._id} className="chat-item">
                      <h4>{chat.title}</h4>
                      <p>Messages: {chat.messages?.length || 0}</p>
                      <p>Created: {formatDate(chat.createdAt)}</p>
                      <p>Last Updated: {formatDate(chat.updatedAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No chats found for this user.</p>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
