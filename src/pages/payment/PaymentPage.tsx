import { PaymentForm } from "../../components/PaymentForm";
import { CreditCard } from "lucide-react";

const PaymentPage = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Secure Payment
          </h1>
          <p className="text-muted-foreground">
            Choose your preferred payment method
          </p>
        </div>

        {/* Payment Card */}
        <div className="bg-card rounded-2xl payment-card-shadow p-6 sm:p-8 border border-border">
          <PaymentForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
