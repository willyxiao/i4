export interface User {
  UserID: number;
  UserName: string;
  Email: string;
  YOG: number;
  Comper: number;
  Hidden: number;
  isAdmin: boolean;
}

export interface Client {
  ClientID: number;
  FirstName: string;
  LastName: string;
  Phone1AreaCode: string;
  Phone1Number: string;
  Phone2AreaCode: string;
  Phone2Number: string;
  Email: string;
  Address1: string;
  City: string;
  State: string;
  ZIP: string;
  Language: string;
  Notes: string;
  CaseTypeID: number;
  CategoryID: number;
  Priority?: string;
  Category?: string;
}

export interface Contact {
  ContactID: number;
  ClientID: number;
  ContactTypeID: number;
  ContactDate: string;
  ContactEditDate: string;
  UserAddedID: number;
  UserEditID: number;
  ContactSummary: string;
  ContactType: string;
  UserNameAdded: string;
  UserNameEdit: string;
  UserEmailAdded: string;
  UserEmailEdit: string;
}

export interface OldContact {
  ContactID: number;
  ClientID: number;
  ContactTypeID: number;
  UserID: number;
  Date: string;
  UserName: string;
  ContactType: string;
}

export interface CaseRow {
  ClientID: number;
  FirstName: string;
  LastName: string;
  Phone1AreaCode: string;
  Phone1Number: string;
  Email: string;
  Priority: string;
  CaseTypeID: number;
  ContactTypeID?: number;
}

export interface ContactType {
  ContactTypeID: number;
  Description: string;
}

export interface CaseType {
  CaseTypeID: number;
  Description: string;
}

export interface Category {
  CategoryID: number;
  Description: string;
}

export interface UserStats {
  clients_assisted: number;
  clients_assisted_by_phone: number;
  clients_assisted_by_email: number;
  clients_assisted_by_appointment: number;
  clients_assisted_by_voicemail: number;
  clients_by_month: { month: number; clients: number }[];
  logins: { Y: number; M: number; D: number; seconds: number }[];
}

export interface StateOption {
  code: string;
  name: string;
}
