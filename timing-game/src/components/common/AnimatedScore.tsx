import React, { useEffect, useState, useRef } from "react";

interface AnimatedScoreProps {
  score: number;
  label?: string;
}

const AnimatedScore: React.FC<AnimatedScoreProps> = ({ score, label }) => {
  const [animate, setAnimate] = useState(false);
  const [diff, setDiff] = useState(0);
  const prevScore = useRef(score);

  useEffect(() => {
    if (score > prevScore.current) {
      setDiff(score - prevScore.current);
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
    prevScore.current = score;
  }, [score]);

  return (
    <div className="relative flex flex-col items-center">
      {label && (
        <span className="text-xs text-gray-400 mb-1 font-bold tracking-wider uppercase">
          {label}
        </span>
      )}
      <div className="relative">
        <span
          className={`text-3xl md:text-4xl font-black transition-all duration-300 block ${
            animate ? "scale-125 text-green-400" : "text-white"
          }`}
        >
          {score}
        </span>

        {animate && (
          <span className="absolute -right-6 -top-2 text-lg font-bold text-green-400 animate-float-up pointer-events-none">
            +{diff}
          </span>
        )}
      </div>
    </div>
  );
};

export default AnimatedScore;
