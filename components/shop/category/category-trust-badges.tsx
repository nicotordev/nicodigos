import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const trustBadges = [
  {
    label: "Entrega digital rápida",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    label: "Stock disponible",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    label: "Keys globales/regionales",
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    label: "Ofertas activas",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
] as const;

type CategoryTrustBadgesProps = {
  className?: string;
  badgeClassName?: string;
  includeOffers?: boolean;
};

export function CategoryTrustBadges({
  className,
  badgeClassName,
  includeOffers = true,
}: CategoryTrustBadgesProps) {
  const badges = includeOffers
    ? trustBadges
    : trustBadges.filter((badge) => badge.label !== "Ofertas activas");

  return (
    <div className={className}>
      {badges.map((badge) => (
        <Badge
          key={badge.label}
          variant="outline"
          className={cn(
            "shrink-0 rounded-full border font-semibold text-xs py-1 px-3",
            badge.className,
            badgeClassName,
          )}
        >
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
