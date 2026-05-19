import { useState } from "react";
import { sendEmail } from "../api/reference";

interface Props {
  initialTo?: string;
  initialFrom?: string;
  initialSubject?: string;
  onClose: () => void;
}

const DISCLAIMER = `\n\n--\nThe Small Claims Advisory Service\nPhillips Brooks House, Harvard Yard, Cambridge, MA 02138\n(617) 497-5690\nhttp://www.masmallclaims.org\n\nDisclaimer: Members of the Small Claims Advisory Service are neither lawyers nor law students. We are volunteer undergraduates who have studied the small claims law in Massachusetts. The information included in this email is only information and should not be considered legal advice, which you can only receive from a lawyer.`;

export default function EmailModal({
  initialTo = "",
  initialFrom = "",
  initialSubject = "",
  onClose,
}: Props) {
  const [to, setTo] = useState(initialTo);
  const [from, setFrom] = useState(initialFrom);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(DISCLAIMER);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!to || !from) return;
    setSending(true);
    try {
      await sendEmail({ to, from, subject, message, senderName: "" });
      setSent(true);
      setTimeout(onClose, 1500);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 shadow-2xl">
        <div className="p-4 border-b space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Send Email</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              &times;
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-16 text-right">To</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-16 text-right">From</label>
            <input
              type="email"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-16 text-right">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject goes here..."
              className="flex-1 px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message here..."
            className="w-full h-48 px-3 py-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          {sent ? (
            <span className="text-green-600 font-medium text-sm">
              Email sent!
            </span>
          ) : (
            <>
              <button
                onClick={handleSend}
                disabled={sending || !to || !from}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
