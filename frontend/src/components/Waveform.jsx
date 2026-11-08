import React from 'react';

export const Waveform = ({ isListening, isSpeaking, isProcessing, volume = 0 }) => {
  // Generate 16 responsive wave bars
  const bars = Array.from({ length: 16 });

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 px-4">
      {bars.map((_, i) => {
        let height = 8;
        let colorClass = 'bg-slate-300';

        if (isListening) {
          // Dynamic height calculated from real-time microphone volume
          const distanceToCenter = Math.abs(i - 7.5);
          const factor = Math.max(0.2, 1 - distanceToCenter / 8);
          height = Math.max(8, Math.min(48, Math.round(8 + volume * factor * 0.4)));
          colorClass = 'bg-gradient-to-t from-rose-500 to-amber-500';
        } else if (isSpeaking) {
          colorClass = 'bg-gradient-to-t from-indigo-500 to-violet-500';
          const delay = `${(i % 5) * 0.15}s`;
          return (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-100 ${colorClass}`}
              style={{
                height: `${12 + (i % 4) * 8}px`,
                animation: `soundwave 0.8s ease-in-out infinite alternate ${delay}`,
              }}
            />
          );
        } else if (isProcessing) {
          colorClass = 'bg-indigo-400';
          const delay = `${i * 0.08}s`;
          return (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all ${colorClass}`}
              style={{
                height: '14px',
                animation: `soundwave 1.2s ease-in-out infinite alternate ${delay}`,
              }}
            />
          );
        }

        return (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-75 ${colorClass}`}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
};

