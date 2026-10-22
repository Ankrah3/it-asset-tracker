const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let assets = [
  {
    id: 1,
    name: "Dell Latitude 5420",
    type: "Laptop",
    assignedTo: "Kwame",
    status: "In use",
  },
];
let nextId = 2;

// Get all assets (optional ?status= filter)
app.get("/api/assets", (req, res) => {
  const { status } = req.query;
  res.json(status ? assets.filter((a) => a.status === status) : assets);
});

// Add an asset
app.post("/api/assets", (req, res) => {
  const { name, type, assignedTo, status } = req.body;
  if (!name || !type)
    return res.status(400).json({ error: "name and type are required" });
  const asset = {
    id: nextId++,
    name,
    type,
    assignedTo: assignedTo || "",
    status: status || "In use",
  };
  assets.push(asset);
  res.status(201).json(asset);
});

// Update an asset
app.put("/api/assets/:id", (req, res) => {
  const asset = assets.find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  Object.assign(asset, req.body);
  res.json(asset);
});

// Delete an asset
app.delete("/api/assets/:id", (req, res) => {
  const before = assets.length;
  assets = assets.filter((a) => a.id !== Number(req.params.id));
  if (assets.length === before)
    return res.status(404).json({ error: "Asset not found" });
  res.status(204).end();
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
