import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="mt-8 pb-6 px-4 text-xs text-gray-500">
      <hr className="mb-4" />
      {user && (
        <p className="mb-2">
          Logged in as <Link to="/profile" className="text-blue-600 hover:underline">{user.UserName}</Link>.
        </p>
      )}
      <p className="mb-2">
        Disclaimer: For informational purposes only. The members of the Small
        Claims Advisory Service are undergraduate students at Harvard College,
        and are not lawyers. No aspect of this system is designed or intended
        to dispense legal advice; any actions you may choose to take or not to
        take in or out of court are at your own discretion.
      </p>
    </footer>
  );
}
