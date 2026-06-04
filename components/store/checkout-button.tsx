"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { storeRoutes } from "@/lib/store/navigation";
import { cn } from "@/lib/utils";

type CheckoutButtonProps = {
  disabled?: boolean;
  className?: string;
  onStarted?: () => void;
};

export function CheckoutButton({
  disabled = false,
  className,
  onStarted,
}: CheckoutButtonProps) {
  return (
    <Button
      asChild
      className={cn(className)}
      disabled={disabled}
      onClick={onStarted}
    >
      <Link href={storeRoutes.checkout}>Continuar al checkout</Link>
    </Button>
  );
}
