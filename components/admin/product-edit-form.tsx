"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IconTrash, IconX } from "@tabler/icons-react";
import {
  mapProductImagesToGallery,
  ProductGalleryEditor,
  type GalleryImageItem,
} from "@/components/admin/product-gallery-editor";
import { AiTextAssistToolbar } from "@/components/admin/ai-text-assist-toolbar";
import {
  buildMetadataFormState,
  parseMetadataFormSlice,
  ProductKinguinMetadataCard,
} from "@/components/admin/product-kinguin-metadata-card";
import {
  mapProductSystemRequirements,
  type SystemRequirementItem,
} from "@/components/admin/product-system-requirements-editor";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { AiProductContext } from "@/lib/admin/ai/types";
import {
  mapProductVideosToTrailers,
  ProductTrailerEditor,
  type TrailerItem,
} from "@/components/admin/product-trailer-editor";
import {
  deleteProductAction,
  updateProductAction,
} from "@/lib/admin/products/actions";
import type { AdminProductEditData } from "@/lib/admin/products/get-product";
import type {
  SystemRequirementInput,
  UpdateProductInput,
} from "@/lib/admin/products/schemas";
import {
  htmlToPlainText,
  looksLikeHtml,
  normalizeDescriptionForEditor,
  normalizeDescriptionForSave,
  plainTextToHtml,
} from "@/lib/html/text";
import { formatMoney, formatSourceMoney } from "@/lib/currency/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProductEditFormProps = {
  product: AdminProductEditData;
  categories: { id: string; name: string }[];
  exchangeRate: number;
  r2Configured: boolean;
  openAiConfigured: boolean;
};

function buildAiProductContext(
  product: AdminProductEditData,
  form: { name: string; platform: string; isPreorder: boolean },
  metadataForm: { regionalLimitations: string; languages: string },
): AiProductContext {
  const languages = metadataForm.languages
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    name: form.name.trim() || product.name,
    platform: form.platform.trim() || product.platform,
    originalName: product.originalName,
    regionalLimitations:
      metadataForm.regionalLimitations.trim() || product.regionalLimitations,
    developers: product.developers,
    publishers: product.publishers,
    languages: languages.length > 0 ? languages : product.languages,
    isPreorder: form.isPreorder,
  };
}

function parseSystemRequirementsForSave(
  items: SystemRequirementItem[],
): SystemRequirementInput[] {
  return items
    .map(({ clientId: _id, system, requirement }) => ({
      system: system.trim(),
      requirement: requirement.map((line) => line.trim()).filter(Boolean),
    }))
    .filter((item) => item.system.length > 0 && item.requirement.length > 0);
}

function applyAiTextToDescription(text: string): string {
  if (looksLikeHtml(text)) {
    return text.trim();
  }
  return plainTextToHtml(text);
}

export function ProductEditForm({
  product,
  categories,
  exchangeRate,
  r2Configured,
  openAiConfigured,
}: ProductEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [gallery, setGallery] = useState<GalleryImageItem[]>(() =>
    mapProductImagesToGallery(product.images),
  );
  const [trailers, setTrailers] = useState<TrailerItem[]>(() =>
    mapProductVideosToTrailers(product.videos),
  );
  const [metadataForm, setMetadataForm] = useState(() =>
    buildMetadataFormState(product),
  );
  const [systemRequirements, setSystemRequirements] = useState(() =>
    mapProductSystemRequirements(product.systemRequirements),
  );

  const [form, setForm] = useState<
    Omit<
      UpdateProductInput,
      | "images"
      | "videos"
      | "systemRequirements"
      | keyof ReturnType<typeof parseMetadataFormSlice>
    >
  >({
    name: product.name,
    description: normalizeDescriptionForEditor(product.description),
    platform: product.platform,
    costPrice: Math.round(Number(product.costPrice)),
    sellPrice: Math.round(Number(product.sellPrice)),
    qty: product.qty,
    isActive: product.isActive,
    isOffer: product.isOffer,
    isFeatured: product.isFeatured,
    isPreorder: product.isPreorder,
    categoryIds: product.categoryIds,
    tags: product.tags,
  });

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const aiProductContext = buildAiProductContext(product, form, metadataForm);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const payload: UpdateProductInput = {
      ...form,
      description: normalizeDescriptionForSave(form.description),
      ...parseMetadataFormSlice(metadataForm),
      images: gallery.map(({ clientId: _id, ...image }) => image),
      videos: trailers.map(({ clientId: _id, ...video }) => video),
      systemRequirements: parseSystemRequirementsForSave(systemRequirements),
    };

    startTransition(async () => {
      const result = await updateProductAction(product.id, payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage(result.message ?? "Guardado.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProductGalleryEditor
        productId={product.id}
        productName={product.name}
        images={gallery}
        onChange={setGallery}
        r2Configured={r2Configured}
        disabled={isPending}
      />

      <ProductTrailerEditor
        trailers={trailers}
        onChange={setTrailers}
        disabled={isPending}
      />

      <ProductKinguinMetadataCard
        regionName={product.regionName}
        regionId={product.regionId}
        regionalLimitations={product.regionalLimitations}
        developers={product.developers}
        publishers={product.publishers}
        releaseDate={product.releaseDate}
        ageRating={product.ageRating}
        steamAppId={product.steamAppId}
        systemRequirements={systemRequirements}
        onSystemRequirementsChange={setSystemRequirements}
        form={metadataForm}
        onChange={(key, value) =>
          setMetadataForm((prev) => ({ ...prev, [key]: value }))
        }
        disabled={isPending}
        openAiConfigured={openAiConfigured}
        aiProductContext={aiProductContext}
        onAiError={setAiError}
      />

      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>
            Kinguin #{product.kinguinId} · Tipo de cambio EUR→CLP:{" "}
            {exchangeRate.toLocaleString("es-CL")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <FieldLabel htmlFor="name" className="mb-0">
                  Nombre en tienda
                </FieldLabel>
                <AiTextAssistToolbar
                  configured={openAiConfigured}
                  field="name"
                  value={form.name}
                  productContext={aiProductContext}
                  onApply={(text) => updateField("name", text)}
                  onError={setAiError}
                  disabled={isPending}
                />
              </div>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="platform">Plataforma</FieldLabel>
              <Input
                id="platform"
                value={form.platform}
                onChange={(e) => updateField("platform", e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <FieldLabel htmlFor="description" className="mb-0">
                  Descripción
                </FieldLabel>
                <AiTextAssistToolbar
                  configured={openAiConfigured}
                  field="description"
                  value={htmlToPlainText(form.description ?? "")}
                  productContext={aiProductContext}
                  onApply={(text) =>
                    updateField("description", applyAiTextToDescription(text))
                  }
                  onError={setAiError}
                  disabled={isPending}
                />
              </div>
              <FieldDescription>
                Editor rich text. La asistencia IA genera HTML simple para la
                ficha en Chile.
              </FieldDescription>
              <RichTextEditor
                id="description"
                value={form.description ?? ""}
                onChange={(html) => updateField("description", html)}
                disabled={isPending}
              />
            </Field>
            <Field>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      updateField("isActive", checked === true)
                    }
                    disabled={isPending}
                  />
                  <FieldLabel htmlFor="isActive" className="mb-0">
                    Publicado en tienda
                  </FieldLabel>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isOffer"
                    checked={form.isOffer}
                    onCheckedChange={(checked) =>
                      updateField("isOffer", checked === true)
                    }
                    disabled={isPending}
                  />
                  <FieldLabel htmlFor="isOffer" className="mb-0">
                    Destacar en ofertas
                  </FieldLabel>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isFeatured"
                    checked={form.isFeatured}
                    onCheckedChange={(checked) =>
                      updateField("isFeatured", checked === true)
                    }
                    disabled={isPending}
                  />
                  <FieldLabel htmlFor="isFeatured" className="mb-0">
                    Destacar en inicio
                  </FieldLabel>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isPreorder"
                    checked={form.isPreorder}
                    onCheckedChange={(checked) =>
                      updateField("isPreorder", checked === true)
                    }
                    disabled={isPending}
                  />
                  <FieldLabel htmlFor="isPreorder" className="mb-0">
                    Preorder
                  </FieldLabel>
                </div>
              </div>
              <FieldDescription>
                Desmarcado = borrador (no visible para clientes). «Destacar en
                ofertas» → /offers. «Destacar en inicio» → carrusel de la home.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Categorías</FieldLabel>
              <FieldDescription>
                Asocia este producto a una o más categorías de la tienda.
              </FieldDescription>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3 rounded-xl border border-border/80 bg-muted/10 p-4">
                {categories.map((cat) => {
                  const isChecked = form.categoryIds.includes(cat.id);
                  return (
                    <div key={cat.id} className="flex items-center gap-2.5">
                      <Checkbox
                        id={`category-${cat.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          updateField(
                            "categoryIds",
                            checked === true
                              ? [...form.categoryIds, cat.id]
                              : form.categoryIds.filter((id) => id !== cat.id),
                          );
                        }}
                        disabled={isPending}
                      />
                      <label
                        htmlFor={`category-${cat.id}`}
                        className="text-sm font-medium text-foreground/90 cursor-pointer select-none"
                      >
                        {cat.name}
                      </label>
                    </div>
                  );
                })}
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="tags-input">Etiquetas (Tags)</FieldLabel>
              <FieldDescription>
                Escribe una etiqueta y presiona Enter o coma para añadirla.
              </FieldDescription>
              <div className="mt-2.5 space-y-3">
                <Input
                  id="tags-input"
                  placeholder="Ej: Oferta, Acción, Nuevo..."
                  disabled={isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const target = e.currentTarget;
                      const value = target.value.trim().replace(/,$/, "");
                      if (value && !form.tags.includes(value)) {
                        updateField("tags", [...form.tags, value]);
                        target.value = "";
                      }
                    }
                  }}
                />
                {form.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 rounded-xl border border-dashed border-border bg-muted/5 p-3">
                    {form.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border border-border/60 text-xs"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(
                              "tags",
                              form.tags.filter((t) => t !== tag),
                            )
                          }
                          className="text-muted-foreground hover:text-foreground shrink-0 rounded-full focus:outline-none transition-colors"
                          title="Eliminar etiqueta"
                        >
                          <IconX className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precios</CardTitle>
          <CardDescription>
            Costo original Kinguin:{" "}
            {product.sourceCostPrice
              ? formatSourceMoney(
                  product.sourceCostPrice,
                  product.sourceCurrency,
                )
              : "—"}{" "}
            · Precios de venta en pesos chilenos (CLP)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="costPrice">Costo (CLP)</FieldLabel>
                <Input
                  id="costPrice"
                  type="number"
                  min={0}
                  step={1}
                  value={form.costPrice}
                  onChange={(e) =>
                    updateField("costPrice", Number(e.target.value))
                  }
                  disabled={isPending}
                />
                <FieldDescription>
                  Convertido desde EUR al importar
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="sellPrice">Precio venta (CLP)</FieldLabel>
                <Input
                  id="sellPrice"
                  type="number"
                  min={1}
                  step={1}
                  value={form.sellPrice}
                  onChange={(e) =>
                    updateField("sellPrice", Number(e.target.value))
                  }
                  disabled={isPending}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="qty">Stock (qty)</FieldLabel>
              <Input
                id="qty"
                type="number"
                min={0}
                step={1}
                value={form.qty}
                onChange={(e) => updateField("qty", Number(e.target.value))}
                disabled={isPending}
                className="max-w-xs"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {product.offers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Ofertas Kinguin</CardTitle>
            <CardDescription>
              Todas las ofertas devueltas por Kinguin al importar (
              {product.offers.length}). La marcada Default alimenta el
              precio/stock del producto.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Costo origen</TableHead>
                  <TableHead className="text-right">Costo CLP</TableHead>
                  <TableHead className="text-right">Venta CLP</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Text keys</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{offer.name}</span>
                        {offer.isDefault ? (
                          <Badge variant="secondary">Default</Badge>
                        ) : null}
                        {offer.isPreorder ? (
                          <Badge variant="outline">Preorder</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {offer.merchantName ?? "—"}
                    </TableCell>
                    <TableCell>
                      {offer.sourceCostPrice
                        ? formatSourceMoney(
                            offer.sourceCostPrice,
                            offer.sourceCurrency,
                          )
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(offer.costPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(offer.sellPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {offer.qty}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {offer.textQty}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {aiError ? (
        <Alert variant="destructive">
          <AlertTitle>Asistencia IA</AlertTitle>
          <AlertDescription>{aiError}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {message ? (
        <Alert>
          <AlertTitle>Guardado</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner className="size-4" /> : null}
          Guardar cambios
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/products">Volver al listado</Link>
        </Button>
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de peligro</CardTitle>
          <CardDescription>
            Elimina este producto del catálogo. Los pedidos ya realizados
            conservan su historial; se quitará de carritos y listas de deseos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={isPending}>
                <IconTrash className="size-4" />
                Eliminar producto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar «{product.name}»?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El producto desaparecerá del
                  catálogo y ya no podrás volver a importarlo con el mismo slug
                  sin crear uno nuevo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const res = await deleteProductAction(product.id);
                      if (res.success) {
                        toast.success(
                          res.message ?? "Producto eliminado correctamente",
                        );
                        router.push("/admin/products");
                        router.refresh();
                        return;
                      }
                      toast.error(res.error);
                    });
                  }}
                >
                  {isPending ? <Spinner className="size-4" /> : null}
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </form>
  );
}
