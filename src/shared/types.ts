export type CaseListType = "priority" | "date" | "me";

export interface ClientSummary {
  id: number;
  firstName: string;
  lastName: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  priority: string;
  caseTypeId: number;
  category: string;
  lastContactAt?: string;
  lastContactType?: "email" | "phone" | "voicemail" | "appointment" | "note";
  assignedUserId?: number;
}

export interface ClientDetail extends ClientSummary {
  address?: string;
  city?: string;
  state: string;
  zip?: string;
  language: string;
  notes?: string;
  contacts: ContactRecord[];
}

export interface ContactRecord {
  id: number;
  clientId: number;
  contactDate: string;
  type: ClientSummary["lastContactType"];
  summary: string;
  addedBy: string;
}

export interface ClientSearchParams {
  clientId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface ClientInput {
  firstName: string;
  lastName: string;
  primaryPhone: string;
  email?: string;
  priority?: string;
  notes?: string;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: "comper" | "board" | "admin";
  active: boolean;
}

export interface LeaderboardEntry {
  userId: number;
  name: string;
  contactsLogged: number;
  clientsTouched: number;
}

export interface SessionUser {
  id: number;
  name: string;
  role: UserSummary["role"];
}

export interface ApiEnvelope<T> {
  data: T;
}
