import Logo from "@/components/logo";
import { SignInHero } from "@/components/auth/sign-in-hero";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AuthStatusLayout({
  title,
  description,
  children,
  reverse = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-screen bg-background",
        reverse && "lg:flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[550px] xl:w-[620px] lg:px-8 xl:px-12 bg-muted/20 dark:bg-muted/5 border-border/40",
          reverse ? "lg:border-l lg:border-r-0 border-r" : "border-r",
        )}
      >
        <div className="w-full max-w-[440px]">
          <Card className="w-full border border-border/40 dark:border-border/10 shadow-lg rounded-2xl md:rounded-3xl">
            <CardHeader className="flex flex-col items-center text-center space-y-2 pb-2">
              <Logo href="/" size="lg" priority className="mb-2" />
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </CardTitle>
              {description ? (
                <CardDescription className="text-sm text-muted-foreground">
                  {description}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>

      <SignInHero />
    </div>
  );
}
