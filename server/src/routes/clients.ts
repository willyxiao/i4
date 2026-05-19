import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { requireAuth, requireNonComper } from "../middleware/auth";

const router = Router();

router.get("/search", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const { ClientId, FirstName, LastName, PhoneNumber, Email } = req.query;

  const conditions: string[] = [];
  const params: string[] = [];

  if (ClientId && String(ClientId).trim()) {
    conditions.push("ClientID = ?");
    params.push(String(ClientId));
  }
  if (FirstName && String(FirstName).trim()) {
    conditions.push("FirstName LIKE ?");
    params.push(String(FirstName));
  }
  if (LastName && String(LastName).trim()) {
    conditions.push("LastName LIKE ?");
    params.push(String(LastName));
  }
  if (Email && String(Email).trim()) {
    conditions.push("Email LIKE ?");
    params.push(String(Email));
  }
  if (PhoneNumber && String(PhoneNumber).trim()) {
    const digits = String(PhoneNumber).replace(/\D/g, "");
    if (digits.length >= 3) {
      const areaCode = digits.substring(0, 3);
      const rest = digits.substring(3);
      const phoneLike = rest.split("").join("%");
      conditions.push(
        `(Phone1AreaCode = ? AND Phone1Number LIKE ?) OR (Phone2AreaCode = ? AND Phone2Number LIKE ?)`
      );
      params.push(areaCode, `%${phoneLike}%`, areaCode, `%${phoneLike}%`);
    }
  }

  if (conditions.length === 0) {
    return res.json([]);
  }

  const query = `
    SELECT c.*, ct.Description as Priority
    FROM db_Clients c
    INNER JOIN db_CaseTypes ct ON ct.CaseTypeID = c.CaseTypeID
    WHERE ${conditions.join(" OR ")}
    ORDER BY c.LastName, c.FirstName
    LIMIT 100
  `;

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get("/:id", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const clientId = req.params.id;

  const client = db
    .prepare(
      `SELECT c.*, ct.Description as Priority, cat.Description as Category
       FROM db_Clients c
       LEFT JOIN db_CaseTypes ct ON ct.CaseTypeID = c.CaseTypeID
       LEFT JOIN db_Categories cat ON cat.CategoryID = c.CategoryID
       WHERE c.ClientID = ?`
    )
    .get(clientId) as any;

  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  // Get i4 contacts
  const contacts = db
    .prepare(
      `SELECT c.*, ct.Description as ContactType
       FROM dbi4_Contacts c
       LEFT JOIN db_ContactTypes ct ON ct.ContactTypeID = c.ContactTypeID
       WHERE c.ClientID = ?
       ORDER BY c.ContactDate DESC`
    )
    .all(clientId) as any[];

  // Enrich contacts with user names
  for (const contact of contacts) {
    const addedUser = db
      .prepare("SELECT UserName, Email FROM i3_Users WHERE UserID = ?")
      .get(contact.UserAddedID) as any;
    const editUser = db
      .prepare("SELECT UserName, Email FROM i3_Users WHERE UserID = ?")
      .get(contact.UserEditID) as any;

    contact.UserNameAdded = addedUser?.UserName || "Unknown";
    contact.UserNameEdit = editUser?.UserName || "Unknown";
    contact.UserEmailAdded = addedUser?.Email || "";
    contact.UserEmailEdit = editUser?.Email || "";
  }

  // Get old i3 contacts
  const oldCaseInfo = db
    .prepare("SELECT * FROM db_CaseInfo WHERE ClientID = ?")
    .all(clientId) as any[];

  const oldContacts = db
    .prepare("SELECT * FROM db_Contact WHERE ClientID = ?")
    .all(clientId) as any[];

  // Enrich old contacts
  for (const oc of oldContacts) {
    const user = db
      .prepare("SELECT UserName FROM i3_Users WHERE UserID = ?")
      .get(oc.UserID) as any;
    const ct = db
      .prepare("SELECT Description FROM db_ContactTypes WHERE ContactTypeID = ?")
      .get(oc.ContactTypeID) as any;
    oc.UserName = user?.UserName || "Unknown";
    oc.ContactType = ct?.Description || "Unknown";
  }

  const oldNotes = oldCaseInfo.map((ci: any) => ci.Notes).filter(Boolean).join("\n");

  res.json({
    client,
    contacts,
    oldContacts: {
      exists: oldCaseInfo.length > 0 || oldContacts.length > 0,
      notes: oldNotes,
      contacts: oldContacts,
    },
  });
});

router.post("/", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const {
    FirstName, LastName, Phone1Number, Phone2Number,
    Email, Address, City, State, Zip, Language, ClientNotes,
    CaseTypeID, CategoryID,
  } = req.body;

  const phone1Digits = (Phone1Number || "").replace(/\D/g, "");
  const phone2Digits = (Phone2Number || "").replace(/\D/g, "");

  const result = db
    .prepare(
      `INSERT INTO db_Clients (FirstName, LastName, Phone1AreaCode, Phone1Number,
        Phone2AreaCode, Phone2Number, Email, Address1, City, State, ZIP, Language,
        Notes, CaseTypeID, CategoryID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      FirstName || "",
      LastName || "",
      phone1Digits.substring(0, 3),
      phone1Digits.length > 3
        ? phone1Digits.substring(3, 6) + "-" + phone1Digits.substring(6)
        : "",
      phone2Digits.substring(0, 3),
      phone2Digits.length > 3
        ? phone2Digits.substring(3, 6) + "-" + phone2Digits.substring(6)
        : "",
      Email || "",
      Address || "",
      City || "",
      State || "",
      Zip || "",
      Language || "English",
      ClientNotes || "",
      CaseTypeID || 0,
      CategoryID || 0
    );

  // Create initial contact
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  db.prepare(
    `INSERT INTO dbi4_Contacts (ClientID, ContactTypeID, ContactDate, ContactEditDate,
      UserAddedID, UserEditID, ContactSummary) VALUES (?, 1, ?, ?, ?, ?, 'Client record created.')`
  ).run(result.lastInsertRowid, now, now, req.session.userId, req.session.userId);

  res.json({ success: true, ClientID: result.lastInsertRowid });
});

router.put("/:id", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const clientId = req.params.id;
  const {
    FirstName, LastName, Phone1Number, Phone2Number,
    Email, Address, City, State, Zip, Language, ClientNotes,
    CaseTypeID, CategoryID,
  } = req.body;

  const phone1Digits = (Phone1Number || "").replace(/\D/g, "");
  const phone2Digits = (Phone2Number || "").replace(/\D/g, "");

  db.prepare(
    `UPDATE db_Clients SET FirstName=?, LastName=?, Phone1AreaCode=?, Phone1Number=?,
      Phone2AreaCode=?, Phone2Number=?, Email=?, Address1=?, City=?, State=?, ZIP=?,
      Language=?, Notes=?, CaseTypeID=?, CategoryID=? WHERE ClientID=?`
  ).run(
    FirstName || "",
    LastName || "",
    phone1Digits.substring(0, 3),
    phone1Digits.length > 3
      ? phone1Digits.substring(3, 6) + "-" + phone1Digits.substring(6)
      : "",
    phone2Digits.substring(0, 3),
    phone2Digits.length > 3
      ? phone2Digits.substring(3, 6) + "-" + phone2Digits.substring(6)
      : "",
    Email || "",
    Address || "",
    City || "",
    State || "",
    Zip || "",
    Language || "English",
    ClientNotes || "",
    CaseTypeID || 0,
    CategoryID || 0,
    clientId
  );

  res.json({ success: true });
});

router.delete("/:id", requireNonComper, (req: Request, res: Response) => {
  const db = getDb();
  const clientId = req.params.id;

  db.prepare("DELETE FROM dbi4_Contacts WHERE ClientID = ?").run(clientId);
  db.prepare("DELETE FROM db_Clients WHERE ClientID = ?").run(clientId);

  res.json({ success: true });
});

router.post("/merge", requireNonComper, (req: Request, res: Response) => {
  const db = getDb();
  const { keepClientId, mergeClientId, mergedData } = req.body;

  if (!keepClientId || !mergeClientId) {
    return res
      .status(400)
      .json({ error: "Both keepClientId and mergeClientId are required" });
  }

  // Move contacts from mergeClient to keepClient
  db.prepare("UPDATE dbi4_Contacts SET ClientID = ? WHERE ClientID = ?").run(
    keepClientId,
    mergeClientId
  );
  db.prepare("UPDATE db_Contact SET ClientID = ? WHERE ClientID = ?").run(
    keepClientId,
    mergeClientId
  );
  db.prepare("UPDATE db_CaseInfo SET ClientID = ? WHERE ClientID = ?").run(
    keepClientId,
    mergeClientId
  );

  // Update keepClient with merged data if provided
  if (mergedData) {
    const phone1Digits = (mergedData.Phone1Number || "").replace(/\D/g, "");
    const phone2Digits = (mergedData.Phone2Number || "").replace(/\D/g, "");

    db.prepare(
      `UPDATE db_Clients SET FirstName=?, LastName=?, Phone1AreaCode=?, Phone1Number=?,
        Phone2AreaCode=?, Phone2Number=?, Email=?, Address1=?, City=?, State=?, ZIP=?,
        Language=?, Notes=?, CaseTypeID=?, CategoryID=? WHERE ClientID=?`
    ).run(
      mergedData.FirstName || "",
      mergedData.LastName || "",
      phone1Digits.substring(0, 3),
      phone1Digits.length > 3
        ? phone1Digits.substring(3, 6) + "-" + phone1Digits.substring(6)
        : "",
      phone2Digits.substring(0, 3),
      phone2Digits.length > 3
        ? phone2Digits.substring(3, 6) + "-" + phone2Digits.substring(6)
        : "",
      mergedData.Email || "",
      mergedData.Address || "",
      mergedData.City || "",
      mergedData.State || "",
      mergedData.Zip || "",
      mergedData.Language || "English",
      mergedData.ClientNotes || "",
      mergedData.CaseTypeID || 0,
      mergedData.CategoryID || 0,
      keepClientId
    );
  }

  // Delete merged client
  db.prepare("DELETE FROM db_Clients WHERE ClientID = ?").run(mergeClientId);

  res.json({ success: true, ClientID: keepClientId });
});

export default router;
