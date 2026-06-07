import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./src/pages/Login";
import Register from "./src/pages/Register";
import Dashboard from "./src/pages/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("task_token") || null);

  const handleAuth = (nextToken) => {
    localStorage.setItem("task_token", nextToken);
    setToken(nextToken);
  };

  const logout = () => {
    localStorage.removeItem("task_token");
    setToken(null);
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav>
          <div>
            <Link to="/">Task Manager</Link>
          </div>
          <div>
            {token ? (
              <button onClick={logout} className="secondary">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />
          <Route path="/login" element={<Login onAuth={handleAuth} />} />
          <Route path="/register" element={<Register onAuth={handleAuth} />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
