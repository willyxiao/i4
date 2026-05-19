import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type {
  CaseListType,
  ClientDetail,
  ClientInput,
  ClientSearchParams,
  ClientSummary,
  LeaderboardEntry,
  SessionUser,
  UserSummary
} from "../shared/types";
import "./styles.css";

type View = "dashboard" | "find" | "cases" | "leaderboard" | "users";

const caseViews: Array<{ label: string; type: CaseListType }> = [
  { label: "Priority", type: "priority" },
  { label: "Date", type: "date" },
  { label: "Me", type: "me" }
];

function formatDate(value?: string): string {
  if (!value) {
    return "No contact yet";
  }
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function ClientTable({ clients, onOpenClient }: { clients: ClientSummary[]; onOpenClient: (id: number) => void }) {
  if (clients.length === 0) {
    return <p className="empty-state">No clients match this view yet.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Priority</th>
          <th>Last contact</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id} onClick={() => onOpenClient(client.id)} tabIndex={0}>
            <td>
              <strong>
                {client.lastName}, {client.firstName}
              </strong>
              {client.lastContactType === "email" ? <span className="badge">New Email</span> : null}
              {client.lastContactType === "voicemail" ? <span className="badge badge-info">New Voicemail</span> : null}
            </td>
            <td>{client.primaryPhone}</td>
            <td>{client.email ?? ""}</td>
            <td>{client.priority}</td>
            <td>{formatDate(client.lastContactAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Dashboard({
  clients,
  leaderboard,
  onChangeView
}: {
  clients: ClientSummary[];
  leaderboard: LeaderboardEntry[];
  onChangeView: (view: View) => void;
}) {
  const urgentCount = clients.filter((client) => client.priority === "Urgent").length;
  const recentCount = clients.filter((client) => client.lastContactAt).length;

  return (
    <section className="stack">
      <div className="hero">
        <div>
          <p className="eyebrow">Small Claims Advisory Service</p>
          <h1>SCAS i4 is now running on React and Node TypeScript.</h1>
          <p>
            The new interface keeps the legacy database workflows visible while moving client search,
            case queues, users, and leaderboard data behind typed JSON APIs.
          </p>
        </div>
        <div className="hero-card">
          <span>Regression target</span>
          <strong>Core i4 workflows</strong>
          <small>Find/add clients, case queues, client details, users, leaderboard</small>
        </div>
      </div>

      <div className="metric-grid">
        <button className="metric-card" onClick={() => onChangeView("cases")}>
          <span>Open cases</span>
          <strong>{clients.length}</strong>
        </button>
        <button className="metric-card" onClick={() => onChangeView("cases")}>
          <span>Urgent clients</span>
          <strong>{urgentCount}</strong>
        </button>
        <button className="metric-card" onClick={() => onChangeView("leaderboard")}>
          <span>Contacts logged</span>
          <strong>{leaderboard.reduce((total, entry) => total + entry.contactsLogged, 0)}</strong>
        </button>
        <button className="metric-card" onClick={() => onChangeView("find")}>
          <span>Recently touched</span>
          <strong>{recentCount}</strong>
        </button>
      </div>
    </section>
  );
}

function FindAddClient({ onOpenClient }: { onOpenClient: (id: number) => void }) {
  const [search, setSearch] = useState<ClientSearchParams>({});
  const [results, setResults] = useState<ClientSummary[]>([]);
  const [newClient, setNewClient] = useState<ClientInput>({
    firstName: "",
    lastName: "",
    primaryPhone: "",
    email: ""
  });
  const [status, setStatus] = useState("Enter search criteria or add a client.");

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Searching...");
    const clients = await api.searchClients(search);
    setResults(clients);
    setStatus(clients.length === 0 ? "No clients found." : `Found ${clients.length} client(s).`);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Adding client...");
    const created = await api.createClient(newClient);
    setResults([created]);
    setNewClient({ firstName: "", lastName: "", primaryPhone: "", email: "" });
    setStatus(`Added ${created.firstName} ${created.lastName}.`);
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Find/Add Client</p>
          <h2>Search existing clients before adding a new intake.</h2>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSearch} aria-label="Search clients">
        <input placeholder="Client ID" value={search.clientId ?? ""} onChange={(event) => setSearch({ ...search, clientId: event.target.value })} />
        <input placeholder="First name" value={search.firstName ?? ""} onChange={(event) => setSearch({ ...search, firstName: event.target.value })} />
        <input placeholder="Last name" value={search.lastName ?? ""} onChange={(event) => setSearch({ ...search, lastName: event.target.value })} />
        <input placeholder="Phone number" value={search.phoneNumber ?? ""} onChange={(event) => setSearch({ ...search, phoneNumber: event.target.value })} />
        <input placeholder="Email" value={search.email ?? ""} onChange={(event) => setSearch({ ...search, email: event.target.value })} />
        <button type="submit">Search</button>
      </form>

      <form className="form-grid add-form" onSubmit={handleCreate} aria-label="Add client">
        <input required placeholder="First name" value={newClient.firstName} onChange={(event) => setNewClient({ ...newClient, firstName: event.target.value })} />
        <input required placeholder="Last name" value={newClient.lastName} onChange={(event) => setNewClient({ ...newClient, lastName: event.target.value })} />
        <input required placeholder="Primary phone" value={newClient.primaryPhone} onChange={(event) => setNewClient({ ...newClient, primaryPhone: event.target.value })} />
        <input placeholder="Email" value={newClient.email ?? ""} onChange={(event) => setNewClient({ ...newClient, email: event.target.value })} />
        <button type="submit" className="secondary-button">Add client</button>
      </form>

      <p className="status" role="status">{status}</p>
      <ClientTable clients={results} onOpenClient={onOpenClient} />
    </section>
  );
}

function CaseQueues({ onOpenClient }: { onOpenClient: (id: number) => void }) {
  const [activeType, setActiveType] = useState<CaseListType>("priority");
  const [clients, setClients] = useState<ClientSummary[]>([]);

  useEffect(() => {
    void api.getCases(activeType).then(setClients);
  }, [activeType]);

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">List of Cases</p>
          <h2>Review cases by priority, recent contact date, or current user.</h2>
        </div>
        <div className="segmented-control">
          {caseViews.map((view) => (
            <button
              key={view.type}
              className={activeType === view.type ? "active" : ""}
              onClick={() => setActiveType(view.type)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>
      <ClientTable clients={clients} onOpenClient={onOpenClient} />
    </section>
  );
}

function ClientDrawer({ client, onClose, onSaved }: { client: ClientDetail | undefined; onClose: () => void; onSaved: (client: ClientDetail) => void }) {
  const [draft, setDraft] = useState<ClientDetail | undefined>(client);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft(client);
    setStatus("");
  }, [client]);

  if (!draft) {
    return null;
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) {
      return;
    }
    const saved = await api.updateClient(draft.id, draft);
    setDraft(saved);
    onSaved(saved);
    setStatus("Client successfully updated.");
  }

  return (
    <aside className="drawer" aria-label="Client detail">
      <form onSubmit={handleSave}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Client #{draft.id}</p>
            <h2>
              {draft.lastName}, {draft.firstName}
            </h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>Close</button>
        </div>

        <div className="detail-grid">
          <label>
            First name
            <input value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} />
          </label>
          <label>
            Last name
            <input value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} />
          </label>
          <label>
            Priority
            <input value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })} />
          </label>
          <label>
            Phone
            <input value={draft.primaryPhone} onChange={(event) => setDraft({ ...draft, primaryPhone: event.target.value })} />
          </label>
          <label>
            Email
            <input value={draft.email ?? ""} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          </label>
          <label>
            Language
            <input value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value })} />
          </label>
          <label className="wide">
            Notes
            <textarea value={draft.notes ?? ""} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
          </label>
        </div>

        <button type="submit">Update client info</button>
        {status ? <p className="status" role="status">{status}</p> : null}
      </form>

      <h3>Contacts</h3>
      <div className="contact-list">
        {draft.contacts.map((contact) => (
          <article key={contact.id}>
            <strong>{contact.type}</strong>
            <span>{formatDate(contact.contactDate)} by {contact.addedBy}</span>
            <p>{contact.summary}</p>
          </article>
        ))}
      </div>
    </aside>
  );
}

function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    void api.getLeaderboard().then(setEntries);
  }, []);

  return (
    <section className="panel">
      <p className="eyebrow">Leaderboard</p>
      <h2>Volunteer contact totals</h2>
      <div className="leaderboard">
        {entries.map((entry, index) => (
          <article key={entry.userId}>
            <span>#{index + 1}</span>
            <strong>{entry.name}</strong>
            <small>{entry.contactsLogged} contacts across {entry.clientsTouched} clients</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function Users() {
  const [users, setUsers] = useState<UserSummary[]>([]);

  useEffect(() => {
    void api.getUsers().then(setUsers);
  }, []);

  return (
    <section className="panel">
      <p className="eyebrow">Database Items</p>
      <h2>Active users</h2>
      <div className="user-grid">
        {users.map((user) => (
          <article key={user.id}>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <small>{user.role} - {user.active ? "active" : "hidden"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [session, setSession] = useState<SessionUser | undefined>();
  const [dashboardCases, setDashboardCases] = useState<ClientSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDetail | undefined>();

  useEffect(() => {
    void Promise.all([api.getSession(), api.getCases("priority"), api.getLeaderboard()]).then(
      ([nextSession, nextCases, nextLeaderboard]) => {
        setSession(nextSession);
        setDashboardCases(nextCases);
        setLeaderboard(nextLeaderboard);
      }
    );
  }, []);

  const activeLabel = useMemo(() => {
    if (view === "find") {
      return "Find/Add Client";
    }
    if (view === "cases") {
      return "List of Cases";
    }
    if (view === "leaderboard") {
      return "Leaderboard";
    }
    if (view === "users") {
      return "Users";
    }
    return "Home";
  }, [view]);

  async function openClient(id: number) {
    setSelectedClient(await api.getClient(id));
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <button className="brand" onClick={() => setView("dashboard")}>SCASi4</button>
        <nav aria-label="Primary">
          <button className={view === "cases" ? "active" : ""} onClick={() => setView("cases")}>List of Cases</button>
          <button className={view === "find" ? "active" : ""} onClick={() => setView("find")}>Find/Add Client</button>
          <button className={view === "leaderboard" ? "active" : ""} onClick={() => setView("leaderboard")}>Leaderboard</button>
          <button className={view === "users" ? "active" : ""} onClick={() => setView("users")}>Users</button>
        </nav>
        <span className="session">{session ? `${session.name} (${session.role})` : "Loading session"}</span>
      </header>

      <main>
        <p className="route-label">{activeLabel}</p>
        {view === "dashboard" ? <Dashboard clients={dashboardCases} leaderboard={leaderboard} onChangeView={setView} /> : null}
        {view === "find" ? <FindAddClient onOpenClient={openClient} /> : null}
        {view === "cases" ? <CaseQueues onOpenClient={openClient} /> : null}
        {view === "leaderboard" ? <Leaderboard /> : null}
        {view === "users" ? <Users /> : null}
      </main>

      <ClientDrawer
        client={selectedClient}
        onClose={() => setSelectedClient(undefined)}
        onSaved={(client) => setSelectedClient(client)}
      />
    </div>
  );
}
