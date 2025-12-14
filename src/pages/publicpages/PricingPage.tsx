import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { CheckCircle, Info, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";

const fdmPricing = [
  { material: "PLA", pricePerGram: "$0.08", colors: "15+", typical: "$15-45" },
  { material: "ABS", pricePerGram: "$0.10", colors: "10+", typical: "$18-50" },
  { material: "PETG", pricePerGram: "$0.12", colors: "12+", typical: "$20-55" },
  { material: "TPU (Flexible)", pricePerGram: "$0.18", colors: "8+", typical: "$30-75" },
  { material: "Nylon", pricePerGram: "$0.22", colors: "5+", typical: "$35-90" },
  { material: "Carbon Fiber", pricePerGram: "$0.35", colors: "3+", typical: "$50-150" }
];

const resinPricing = [
  { material: "Standard Resin", pricePerML: "$0.25", colors: "10+", typical: "$25-60" },
  { material: "Tough Resin", pricePerML: "$0.35", colors: "3+", typical: "$35-80" },
  { material: "Flexible Resin", pricePerML: "$0.40", colors: "2+", typical: "$40-90" },
  { material: "Castable Resin", pricePerML: "$0.50", colors: "1", typical: "$50-120" }
];

const postProcessing = [
  { service: "Basic Cleanup", description: "Support removal and minimal cleanup", price: "$10-15" },
  { service: "Sanding & Smoothing", description: "Multi-grit sanding for smooth finish", price: "$15-30" },
  { service: "Priming", description: "Professional primer coat", price: "$10-20" },
  { service: "Custom Painting", description: "Professional paint finish with color matching", price: "$25-75" },
  { service: "Vapor Smoothing", description: "Chemical smoothing for ABS parts", price: "$20-40" },
  { service: "Assembly", description: "Multi-part assembly and bonding", price: "$20-50" }
];

const discounts = [
  { tier: "Student", discount: "20%", requirement: "Valid student ID required" },
  { tier: "Bulk (10-49 units)", discount: "15%", requirement: "Same design, per order" },
  { tier: "Bulk (50-99 units)", discount: "25%", requirement: "Same design, per order" },
  { tier: "Bulk (100+ units)", discount: "35%", requirement: "Custom quote available" },
  { tier: "Academic Institution", discount: "25%", requirement: "Institutional purchase order" }
];

export function PricingPage() {
  const navigateTo = (page: string) => {
    window.location.hash = page;
  };

  return (
    <div className="pt-16">
      {/* Discounts Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="tracking-tight mb-4">Discounts & Special Offers</h2>
            <p className="text-muted-foreground">
              We offer special pricing for students, bulk orders, and academic institutions
            </p>
          </div>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Available Discounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {discounts.map((discount) => (
                  <div
                    key={discount.tier}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{discount.tier}</span>
                        <Badge className="bg-green-500">{discount.discount} OFF</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{discount.requirement}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="tracking-tight mb-4">Pricing FAQs</h2>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How is the price calculated?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Price = (Material Volume × Material Cost) + (Print Time × Machine Rate) + Post-Processing. Our instant quote calculator analyzes your file to provide an exact price.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you charge for failed prints?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No. If a print fails due to our error or equipment issue, we'll reprint at no additional cost. You only pay for successful prints.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept credit/debit cards, PayPal, bank transfers, and purchase orders from academic institutions and businesses.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="tracking-tight text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 mb-8">
            Upload your 3D files now and receive an instant, accurate quote in seconds.
          </p>
          <Button size="lg" variant="default" onClick={() => navigateTo("submit-project")}>
            Get Your Quote
          </Button>
        </div>
      </section>
    </div>
  );
}
export default PricingPage;