import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { CategoryEditForm } from "@/components/admin/category-edit-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getAdminCategoryForEdit } from "@/lib/admin/categories/queries";
import { isOpenAIConfigured } from "@/lib/openai/env";
import { isR2Configured } from "@/lib/r2/env";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await getAdminCategoryForEdit(id);
  return {
    title: category ? `Editar: ${category.name}` : "Editar categoría",
  };
}

export default async function AdminCategoryEditPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { created } = await searchParams;
  const category = await getAdminCategoryForEdit(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 md:space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/admin/categories">
            <IconArrowLeft className="size-4" />
            Volver a categorías
          </Link>
        </Button>
        <DashboardPageHeader
          title="Editar categoría"
          description="Actualiza textos, imagen de icono y banner de la categoría."
        />
      </div>

      {created === "1" ? (
        <Alert>
          <AlertTitle>Categoría creada</AlertTitle>
          <AlertDescription>
            Ya puedes subir la imagen y el banner, o pegar URLs externas.
          </AlertDescription>
        </Alert>
      ) : null}

      <CategoryEditForm
        category={category}
        r2Configured={isR2Configured()}
        openAiConfigured={isOpenAIConfigured()}
      />
    </div>
  );
}
