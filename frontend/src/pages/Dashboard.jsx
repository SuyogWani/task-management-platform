import { useEffect, useState } from "react";
import api from "../../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load tasks.");
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      await api.post("/tasks", { title, description });
      setTitle("");
      setDescription("");
      setError("");
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create task.");
    }
  };

  const toggleStatus = async (task) => {
    try {
      const nextStatus = task.status === "DONE" ? "TODO" : "DONE";
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update task.");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete task.");
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Task title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write a task title"
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional details"
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Create task</button>
      </form>

      <div style={{ marginTop: 24 }}>
        {tasks.length === 0 ? (
          <p>No tasks yet. Add one to get started.</p>
        ) : (
          tasks.map((task) => (
            <div className="task-card" key={task.id}>
              <div className="task-meta">
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description || "No description provided."}</p>
                </div>
                <span className={`status-badge ${task.status}`}>{task.status}</span>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => toggleStatus(task)}>
                  Mark {task.status === "DONE" ? "TODO" : "DONE"}
                </button>
                <button type="button" className="secondary" onClick={() => deleteTask(task.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
