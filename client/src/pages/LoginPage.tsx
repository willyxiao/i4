import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUsersList } from "../api/auth";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    getUsersList()
      .then((users: { UserName: string }[]) =>
        setUsernames(users.map((u) => u.UserName))
      )
      .catch(() => {});
  }, []);

  const filtered = usernames.filter((u) =>
    u.toLowerCase().includes(username.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scas-green via-scas-mid to-scas-dark">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-2 tracking-tight">
          SCAS i4
        </h1>
        <p className="text-white/70 mb-8 text-sm">
          Small Claims Advisory Service Database
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 w-80 mx-auto">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Username"
              className="w-full px-4 py-3 rounded bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              autoFocus
              autoComplete="off"
            />
            {showSuggestions && username && filtered.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded shadow-lg max-h-40 overflow-y-auto z-10">
                {filtered.map((u) => (
                  <button
                    key={u}
                    type="button"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                    onMouseDown={() => {
                      setUsername(u);
                      setShowSuggestions(false);
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-gray-900 font-semibold rounded hover:bg-gray-100 disabled:opacity-50 transition"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
