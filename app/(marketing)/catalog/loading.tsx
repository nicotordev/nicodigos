import { CatalogPageShell } from "@/components/store/catalog-page-shell";

export default function CatalogLoading() {
  return (
    <main className="flex-1 relative overflow-hidden bg-background">
      <div className="absolute inset-0 admin-dashboard-grid opacity-20 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[110px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 relative z-10">
        <CatalogPageShell />
      </div>
    </main>
  );
}
