import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClient, updateClient, deleteClient } from "../api/clients";
import {
  createContact,
  updateContact,
  deleteContact,
} from "../api/contacts";
import { getContactTypes, getPriorities, getCategories, getStates } from "../api/reference";
import { useAuth } from "../hooks/useAuth";
import ContactEditModal from "../components/ContactEditModal";
import EmailModal from "../components/EmailModal";
import type { Client, Contact, ContactType, CaseType, Category, StateOption, OldContact } from "../types";

export default function ClientPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [oldContacts, setOldContacts] = useState<{
    exists: boolean;
    notes: string;
    contacts: OldContact[];
  }>({ exists: false, notes: "", contacts: [] });
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [priorities, setPriorities] = useState<CaseType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showNewContact, setShowNewContact] = useState(false);
  const [emailModal, setEmailModal] = useState<{
    to: string;
    from: string;
    subject: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "contacts">("info");

  const loadClient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getClient(Number(id));
      setClient(data.client);
      setContacts(data.contacts);
      setOldContacts(data.oldContacts);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClient();
    Promise.all([getContactTypes(), getPriorities(), getCategories(), getStates()]).then(
      ([ct, pr, cat, st]) => {
        setContactTypes(ct);
        setPriorities(pr);
        setCategories(cat);
        setStates(st);
      }
    );
  }, [loadClient]);

  const handleUpdate = async () => {
    if (!client) return;
    setSaving(true);
    try {
      await updateClient(client.ClientID, {
        FirstName: client.FirstName,
        LastName: client.LastName,
        Phone1Number: `${client.Phone1AreaCode}${(client.Phone1Number || "").replace(/\D/g, "")}`,
        Phone2Number: `${client.Phone2AreaCode}${(client.Phone2Number || "").replace(/\D/g, "")}`,
        Email: client.Email,
        Address: client.Address1,
        City: client.City,
        State: client.State,
        Zip: client.ZIP,
        Language: client.Language,
        ClientNotes: client.Notes,
        CaseTypeID: client.CaseTypeID,
        CategoryID: client.CategoryID,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async (data: {
    ContactID?: number;
    ContactTypeID: number;
    ContactDate: string;
    ContactSummary: string;
  }) => {
    if (data.ContactID) {
      await updateContact(data.ContactID, data);
    } else {
      await createContact({ ...data, ClientID: Number(id) });
    }
    setEditingContact(null);
    setShowNewContact(false);
    loadClient();
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm("Delete this contact?")) return;
    await deleteContact(contactId);
    setEditingContact(null);
    loadClient();
  };

  const handleDeleteClient = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this client and all data associated with them?"
      )
    )
      return;
    await deleteClient(Number(id));
    navigate("/find");
  };

  const handleFieldChange = (field: keyof Client, value: string | number) => {
    if (!client) return;
    setClient({ ...client, [field]: value });
  };

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 fixed left-0 top-12 bottom-0 flex flex-col">
        <div className="p-6 pt-12">
          <p className="text-right text-lg font-semibold">
            {client.LastName},
          </p>
          <p className="text-right text-lg">{client.FirstName}</p>
        </div>
        <nav className="mt-8 space-y-1 px-4">
          <button
            onClick={() => setActiveTab("info")}
            className={`w-full text-left px-4 py-2 rounded text-sm ${
              activeTab === "info"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`w-full text-left px-4 py-2 rounded text-sm ${
              activeTab === "contacts"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            Contacts
          </button>
        </nav>

        {/* Genius Bar */}
        <div className="mt-8 px-4 space-y-2">
          <button
            onClick={() =>
              setEmailModal({
                to: "",
                from: user?.Email || "",
                subject: `SCAS Question: Client ${client.ClientID}`,
              })
            }
            className="w-full px-3 py-2 bg-gray-700 text-sm rounded hover:bg-gray-600"
          >
            Email i4 Users
          </button>
          <button
            onClick={() =>
              setEmailModal({
                to: "",
                from: user?.Email || "",
                subject: `SCAS Referral: Client ${client.ClientID}`,
              })
            }
            className="w-full px-3 py-2 bg-gray-700 text-sm rounded hover:bg-gray-600"
          >
            Email Legal Research
          </button>
          <button
            onClick={() =>
              setEmailModal({
                to: client.Email,
                from: "masmallclaims@gmail.com",
                subject: "",
              })
            }
            className="w-full px-3 py-2 bg-green-700 text-sm rounded hover:bg-green-600"
          >
            Email Client
          </button>
        </div>

        {/* Actions (non-comper) */}
        {user && !user.Comper && (
          <div className="mt-auto p-4 space-y-2">
            <button
              onClick={handleDeleteClient}
              className="w-full px-3 py-2 bg-red-700 text-sm rounded hover:bg-red-600"
            >
              Delete Client
            </button>
            <button
              onClick={() => navigate(`/merge/${client.ClientID}`)}
              className="w-full px-3 py-2 bg-blue-700 text-sm rounded hover:bg-blue-600"
            >
              Merge Client
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="ml-64 flex-1 p-6">
        {activeTab === "info" && (
          <div>
            {/* Primary info */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Client ID</label>
                  <input
                    type="text"
                    value={client.ClientID}
                    readOnly
                    className="w-full px-3 py-2 border rounded bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Priority</label>
                  <select
                    value={client.CaseTypeID}
                    onChange={(e) =>
                      handleFieldChange("CaseTypeID", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    {priorities.map((p) => (
                      <option key={p.CaseTypeID} value={p.CaseTypeID}>
                        {p.Description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Client info form */}
            <h2 className="text-xl font-semibold text-gray-600 mb-4 lowercase tracking-wider">
              client information
            </h2>
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">First Name</label>
                  <input
                    type="text"
                    value={client.FirstName}
                    onChange={(e) =>
                      handleFieldChange("FirstName", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <input
                    type="text"
                    value={client.Address1}
                    onChange={(e) =>
                      handleFieldChange("Address1", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Last Name</label>
                  <input
                    type="text"
                    value={client.LastName}
                    onChange={(e) =>
                      handleFieldChange("LastName", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">City</label>
                  <input
                    type="text"
                    value={client.City}
                    onChange={(e) => handleFieldChange("City", e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Category</label>
                  <select
                    value={client.CategoryID}
                    onChange={(e) =>
                      handleFieldChange("CategoryID", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    <option value={0}>--</option>
                    {categories.map((c) => (
                      <option key={c.CategoryID} value={c.CategoryID}>
                        {c.Description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-500">State</label>
                  <select
                    value={client.State}
                    onChange={(e) => handleFieldChange("State", e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    {states.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name || "--"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Primary Phone</label>
                  <input
                    type="tel"
                    value={
                      client.Phone1AreaCode
                        ? `(${client.Phone1AreaCode}) ${client.Phone1Number}`
                        : client.Phone1Number
                    }
                    onChange={(e) =>
                      handleFieldChange("Phone1Number", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">ZIP</label>
                  <input
                    type="text"
                    value={client.ZIP}
                    onChange={(e) => handleFieldChange("ZIP", e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    value={
                      client.Phone2AreaCode
                        ? `(${client.Phone2AreaCode}) ${client.Phone2Number}`
                        : client.Phone2Number
                    }
                    onChange={(e) =>
                      handleFieldChange("Phone2Number", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Language</label>
                  <input
                    type="text"
                    value={client.Language}
                    onChange={(e) =>
                      handleFieldChange("Language", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <input
                    type="email"
                    value={client.Email}
                    onChange={(e) => handleFieldChange("Email", e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Notes</label>
                  <textarea
                    value={client.Notes}
                    onChange={(e) => handleFieldChange("Notes", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded text-sm resize-none"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
                >
                  {saving ? "Updating..." : "Update Client Info"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-600 mb-4 lowercase tracking-wider">
              contacts
            </h2>

            <button
              onClick={() => setShowNewContact(true)}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4 text-sm font-medium"
            >
              + New Contact
            </button>

            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm">Date</th>
                    <th className="px-4 py-2 text-left text-sm">Type</th>
                    <th className="px-4 py-2 text-left text-sm">Summary</th>
                    <th className="px-4 py-2 text-left text-sm">Added By</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr
                      key={c.ContactID}
                      className="hover:bg-blue-50 cursor-pointer border-t transition-colors"
                      onClick={() => setEditingContact(c)}
                    >
                      <td className="px-4 py-2 text-sm whitespace-nowrap">
                        {c.ContactDate}
                      </td>
                      <td className="px-4 py-2 text-sm">{c.ContactType}</td>
                      <td
                        className="px-4 py-2 text-sm"
                        dangerouslySetInnerHTML={{
                          __html: c.ContactSummary || "",
                        }}
                      />
                      <td className="px-4 py-2 text-sm">
                        {c.UserNameAdded}
                      </td>
                    </tr>
                  ))}
                  {contacts.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-400 text-sm"
                      >
                        No contacts yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Old i3 contacts */}
            {oldContacts.exists && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  Legacy Contacts (i3)
                </h3>
                {oldContacts.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3 text-sm">
                    {oldContacts.notes}
                  </div>
                )}
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm">Date</th>
                        <th className="px-4 py-2 text-left text-sm">Type</th>
                        <th className="px-4 py-2 text-left text-sm">User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {oldContacts.contacts.map((c, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2 text-sm">{c.Date}</td>
                          <td className="px-4 py-2 text-sm">
                            {c.ContactType}
                          </td>
                          <td className="px-4 py-2 text-sm">{c.UserName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact edit modal */}
      {(editingContact || showNewContact) && (
        <ContactEditModal
          contact={editingContact || undefined}
          contactTypes={contactTypes}
          onSave={handleSaveContact}
          onDelete={
            editingContact
              ? () => handleDeleteContact(editingContact.ContactID)
              : undefined
          }
          onClose={() => {
            setEditingContact(null);
            setShowNewContact(false);
          }}
        />
      )}

      {/* Email modal */}
      {emailModal && (
        <EmailModal
          initialTo={emailModal.to}
          initialFrom={emailModal.from}
          initialSubject={emailModal.subject}
          onClose={() => setEmailModal(null)}
        />
      )}
    </div>
  );
}
