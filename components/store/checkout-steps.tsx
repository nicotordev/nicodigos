import { cn } from "@/lib/utils";

type CheckoutStep = "cart" | "checkout" | "payment";

type CheckoutStepsProps = {
  current: CheckoutStep;
  className?: string;
};

const steps = [
  { id: "cart" as const, label: "Carrito", number: 1 },
  { id: "checkout" as const, label: "Datos", number: 2 },
  { id: "payment" as const, label: "Pago Flow", number: 3 },
];

export function CheckoutSteps({ current, className }: CheckoutStepsProps) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <div className={cn("mx-auto max-w-3xl pb-2", className)}>
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border/40 z-0" />

        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-2 bg-background px-4"
            >
              <div
                className={cn(
                  "size-8 rounded-full font-extrabold flex items-center justify-center text-sm",
                  isActive &&
                    "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20",
                  isComplete &&
                    "bg-primary/15 text-primary border border-primary/30",
                  !isActive &&
                    !isComplete &&
                    "bg-muted text-muted-foreground border border-border/80 font-bold",
                )}
              >
                {step.number}
              </div>
              <span
                className={cn(
                  "text-xs",
                  isActive
                    ? "font-bold text-foreground"
                    : "font-medium text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
