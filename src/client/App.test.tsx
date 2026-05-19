import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

const session = { id: 1, name: "Avery Chen", role: "admin" };
const clients = [
  {
    id: 16745,
    firstName: "Maria",
    lastName: "Santos",
    primaryPhone: "617-555-0199",
    secondaryPhone: "857-555-0142",
    email: "maria.santos@example.org",
    priority: "Urgent",
    caseTypeId: 1,
    category: "Housing",
    lastContactAt: "2026-05-18T15:20:00.000Z",
    lastContactType: "email",
    assignedUserId: 1
  }
];
const clientDetail = {
  ...clients[0],
  state: "MA",
  language: "Spanish",
  notes: "Tenant received a small claims notice.",
  contacts: [
    {
      id: 9001,
      clientId: 16745,
      contactDate: "2026-05-18T15:20:00.000Z",
      type: "email",
      summary: "Forwarded intake summary to legal research.",
      addedBy: "Avery Chen"
    }
  ]
};
const leaderboard = [{ userId: 1, name: "Avery Chen", contactsLogged: 1, clientsTouched: 1 }];

function json(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data })
  } as Response;
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith("/api/session")) {
          return json(session);
        }
        if (url.startsWith("/api/leaderboard")) {
          return json(leaderboard);
        }
        if (url.startsWith("/api/clients/16745")) {
          return json(clientDetail);
        }
        if (url.startsWith("/api/clients")) {
          return json(clients);
        }
        if (url.startsWith("/api/cases")) {
          return json(clients);
        }
        return json([]);
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the converted TypeScript dashboard", async () => {
    render(<App />);

    expect(await screen.findByText(/React and Node TypeScript/i)).toBeInTheDocument();
    expect(screen.getByText("Avery Chen (admin)")).toBeInTheDocument();
    expect(screen.getByText("Core i4 workflows")).toBeInTheDocument();
  });

  it("runs the find/add client search flow and opens client details", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Find/Add Client" }));
    const searchForm = screen.getByRole("form", { name: "Search clients" });
    await user.type(within(searchForm).getByPlaceholderText("Last name"), "Santos");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Santos, Maria")).toBeInTheDocument();

    await user.click(screen.getByText("Santos, Maria"));
    await waitFor(() => expect(screen.getByRole("complementary", { name: "Client detail" })).toBeInTheDocument());
    expect(screen.getByText("Forwarded intake summary to legal research.")).toBeInTheDocument();
  });
});
