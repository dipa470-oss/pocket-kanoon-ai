import { Crown, Sparkles } from "lucide-react";
import { isPaidPlan } from "@/lib/pricing";
import { planLabel } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

type PremiumBadgeProps = {
  plan: string;
  className?: string;
  showLabel?: boolean;
};

export function PremiumBadge({ plan, className, showLabel = true }: PremiumBadgeProps) {
  if (!isPaidPlan(plan)) return null;

  const isPlus = plan === "premium_plus";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
        isPlus
          ? "bg-gradient-to-r from-gold-soft/90 to-gold text-primary-foreground shadow-gold"
          : "bg-primary/15 text-primary border border-primary/30",
        className,
      )}
    >
      {isPlus ? <Sparkles className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
      {showLabel && (isPlus ? "Premium Plus" : planLabel(plan))}
    </span>
  );
}
