import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchClients, createClient } from "../api/clients";
import CasesTable from "../components/CasesTable";
import type { CaseRow } from "../types";

export default function FindAddPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    ClientId: "",
    FirstName: "",
    LastName: "",
    PhoneNumber: "",
    Email: "",
  });
  const [results, setResults] = useState<CaseRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const hasInput = Object.values(fields).some((v) => v.trim() !== "");

  const handleSearch = async () => {
    if (!hasInput) return;
    setLoading(true);
    try {
      const data = await searchClients(fields);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const data = await createClient({
      FirstName: fields.FirstName,
      LastName: fields.LastName,
      Phone1Number: fields.PhoneNumber,
      Email: fields.Email,
    });
    if (data.ClientID) {
      navigate(`/client/${data.ClientID}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-50 p-6">
        <div className="flex flex-wrap gap-3 items-end">
          <input
            type="text"
            value={fields.ClientId}
            onChange={(e) => handleChange("ClientId", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Client ID"
            className="px-3 py-2 border rounded w-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            value={fields.FirstName}
            onChange={(e) => handleChange("FirstName", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="First Name"
            className="px-3 py-2 border rounded w-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            value={fields.LastName}
            onChange={(e) => handleChange("LastName", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Last Name"
            className="px-3 py-2 border rounded w-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="tel"
            value={fields.PhoneNumber}
            onChange={(e) => handleChange("PhoneNumber", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Phone Number"
            className="px-3 py-2 border rounded w-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            value={fields.Email}
            onChange={(e) => handleChange("Email", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Email Address"
            className="px-3 py-2 border rounded w-44 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            disabled={!hasInput || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Search
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>

      {loading && (
        <div className="h-1 bg-blue-200">
          <div className="h-full bg-blue-600 animate-pulse w-1/2" />
        </div>
      )}

      {results !== null && (
        <CasesTable
          cases={results}
          showAddNew={
            hasInput
              ? {
                  FirstName: fields.FirstName,
                  LastName: fields.LastName,
                  PhoneNumber: fields.PhoneNumber,
                  Email: fields.Email,
                }
              : undefined
          }
          onAddNew={handleAdd}
        />
      )}

      {results === null && (
        <div className="text-center py-12 text-gray-400">
          <p>Search for clients or add a new one.</p>
        </div>
      )}
    </div>
  );
}
