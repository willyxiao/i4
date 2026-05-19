import path from "path";

type DbBackend = "sqlite" | "mysql";

interface RunResult {
  lastInsertId: number;
  changes: number;
}

let backend: DbBackend;
let sqliteDb: import("better-sqlite3").Database;
let mysqlPool: import("mysql2/promise").Pool;

export function getBackend(): DbBackend {
  return backend;
}

export async function initDb(): Promise<void> {
  if (process.env.MYSQL_HOST) {
    backend = "mysql";
    const mysql = await import("mysql2/promise");
    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "i4",
      port: Number(process.env.MYSQL_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
    });
    // Verify connection
    const conn = await mysqlPool.getConnection();
    conn.release();
    console.log("Connected to MySQL database");
  } else {
    backend = "sqlite";
    const BetterSqlite3 = (await import("better-sqlite3")).default;
    const DB_PATH = path.join(__dirname, "..", "i4.db");
    sqliteDb = new BetterSqlite3(DB_PATH);
    sqliteDb.pragma("journal_mode = WAL");
    sqliteDb.pragma("foreign_keys = ON");
    initSqliteSchema(sqliteDb);
    console.log("Using SQLite database (local dev)");
  }
}

function initSqliteSchema(db: import("better-sqlite3").Database) {
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

  // Seed demo data for local dev
  const { seedDatabase } = require("./seed");
  seedDatabase(db);
}

// --- Query abstraction ---

export async function dbGet<T = any>(
  sql: string,
  ...params: any[]
): Promise<T | undefined> {
  if (backend === "mysql") {
    const [rows] = await mysqlPool.execute(sql, params);
    return (rows as T[])[0];
  }
  return sqliteDb.prepare(sql).get(...params) as T | undefined;
}

export async function dbAll<T = any>(
  sql: string,
  ...params: any[]
): Promise<T[]> {
  if (backend === "mysql") {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows as T[];
  }
  return sqliteDb.prepare(sql).all(...params) as T[];
}

export async function dbRun(
  sql: string,
  ...params: any[]
): Promise<RunResult> {
  if (backend === "mysql") {
    const [result] = await mysqlPool.execute(sql, params);
    const r = result as any;
    return {
      lastInsertId: r.insertId ?? 0,
      changes: r.affectedRows ?? 0,
    };
  }
  const result = sqliteDb.prepare(sql).run(...params);
  return {
    lastInsertId: Number(result.lastInsertRowid),
    changes: result.changes,
  };
}

export async function dbExec(sql: string): Promise<void> {
  if (backend === "mysql") {
    await mysqlPool.query(sql);
  } else {
    sqliteDb.exec(sql);
  }
}

// --- SQL dialect helpers ---

export function sqlRandom(): string {
  return backend === "mysql" ? "RAND()" : "RANDOM()";
}

export function sqlMonth(col: string): string {
  return backend === "mysql"
    ? `MONTH(${col})`
    : `CAST(strftime('%m', ${col}) AS INTEGER)`;
}

export function sqlYear(col: string): string {
  return backend === "mysql"
    ? `YEAR(${col})`
    : `CAST(strftime('%Y', ${col}) AS INTEGER)`;
}

export function sqlDay(col: string): string {
  return backend === "mysql"
    ? `DAY(${col})`
    : `CAST(strftime('%d', ${col}) AS INTEGER)`;
}

export function sqlTimeDiffSeconds(end: string, start: string): string {
  return backend === "mysql"
    ? `TIMESTAMPDIFF(SECOND, ${start}, ${end})`
    : `(julianday(${end}) - julianday(${start})) * 86400`;
}
