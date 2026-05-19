import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../api/users";

export default function AddUserPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    UserName: "",
    Email: "",
    YOG: new Date().getFullYear(),
    password: "password",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const currentYear = new Date().getFullYear();
  const yogOptions = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.UserName || !form.Email) {
      setError("Username and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await createUser(form);
      if (result.error) {
        setError(result.error);
      } else {
        navigate("/users");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4 lowercase tracking-wider">
        add user
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 space-y-4">
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="text-sm text-gray-500">User Name</label>
          <input
            type="text"
            value={form.UserName}
            onChange={(e) => setForm({ ...form, UserName: e.target.value })}
            className="w-full px-3 py-2 border rounded text-sm"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <input
            type="email"
            value={form.Email}
            onChange={(e) => setForm({ ...form, Email: e.target.value })}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Graduation Year</label>
          <select
            value={form.YOG}
            onChange={(e) => setForm({ ...form, YOG: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded text-sm"
          >
            {yogOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-500">
            Password (default: password)
          </label>
          <input
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {saving ? "Adding..." : "Add User"}
        </button>
      </form>
    </div>
  );
}
