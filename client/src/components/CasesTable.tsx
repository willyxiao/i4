import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CaseRow } from "../types";

interface Props {
  cases: CaseRow[];
  showAddNew?: {
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
    Email: string;
  };
  onAddNew?: () => void;
}

export default function CasesTable({ cases, showAddNew, onAddNew }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = search
    ? cases.filter((c) => {
        const text =
          `${c.LastName} ${c.FirstName} ${c.Phone1Number} ${c.Email} ${c.Priority}`.toLowerCase();
        return text.includes(search.toLowerCase());
      })
    : cases;

  if (cases.length === 0 && !showAddNew) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">No cases found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 bg-gray-50">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Instant Search..."
          className="w-full max-w-md px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Phone Number</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Priority</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.ClientID}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/client/${c.ClientID}`)}
              >
                <td className="border px-4 py-2">
                  {c.LastName}, {c.FirstName}
                  {c.ContactTypeID === 15 && c.CaseTypeID !== 61 && (
                    <span className="ml-2 inline-block bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                      New Email
                    </span>
                  )}
                  {c.ContactTypeID === 21 &&
                    c.CaseTypeID !== 61 &&
                    c.CaseTypeID !== 11 &&
                    c.CaseTypeID !== 22 && (
                      <span className="ml-2 inline-block bg-cyan-500 text-white text-xs px-2 py-0.5 rounded">
                        New Voicemail
                      </span>
                    )}
                </td>
                <td className="border px-4 py-2">
                  {c.Phone1AreaCode
                    ? `(${c.Phone1AreaCode}) ${c.Phone1Number}`
                    : c.Phone1Number}
                </td>
                <td className="border px-4 py-2">{c.Email}</td>
                <td className="border px-4 py-2">{c.Priority}</td>
              </tr>
            ))}
            {showAddNew && (
              <tr
                className="hover:bg-green-50 cursor-pointer bg-green-50/50 transition-colors"
                onClick={onAddNew}
              >
                <td className="border px-4 py-2 font-semibold text-green-700">
                  + Add New: {showAddNew.FirstName} {showAddNew.LastName}
                </td>
                <td className="border px-4 py-2 text-green-700">
                  {showAddNew.PhoneNumber}
                </td>
                <td className="border px-4 py-2 text-green-700">
                  {showAddNew.Email}
                </td>
                <td className="border px-4 py-2"></td>
              </tr>
            )}
            {filtered.length === 0 && !showAddNew && (
              <tr>
                <td className="border px-4 py-2 text-gray-400 italic" colSpan={4}>
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
