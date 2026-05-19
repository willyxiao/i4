import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/send", requireAuth, (req: Request, res: Response) => {
  const { to, from, subject, message, senderName } = req.body;

  if (!to || !from) {
    return res.status(400).json({ error: "'to' and 'from' are required" });
  }

  // In local dev, we just log the email instead of actually sending it
  console.log("=== EMAIL SENT (dev mode) ===");
  console.log(`From: ${senderName ? `${senderName} <${from}>` : from}`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject || "(no subject)"}`);
  console.log(`Message: ${message || "(no message)"}`);
  console.log("=== END EMAIL ===");

  res.json({ success: true });
});

export default router;
