import { useState, useEffect, useRef } from "react";
import type { Contact, ContactType } from "../types";

interface Props {
  contact?: Contact;
  contactTypes: ContactType[];
  onSave: (data: {
    ContactID?: number;
    ContactTypeID: number;
    ContactDate: string;
    ContactSummary: string;
  }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }
  // Handle "YYYY-MM-DD HH:MM:SS" format
  const d = dateStr.replace(" ", "T");
  return d.length > 16 ? d.slice(0, 16) : d;
}

export default function ContactEditModal({
  contact,
  contactTypes,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [contactTypeId, setContactTypeId] = useState(
    contact?.ContactTypeID || (contactTypes[0]?.ContactTypeID ?? 0)
  );
  const [contactDate, setContactDate] = useState(
    formatDateForInput(contact?.ContactDate || "")
  );
  const [summary, setSummary] = useState(contact?.ContactSummary || "");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const dateFormatted = contactDate.replace("T", " ") + ":00";
    await onSave({
      ContactID: contact?.ContactID,
      ContactTypeID: contactTypeId,
      ContactDate: dateFormatted,
      ContactSummary: summary,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 shadow-2xl">
        <div className="p-4 border-b flex items-start gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium w-12 text-right">
                Date
              </label>
              <input
                type="datetime-local"
                value={contactDate}
                onChange={(e) => setContactDate(e.target.value)}
                className="flex-1 px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium w-12 text-right">
                Type
              </label>
              <select
                value={contactTypeId}
                onChange={(e) => setContactTypeId(Number(e.target.value))}
                className="flex-1 px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {contactTypes.map((ct) => (
                  <option key={ct.ContactTypeID} value={ct.ContactTypeID}>
                    {ct.Description}
                  </option>
                ))}
              </select>
            </div>
            {contact && (
              <p className="text-xs text-gray-400 pl-16">
                Last Edit: {contact.UserNameEdit} on {contact.ContactEditDate}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Type summary here..."
            className="w-full h-48 px-3 py-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          {contact && onDelete ? (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
