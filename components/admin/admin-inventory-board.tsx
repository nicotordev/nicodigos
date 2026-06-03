"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconAlertTriangle, IconSearch } from "@tabler/icons-react";
import type { AdminInventoryItem } from "@/lib/admin/inventory/types";
import { formatMoney } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminInventoryBoardProps = {
  products: AdminInventoryItem[];
  threshold: number;
};

export function AdminInventoryBoard({
  products,
  threshold,
}: AdminInventoryBoardProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return products;
    }
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q) ||
        String(p.kinguinId).includes(q),
    );
  }, [products, query]);

  const outOfStock = products.filter((p) => p.qty === 0).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Alertas</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {products.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Productos con menos de {threshold} unidades
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sin stock</CardDescription>
            <CardTitle className="text-2xl tabular-nums text-destructive">
              {outOfStock}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Publicados</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {products.filter((p) => p.isActive).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <InputGroup className="max-w-md">
        <InputGroupAddon>
          <IconSearch className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto o plataforma…"
        />
      </InputGroup>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconAlertTriangle className="size-5 text-amber-500" />
            Stock bajo
          </CardTitle>
          <CardDescription>
            Revisa y actualiza qty en la ficha de cada producto.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {products.length === 0
                ? "Inventario saludable: no hay productos bajo el umbral."
                : "Ningún resultado para la búsqueda."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="max-w-[240px] truncate font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.platform}</TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "outline"}>
                        {product.isActive ? "Publicado" : "Borrador"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={product.qty === 0 ? "destructive" : "outline"}
                        className="tabular-nums"
                      >
                        {product.qty === 0 ? "Agotado" : product.qty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(product.sellPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          Editar
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
