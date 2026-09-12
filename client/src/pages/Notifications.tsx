import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { connectSocket } from "../lib/socket";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data ?? response.data.notifications ?? [];

      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const socket = connectSocket();

    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((current) => [notification, ...current]);
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification", error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">V</div>
          <span>Velozity</span>
        </div>

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
          <Link className="nav-item" to="/activity">
            Activity
          </Link>
          <Link className="nav-item active" to="/notifications">
            Notifications
          </Link>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount} unread notifications</p>
          </div>

          {unreadCount > 0 && (
            <button onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </header>

        <section className="content-card">
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p>No notifications.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  !notification.isRead ? "unread" : ""
                }`}
              >
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <small>
                    {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </div>

                {!notification.isRead && (
                  <button onClick={() => markRead(notification.id)}>
                    Mark read
                  </button>
                )}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}