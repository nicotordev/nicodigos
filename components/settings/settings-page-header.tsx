import { cn } from "@/lib/utils";

type SettingsPageHeaderProps = {
  title: string;
  description: string;
  className?: string;
};

export function SettingsPageHeader({
  title,
  description,
  className,
}: SettingsPageHeaderProps) {
  return (
    <div className={cn("space-y-1.5 border-b border-border/20 pb-4", className)}>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
