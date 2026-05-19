import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUser, updateUser, getStats, resetPassword, makeAdmin, revokeAdmin } from "../api/users";
import StatsCharts from "../components/StatsCharts";
import type { User, UserStats } from "../types";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, refresh } = useAuth();
  const isOwnProfile = !id || (currentUser && Number(id) === currentUser.UserID);
  const isAdminEdit = !isOwnProfile && currentUser?.isAdmin;

  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const userId = id ? Number(id) : currentUser?.UserID;

  useEffect(() => {
    if (!userId) return;
    getUser(userId).then(setProfile);
    getStats(userId).then(setStats);
  }, [userId]);

  const handleSave = async () => {
    if (!profile || !userId) return;
    if (newPassword && newPassword !== confirmPassword) {
      setMessage("Passwords don't match.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const data: Record<string, unknown> = {
        UserName: profile.UserName,
        Email: profile.Email,
        YOG: profile.YOG,
      };
      if (newPassword) {
        data.CurrentPassword = currentPassword;
        data.NewPassword = newPassword;
      }
      const result = await updateUser(userId, data);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("Profile updated.");
        if (isOwnProfile) refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading...
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const yogOptions = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4 lowercase tracking-wider">
        profile
      </h1>

      {profile.isAdmin && (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-4">
          Admin
        </span>
      )}
      {profile.Comper === 1 && !profile.isAdmin && (
        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-4">
          Comper
        </span>
      )}

      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">User ID</label>
              <input
                type="text"
                value={profile.UserID}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-50 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">User Name</label>
              <input
                type="text"
                value={profile.UserName}
                onChange={(e) =>
                  setProfile({ ...profile, UserName: e.target.value })
                }
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <input
                type="email"
                value={profile.Email}
                onChange={(e) =>
                  setProfile({ ...profile, Email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Graduation Year</label>
              <select
                value={profile.YOG}
                onChange={(e) =>
                  setProfile({ ...profile, YOG: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded text-sm"
              >
                {yogOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Admin actions for editing another user */}
          {isAdminEdit && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={async () => {
                  if (confirm("Reset this user's password?")) {
                    await resetPassword(userId!);
                    setMessage("Password reset to 'password'.");
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Reset Password
              </button>
              <button
                onClick={async () => {
                  if (confirm("Make this user an admin?")) {
                    await makeAdmin(userId!);
                    setProfile({ ...profile, isAdmin: true });
                  }
                }}
                className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700"
              >
                Make Admin
              </button>
              <button
                onClick={async () => {
                  if (confirm("Revoke admin access?")) {
                    await revokeAdmin(userId!);
                    setProfile({ ...profile, isAdmin: false });
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Revoke Admin
              </button>
            </div>
          )}

          {/* Password edit (own profile only) */}
          {isOwnProfile && !showPasswordEdit && (
            <button
              onClick={() => setShowPasswordEdit(true)}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Click to Edit Password
            </button>
          )}

          {isOwnProfile && showPasswordEdit && (
            <div className="bg-gray-50 rounded p-4 space-y-3">
              <div>
                <label className="text-sm text-gray-500">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <button
                onClick={() => {
                  setShowPasswordEdit(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Cancel
              </button>
            </div>
          )}

          {message && (
            <div
              className={`text-sm px-4 py-2 rounded ${
                message.includes("error") || message.includes("match")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full max-w-xs mx-auto block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {saving ? "Saving..." : "Save Profile Updates"}
          </button>
        </div>
      </div>

      {stats && <StatsCharts stats={stats} />}
    </div>
  );
}
