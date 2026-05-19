import { Router, Request, Response } from "express";
import { dbRun, dbGet } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { ClientID, ContactTypeID, ContactDate, ContactSummary } = req.body;

  if (!ClientID) {
    return res.status(400).json({ error: "ClientID is required" });
  }

  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const date = ContactDate || now;

  const result = await dbRun(
    `INSERT INTO dbi4_Contacts (ClientID, ContactTypeID, ContactDate, ContactEditDate,
      UserAddedID, UserEditID, ContactSummary) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ClientID,
    ContactTypeID || 0,
    date,
    date,
    req.session.userId,
    req.session.userId,
    ContactSummary || ""
  );

  const contactType = await dbGet<any>(
    "SELECT Description FROM db_ContactTypes WHERE ContactTypeID = ?",
    ContactTypeID || 0
  );

  res.json({
    success: true,
    ContactID: result.lastInsertId,
    ContactType: contactType?.Description || "Unknown",
  });
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const contactId = req.params.id;
  const { ContactTypeID, ContactDate, ContactSummary } = req.body;

  const now = new Date().toISOString().replace("T", " ").substring(0, 19);

  await dbRun(
    `UPDATE dbi4_Contacts SET ContactTypeID=?, ContactDate=?, ContactEditDate=?,
      UserEditID=?, ContactSummary=? WHERE ContactID=?`,
    ContactTypeID || 0,
    ContactDate || now,
    now,
    req.session.userId,
    ContactSummary || "",
    contactId
  );

  const contactType = await dbGet<any>(
    "SELECT Description FROM db_ContactTypes WHERE ContactTypeID = ?",
    ContactTypeID || 0
  );

  res.json({
    success: true,
    ContactType: contactType?.Description || "Unknown",
  });
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const contactId = req.params.id;
  await dbRun("DELETE FROM dbi4_Contacts WHERE ContactID = ?", contactId);
  res.json({ success: true });
});

export default router;
