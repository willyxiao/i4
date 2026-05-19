import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const { ClientID, ContactTypeID, ContactDate, ContactSummary } = req.body;

  if (!ClientID) {
    return res.status(400).json({ error: "ClientID is required" });
  }

  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const date = ContactDate || now;

  const result = db
    .prepare(
      `INSERT INTO dbi4_Contacts (ClientID, ContactTypeID, ContactDate, ContactEditDate,
        UserAddedID, UserEditID, ContactSummary) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      ClientID,
      ContactTypeID || 0,
      date,
      date,
      req.session.userId,
      req.session.userId,
      ContactSummary || ""
    );

  const contactType = db
    .prepare("SELECT Description FROM db_ContactTypes WHERE ContactTypeID = ?")
    .get(ContactTypeID || 0) as any;

  res.json({
    success: true,
    ContactID: result.lastInsertRowid,
    ContactType: contactType?.Description || "Unknown",
  });
});

router.put("/:id", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const contactId = req.params.id;
  const { ContactTypeID, ContactDate, ContactSummary } = req.body;

  const now = new Date().toISOString().replace("T", " ").substring(0, 19);

  db.prepare(
    `UPDATE dbi4_Contacts SET ContactTypeID=?, ContactDate=?, ContactEditDate=?,
      UserEditID=?, ContactSummary=? WHERE ContactID=?`
  ).run(
    ContactTypeID || 0,
    ContactDate || now,
    now,
    req.session.userId,
    ContactSummary || "",
    contactId
  );

  const contactType = db
    .prepare("SELECT Description FROM db_ContactTypes WHERE ContactTypeID = ?")
    .get(ContactTypeID || 0) as any;

  res.json({
    success: true,
    ContactType: contactType?.Description || "Unknown",
  });
});

router.delete("/:id", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const contactId = req.params.id;

  db.prepare("DELETE FROM dbi4_Contacts WHERE ContactID = ?").run(contactId);
  res.json({ success: true });
});

export default router;
