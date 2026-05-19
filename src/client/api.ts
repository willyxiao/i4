import type {
  ApiEnvelope,
  CaseListType,
  ClientDetail,
  ClientInput,
  ClientSearchParams,
  ClientSummary,
  LeaderboardEntry,
  SessionUser,
  UserSummary
} from "../shared/types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

function toQuery(params: ClientSearchParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });
  return query.toString();
}

export const api = {
  getSession: () => request<SessionUser>("/api/session"),
  getCases: (type: CaseListType) => request<ClientSummary[]>(`/api/cases?type=${type}`),
  searchClients: (params: ClientSearchParams) => request<ClientSummary[]>(`/api/clients?${toQuery(params)}`),
  getClient: (id: number) => request<ClientDetail>(`/api/clients/${id}`),
  createClient: (input: ClientInput) =>
    request<ClientDetail>("/api/clients", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  updateClient: (id: number, input: Partial<ClientDetail>) =>
    request<ClientDetail>(`/api/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  getUsers: () => request<UserSummary[]>("/api/users"),
  getLeaderboard: () => request<LeaderboardEntry[]>("/api/leaderboard")
};
