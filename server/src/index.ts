import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth";
import clientRoutes from "./routes/clients";
import contactRoutes from "./routes/contacts";
import caseRoutes from "./routes/cases";
import userRoutes from "./routes/users";
import statsRoutes from "./routes/stats";
import referenceRoutes from "./routes/reference";
import emailRoutes from "./routes/email";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "i4-dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 30 * 60 * 1000, // 30 minutes idle timeout
    },
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/reference", referenceRoutes);
app.use("/api/email", emailRoutes);

// Serve frontend in production
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`i4 server running on http://localhost:${PORT}`);
});
