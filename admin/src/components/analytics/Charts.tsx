import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const VERDICT_COLORS: Record<string, string> = {
  BUILD: '#C9B896',
  VALIDATE: '#e50920',
  PIVOT: '#A89588',
  KILL: '#5c060d',
};

const axisStyle = { fill: '#A89588', fontSize: 11 };
const tooltipStyle = {
  background: '#0b0b0b',
  border: '1px solid #760b12',
  borderRadius: 8,
  color: '#E8D5BD',
  fontSize: 12,
};

/** Verdict distribution pie chart (backend-provided data). */
export function VerdictPie({ data }: { data: { verdict: string; count: number }[] }) {
  if (data.length === 0) return <p className="py-10 text-center text-sm text-sand-dim">No completed trials yet.</p>;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="verdict" innerRadius={55} outerRadius={90}>
            {data.map((entry) => (
              <Cell key={entry.verdict} fill={VERDICT_COLORS[entry.verdict] ?? '#760b12'} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Daily signups line chart. */
export function SignupsLine({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) return <p className="py-10 text-center text-sm text-sand-dim">No signups in the last 30 days.</p>;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={axisStyle} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={axisStyle} allowDecimals={false} width={30} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="count" stroke="#e50920" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Trials-by-mode bar chart. */
export function ModesBar({ data }: { data: { mode: string; count: number }[] }) {
  if (data.length === 0) return <p className="py-10 text-center text-sm text-sand-dim">No trials yet.</p>;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
          <XAxis dataKey="mode" tick={axisStyle} tickFormatter={(v: string) => v.replace('_MODE', '').replace('_', ' ')} />
          <YAxis tick={axisStyle} allowDecimals={false} width={30} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" fill="#760b12" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
