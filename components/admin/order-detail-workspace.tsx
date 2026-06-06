"use client";

import { useEffect, useState } from "react";

import { OrderContactCustomerPanel } from "@/components/admin/order-contact-customer-panel";
import { OrderEditForm } from "@/components/admin/order-edit-form";
import { OrderItemCard } from "@/components/admin/order-item-card";
import { OrderKinguinRetryBanner } from "@/components/admin/order-kinguin-retry-banner";
import type { AdminOrderDetail } from "@/lib/admin/orders/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type OrderDetailWorkspaceProps = {
  order: AdminOrderDetail;
};

export function OrderDetailWorkspace({ order }: OrderDetailWorkspaceProps) {
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [activeTab, setActiveTab] = useState("edit");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "email") {
      setActiveTab("email");
    }
    if (hash === "deliver") {
      document
        .getElementById("deliver")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const canDeliver =
    order.status === "PROCESSING" || order.status === "COMPLETED";
  const extraKeyCount = order.items.reduce(
    (sum, item) => sum + Math.max(item.deliveredKeyCount - item.quantity, 0),
    0,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <Card id="deliver">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Productos y keys</CardTitle>
                <CardDescription>
                  {order.deliveredKeyCount}/{order.expectedKeyCount} keys
                  entregadas
                  {extraKeyCount > 0 ? ` · ${extraKeyCount} extra` : ""}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {canDeliver ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="notify-delivery-email"
                      checked={notifyByEmail}
                      onCheckedChange={(checked) =>
                        setNotifyByEmail(checked === true)
                      }
                    />
                    <Label
                      htmlFor="notify-delivery-email"
                      className="text-xs font-normal text-muted-foreground"
                    >
                      Email al entregar
                    </Label>
                  </div>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <OrderKinguinRetryBanner order={order} />

            {order.manualFulfillmentNote ? (
              <p className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
                {order.manualFulfillmentNote}
              </p>
            ) : null}

            {!canDeliver ? (
              <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                Para entregar keys, el pedido debe estar en{" "}
                <strong>Procesando</strong> o <strong>Completado</strong>.
              </p>
            ) : null}

            {order.items.map((item) => (
              <OrderItemCard
                key={item.id}
                order={order}
                item={item}
                canDeliver={canDeliver}
                notifyByEmail={notifyByEmail}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-20 xl:self-start">
        <Card className="overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            defaultValue="edit"
            className="gap-0"
          >
            <CardHeader className="border-b border-border/60 pb-0">
              <CardTitle className="text-base">Acciones</CardTitle>
              <TabsList className="mt-3 w-full">
                <TabsTrigger value="edit" className="flex-1">
                  Editar
                </TabsTrigger>
                <TabsTrigger value="email" className="flex-1">
                  Email
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-4">
              <TabsContent value="edit" className="mt-0">
                <OrderEditForm order={order} embedded />
              </TabsContent>
              <TabsContent value="email" id="email" className="mt-0">
                <OrderContactCustomerPanel order={order} embedded />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </aside>
    </div>
  );
}
