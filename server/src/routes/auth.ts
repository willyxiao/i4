import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../db";

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const db = getDb();
  const user = db
    .prepare(
      "SELECT u.*, p.hash FROM i3_Users u JOIN i3_Passwords p ON u.UserID = p.UserID WHERE u.UserName = ? AND u.Hidden = 0"
    )
    .get(username) as any;

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  if (!bcrypt.compareSync(password, user.hash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const isAdmin =
    db
      .prepare("SELECT UserID FROM i3_Admins WHERE UserID = ?")
      .get(user.UserID) != null;

  // Create log entry
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const logResult = db
    .prepare(
      "INSERT INTO i3_Log (UserID, Login, LastAction, IP) VALUES (?, ?, ?, ?)"
    )
    .run(user.UserID, now, now, req.ip || "unknown");

  req.session.userId = user.UserID;
  req.session.username = user.UserName;
  req.session.isComper = user.Comper === 1;
  req.session.isAdmin = isAdmin;
  req.session.logId = Number(logResult.lastInsertRowid);

  res.json({
    user: {
      UserID: user.UserID,
      UserName: user.UserName,
      Email: user.Email,
      YOG: user.YOG,
      Comper: user.Comper,
      Hidden: user.Hidden,
      isAdmin,
    },
  });
});

router.post("/logout", (req: Request, res: Response) => {
  if (req.session.logId) {
    const db = getDb();
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    db.prepare("UPDATE i3_Log SET Logout = ? WHERE LogID = ?").run(
      now,
      req.session.logId
    );
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ success: true });
  });
});

router.get("/me", (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const db = getDb();
  const user = db
    .prepare("SELECT UserID, UserName, Email, YOG, Comper, Hidden FROM i3_Users WHERE UserID = ?")
    .get(req.session.userId) as any;

  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  // Update log
  if (req.session.logId) {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    db.prepare("UPDATE i3_Log SET LastAction = ? WHERE LogID = ?").run(
      now,
      req.session.logId
    );
  }

  res.json({
    user: {
      ...user,
      isAdmin: req.session.isAdmin,
    },
  });
});

router.get("/users-list", (_req: Request, res: Response) => {
  const db = getDb();
  const users = db
    .prepare("SELECT UserID, UserName FROM i3_Users WHERE Hidden = 0 ORDER BY UserName")
    .all();
  res.json(users);
});

export default router;
