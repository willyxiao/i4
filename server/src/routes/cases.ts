import { Router, Request, Response } from "express";
import { dbAll } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { type, userId } = req.query;

  let query = "";
  const params: (string | number)[] = [];

  switch (type) {
    case "priority": {
      query = `
        SELECT c.*, ct.Description as Priority,
          (SELECT con.ContactTypeID FROM dbi4_Contacts con
           WHERE con.ClientID = c.ClientID
           ORDER BY con.ContactDate DESC LIMIT 1) as ContactTypeID
        FROM db_Clients c
        INNER JOIN db_CaseTypes ct ON ct.CaseTypeID = c.CaseTypeID
        WHERE c.CaseTypeID IN (1, 21, 22, 11)
        ORDER BY c.CaseTypeID, c.LastName, c.FirstName
      `;
      break;
    }
    case "date": {
      query = `
        SELECT c.*, ct.Description as Priority,
          MAX(con.ContactDate) as LastContactDate,
          (SELECT con2.ContactTypeID FROM dbi4_Contacts con2
           WHERE con2.ClientID = c.ClientID
           ORDER BY con2.ContactDate DESC LIMIT 1) as ContactTypeID
        FROM db_Clients c
        INNER JOIN db_CaseTypes ct ON ct.CaseTypeID = c.CaseTypeID
        LEFT JOIN dbi4_Contacts con ON con.ClientID = c.ClientID
        GROUP BY c.ClientID
        ORDER BY LastContactDate DESC
        LIMIT 200
      `;
      break;
    }
    case "me": {
      const uid = req.session.userId;
      query = `
        SELECT DISTINCT c.*, ct.Description as Priority,
          (SELECT con2.ContactTypeID FROM dbi4_Contacts con2
           WHERE con2.ClientID = c.ClientID
           ORDER BY con2.ContactDate DESC LIMIT 1) as ContactTypeID
        FROM db_Clients c
        INNER JOIN db_CaseTypes ct ON ct.CaseTypeID = c.CaseTypeID
        INNER JOIN dbi4_Contacts con ON con.ClientID = c.ClientID
        WHERE con.UserAddedID = ? OR con.UserEditID = ?
        ORDER BY c.LastName, c.FirstName
      `;
      params.push(uid!, uid!);
      break;
    }
    case "user": {
      const targetUserId = userId ? Number(userId) : req.session.userId;
      query = `
        SELECT DISTINCT c.*, ct.Description as Priority,
          (SELECT con2.ContactTypeID FROM dbi4_Contacts con2
           WHERE con2.ClientID = c.ClientID
           ORDER BY con2.ContactDate DESC LIMIT 1) as ContactTypeID
        FROM db_Clients c
        INNER JOIN db_CaseTypes ct ON ct.CaseTypeID = c.CaseTypeID
        INNER JOIN dbi4_Contacts con ON con.ClientID = c.ClientID
        WHERE con.UserAddedID = ? OR con.UserEditID = ?
        ORDER BY c.LastName, c.FirstName
      `;
      params.push(targetUserId!, targetUserId!);
      break;
    }
    default:
      return res.status(400).json({ error: "Invalid case type" });
  }

  const cases = await dbAll(query, ...params);
  res.json(cases);
});

export default router;
