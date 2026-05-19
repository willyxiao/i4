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

export interface I4Repository {
  getSessionUser(): SessionUser;
  listCases(type: CaseListType): ClientSummary[];
  searchClients(params: ClientSearchParams): ClientSummary[];
  getClient(id: number): ClientDetail | undefined;
  createClient(input: ClientInput): ClientDetail;
  updateClient(id: number, input: Partial<ClientDetail>): ClientDetail | undefined;
  listUsers(): UserSummary[];
  getLeaderboard(): LeaderboardEntry[];
}

const clientsSeed: ClientDetail[] = [
  {
    id: 16745,
    firstName: "Maria",
    lastName: "Santos",
    primaryPhone: "617-555-0199",
    secondaryPhone: "857-555-0142",
    email: "maria.santos@example.org",
    priority: "Urgent",
    caseTypeId: 1,
    category: "Housing",
    state: "MA",
    city: "Cambridge",
    zip: "02139",
    language: "Spanish",
    address: "12 River Street",
    notes: "Tenant received a small claims notice and needs next-step guidance.",
    lastContactAt: "2026-05-18T15:20:00.000Z",
    lastContactType: "email",
    assignedUserId: 1,
    contacts: [
      {
        id: 9001,
        clientId: 16745,
        contactDate: "2026-05-18T15:20:00.000Z",
        type: "email",
        summary: "Forwarded intake summary to legal research.",
        addedBy: "Avery Chen"
      },
      {
        id: 8997,
        clientId: 16745,
        contactDate: "2026-05-16T19:05:00.000Z",
        type: "phone",
        summary: "Explained how to prepare evidence for the hearing.",
        addedBy: "Sam Patel"
      }
    ]
  },
  {
    id: 16746,
    firstName: "Devin",
    lastName: "Johnson",
    primaryPhone: "781-555-0101",
    email: "devin.j@example.org",
    priority: "No Contact Yet",
    caseTypeId: 21,
    category: "Consumer",
    state: "MA",
    city: "Somerville",
    zip: "02144",
    language: "English",
    notes: "New voicemail about a contractor dispute.",
    lastContactAt: "2026-05-17T13:10:00.000Z",
    lastContactType: "voicemail",
    assignedUserId: 2,
    contacts: [
      {
        id: 9002,
        clientId: 16746,
        contactDate: "2026-05-17T13:10:00.000Z",
        type: "voicemail",
        summary: "Client left voicemail asking about service-of-process timing.",
        addedBy: "Jordan Lee"
      }
    ]
  },
  {
    id: 16747,
    firstName: "Nora",
    lastName: "O'Brien",
    primaryPhone: "617-555-0122",
    email: "nora.obrien@example.org",
    priority: "Phone Tag",
    caseTypeId: 11,
    category: "Wage",
    state: "MA",
    city: "Boston",
    zip: "02108",
    language: "English",
    notes: "Client prefers evening calls.",
    lastContactAt: "2026-05-15T21:00:00.000Z",
    lastContactType: "phone",
    assignedUserId: 1,
    contacts: [
      {
        id: 9003,
        clientId: 16747,
        contactDate: "2026-05-15T21:00:00.000Z",
        type: "phone",
        summary: "Left callback message with clinic hours.",
        addedBy: "Avery Chen"
      }
    ]
  }
];

const usersSeed: UserSummary[] = [
  { id: 1, name: "Avery Chen", email: "avery@masmallclaims.org", role: "admin", active: true },
  { id: 2, name: "Jordan Lee", email: "jordan@masmallclaims.org", role: "board", active: true },
  { id: 3, name: "Sam Patel", email: "sam@masmallclaims.org", role: "comper", active: true }
];

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function digits(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "");
}

function toSummary(client: ClientDetail): ClientSummary {
  const { address: _address, city: _city, state: _state, zip: _zip, language: _language, notes: _notes, contacts: _contacts, ...summary } = client;
  return summary;
}

export class InMemoryI4Repository implements I4Repository {
  private clients: ClientDetail[];

  private users: UserSummary[];

  private nextClientId: number;

  public constructor(clients = clientsSeed, users = usersSeed) {
    this.clients = structuredClone(clients);
    this.users = structuredClone(users);
    this.nextClientId = Math.max(...this.clients.map((client) => client.id)) + 1;
  }

  public getSessionUser(): SessionUser {
    return { id: 1, name: "Avery Chen", role: "admin" };
  }

  public listCases(type: CaseListType): ClientSummary[] {
    const cases = this.clients.map(toSummary);

    if (type === "date") {
      return cases.sort((a, b) => normalize(b.lastContactAt).localeCompare(normalize(a.lastContactAt)));
    }

    if (type === "me") {
      return cases.filter((client) => client.assignedUserId === this.getSessionUser().id);
    }

    const priorityOrder = ["Urgent", "No Contact Yet", "Phone Tag", "One Message Left"];
    return cases.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.priority);
      const bPriority = priorityOrder.indexOf(b.priority);
      return (aPriority === -1 ? 99 : aPriority) - (bPriority === -1 ? 99 : bPriority);
    });
  }

  public searchClients(params: ClientSearchParams): ClientSummary[] {
    const clientId = normalize(params.clientId);
    const firstName = normalize(params.firstName);
    const lastName = normalize(params.lastName);
    const phoneNumber = digits(params.phoneNumber);
    const email = normalize(params.email);

    return this.clients
      .filter((client) => {
        const phoneMatches =
          phoneNumber.length > 0 &&
          [client.primaryPhone, client.secondaryPhone].some((phone) => digits(phone).includes(phoneNumber));

        return (
          (clientId.length > 0 && String(client.id).includes(clientId)) ||
          (firstName.length > 0 && normalize(client.firstName).includes(firstName)) ||
          (lastName.length > 0 && normalize(client.lastName).includes(lastName)) ||
          phoneMatches ||
          (email.length > 0 && normalize(client.email).includes(email))
        );
      })
      .map(toSummary);
  }

  public getClient(id: number): ClientDetail | undefined {
    const client = this.clients.find((item) => item.id === id);
    return client ? structuredClone(client) : undefined;
  }

  public createClient(input: ClientInput): ClientDetail {
    const now = new Date().toISOString();
    const client: ClientDetail = {
      id: this.nextClientId,
      firstName: input.firstName,
      lastName: input.lastName,
      primaryPhone: input.primaryPhone,
      email: input.email,
      priority: input.priority ?? "No Contact Yet",
      caseTypeId: 21,
      category: "Uncategorized",
      state: "MA",
      language: "English",
      notes: input.notes,
      lastContactAt: now,
      lastContactType: "note",
      assignedUserId: this.getSessionUser().id,
      contacts: [
        {
          id: Date.now(),
          clientId: this.nextClientId,
          contactDate: now,
          type: "note",
          summary: "Client created in the TypeScript i4 app.",
          addedBy: this.getSessionUser().name
        }
      ]
    };

    this.nextClientId += 1;
    this.clients.unshift(client);
    return structuredClone(client);
  }

  public updateClient(id: number, input: Partial<ClientDetail>): ClientDetail | undefined {
    const clientIndex = this.clients.findIndex((client) => client.id === id);
    if (clientIndex === -1) {
      return undefined;
    }

    const existing = this.clients[clientIndex];
    if (!existing) {
      return undefined;
    }

    const updated: ClientDetail = {
      ...existing,
      ...input,
      id: existing.id,
      contacts: existing.contacts
    };

    this.clients[clientIndex] = updated;
    return structuredClone(updated);
  }

  public listUsers(): UserSummary[] {
    return structuredClone(this.users);
  }

  public getLeaderboard(): LeaderboardEntry[] {
    return this.users
      .map((user) => {
        const contacts = this.clients.flatMap((client) =>
          client.contacts.filter((contact) => contact.addedBy === user.name)
        );
        return {
          userId: user.id,
          name: user.name,
          contactsLogged: contacts.length,
          clientsTouched: new Set(contacts.map((contact) => contact.clientId)).size
        };
      })
      .sort((a, b) => b.contactsLogged - a.contactsLogged);
  }
}
