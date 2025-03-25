import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

interface TimerProps {
  totalMinutes: number;
  onTimeUp: () => void;
}

export function Timer({ totalMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const timeColor = timeLeft < 300 ? 'text-red-600' : 'text-gray-800';

  return (
    <div className="flex items-center space-x-2 text-lg font-semibold">
      <TimerIcon className="h-6 w-6" />
      <span className={timeColor}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}