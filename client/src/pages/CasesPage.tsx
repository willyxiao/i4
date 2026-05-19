import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCases } from "../api/cases";
import CasesTable from "../components/CasesTable";
import type { CaseRow } from "../types";

export default function CasesPage() {
  const { type } = useParams<{ type: string }>();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCases(type || "priority")
      .then(setCases)
      .finally(() => setLoading(false));
  }, [type]);

  const titles: Record<string, string> = {
    priority: "Cases by Priority",
    date: "Cases by Date",
    me: "My Cases",
    user: "Cases by User",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4 lowercase tracking-wider">
        {titles[type || "priority"] || "Cases"}
      </h1>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <CasesTable cases={cases} />
      )}
    </div>
  );
}
