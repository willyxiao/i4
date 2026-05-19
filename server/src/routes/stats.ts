import { Router, Request, Response } from "express";
import { dbGet, dbAll, sqlMonth, sqlYear, sqlDay, sqlTimeDiffSeconds } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/:userId", requireAuth, async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const total = await dbGet<any>(
    `SELECT COUNT(DISTINCT ClientID) as count FROM dbi4_Contacts
     WHERE UserAddedID = ? OR UserEditID = ?`,
    userId,
    userId
  );

  const byPhone = await dbGet<any>(
    `SELECT COUNT(DISTINCT ClientID) as count FROM dbi4_Contacts
     WHERE (UserAddedID = ? OR UserEditID = ?) AND ContactTypeID IN (10, 11, 12, 13, 14, 20)`,
    userId,
    userId
  );

  const byEmail = await dbGet<any>(
    `SELECT COUNT(DISTINCT ClientID) as count FROM dbi4_Contacts
     WHERE (UserAddedID = ? OR UserEditID = ?) AND ContactTypeID IN (15, 16)`,
    userId,
    userId
  );

  const byAppointment = await dbGet<any>(
    `SELECT COUNT(DISTINCT ClientID) as count FROM dbi4_Contacts
     WHERE (UserAddedID = ? OR UserEditID = ?) AND ContactTypeID IN (30, 31)`,
    userId,
    userId
  );

  const byVoicemail = await dbGet<any>(
    `SELECT COUNT(DISTINCT ClientID) as count FROM dbi4_Contacts
     WHERE (UserAddedID = ? OR UserEditID = ?) AND ContactTypeID = 21`,
    userId,
    userId
  );

  const byMonth = await dbAll(
    `SELECT
      ${sqlMonth("ContactDate")} as month,
      COUNT(DISTINCT ClientID) as clients
     FROM dbi4_Contacts
     WHERE UserAddedID = ? OR UserEditID = ?
     GROUP BY month
     ORDER BY month`,
    userId,
    userId
  );

  const logins = await dbAll(
    `SELECT
      ${sqlYear("Login")} as Y,
      ${sqlMonth("Login")} as M,
      ${sqlDay("Login")} as D,
      CASE
        WHEN Logout IS NOT NULL THEN
          ${sqlTimeDiffSeconds("Logout", "Login")}
        ELSE
          ${sqlTimeDiffSeconds("LastAction", "Login")}
      END as seconds
     FROM i3_Log
     WHERE UserID = ? AND Login IS NOT NULL
     ORDER BY Login`,
    userId
  );

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
