import Database from "better-sqlite3";
import path from "path";
import { seedDatabase } from "./seed";

const DB_PATH = path.join(__dirname, "..", "i4.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='i3_Users'"
    )
    .get();

  if (tableExists) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS db_CaseTypes (
      CaseTypeID INTEGER PRIMARY KEY,
      Description TEXT,
      Deprecated INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS db_Categories (
      CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
      Description TEXT,
      SortKey INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS db_ContactTypes (
      ContactTypeID INTEGER PRIMARY KEY,
      Description TEXT,
      Visible INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS db_Clients (
      ClientID INTEGER PRIMARY KEY AUTOINCREMENT,
      FirstName TEXT,
      LastName TEXT,
      Phone1AreaCode TEXT DEFAULT '',
      Phone1Number TEXT DEFAULT '',
      Phone2AreaCode TEXT DEFAULT '',
      Phone2Number TEXT DEFAULT '',
      Email TEXT DEFAULT '',
      Address1 TEXT DEFAULT '',
      City TEXT DEFAULT '',
      State TEXT DEFAULT '',
      ZIP TEXT DEFAULT '',
      Language TEXT DEFAULT 'English',
      Notes TEXT DEFAULT '',
      CaseTypeID INTEGER DEFAULT 0,
      CategoryID INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS dbi4_Contacts (
      ContactID INTEGER PRIMARY KEY AUTOINCREMENT,
      ClientID INTEGER NOT NULL,
      ContactTypeID INTEGER DEFAULT 0,
      ContactDate TEXT,
      ContactEditDate TEXT,
      UserAddedID INTEGER,
      UserEditID INTEGER,
      ContactSummary TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS db_CaseInfo (
      CaseInfoID INTEGER PRIMARY KEY AUTOINCREMENT,
      ClientID INTEGER NOT NULL,
      CaseTypeID INTEGER DEFAULT 0,
      Notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS db_Contact (
      ContactID INTEGER PRIMARY KEY AUTOINCREMENT,
      ClientID INTEGER NOT NULL,
      ContactTypeID INTEGER DEFAULT 0,
      UserID INTEGER DEFAULT 0,
      Date TEXT
    );

    CREATE TABLE IF NOT EXISTS i3_Users (
      UserID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserName TEXT NOT NULL,
      Email TEXT NOT NULL,
      YOG INTEGER DEFAULT 0,
      Comper INTEGER DEFAULT 0,
      Hidden INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS i3_Passwords (
      UserID INTEGER PRIMARY KEY,
      hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS i3_Admins (
      UserID INTEGER PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS i3_Log (
      LogID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserID INTEGER,
      Login TEXT,
      LastAction TEXT,
      Logout TEXT,
      IP TEXT
    );

    CREATE TABLE IF NOT EXISTS i3_Quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT
    );

    CREATE TABLE IF NOT EXISTS db_Emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT DEFAULT '',
      body TEXT DEFAULT '',
      sender TEXT DEFAULT '',
      timestamp TEXT,
      isAssigned INTEGER DEFAULT 0,
      ClientID INTEGER DEFAULT 0
    );
  `);

  seedDatabase(db);
}
