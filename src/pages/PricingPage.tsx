import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { CheckCircle, Info, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

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
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">Transparent Pricing</Badge>
            <h1 className="tracking-tight mb-6">Pricing Guide</h1>
            <p className="text-muted-foreground mb-8">
              Clear, straightforward pricing based on material usage and complexity. Get an instant estimate with our online quote calculator.
            </p>
            <Button size="lg" onClick={() => navigateTo("submit-project")}>
              Get Instant Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Information */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="mb-12">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Prices are based on material usage (volume × density), print time, and complexity. Upload your file for an exact quote.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="fdm" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="fdm">FDM</TabsTrigger>
              <TabsTrigger value="resin">Resin</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            {/* FDM Pricing */}
            <TabsContent value="fdm">
              <Card>
                <CardHeader>
                  <CardTitle>FDM Printing Prices</CardTitle>
                  <CardDescription>
                    Pricing per gram of material used. Final price includes material, print time, and equipment cost.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Material</th>
                          <th className="text-left py-3 px-4">Price/Gram</th>
                          <th className="text-left py-3 px-4">Colors Available</th>
                          <th className="text-left py-3 px-4">Typical Part</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fdmPricing.map((item) => (
                          <tr key={item.material} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{item.material}</td>
                            <td className="py-3 px-4">{item.pricePerGram}</td>
                            <td className="py-3 px-4">{item.colors}</td>
                            <td className="py-3 px-4 text-muted-foreground">{item.typical}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Example:</strong> A 100g PLA part with standard quality would cost approximately $8 (material) + $7 (print time) = $15 total
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resin Pricing */}
            <TabsContent value="resin">
              <Card>
                <CardHeader>
                  <CardTitle>Resin Printing Prices</CardTitle>
                  <CardDescription>
                    Pricing per milliliter of resin used. Includes post-curing and basic support removal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Material</th>
                          <th className="text-left py-3 px-4">Price/mL</th>
                          <th className="text-left py-3 px-4">Colors Available</th>
                          <th className="text-left py-3 px-4">Typical Part</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resinPricing.map((item) => (
                          <tr key={item.material} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{item.material}</td>
                            <td className="py-3 px-4">{item.pricePerML}</td>
                            <td className="py-3 px-4">{item.colors}</td>
                            <td className="py-3 px-4 text-muted-foreground">{item.typical}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Example:</strong> A 50mL miniature in standard resin would cost approximately $12.50 (material) + $12.50 (print time + post-processing) = $25 total
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Pricing */}
            <TabsContent value="services">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Post-Processing Services</CardTitle>
                    <CardDescription>
                      Professional finishing for production-ready parts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {postProcessing.map((service) => (
                        <div key={service.service} className="pb-4 border-b last:border-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>{service.service}</div>
                            <Badge variant="secondary">{service.price}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Services</CardTitle>
                    <CardDescription>
                      Other services and options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="pb-4 border-b">
                      <div className="flex justify-between items-start mb-1">
                        <div>3D Scanning</div>
                        <Badge variant="secondary">$50-200</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on object size and complexity
                      </p>
                    </div>
                    <div className="pb-4 border-b">
                      <div className="flex justify-between items-start mb-1">
                        <div>Design Consultation</div>
                        <Badge variant="secondary">$75/hour</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expert guidance on design optimization
                      </p>
                    </div>
                    <div className="pb-4 border-b">
                      <div className="flex justify-between items-start mb-1">
                        <div>Rush Order (24-48h)</div>
                        <Badge variant="secondary">+50%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Priority processing and delivery
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <div>File Preparation</div>
                        <Badge variant="secondary">$25-75</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mesh repair and optimization
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

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
      <section className="py-20 bg-gradient-to-br from-blue-500 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="tracking-tight text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 mb-8">
            Upload your 3D files now and receive an instant, accurate quote in seconds.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigateTo("submit-project")}>
            Get Your Quote
          </Button>
        </div>
      </section>
    </div>
  );
}