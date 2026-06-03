import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SettingsSectionCardProps = {
  id: string;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SettingsSectionCard({
  id,
  title,
  description,
  badge,
  action,
  children,
  className,
  contentClassName,
}: SettingsSectionCardProps) {
  return (
    <Card
      id={id}
      className={cn(
        "scroll-mt-24 border border-border/40 bg-card shadow-sm",
        className,
      )}
    >
      <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base font-bold md:text-lg">
              {title}
            </CardTitle>
            {badge}
          </div>
          {description ? (
            <CardDescription className="text-xs leading-relaxed md:text-sm">
              {description}
            </CardDescription>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn("space-y-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
