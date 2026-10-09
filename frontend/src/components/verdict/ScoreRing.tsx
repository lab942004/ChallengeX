import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  verdict: string;
  size?: number;
}

/** Animated circular score ring — the number itself comes from the backend. */
export function ScoreRing({ score, verdict, size = 220 }: ScoreRingProps) {
  const radius = size / 2 - 16;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Score ${score} out of 100`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#101010"
          strokeWidth="12"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#760b12" />
            <stop offset="60%" stopColor="#e50920" />
            <stop offset="100%" stopColor="#ff5563" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="font-cinzel text-5xl font-bold text-parchment-light"
        >
          {score}
        </motion.span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.24em] text-parchment-dim">
          of 100
        </span>
        <span className="mt-3 rounded-md border border-blood-600/60 bg-blood-950/70 px-3 py-1 font-cinzel text-xs tracking-[0.2em] text-blood-400">
          {verdict}
        </span>
      </div>
    </div>
  );
}
