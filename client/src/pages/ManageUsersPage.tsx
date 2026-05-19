import { useState, useCallback } from "react";
import { searchUsers, manageUsers } from "../api/users";

interface UserRow {
  UserID: number;
  UserName: string;
  Email: string;
  selected: boolean;
}

export default function ManageUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [yog, setYog] = useState(0);
  const [includeHidden, setIncludeHidden] = useState(false);
  const [onlyCompers, setOnlyCompers] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const currentYear = new Date().getFullYear();
  const yogOptions = [
    { value: 0, label: "" },
    { value: 1, label: `Before ${currentYear - 1}` },
    ...Array.from({ length: 5 }, (_, i) => ({
      value: currentYear - 1 + i,
      label: String(currentYear - 1 + i),
    })),
  ];

  const doSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, string> = { search: searchTerm };
      if (includeHidden) params.hidden = "true";
      if (onlyCompers) params.compers = "true";
      if (yog > 0) params.yog = String(yog);
      const result = await searchUsers(params);
      if (Array.isArray(result)) {
        setUsers(
          result.map((u: { UserID: number; UserName: string; Email: string }) => ({
            ...u,
            selected: false,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, includeHidden, onlyCompers, yog]);

  const handleAction = async (action: string) => {
    const selectedIds = users.filter((u) => u.selected).map((u) => u.UserID);
    if (selectedIds.length === 0) return;
    setMessage("");
    const result = await manageUsers(action, selectedIds);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("Done! Refreshing...");
      doSearch();
    }
  };

  const toggleAll = (checked: boolean) => {
    setUsers(users.map((u) => ({ ...u, selected: checked })));
  };

  const toggleUser = (userId: number) => {
    setUsers(
      users.map((u) =>
        u.UserID === userId ? { ...u, selected: !u.selected } : u
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4 lowercase tracking-wider">
        manage users
      </h1>

      <div className="bg-white rounded-lg border p-4 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={doSearch}
              placeholder="Search for users here..."
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Year of Graduation</label>
            <select
              value={yog}
              onChange={(e) => {
                setYog(Number(e.target.value));
                setTimeout(doSearch, 0);
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              {yogOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeHidden}
              onChange={(e) => {
                setIncludeHidden(e.target.checked);
                setTimeout(doSearch, 0);
              }}
            />
            Include hidden users?
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyCompers}
              onChange={(e) => {
                setOnlyCompers(e.target.checked);
                setTimeout(doSearch, 0);
              }}
            />
            Include only compers?
          </label>
        </div>
      </div>

      {message && (
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded text-sm mb-4">
          {message}
        </div>
      )}

      {loading && <div className="text-center text-gray-400 py-4">Loading...</div>}

      {users.length > 0 && (
        <>
          <div className="bg-white rounded-lg border overflow-hidden mb-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-sm">User Name</th>
                  <th className="px-4 py-2 text-left text-sm">Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.UserID}
                    className="border-t hover:bg-blue-50 cursor-pointer"
                    onClick={() => toggleUser(u.UserID)}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={u.selected}
                        onChange={() => toggleUser(u.UserID)}
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">{u.UserName}</td>
                    <td className="px-4 py-2 text-sm">{u.Email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("graduate")}
              className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
            >
              Graduate
            </button>
            <button
              onClick={() => handleAction("ungraduate")}
              className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
            >
              Ungraduate
            </button>
            <button
              onClick={() => handleAction("hide")}
              className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
            >
              Hide
            </button>
            <button
              onClick={() => handleAction("unhide")}
              className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
            >
              Unhide
            </button>
          </div>
        </>
      )}

      {!loading && users.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400 text-sm">
          Search for users above!
        </div>
      )}
    </div>
  );
}
