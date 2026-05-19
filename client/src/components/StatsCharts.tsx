import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { UserStats } from "../types";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
const MONTHS = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface Props {
  stats: UserStats;
}

export default function StatsCharts({ stats }: Props) {
  const pieData = [
    { name: "Phone", value: stats.clients_assisted_by_phone },
    { name: "Email", value: stats.clients_assisted_by_email },
    { name: "Appointment", value: stats.clients_assisted_by_appointment },
    { name: "Voicemail", value: stats.clients_assisted_by_voicemail },
  ].filter((d) => d.value > 0);

  const barData = stats.clients_by_month.map((m) => ({
    month: MONTHS[m.month] || String(m.month),
    Contacts: m.clients,
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-600 mb-4 lowercase tracking-wider">
        stats
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Clients Assisted: {stats.clients_assisted}
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">
              No data yet
            </p>
          )}
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Assisted by Month
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="Contacts" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">
              No data yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
