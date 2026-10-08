import { motion } from 'framer-motion';
import { LOADING_MESSAGES } from '../../constants';

interface ThemedLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Themed red-rune loader — used instead of generic spinners
 * wherever a full/inline loading state is needed.
 */
export function ThemedLoader({ message, fullScreen = false }: ThemedLoaderProps) {
  const text = message ?? LOADING_MESSAGES[0];

  const content = (
    <div className="flex flex-col items-center justify-center gap-6 py-10">
      <div className="relative h-24 w-24">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blood-950"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-blood-500"
          animate={{ rotate: -360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-6 rounded-full border border-blood-800"
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="absolute inset-0 grid place-items-center font-cinzel text-2xl text-blood-500 animate-rune-pulse">
          ✕
        </span>
      </div>
      <p className="font-cinzel text-xs tracking-[0.3em] text-parchment-dim sm:text-sm">
        {text}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 grid min-h-screen place-items-center bg-void/95 backdrop-blur">
        {content}
      </div>
    );
  }

  return content;
}

export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <ThemedLoader message={message} />
    </div>
  );
}
