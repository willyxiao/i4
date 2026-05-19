import type Database from "better-sqlite3";
import bcrypt from "bcryptjs";

export function seedDatabase(db: Database.Database) {
  const salt = bcrypt.genSaltSync(10);

  db.exec("BEGIN");

  // Case Types (priorities)
  const caseTypes = [
    [0, "Undefined", 0],
    [1, "Urgent", 0],
    [11, "Phone Tag", 0],
    [21, "Never Been Contacted", 0],
    [22, "One Message Left", 0],
    [61, "Resolved", 0],
    [99, "Completed", 0],
  ];
  const insertCaseType = db.prepare(
    "INSERT INTO db_CaseTypes (CaseTypeID, Description, Deprecated) VALUES (?, ?, ?)"
  );
  for (const ct of caseTypes) insertCaseType.run(...ct);

  // Categories
  const categories = [
    [1, "Small Claims", 1],
    [2, "Consumer Protection", 2],
    [3, "Housing", 3],
    [4, "Employment", 4],
    [5, "Family", 5],
    [6, "Other", 6],
  ];
  const insertCategory = db.prepare(
    "INSERT INTO db_Categories (CategoryID, Description, SortKey) VALUES (?, ?, ?)"
  );
  for (const cat of categories) insertCategory.run(...cat);

  // Contact Types
  const contactTypes: [number, string, number][] = [
    [1, "Create client record", 0],
    [2, "Create new case record", 0],
    [10, "Called, left message", 1],
    [11, "Called, no answer", 1],
    [12, "Called, helped by phone", 1],
    [13, "Called, wrong number", 1],
    [14, "Called, number not in service", 1],
    [15, "Email Received", 1],
    [16, "Email, Response Sent", 1],
    [20, "Call received, helped by phone", 0],
    [21, "Voicemail received", 1],
    [24, "Legal Research replied to question", 0],
    [29, "Other", 1],
    [30, "Met with client", 1],
    [31, "Appointment scheduled", 1],
    [90, "Case referred to external agency", 0],
    [91, "Case referred to GBLS Office", 0],
    [92, "Case referred to Legal Research", 1],
    [93, "Case referred to PBH Office", 0],
    [97, "Assistance not required", 1],
    [99, "Case marked complete", 0],
  ];
  const insertContactType = db.prepare(
    "INSERT INTO db_ContactTypes (ContactTypeID, Description, Visible) VALUES (?, ?, ?)"
  );
  for (const ct of contactTypes) insertContactType.run(...ct);

  // Quotes
  const quotes = [
    '"Make each day your masterpiece." - John Wooden',
    '"The best way to predict the future is to create it." - Peter Drucker',
    '"Justice delayed is justice denied." - William E. Gladstone',
    '"Equal justice under law." - Motto of the U.S. Supreme Court',
    '"Injustice anywhere is a threat to justice everywhere." - Martin Luther King Jr.',
    '"The law is reason, free from passion." - Aristotle',
    '"Access to justice is a fundamental right." - Ruth Bader Ginsburg',
  ];
  const insertQuote = db.prepare("INSERT INTO i3_Quotes (quote) VALUES (?)");
  for (const q of quotes) insertQuote.run(q);

  // Demo Users
  const users = [
    [1, "Willy Xiao", "willy@chenxiao.us", 2015, 0, 0],
    [2, "Chris Lim", "klim01@college.harvard.edu", 2016, 0, 0],
    [3, "Demo Comper", "comper@example.com", 2026, 1, 0],
  ];
  const insertUser = db.prepare(
    "INSERT INTO i3_Users (UserID, UserName, Email, YOG, Comper, Hidden) VALUES (?, ?, ?, ?, ?, ?)"
  );
  for (const u of users) insertUser.run(...u);

  // Passwords (all "password")
  const defaultHash = bcrypt.hashSync("password", salt);
  const insertPassword = db.prepare(
    "INSERT INTO i3_Passwords (UserID, hash) VALUES (?, ?)"
  );
  for (const u of users) insertPassword.run(u[0], defaultHash);

  // Admins
  db.prepare("INSERT INTO i3_Admins (UserID) VALUES (?)").run(1);
  db.prepare("INSERT INTO i3_Admins (UserID) VALUES (?)").run(2);

  // Demo Clients
  const clients = [
    [
      "John",
      "Smith",
      "617",
      "555-1234",
      "",
      "",
      "john@example.com",
      "123 Main St",
      "Boston",
      "MA",
      "02101",
      "English",
      "Initial consultation about small claims case.",
      1,
      1,
    ],
    [
      "Maria",
      "Garcia",
      "617",
      "555-5678",
      "",
      "",
      "maria@example.com",
      "456 Oak Ave",
      "Cambridge",
      "MA",
      "02139",
      "Spanish",
      "Landlord dispute regarding security deposit.",
      21,
      3,
    ],
    [
      "James",
      "Williams",
      "781",
      "555-9012",
      "781",
      "555-9013",
      "james@example.com",
      "789 Elm Rd",
      "Somerville",
      "MA",
      "02143",
      "English",
      "",
      11,
      2,
    ],
    [
      "Sarah",
      "Johnson",
      "508",
      "555-3456",
      "",
      "",
      "sarah@example.com",
      "321 Pine Ln",
      "Worcester",
      "MA",
      "01608",
      "English",
      "Consumer protection issue with auto repair shop.",
      0,
      2,
    ],
    [
      "Michael",
      "Brown",
      "617",
      "555-7890",
      "",
      "",
      "",
      "654 Maple Dr",
      "Boston",
      "MA",
      "02118",
      "English",
      "Employment wage dispute.",
      22,
      4,
    ],
  ];
  const insertClient = db.prepare(
    `INSERT INTO db_Clients (FirstName, LastName, Phone1AreaCode, Phone1Number,
      Phone2AreaCode, Phone2Number, Email, Address1, City, State, ZIP, Language,
      Notes, CaseTypeID, CategoryID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const c of clients) insertClient.run(...c);

  // Demo Contacts
  const contacts = [
    [1, 21, "2024-01-15 10:30:00", "2024-01-15 10:30:00", 1, 1, "Client called about small claims case against neighbor. Advised on filing process and court fees."],
    [1, 12, "2024-02-01 14:00:00", "2024-02-01 14:00:00", 2, 2, "Follow-up call. Helped client understand the statute of limitations."],
    [2, 15, "2024-01-20 09:00:00", "2024-01-20 09:00:00", 1, 1, "Email received regarding security deposit dispute with landlord."],
    [2, 16, "2024-01-22 11:00:00", "2024-01-22 11:00:00", 2, 2, "Sent response with information about MA security deposit law (Ch. 186, Sec. 15B)."],
    [3, 10, "2024-02-10 16:00:00", "2024-02-10 16:00:00", 1, 1, "Called client, left voicemail about their consumer protection inquiry."],
    [4, 21, "2024-02-15 13:00:00", "2024-02-15 13:00:00", 2, 2, "Voicemail received from new client about auto repair shop dispute."],
    [5, 15, "2024-03-01 10:00:00", "2024-03-01 10:00:00", 1, 1, "Email received about unpaid wages. Advised to contact AG office."],
  ];
  const insertContact = db.prepare(
    `INSERT INTO dbi4_Contacts (ClientID, ContactTypeID, ContactDate, ContactEditDate,
      UserAddedID, UserEditID, ContactSummary) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  for (const c of contacts) insertContact.run(...c);

  db.exec("COMMIT");
}
