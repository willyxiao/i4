import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [casesOpen, setCasesOpen] = useState(false);
  const [dbOpen, setDbOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className="font-bold text-lg px-3 py-2 hover:bg-gray-800 rounded"
            >
              SCASi4
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Cases dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCasesOpen(true)}
                onMouseLeave={() => setCasesOpen(false)}
              >
                <button className="px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-1">
                  List of Cases by <span className="text-xs">&#9660;</span>
                </button>
                {casesOpen && (
                  <div className="absolute left-0 top-full bg-white text-gray-900 shadow-lg rounded-b min-w-[160px] z-50">
                    <Link
                      to="/cases/priority"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Priority
                    </Link>
                    <Link
                      to="/cases/date"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Date
                    </Link>
                    <Link
                      to="/cases/me"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Me
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/find"
                className="px-3 py-2 hover:bg-gray-800 rounded text-sm"
              >
                Find/Add Client
              </Link>

              {/* Database Items dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setDbOpen(true)}
                onMouseLeave={() => setDbOpen(false)}
              >
                <button className="px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-1">
                  Database Items <span className="text-xs">&#9660;</span>
                </button>
                {dbOpen && (
                  <div className="absolute left-0 top-full bg-white text-gray-900 shadow-lg rounded-b min-w-[160px] z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/users"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      List All Users
                    </Link>
                    {!user.Comper && (
                      <Link
                        to="/users/add"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Add User
                      </Link>
                    )}
                    {user.isAdmin && (
                      <Link
                        to="/users/manage"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Manage Users
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Resources dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
              >
                <button className="px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-1">
                  Resources <span className="text-xs">&#9660;</span>
                </button>
                {resourcesOpen && (
                  <div className="absolute left-0 top-full bg-white text-gray-900 shadow-lg rounded-b min-w-[160px] z-50">
                    <a
                      href="http://masmallclaims.wikia.com/wiki/MA_Small_Claims_Wiki"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Wiki
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center">
            <button
              onClick={handleLogout}
              className="px-3 py-2 hover:bg-gray-800 rounded text-sm"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden px-3 py-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            &#9776;
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-800 px-4 pb-3 space-y-1">
          <Link to="/cases/priority" className="block py-2 text-sm">
            Cases by Priority
          </Link>
          <Link to="/cases/date" className="block py-2 text-sm">
            Cases by Date
          </Link>
          <Link to="/cases/me" className="block py-2 text-sm">
            My Cases
          </Link>
          <Link to="/find" className="block py-2 text-sm">
            Find/Add Client
          </Link>
          <Link to="/profile" className="block py-2 text-sm">
            Profile
          </Link>
          <Link to="/users" className="block py-2 text-sm">
            Users
          </Link>
          <button onClick={handleLogout} className="block py-2 text-sm w-full text-left">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
