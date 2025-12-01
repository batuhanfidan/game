import React, { memo } from "react";
import { Circle, Ghost, Activity, Shuffle, Target } from "lucide-react";
import type { GameVariant } from "../../types";

interface VariantIconProps {
  variant: GameVariant;
  size?: number;
}

const VariantIcon: React.FC<VariantIconProps> = ({ variant, size = 16 }) => {
  switch (variant) {
    case "classic":
      return <Circle size={size} className="text-green-400" />;
    case "ghost":
      return <Ghost size={size} className="text-purple-400" />;
    case "unstable":
      return <Activity size={size} className="text-orange-400" />;
    case "random":
      return <Shuffle size={size} className="text-blue-400" />;
    case "moving":
      return <Target size={size} className="text-red-400" />;
    default:
      return <Circle size={size} />;
  }
};

export default memo(VariantIcon);
