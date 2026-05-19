import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/:userId", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const userId = req.params.userId;

  // Clients assisted total
  const total = db
    .prepare(
      `SELECT COUNT(DISTINCT ClientID) as count FROM dbi4_Contacts
       WHERE UserAddedID = ? OR UserEditID = ?`
    )
    .get(userId, userId) as any;

  // By contact type
  const byPhone = db
    .prepare(
      `SELECT COUNT(DISTINCT ClientID) as count FROM dbi4_Contacts
       WHERE (UserAddedID = ? OR UserEditID = ?) AND ContactTypeID IN (10, 11, 12, 13, 14, 20)`
    )
    .get(userId, userId) as any;

  const byEmail = db
    .prepare(
      `SELECT COUNT(DISTINCT ClientID) as count FROM dbi4_Contacts
       WHERE (UserAddedID = ? OR UserEditID = ?) AND ContactTypeID IN (15, 16)`
    )
    .get(userId, userId) as any;

  const byAppointment = db
    .prepare(
      `SELECT COUNT(DISTINCT ClientID) as count FROM dbi4_Contacts
       WHERE (UserAddedID = ? OR UserEditID = ?) AND ContactTypeID IN (30, 31)`
    )
    .get(userId, userId) as any;

  const byVoicemail = db
    .prepare(
      `SELECT COUNT(DISTINCT ClientID) as count FROM dbi4_Contacts
       WHERE (UserAddedID = ? OR UserEditID = ?) AND ContactTypeID = 21`
    )
    .get(userId, userId) as any;

  // By month
  const byMonth = db
    .prepare(
      `SELECT
        CAST(strftime('%m', ContactDate) AS INTEGER) as month,
        COUNT(DISTINCT ClientID) as clients
       FROM dbi4_Contacts
       WHERE UserAddedID = ? OR UserEditID = ?
       GROUP BY month
       ORDER BY month`
    )
    .all(userId, userId);

  // Login activity
  const logins = db
    .prepare(
      `SELECT
        CAST(strftime('%Y', Login) AS INTEGER) as Y,
        CAST(strftime('%m', Login) AS INTEGER) as M,
        CAST(strftime('%d', Login) AS INTEGER) as D,
        CASE
          WHEN Logout IS NOT NULL THEN
            (julianday(Logout) - julianday(Login)) * 86400
          ELSE
            (julianday(LastAction) - julianday(Login)) * 86400
        END as seconds
       FROM i3_Log
       WHERE UserID = ? AND Login IS NOT NULL
       ORDER BY Login`
    )
    .all(userId);

  res.json({
    clients_assisted: total?.count || 0,
    clients_assisted_by_phone: byPhone?.count || 0,
    clients_assisted_by_email: byEmail?.count || 0,
    clients_assisted_by_appointment: byAppointment?.count || 0,
    clients_assisted_by_voicemail: byVoicemail?.count || 0,
    clients_by_month: byMonth,
    logins,
  });
});

export default router;
