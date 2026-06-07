const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 5005;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(staticPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});