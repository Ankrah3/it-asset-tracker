import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/assets";
const STATUSES = ["In use", "In repair", "Retired"];
const emptyForm = { name: "", type: "", assignedTo: "", status: "In use" };

function App() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(emptyForm);
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
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    loadAssets();
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadAssets();
  };

  return (
    <div className="container">
      <h1>IT Asset Tracker</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <input name="name" placeholder="Asset name" value={form.name} onChange={handleChange} required />
        <input name="type" placeholder="Type (Laptop, Phone...)" value={form.type} onChange={handleChange} required />
        <input name="assignedTo" placeholder="Assigned to" value={form.assignedTo} onChange={handleChange} />
        <select name="status" value={form.status} onChange={handleChange}>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button type="submit">Add asset</button>
      </form>

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
          {assets.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.type}</td>
              <td>{a.assignedTo || "-"}</td>
              <td>{a.status}</td>
              <td>
                <button className="delete" onClick={() => handleDelete(a.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;