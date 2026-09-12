import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

type DashboardData = {
  role: string;
  stats: {
    projects: number;
    totalTasks: number;
    todo: number;
    inProgress: number;
    inReview: number;
    done: number;
    overdue: number;
  };
  recentActivity: {
    id: string;
    message: string;
    createdAt: string;
    user: {
      name: string;
    };
  }[];
  unreadNotifications: number;
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setDashboard(response.data.data);
      } catch (error) {
        console.error("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        Loading dashboard...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="page-loading">
        Failed to load dashboard.
      </div>
    );
  }

  const { stats } = dashboard;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">V</div>
          <span>Velozity</span>
        </div>

        <nav>
  <Link className="nav-item active" to="/">
    Dashboard
  </Link>

  <Link className="nav-item" to="/projects">
    Projects
  </Link>

  <Link className="nav-item" to="/tasks">
    Tasks
  </Link>

  <Link className="nav-item" to="/activity">
    Activity
  </Link>
</nav>    

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {user?.name.charAt(0)}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back, {user?.name}. Here's what's happening today.
            </p>
          </div>

          <div className="topbar-right">
          <Link to="/notifications" className="notification-bell">
  🔔
  <span className="notification-badge">
    1
  </span>
</Link>

            <div className="role-badge">
              {user?.role}
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Projects</span>
            <strong>{stats.projects}</strong>
            <small>Accessible projects</small>
          </div>

          <div className="stat-card">
            <span className="stat-label">Total Tasks</span>
            <strong>{stats.totalTasks}</strong>
            <small>Across your projects</small>
          </div>

          <div className="stat-card">
            <span className="stat-label">In Progress</span>
            <strong>{stats.inProgress}</strong>
            <small>Currently active</small>
          </div>

          <div className="stat-card danger">
            <span className="stat-label">Overdue</span>
            <strong>{stats.overdue}</strong>
            <small>Needs attention</small>
          </div>
        </section>

        {/* Task Status */}
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>Task Overview</h2>
              <p>Current task distribution</p>
            </div>
          </div>

          <div className="task-status-grid">
            <div>
              <span>To Do</span>
              <strong>{stats.todo}</strong>
            </div>

            <div>
              <span>In Progress</span>
              <strong>{stats.inProgress}</strong>
            </div>

            <div>
              <span>In Review</span>
              <strong>{stats.inReview}</strong>
            </div>

            <div>
              <span>Done</span>
              <strong>{stats.done}</strong>
            </div>

            <div className="overdue-status">
              <span>Overdue</span>
              <strong>{stats.overdue}</strong>
            </div>
          </div>
        </section>

        {/* Activity */}
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest project updates</p>
            </div>

            <span className="live-indicator">
              ● Live
            </span>
          </div>

          <div className="activity-list">
            {dashboard.recentActivity.length === 0 ? (
              <p className="empty-state">
                No recent activity.
              </p>
            ) : (
              dashboard.recentActivity.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <div className="activity-icon">✓</div>

                  <div className="activity-content">
                    <strong>{activity.user.name}</strong>
                    <p>{activity.message}</p>
                  </div>

                  <time>
                    {new Date(activity.createdAt).toLocaleString()}
                  </time>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;