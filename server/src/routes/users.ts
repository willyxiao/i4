import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { dbAll, dbGet, dbRun } from "../db";
import { requireAuth, requireAdmin, requireNonComper } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (_req: Request, res: Response) => {
  const users = await dbAll(
    "SELECT UserID, UserName, Email, YOG, Comper, Hidden FROM i3_Users WHERE Hidden = 0 ORDER BY UserName"
  );
  res.json(users);
});

router.get("/search", requireAuth, async (req: Request, res: Response) => {
  const { search, hidden, compers, yog } = req.query;

  let query = "SELECT DISTINCT UserID, UserName, Email FROM i3_Users WHERE ";
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (hidden !== "true") {
    conditions.push("Hidden = 0");
  }
  if (compers === "true") {
    conditions.push("Comper = 1");
  }
  if (yog && Number(yog) > 0) {
    conditions.push("YOG = ?");
    params.push(Number(yog));
  }
  if (search && String(search).trim()) {
    conditions.push("(LOWER(UserName) LIKE ? OR LOWER(Email) LIKE ?)");
    const s = `%${String(search).toLowerCase()}%`;
    params.push(s, s);
  }

  if (conditions.length === 0) {
    conditions.push("1=1");
  }

  query += conditions.join(" AND ") + " ORDER BY UserName LIMIT 100";
  const users = await dbAll(query, ...params);
  res.json(users);
});

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.params.id;

  const user = await dbGet<any>(
    "SELECT UserID, UserName, Email, YOG, Comper, Hidden FROM i3_Users WHERE UserID = ?",
    userId
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const admin = await dbGet<any>(
    "SELECT UserID FROM i3_Admins WHERE UserID = ?",
    userId
  );
  const isAdmin = admin != null;

  res.json({ ...user, isAdmin });
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { UserName, Email, YOG, CurrentPassword, NewPassword } = req.body;

  if (Number(userId) !== req.session.userId && !req.session.isAdmin) {
    return res.status(403).json({ error: "Cannot edit another user's profile" });
  }

  await dbRun(
    "UPDATE i3_Users SET UserName=?, Email=?, YOG=? WHERE UserID=?",
    UserName,
    Email,
    YOG || 0,
    userId
  );

  if (NewPassword) {
    if (Number(userId) === req.session.userId) {
      const pw = await dbGet<any>(
        "SELECT hash FROM i3_Passwords WHERE UserID = ?",
        userId
      );
      if (!pw || !bcrypt.compareSync(CurrentPassword || "", pw.hash)) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(NewPassword, salt);
    await dbRun(
      "UPDATE i3_Passwords SET hash = ? WHERE UserID = ?",
      hash,
      userId
    );
  }

  if (Number(userId) === req.session.userId) {
    req.session.username = UserName;
  }

  res.json({ success: true });
});

router.post("/", requireNonComper, async (req: Request, res: Response) => {
  const { UserName, Email, YOG, password } = req.body;

  if (!UserName || !Email) {
    return res.status(400).json({ error: "UserName and Email are required" });
  }

  const existing = await dbGet(
    "SELECT UserID FROM i3_Users WHERE UserName = ?",
    UserName
  );
  if (existing) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const result = await dbRun(
    "INSERT INTO i3_Users (UserName, Email, YOG, Comper) VALUES (?, ?, ?, 1)",
    UserName,
    Email,
    YOG || 0
  );

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password || "password", salt);
  await dbRun(
    "INSERT INTO i3_Passwords (UserID, hash) VALUES (?, ?)",
    result.lastInsertId,
    hash
  );

  res.json({ success: true, UserID: result.lastInsertId });
});

router.post("/manage", requireAdmin, async (req: Request, res: Response) => {
  const { action, users: userIds } = req.body;

  if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "Action and users are required" });
  }

  for (const userId of userIds) {
    switch (action) {
      case "graduate":
        await dbRun(
          "UPDATE i3_Users SET Comper = 0 WHERE UserID = ?",
          userId
        );
        break;
      case "ungraduate":
        await dbRun(
          "UPDATE i3_Users SET Comper = 1 WHERE UserID = ?",
          userId
        );
        break;
      case "hide":
        await dbRun(
          "UPDATE i3_Users SET Hidden = 1 WHERE UserID = ?",
          userId
        );
        break;
      case "unhide":
        await dbRun(
          "UPDATE i3_Users SET Hidden = 0 WHERE UserID = ?",
          userId
        );
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  }

  res.json({ success: true });
});

router.post(
  "/:id/reset-password",
  requireAdmin,
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("password", salt);
    await dbRun(
      "UPDATE i3_Passwords SET hash = ? WHERE UserID = ?",
      hash,
      userId
    );
    res.json({ success: true });
  }
);

router.post(
  "/:id/make-admin",
  requireAdmin,
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const existing = await dbGet(
      "SELECT UserID FROM i3_Admins WHERE UserID = ?",
      userId
    );
    if (!existing) {
      await dbRun("INSERT INTO i3_Admins (UserID) VALUES (?)", userId);
    }
    res.json({ success: true });
  }
);

router.post(
  "/:id/revoke-admin",
  requireAdmin,
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    await dbRun("DELETE FROM i3_Admins WHERE UserID = ?", userId);
    res.json({ success: true });
  }
);

export default router;
