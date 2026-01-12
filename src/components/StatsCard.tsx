import { LucideIcon } from "lucide-react";

type StatVariant = "blue" | "yellow" | "cyan" | "green" | "purple";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: StatVariant;
}

const variantStyles: Record<StatVariant, { bg: string; iconColor: string }> = {
  blue: {
    bg: "bg-[hsl(var(--stat-blue-bg))]",
    iconColor: "text-[hsl(var(--stat-blue))]",
  },
  yellow: {
    bg: "bg-[hsl(var(--stat-yellow-bg))]",
    iconColor: "text-[hsl(var(--stat-yellow))]",
  },
  cyan: {
    bg: "bg-[hsl(var(--stat-cyan-bg))]",
    iconColor: "text-[hsl(var(--stat-cyan))]",
  },
  green: {
    bg: "bg-[hsl(var(--stat-green-bg))]",
    iconColor: "text-[hsl(var(--stat-green))]",
  },
  purple: {
    bg: "bg-[hsl(var(--stat-purple-bg))]",
    iconColor: "text-[hsl(var(--stat-purple))]",
  },
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, variant }) => {
  const styles = variantStyles[variant];
  
  return (
    <div
      className={`${styles.bg} rounded-2xl p-6 flex items-center justify-between transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.02]`}
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-[hsl(var(--foreground))] opacity-70 mb-1">{title}</p>
        <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{value}</p>
      </div>
      <div className={`${styles.iconColor}`}>
        <Icon className="w-10 h-10" strokeWidth={1.5} />
      </div>
    </div>
  );
};

export default StatsCard;