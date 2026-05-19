import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { dbGet, dbRun, dbAll } from "../db";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = await dbGet<any>(
    "SELECT u.*, p.hash FROM i3_Users u JOIN i3_Passwords p ON u.UserID = p.UserID WHERE u.UserName = ? AND u.Hidden = 0",
    username
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  if (!bcrypt.compareSync(password, user.hash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const admin = await dbGet<any>(
    "SELECT UserID FROM i3_Admins WHERE UserID = ?",
    user.UserID
  );
  const isAdmin = admin != null;

  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const logResult = await dbRun(
    "INSERT INTO i3_Log (UserID, Login, LastAction, IP) VALUES (?, ?, ?, ?)",
    user.UserID,
    now,
    now,
    req.ip || "unknown"
  );

  req.session.userId = user.UserID;
  req.session.username = user.UserName;
  req.session.isComper = user.Comper === 1;
  req.session.isAdmin = isAdmin;
  req.session.logId = logResult.lastInsertId;

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

router.post("/logout", async (req: Request, res: Response) => {
  if (req.session.logId) {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    await dbRun(
      "UPDATE i3_Log SET Logout = ? WHERE LogID = ?",
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

router.get("/me", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await dbGet<any>(
    "SELECT UserID, UserName, Email, YOG, Comper, Hidden FROM i3_Users WHERE UserID = ?",
    req.session.userId
  );

  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  if (req.session.logId) {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    await dbRun(
      "UPDATE i3_Log SET LastAction = ? WHERE LogID = ?",
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

router.get("/users-list", async (_req: Request, res: Response) => {
  const users = await dbAll(
    "SELECT UserID, UserName FROM i3_Users WHERE Hidden = 0 ORDER BY UserName"
  );
  res.json(users);
});

export default router;
