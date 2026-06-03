type DashboardPageHeaderProps = {
  title: string;
  description: string;
};

export function DashboardPageHeader({
  title,
  description,
}: DashboardPageHeaderProps) {
  return (
    <div className="space-y-1.5 border-b border-border/20 pb-4">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
