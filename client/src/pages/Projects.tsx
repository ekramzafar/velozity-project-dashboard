import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

type Project = {
  id: string;
  name: string;
  description?: string | null;
  client: {
    id: string;
    name: string;
    company?: string | null;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    tasks: number;
  };
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.get("/projects");
        setProjects(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading projects...</div>;
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

          <Link className="nav-item active" to="/projects">
            Projects
          </Link>

          <Link className="nav-item" to="/tasks">
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
            <h1>Projects</h1>
            <p>Manage and track your projects.</p>
          </div>

          <div className="role-badge">
            {projects.length} Projects
          </div>
        </header>

        {error && <div className="error">{error}</div>}

        <section className="projects-grid">
          {projects.length === 0 ? (
            <div className="content-card empty-state">
              No projects available.
            </div>
          ) : (
            projects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-header">
                  <div className="project-icon">
                    {project.name.charAt(0).toUpperCase()}
                  </div>

                  <span className="project-tasks">
                    {project._count.tasks} tasks
                  </span>
                </div>

                <h2>{project.name}</h2>

                <p className="project-description">
                  {project.description || "No description available."}
                </p>

                <div className="project-info">
                  <div>
                    <span>Client</span>
                    <strong>{project.client.name}</strong>
                  </div>

                  <div>
                    <span>Manager</span>
                    <strong>{project.createdBy.name}</strong>
                  </div>
                </div>

                <button
                  className="project-button"
                  onClick={() =>
                    alert(`Project: ${project.name}`)
                  }
                >
                  View Project →
                </button>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Projects;