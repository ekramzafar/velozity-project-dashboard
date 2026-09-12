import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

type Activity = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user: {
    name: string;
  };
  task?: {
    title: string;
  } | null;
};

export default function Activity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await api.get("/activity");
  
        console.log("ACTIVITY RESPONSE:", response.data);
  
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.activities ?? response.data.data ?? [];
  
        setActivities(data);
      } catch (error) {
        console.error("Failed to fetch activity", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchActivity();
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>VELOZITY</h2>

        <nav>
          <Link className="nav-item" to="/">
            Dashboard
          </Link>

          <Link className="nav-item" to="/projects">
            Projects
          </Link>

          <Link className="nav-item" to="/tasks">
            Tasks
          </Link>

          <Link className="nav-item active" to="/activity">
            Activity
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Activity</h1>
            <p>Recent project and task activity</p>
          </div>
        </header>

        <div className="page-content"></div>

        <section className="card">
          {loading ? (
            <p>Loading activity...</p>
          ) : activities.length === 0 ? (
            <p>No activity found.</p>
          ) : (
            <div className="activity-list">
              {activities.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <div className="activity-dot" />

                  <div className="activity-content">
                    <strong>{activity.message}</strong>

                    <p>
                      {activity.user.name} •{" "}
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>

                    {activity.task && (
                      <span className="activity-task">
                        Task: {activity.task.title}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}