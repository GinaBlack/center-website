import { useState } from "react";
import { PaymentMethodSelector, type PaymentMethod } from "./PaymentMethodSelector";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Shield, Lock } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../lib/utils";

const paymentTypes = [
  { value: "gallery-order", label: "Gallery Order" },
  { value: "training-registration", label: "Training Program Registration" },
  { value: "booking", label: "Booking" },
  { value: "3d-printing", label: "3D Printing Quote" },
  { value: "3d-scanning", label: "3D Scanning" },
];

export function PaymentForm() {
  const [method, setMethod] = useState<PaymentMethod>("mobile-money");
  const [formData, setFormData] = useState({
    paymentType: "",
    description: "",
    fullName: "",
    email: "",
    address: "",
    city: "",
    amount: "",
    phoneNumber: "",
    reference: "",
    cardNumber: "",
    nameOnCard: "",
    expiryDate: "",
    cvv: "",
    paypalEmail: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Payment submitted:", { method, ...formData });
  };

  const isMobilePayment = method === "mobile-money" || method === "orange-money";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-foreground">Payment Method</Label>
        <PaymentMethodSelector selected={method} onSelect={setMethod} />
      </div>

      {/* Payment Type */}
      <div className="space-y-2">
        <Label htmlFor="paymentType" className="text-sm font-medium text-foreground">
          Payment Type
        </Label>
        <Select
          value={formData.paymentType}
          onValueChange={(value) => handleInputChange("paymentType", value)}
        >
          <SelectTrigger className="h-11 input-focus-ring">
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            {paymentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="E.g., Introduction to 3D Printing course, Hall A booking for Dec 15, African Art Print #42..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="min-h-[80px] input-focus-ring resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Specify what you're paying for (course name, hall, artwork, etc.)
        </p>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-medium text-foreground">
          Amount
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            XAF
          </span>
          <Input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            className="pl-14 h-12 text-lg font-semibold input-focus-ring"
            required
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="h-11 input-focus-ring"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="h-11 input-focus-ring"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">Address</Label>
          <Input
            id="address"
            placeholder="123 Main Street"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="h-11 input-focus-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">City</Label>
          <Input
            id="city"
            placeholder="Douala"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="h-11 input-focus-ring"
            required
          />
        </div>
      </div>

      {/* Dynamic Payment Fields */}
      <div
        key={method}
        className={cn(
          "space-y-4 animate-fade-in p-5 rounded-xl border-2",
          method === "mobile-money"
            ? "bg-mobile-money-light border-mobile-money/30"
            : method === "orange-money"
            ? "bg-orange-money-light border-orange-money/30"
            : method === "paypal"
            ? "bg-paypal-light border-paypal/30"
            : "bg-credit-card-light border-credit-card/30"
        )}
      >
        <h3
          className={cn(
            "text-sm font-semibold uppercase tracking-wider",
            method === "mobile-money"
              ? "text-mobile-money"
              : method === "orange-money"
              ? "text-orange-money"
              : method === "paypal"
              ? "text-paypal"
              : "text-credit-card"
          )}
        >
          {method === "credit-card" 
            ? "Card Details" 
            : method === "mobile-money" 
            ? "MTN Mobile Money" 
            : method === "orange-money"
            ? "Orange Money"
            : "PayPal"}
        </h3>

        {isMobilePayment && (
          <div className="space-y-4 animate-slide-in">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder={method === "mobile-money" ? "+237 6XX XXX XXX" : "+237 6XX XXX XXX"}
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className="h-11 input-focus-ring bg-card"
                required
              />
              <p className="text-xs text-muted-foreground">
                {method === "mobile-money"
                  ? "Enter your MTN Mobile Money registered number"
                  : "Enter your Orange Money registered number"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference" className="text-sm font-medium">Reference / Transaction ID</Label>
              <Input
                id="reference"
                placeholder="Enter reference number"
                value={formData.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                className="h-11 input-focus-ring bg-card"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add a reference for your records
              </p>
            </div>
          </div>
        )}

        {method === "credit-card" && (
          <div className="space-y-4 animate-slide-in">
            <div className="space-y-2">
              <Label htmlFor="nameOnCard" className="text-sm font-medium">Name on Card</Label>
              <Input
                id="nameOnCard"
                placeholder="JOHN DOE"
                value={formData.nameOnCard}
                onChange={(e) => handleInputChange("nameOnCard", e.target.value.toUpperCase())}
                className="h-11 input-focus-ring bg-card"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                maxLength={19}
                className="h-11 input-focus-ring bg-card font-mono"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", formatExpiry(e.target.value))}
                  maxLength={5}
                  className="h-11 input-focus-ring bg-card font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="•••"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  className="h-11 input-focus-ring bg-card font-mono"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {method === "paypal" && (
          <div className="space-y-4 animate-slide-in">
            <div className="space-y-2">
              <Label htmlFor="paypalEmail" className="text-sm font-medium">PayPal Email</Label>
              <Input
                id="paypalEmail"
                type="email"
                placeholder="your-email@paypal.com"
                value={formData.paypalEmail}
                onChange={(e) => handleInputChange("paypalEmail", e.target.value)}
                className="h-11 input-focus-ring bg-card"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the email address associated with your PayPal account
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className={cn(
          "w-full h-12 text-base font-semibold method-transition",
          method === "mobile-money"
            ? "bg-mobile-money hover:bg-mobile-money/90"
            : method === "orange-money"
            ? "bg-orange-money hover:bg-orange-money/90"
            : method === "paypal"
            ? "bg-paypal hover:bg-paypal/90"
            : "bg-credit-card hover:bg-credit-card/90"
        )}
      >
        <Lock className="w-4 h-4 mr-2" />
        Pay {formData.amount ? `${formData.amount} XAF` : "Now"}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span className="text-xs">Secured by 256-bit SSL encryption</span>
      </div>
    </form>
  );
}
