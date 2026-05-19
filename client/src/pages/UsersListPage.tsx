import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../api/users";
import type { User } from "../types";

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4 lowercase tracking-wider">
        all users
      </h1>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm">Name</th>
                <th className="px-4 py-2 text-left text-sm">Email</th>
                <th className="px-4 py-2 text-left text-sm">YOG</th>
                <th className="px-4 py-2 text-left text-sm">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.UserID} className="border-t hover:bg-blue-50">
                  <td className="px-4 py-2 text-sm">
                    <Link
                      to={`/profile/${u.UserID}`}
                      className="text-blue-600 hover:underline"
                    >
                      {u.UserName}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-sm">{u.Email}</td>
                  <td className="px-4 py-2 text-sm">{u.YOG || "-"}</td>
                  <td className="px-4 py-2 text-sm">
                    {u.Comper ? (
                      <span className="text-green-600">Comper</span>
                    ) : (
                      <span className="text-gray-500">Member</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
