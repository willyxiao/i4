import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./hooks/useAuth";
import * as authApi from "./api/auth";
import type { User } from "./types";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import FindAddPage from "./pages/FindAddPage";
import ClientPage from "./pages/ClientPage";
import CasesPage from "./pages/CasesPage";
import ProfilePage from "./pages/ProfilePage";
import UsersListPage from "./pages/UsersListPage";
import AddUserPage from "./pages/AddUserPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import MergePage from "./pages/MergePage";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = async (username: string, password: string) => {
    const data = await authApi.login(username, password);
    setUser(data.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/find" element={<FindAddPage />} />
            <Route path="/client/:id" element={<ClientPage />} />
            <Route path="/cases/:type" element={<CasesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/users/add" element={<AddUserPage />} />
            <Route path="/users/manage" element={<ManageUsersPage />} />
            <Route path="/merge/:id" element={<MergePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
