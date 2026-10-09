import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ScoreBreakdownEntry } from '../../types/verdict';

interface VerdictRadarProps {
  data: ScoreBreakdownEntry[];
}

/** Per-category radar chart fed exclusively by backend scores. */
export function VerdictRadar({ data }: VerdictRadarProps) {
  if (data.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-parchment-dim">
        No category breakdown available yet.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#45090f" gridType="polygon" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#A89588', fontSize: 11, fontFamily: 'Inter' }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: '#A89588', fontSize: 9 }}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#070707',
              border: '1px solid #760b12',
              borderRadius: 8,
              color: '#E8D5BD',
              fontSize: 12,
            }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#e50920"
            fill="#e50920"
            fillOpacity={0.3}
            strokeWidth={2}
            isAnimationActive
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
