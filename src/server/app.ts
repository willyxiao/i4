import cors from "cors";
import express from "express";
import path from "node:path";
import { z } from "zod";
import type { CaseListType } from "../shared/types";
import { InMemoryI4Repository, type I4Repository } from "./repository";

const clientInputSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  primaryPhone: z.string().trim().min(1),
  email: z.string().trim().email().optional().or(z.literal("")),
  priority: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

const clientUpdateSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  primaryPhone: z.string().trim().min(1).optional(),
  secondaryPhone: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  priority: z.string().trim().optional(),
  category: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().length(2).optional(),
  zip: z.string().trim().optional(),
  language: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

function parseClientId(value: string): number | undefined {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function parseCaseType(value: unknown): CaseListType {
  return value === "date" || value === "me" ? value : "priority";
}

export function createApp(repository: I4Repository = new InMemoryI4Repository()): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({
      data: {
        ok: true,
        service: "i4-typescript",
        runtime: "node"
      }
    });
  });

  app.get("/api/session", (_request, response) => {
    response.json({ data: repository.getSessionUser() });
  });

  app.get("/api/clients", (request, response) => {
    response.json({
      data: repository.searchClients({
        clientId: String(request.query.clientId ?? ""),
        firstName: String(request.query.firstName ?? ""),
        lastName: String(request.query.lastName ?? ""),
        phoneNumber: String(request.query.phoneNumber ?? ""),
        email: String(request.query.email ?? "")
      })
    });
  });

  app.post("/api/clients", (request, response) => {
    const parsed = clientInputSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Invalid client payload", details: parsed.error.flatten() });
      return;
    }

    const normalized = {
      ...parsed.data,
      email: parsed.data.email === "" ? undefined : parsed.data.email
    };
    response.status(201).json({ data: repository.createClient(normalized) });
  });

  app.get("/api/clients/:id", (request, response) => {
    const id = parseClientId(request.params.id);
    const client = id ? repository.getClient(id) : undefined;

    if (!client) {
      response.status(404).json({ error: "Client not found" });
      return;
    }

    response.json({ data: client });
  });

  app.patch("/api/clients/:id", (request, response) => {
    const id = parseClientId(request.params.id);
    const parsed = clientUpdateSchema.safeParse(request.body);

    if (!id || !parsed.success) {
      response.status(400).json({ error: "Invalid client update", details: parsed.success ? undefined : parsed.error.flatten() });
      return;
    }

    const normalized = {
      ...parsed.data,
      email: parsed.data.email === "" ? undefined : parsed.data.email
    };
    const client = repository.updateClient(id, normalized);

    if (!client) {
      response.status(404).json({ error: "Client not found" });
      return;
    }

    response.json({ data: client });
  });

  app.get("/api/cases", (request, response) => {
    response.json({ data: repository.listCases(parseCaseType(request.query.type)) });
  });

  app.get("/api/users", (_request, response) => {
    response.json({ data: repository.listUsers() });
  });

  app.get("/api/leaderboard", (_request, response) => {
    response.json({ data: repository.getLeaderboard() });
  });

  app.get("/api/legacy/routes", (_request, response) => {
    response.json({
      data: [
        "index.php",
        "find_add.php",
        "client.php",
        "cases.php",
        "leaderboard.php",
        "profile.php",
        "users.php",
        "add_user.php",
        "manage.php",
        "merge.php"
      ]
    });
  });

  const distPath = path.resolve(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_request, response) => {
    response.sendFile(path.join(distPath, "index.html"));
  });

  return app;
}
