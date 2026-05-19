import { useState, useEffect } from "react";
import { getQuote } from "../api/reference";

export default function HomePage() {
  const [quote, setQuote] = useState("");
  const [person, setPerson] = useState("");

  useEffect(() => {
    getQuote().then((data: { quote: string }) => {
      const raw = data.quote;
      const idx = raw.lastIndexOf(" - ");
      if (idx > 0) {
        setQuote(raw.substring(1, idx - 1));
        setPerson(raw.substring(idx + 3));
      } else {
        setQuote(raw);
      }
    });
  }, []);

  return (
    <div>
      <div className="relative bg-gradient-to-br from-scas-green via-scas-mid to-scas-dark h-[500px] flex items-center justify-center">
        <h1 className="text-8xl font-bold text-white tracking-tight">
          SCAS i4
        </h1>
      </div>
      <div className="text-center py-12 px-4">
        {quote && (
          <>
            <blockquote className="text-2xl font-display italic text-gray-700 max-w-2xl mx-auto">
              &ldquo;{quote}&rdquo;
            </blockquote>
            {person && (
              <p className="mt-4 text-gray-500">— {person}</p>
            )}
          </>
        )}
      </div>
      <hr className="max-w-4xl mx-auto" />
    </div>
  );
}
