import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClient, mergeClients, searchClients } from "../api/clients";
import type { Client } from "../types";

export default function MergePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client1, setClient1] = useState<Client | null>(null);
  const [client2, setClient2] = useState<Client | null>(null);
  const [searchId, setSearchId] = useState("");
  const [merged, setMerged] = useState<Record<string, string>>({});
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    if (id) {
      getClient(Number(id)).then((data) => setClient1(data.client));
    }
  }, [id]);

  useEffect(() => {
    if (client1 && client2) {
      const fields = [
        "FirstName", "LastName", "Phone1Number", "Phone2Number",
        "Email", "Address1", "City", "State", "ZIP", "Language", "Notes",
      ];
      const m: Record<string, string> = {};
      for (const f of fields) {
        const v1 = String((client1 as unknown as Record<string, unknown>)[f] || "");
        const v2 = String((client2 as unknown as Record<string, unknown>)[f] || "");
        m[f] = v1 || v2;
      }
      m.CaseTypeID = String(client1.CaseTypeID || client2.CaseTypeID || 0);
      m.CategoryID = String(client1.CategoryID || client2.CategoryID || 0);
      setMerged(m);
    }
  }, [client1, client2]);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    try {
      const data = await getClient(Number(searchId));
      setClient2(data.client);
    } catch {
      alert("Client not found");
    }
  };

  const handleMerge = async () => {
    if (!client1 || !client2) return;
    if (
      !confirm(
        `Merge Client ${client2.ClientID} into Client ${client1.ClientID}? Client ${client2.ClientID} will be deleted.`
      )
    )
      return;
    setMerging(true);
    try {
      await mergeClients(client1.ClientID, client2.ClientID, {
        ...merged,
        CaseTypeID: Number(merged.CaseTypeID),
        CategoryID: Number(merged.CategoryID),
      });
      navigate(`/client/${client1.ClientID}`);
    } finally {
      setMerging(false);
    }
  };

  const renderClientCard = (client: Client | null, label: string) => {
    if (!client) return null;
    const fields = [
      ["First Name", "FirstName"],
      ["Last Name", "LastName"],
      ["Phone 1", "Phone1Number"],
      ["Phone 2", "Phone2Number"],
      ["Email", "Email"],
      ["Address", "Address1"],
      ["City", "City"],
      ["State", "State"],
      ["ZIP", "ZIP"],
      ["Language", "Language"],
    ];
    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-700 mb-3">
          {label} (ID: {client.ClientID})
        </h3>
        <div className="space-y-2">
          {fields.map(([label, key]) => (
            <div key={key} className="flex text-sm">
              <span className="w-24 text-gray-500 flex-shrink-0">{label}</span>
              <span>{String((client as unknown as Record<string, unknown>)[key] || "")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4 lowercase tracking-wider">
        merge clients
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Client 1 */}
        <div>
          {renderClientCard(client1, "Client 1")}
        </div>

        {/* Merged result */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Merged Result</h3>
          {client1 && client2 ? (
            <div className="space-y-2">
              {Object.entries(merged).map(([key, value]) => (
                <div key={key}>
                  <label className="text-xs text-gray-500">{key}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setMerged({ ...merged, [key]: e.target.value })
                    }
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              ))}
              <button
                onClick={handleMerge}
                disabled={merging}
                className="w-full mt-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {merging ? "Merging..." : "Merge Clients"}
              </button>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              Select both clients to see merged result.
            </p>
          )}
        </div>

        {/* Client 2 */}
        <div>
          {client2 ? (
            renderClientCard(client2, "Client 2")
          ) : (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Client 2</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter Client ID"
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Find
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
