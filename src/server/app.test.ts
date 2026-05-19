import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("i4 TypeScript API", () => {
  it("reports a healthy Node runtime", async () => {
    const response = await request(createApp()).get("/api/health").expect(200);

    expect(response.body.data).toMatchObject({
      ok: true,
      service: "i4-typescript",
      runtime: "node"
    });
  });

  it("searches clients by legacy find/add criteria", async () => {
    const response = await request(createApp()).get("/api/clients").query({ lastName: "Santos" }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      firstName: "Maria",
      lastName: "Santos",
      priority: "Urgent"
    });
  });

  it("searches both primary and secondary phone numbers", async () => {
    const response = await request(createApp()).get("/api/clients").query({ phoneNumber: "8575550142" }).expect(200);

    expect(response.body.data[0]).toMatchObject({
      id: 16745,
      firstName: "Maria"
    });
  });

  it("creates and updates a client through typed JSON endpoints", async () => {
    const app = createApp();

    const createResponse = await request(app)
      .post("/api/clients")
      .send({
        firstName: "Taylor",
        lastName: "Nguyen",
        primaryPhone: "617-555-0188",
        email: "taylor.nguyen@example.org"
      })
      .expect(201);

    const clientId = createResponse.body.data.id as number;
    expect(createResponse.body.data).toMatchObject({
      firstName: "Taylor",
      priority: "No Contact Yet"
    });

    const updateResponse = await request(app)
      .patch(`/api/clients/${clientId}`)
      .send({ priority: "Urgent", notes: "Needs a same-day callback." })
      .expect(200);

    expect(updateResponse.body.data).toMatchObject({
      id: clientId,
      priority: "Urgent",
      notes: "Needs a same-day callback."
    });
  });

  it("returns case queues, users, and leaderboard data", async () => {
    const app = createApp();
    const [casesResponse, usersResponse, leaderboardResponse] = await Promise.all([
      request(app).get("/api/cases").query({ type: "me" }).expect(200),
      request(app).get("/api/users").expect(200),
      request(app).get("/api/leaderboard").expect(200)
    ]);

    expect(casesResponse.body.data.every((client: { assignedUserId: number }) => client.assignedUserId === 1)).toBe(true);
    expect(usersResponse.body.data.some((user: { role: string }) => user.role === "admin")).toBe(true);
    expect(leaderboardResponse.body.data[0]).toHaveProperty("contactsLogged");
  });
});
