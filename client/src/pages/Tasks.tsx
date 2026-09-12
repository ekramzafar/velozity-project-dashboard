import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { connectSocket } from "../lib/socket";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "OVERDUE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate: string;
  project: {
    id: string;
    name: string;
  };
  assignedDeveloper?: {
    id: string;
    name: string;
  } | null;
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await api.get("/tasks");
        setTasks(response.data.data);
      } catch (error) {
        console.error("Failed to load tasks", error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    const socket = connectSocket();
  
    if (!socket) return;
  
    const handleStatusUpdate = (updatedTask: any) => {
      setTasks((current) =>
        current.map((task) =>
          task.id === updatedTask.taskId
            ? { ...task, status: updatedTask.status }
            : task
        )
      );
    };
  
    socket.on("task:status_updated", handleStatusUpdate);
  
    tasks.forEach((task) => {
      socket.emit("project:join", task.project.id);
    });
  
    return () => {
      socket.off("task:status_updated", handleStatusUpdate);
    };
  }, [tasks.length]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;

      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.project.name.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, statusFilter, priorityFilter, search]);

  const updateStatus = async (
    taskId: string,
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"
  ) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId ? { ...task, status } : task
        )
      );
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading tasks...</div>;
  }

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

          <Link className="nav-item active" to="/tasks">
            Tasks
          </Link>

          <Link className="nav-item" to="/activity">
            Activity
          </Link>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <h1>Tasks</h1>
            <p>Track work across your accessible projects.</p>
          </div>

          <div className="role-badge">
            {filteredTasks.length} Tasks
          </div>
        </header>

        <section className="content-card">
          <div className="filters">
            <input
              className="search-input"
              placeholder="Search tasks or projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </section>

        <section className="content-card">
          <div className="task-table">
            <div className="task-row task-header">
              <span>Task</span>
              <span>Project</span>
              <span>Assignee</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Due Date</span>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                No tasks found.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div className="task-row" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <small>
                      {task.description || "No description"}
                    </small>
                  </div>

                  <span>{task.project.name}</span>

                  <span>
                    {task.assignedDeveloper?.name || "Unassigned"}
                  </span>

                  <span>
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </span>

                  <select
                    value={task.status}
                    onChange={(e) =>
                      updateStatus(
                        task.id,
                        e.target.value as
                          | "TODO"
                          | "IN_PROGRESS"
                          | "IN_REVIEW"
                          | "DONE"
                      )
                    }
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                    <option value="OVERDUE" disabled>
                      Overdue
                    </option>
                  </select>

                  <span
                    className={
                      task.status === "OVERDUE"
                        ? "due overdue-text"
                        : "due"
                    }
                  >
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Tasks;