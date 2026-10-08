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
          <PolarGrid stroke="#260305" />
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
              border: '1px solid #65080D',
              borderRadius: 8,
              color: '#E8D5BD',
              fontSize: 12,
            }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#E5161C"
            fill="#E5161C"
            fillOpacity={0.35}
            isAnimationActive
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
