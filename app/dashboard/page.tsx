import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Mi cuenta</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Hola, {session.user.name ?? "usuario"}
        </h1>
        <p className="text-muted-foreground">{session.user.email}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
        {session.user.role === "ADMIN" ? (
          <Button variant="outline" asChild>
            <Link href="/admin">Panel admin</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
