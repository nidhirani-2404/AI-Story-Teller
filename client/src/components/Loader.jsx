import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const LOADING_STEPS = [
  'Warming up imagination...',
  'Conjuring characters...',
  'Weaving narrative...',
  'Polishing draft...'
];

export default function Loader() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-200">Writing story...</p>
        <p className="text-xs text-slate-400">{LOADING_STEPS[stepIndex]}</p>
      </div>
    </div>
  );
}
