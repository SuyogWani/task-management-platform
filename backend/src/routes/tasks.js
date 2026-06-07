const express = require("express");
const auth = require("../middleware/auth");
const pool = require("../db");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, status, created_at, updated_at FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch tasks failed", error);
    res.status(500).json({ message: "Unable to load tasks." });
  }
});

router.post("/", async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Task title is required." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING id, title, description, status, created_at, updated_at",
      [title, description || "", req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create task failed", error);
    res.status(500).json({ message: "Unable to create task." });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  if (!title && !description && !status) {
    return res.status(400).json({ message: "At least one field is required to update." });
  }

  try {
    const existing = await pool.query("SELECT user_id FROM tasks WHERE id = $1", [id]);
    if (!existing.rows.length || existing.rows[0].user_id !== req.user.id) {
      return res.status(404).json({ message: "Task not found." });
    }

    const updateFields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${idx++}`);
      values.push(status);
    }

    values.push(id);
    const query = `UPDATE tasks SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, title, description, status, created_at, updated_at`;
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update task failed", error);
    res.status(500).json({ message: "Unable to update task." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query("SELECT user_id FROM tasks WHERE id = $1", [id]);
    if (!existing.rows.length || existing.rows[0].user_id !== req.user.id) {
      return res.status(404).json({ message: "Task not found." });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.status(204).end();
  } catch (error) {
    console.error("Delete task failed", error);
    res.status(500).json({ message: "Unable to delete task." });
  }
});

module.exports = router;
