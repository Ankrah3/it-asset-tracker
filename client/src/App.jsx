import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/assets";
const STATUSES = ["In use", "In repair", "Retired"];
const emptyForm = { name: "", type: "", assignedTo: "", status: "In use" };

function App() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");

  const loadAssets = async () => {
    try {
      const res = await fetch(API);
      setAssets(await res.json());
      setError("");
    } catch {
      setError("Could not reach the server. Is it running on port 5000?");
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `${API}/${editingId}` : API;
    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    cancelEdit();
    loadAssets();
  };

  const startEdit = (asset) => {
    setEditingId(asset.id);
    setForm({
      name: asset.name,
      type: asset.type,
      assignedTo: asset.assignedTo,
      status: asset.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    loadAssets();
  };

  const visibleAssets = assets.filter((a) => {
    const text = `${a.name} ${a.type} ${a.assignedTo}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container">
      <h1>IT Asset Tracker</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <input
          name="name"
          placeholder="Asset name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="type"
          placeholder="Type (Laptop, Phone...)"
          value={form.type}
          onChange={handleChange}
          required
        />
        <input
          name="assignedTo"
          placeholder="Assigned to"
          value={form.assignedTo}
          onChange={handleChange}
        />
        <select name="status" value={form.status} onChange={handleChange}>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button type="submit">
          {editingId ? "Save changes" : "Add asset"}
        </button>
        {editingId && (
          <button type="button" className="secondary" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      <div className="toolbar">
        <input
          placeholder="Search by name, type or person..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Assigned to</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visibleAssets.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.type}</td>
              <td>{a.assignedTo || "-"}</td>
              <td>{a.status}</td>
              <td className="actions">
                <button onClick={() => startEdit(a)}>Edit</button>
                <button className="delete" onClick={() => handleDelete(a.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {visibleAssets.length === 0 && (
            <tr>
              <td colSpan="5">No assets found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
