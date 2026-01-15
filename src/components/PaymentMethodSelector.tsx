import { cn } from "../lib/utils";
import { Smartphone, CreditCard, Wallet } from "lucide-react";

export type PaymentMethod = "mobile-money" | "orange-money" | "credit-card" | "paypal";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const methods = [
  {
    id: "mobile-money" as const,
    name: "Mobile Money",
    icon: Smartphone,
    color: "mobile-money",
  },
  {
    id: "orange-money" as const,
    name: "Orange Money",
    icon: Smartphone,
    color: "orange-money",
  },
  {
    id: "credit-card" as const,
    name: "Credit Card",
    icon: CreditCard,
    color: "credit-card",
  },
  {
    id: "paypal" as const,
    name: "PayPal",
    icon: Wallet,
    color: "paypal",
  },
];

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-4 sm:grid-cols-2 gap-3">
      {methods.map((method) => {
        const isSelected = selected === method.id;
        const Icon = method.icon;
        
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 method-transition",
              "hover:scale-[1.02] active:scale-[0.98]",
            isSelected
                ? method.color === "mobile-money"
                  ? "border-mobile-money bg-mobile-money-light"
                  : method.color === "orange-money"
                  ? "border-orange-money bg-orange-money-light"
                  : method.color === "paypal"
                  ? "border-paypal bg-paypal-light"
                  : "border-credit-card bg-credit-card-light"
                : "border-border bg-card hover:border-muted-foreground/30"
            )}
          >
            <div
              className={cn(
                "p-2.5 rounded-lg method-transition",
                isSelected
                  ? method.color === "mobile-money"
                    ? "bg-mobile-money text-primary-foreground"
                    : method.color === "orange-money"
                    ? "bg-orange-money text-primary-foreground"
                    : method.color === "paypal"
                    ? "bg-paypal text-primary-foreground"
                    : "bg-credit-card text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span
              className={cn(
                "text-sm font-medium text-center method-transition",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {method.name}
            </span>
            {isSelected && (
              <div
                className={cn(
                  "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
                  method.color === "mobile-money"
                    ? "bg-mobile-money"
                    : method.color === "orange-money"
                    ? "bg-orange-money"
                    : method.color === "paypal"
                    ? "bg-paypal"
                    : "bg-credit-card"
                )}
              >
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
