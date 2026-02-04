import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HealthBarProps {
  current: number;
  max: number;
  label?: string;
  color?: string;
  className?: string;
}

export const HealthBar = ({ 
  current, 
  max, 
  label, 
  color = "bg-red-500", 
  className 
}: HealthBarProps) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className={cn("w-full max-w-md", className)}>
      {label && (
        <div className="flex justify-between mb-1 text-sm font-bold text-white shadow-black drop-shadow-md">
          <span>{label}</span>
          <span>{current}/{max}</span>
        </div>
      )}
      <div className="h-4 w-full bg-gray-800/80 rounded-full overflow-hidden border border-white/20 backdrop-blur-sm">
        <motion.div
          className={cn("h-full", color)}
          initial={{ width: "100%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  );
};
