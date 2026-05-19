import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../db";
import { requireAuth, requireAdmin, requireNonComper } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const users = db
    .prepare(
      "SELECT UserID, UserName, Email, YOG, Comper, Hidden FROM i3_Users WHERE Hidden = 0 ORDER BY UserName"
    )
    .all();
  res.json(users);
});

router.get("/search", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
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
  const users = db.prepare(query).all(...params);
  res.json(users);
});

router.get("/:id", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const userId = req.params.id;

  const user = db
    .prepare(
      "SELECT UserID, UserName, Email, YOG, Comper, Hidden FROM i3_Users WHERE UserID = ?"
    )
    .get(userId) as any;

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isAdmin =
    db.prepare("SELECT UserID FROM i3_Admins WHERE UserID = ?").get(userId) !=
    null;

  res.json({ ...user, isAdmin });
});

router.put("/:id", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const userId = req.params.id;
  const { UserName, Email, YOG, CurrentPassword, NewPassword } = req.body;

  // Can only edit own profile (or admin can edit anyone)
  if (
    Number(userId) !== req.session.userId &&
    !req.session.isAdmin
  ) {
    return res.status(403).json({ error: "Cannot edit another user's profile" });
  }

  // Update basic info
  db.prepare("UPDATE i3_Users SET UserName=?, Email=?, YOG=? WHERE UserID=?").run(
    UserName,
    Email,
    YOG || 0,
    userId
  );

  // Update password if provided
  if (NewPassword) {
    if (Number(userId) === req.session.userId) {
      // Verify current password for self-edit
      const pw = db
        .prepare("SELECT hash FROM i3_Passwords WHERE UserID = ?")
        .get(userId) as any;
      if (!pw || !bcrypt.compareSync(CurrentPassword || "", pw.hash)) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(NewPassword, salt);
    db.prepare("UPDATE i3_Passwords SET hash = ? WHERE UserID = ?").run(
      hash,
      userId
    );
  }

  // Update session if editing own profile
  if (Number(userId) === req.session.userId) {
    req.session.username = UserName;
  }

  res.json({ success: true });
});

router.post("/", requireNonComper, (req: Request, res: Response) => {
  const db = getDb();
  const { UserName, Email, YOG, password } = req.body;

  if (!UserName || !Email) {
    return res.status(400).json({ error: "UserName and Email are required" });
  }

  // Check if username exists
  const existing = db
    .prepare("SELECT UserID FROM i3_Users WHERE UserName = ?")
    .get(UserName);
  if (existing) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const result = db
    .prepare(
      "INSERT INTO i3_Users (UserName, Email, YOG, Comper) VALUES (?, ?, ?, 1)"
    )
    .run(UserName, Email, YOG || 0);

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password || "password", salt);
  db.prepare("INSERT INTO i3_Passwords (UserID, hash) VALUES (?, ?)").run(
    result.lastInsertRowid,
    hash
  );

  res.json({ success: true, UserID: result.lastInsertRowid });
});

router.post("/manage", requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const { action, users: userIds } = req.body;

  if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "Action and users are required" });
  }

  for (const userId of userIds) {
    switch (action) {
      case "graduate":
        db.prepare("UPDATE i3_Users SET Comper = 0 WHERE UserID = ?").run(
          userId
        );
        break;
      case "ungraduate":
        db.prepare("UPDATE i3_Users SET Comper = 1 WHERE UserID = ?").run(
          userId
        );
        break;
      case "hide":
        db.prepare("UPDATE i3_Users SET Hidden = 1 WHERE UserID = ?").run(
          userId
        );
        break;
      case "unhide":
        db.prepare("UPDATE i3_Users SET Hidden = 0 WHERE UserID = ?").run(
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
  (req: Request, res: Response) => {
    const db = getDb();
    const userId = req.params.id;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("password", salt);
    db.prepare("UPDATE i3_Passwords SET hash = ? WHERE UserID = ?").run(
      hash,
      userId
    );
    res.json({ success: true });
  }
);

router.post(
  "/:id/make-admin",
  requireAdmin,
  (req: Request, res: Response) => {
    const db = getDb();
    const userId = req.params.id;
    const existing = db
      .prepare("SELECT UserID FROM i3_Admins WHERE UserID = ?")
      .get(userId);
    if (!existing) {
      db.prepare("INSERT INTO i3_Admins (UserID) VALUES (?)").run(userId);
    }
    res.json({ success: true });
  }
);

router.post(
  "/:id/revoke-admin",
  requireAdmin,
  (req: Request, res: Response) => {
    const db = getDb();
    const userId = req.params.id;
    db.prepare("DELETE FROM i3_Admins WHERE UserID = ?").run(userId);
    res.json({ success: true });
  }
);

export default router;
