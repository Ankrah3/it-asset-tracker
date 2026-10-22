const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(express.json());

// Database setup
const db = new Database(path.join(__dirname, "assets.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    assignedTo TEXT DEFAULT '',
    status TEXT DEFAULT 'In use'
  )
`);

// Add a sample asset the first time only
if (db.prepare("SELECT COUNT(*) AS n FROM assets").get().n === 0) {
  db.prepare(
    "INSERT INTO assets (name, type, assignedTo, status) VALUES (?, ?, ?, ?)",
  ).run("Dell Latitude 5420", "Laptop", "Kwame", "In use");
}

app.get("/", (req, res) => {
  res.send("IT Asset Tracker API is running. Try /api/assets");
});

// Get all assets (optional ?status= filter)
app.get("/api/assets", (req, res) => {
  const { status } = req.query;
  const rows = status
    ? db
        .prepare("SELECT * FROM assets WHERE status = ? ORDER BY id")
        .all(status)
    : db.prepare("SELECT * FROM assets ORDER BY id").all();
  res.json(rows);
});

// Add an asset
app.post("/api/assets", (req, res) => {
  const { name, type, assignedTo, status } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "name and type are required" });
  }
  const info = db
    .prepare(
      "INSERT INTO assets (name, type, assignedTo, status) VALUES (?, ?, ?, ?)",
    )
    .run(name, type, assignedTo || "", status || "In use");
  const asset = db
    .prepare("SELECT * FROM assets WHERE id = ?")
    .get(info.lastInsertRowid);
  res.status(201).json(asset);
});

// Update an asset
app.put("/api/assets/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM assets WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Asset not found" });

  const merged = { ...existing, ...req.body };
  db.prepare(
    "UPDATE assets SET name = ?, type = ?, assignedTo = ?, status = ? WHERE id = ?",
  ).run(
    merged.name,
    merged.type,
    merged.assignedTo,
    merged.status,
    existing.id,
  );

  res.json(db.prepare("SELECT * FROM assets WHERE id = ?").get(existing.id));
});

// Delete an asset
app.delete("/api/assets/:id", (req, res) => {
  const info = db.prepare("DELETE FROM assets WHERE id = ?").run(req.params.id);
  if (info.changes === 0)
    return res.status(404).json({ error: "Asset not found" });
  res.status(204).end();
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
