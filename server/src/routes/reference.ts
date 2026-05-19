import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/contact-types", requireAuth, (_req: Request, res: Response) => {
  const db = getDb();
  const types = db
    .prepare(
      "SELECT ContactTypeID, Description FROM db_ContactTypes WHERE Visible = 1 ORDER BY Description"
    )
    .all();
  res.json(types);
});

router.get("/priorities", requireAuth, (_req: Request, res: Response) => {
  const db = getDb();
  const priorities = db
    .prepare(
      "SELECT CaseTypeID, Description FROM db_CaseTypes WHERE Deprecated = 0 ORDER BY Description"
    )
    .all();
  res.json(priorities);
});

router.get("/categories", requireAuth, (_req: Request, res: Response) => {
  const db = getDb();
  const categories = db
    .prepare(
      "SELECT CategoryID, Description FROM db_Categories ORDER BY SortKey"
    )
    .all();
  res.json(categories);
});

router.get("/quote", (_req: Request, res: Response) => {
  const db = getDb();
  const quote = db
    .prepare("SELECT quote FROM i3_Quotes ORDER BY RANDOM() LIMIT 1")
    .get() as any;
  res.json({ quote: quote?.quote || '"Make each day your masterpiece." - John Wooden' });
});

// US States
router.get("/states", (_req: Request, res: Response) => {
  res.json([
    { code: "", name: "" },
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
    { code: "DC", name: "District of Columbia" },
  ]);
});

export default router;
