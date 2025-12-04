import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ThermometerIcon, Droplets, Zap, Shield } from "lucide-react";

const fdmMaterials = [
  {
    name: "PLA (Polylactic Acid)",
    type: "Standard",
    properties: {
      strength: 65,
      flexibility: 30,
      temperature: 50,
      durability: 60
    },
    specs: {
      printTemp: "190-220°C",
      bedTemp: "50-60°C",
      density: "1.24 g/cm³",
      tensileStrength: "50-70 MPa"
    },
    pros: ["Easy to print", "Biodegradable", "Low warping", "Great surface finish"],
    cons: ["Low heat resistance", "Brittle under stress", "UV sensitive"],
    applications: ["Prototypes", "Decorative items", "Educational models", "Packaging"],
    colors: "15+"
  },
  {
    name: "ABS (Acrylonitrile Butadiene Styrene)",
    type: "Engineering",
    properties: {
      strength: 75,
      flexibility: 50,
      temperature: 85,
      durability: 80
    },
    specs: {
      printTemp: "220-250°C",
      bedTemp: "80-110°C",
      density: "1.04 g/cm³",
      tensileStrength: "40-45 MPa"
    },
    pros: ["High strength", "Good heat resistance", "Impact resistant", "Post-processable"],
    cons: ["Requires heated bed", "Warping issues", "Strong fumes", "Needs ventilation"],
    applications: ["Functional parts", "Automotive components", "Tool housings", "Enclosures"],
    colors: "10+"
  },
  {
    name: "PETG (Polyethylene Terephthalate Glycol)",
    type: "Engineering",
    properties: {
      strength: 80,
      flexibility: 60,
      temperature: 75,
      durability: 85
    },
    specs: {
      printTemp: "230-250°C",
      bedTemp: "70-80°C",
      density: "1.27 g/cm³",
      tensileStrength: "50-55 MPa"
    },
    pros: ["Strong and durable", "Good layer adhesion", "Chemical resistant", "Food safe"],
    cons: ["Stringing issues", "Hygroscopic", "Moderate warping"],
    applications: ["Mechanical parts", "Outdoor use", "Food containers", "Protective equipment"],
    colors: "12+"
  },
  {
    name: "TPU (Thermoplastic Polyurethane)",
    type: "Flexible",
    properties: {
      strength: 45,
      flexibility: 95,
      temperature: 60,
      durability: 90
    },
    specs: {
      printTemp: "220-240°C",
      bedTemp: "50-60°C",
      density: "1.21 g/cm³",
      tensileStrength: "26-35 MPa"
    },
    pros: ["Highly flexible", "Excellent durability", "Impact resistant", "Abrasion resistant"],
    cons: ["Difficult to print", "Slow print speed", "Requires direct drive"],
    applications: ["Flexible parts", "Phone cases", "Seals & gaskets", "Wearables"],
    colors: "8+"
  },
  {
    name: "Nylon (Polyamide)",
    type: "Engineering",
    properties: {
      strength: 90,
      flexibility: 70,
      temperature: 80,
      durability: 95
    },
    specs: {
      printTemp: "240-270°C",
      bedTemp: "70-90°C",
      density: "1.14 g/cm³",
      tensileStrength: "75-85 MPa"
    },
    pros: ["Exceptional strength", "High durability", "Chemical resistant", "Low friction"],
    cons: ["Very hygroscopic", "Requires dry storage", "Warping", "Expensive"],
    applications: ["Gears & bearings", "Hinges", "Functional prototypes", "Tooling"],
    colors: "5+"
  },
  {
    name: "Carbon Fiber Composites",
    type: "Advanced",
    properties: {
      strength: 95,
      flexibility: 40,
      temperature: 90,
      durability: 90
    },
    specs: {
      printTemp: "250-275°C",
      bedTemp: "80-100°C",
      density: "1.30 g/cm³",
      tensileStrength: "85-100 MPa"
    },
    pros: ["Highest strength", "Excellent stiffness", "Low weight", "Professional finish"],
    cons: ["Expensive", "Abrasive to nozzles", "Requires hardened nozzle"],
    applications: ["Aerospace parts", "High-performance prototypes", "Jigs & fixtures", "Drones"],
    colors: "3+"
  }
];

const resinMaterials = [
  {
    name: "Standard Resin",
    type: "General Purpose",
    properties: {
      detail: 95,
      strength: 60,
      flexibility: 30,
      finish: 95
    },
    specs: {
      cureTime: "8-12s/layer",
      hardness: "80-85 Shore D",
      tensileStrength: "50-65 MPa",
      elongation: "10-15%"
    },
    pros: ["High detail", "Smooth finish", "Cost effective", "Wide color range"],
    cons: ["Brittle", "UV sensitive", "Requires post-processing"],
    applications: ["Miniatures", "Display models", "Jewelry masters", "Dental models"],
    colors: "10+"
  },
  {
    name: "Tough Resin",
    type: "Engineering",
    properties: {
      detail: 85,
      strength: 85,
      flexibility: 50,
      finish: 85
    },
    specs: {
      cureTime: "10-15s/layer",
      hardness: "75-80 Shore D",
      tensileStrength: "55-60 MPa",
      elongation: "25-35%"
    },
    pros: ["ABS-like properties", "Impact resistant", "Functional parts", "Good detail"],
    cons: ["More expensive", "Longer cure time", "Limited colors"],
    applications: ["Functional prototypes", "Snap-fit parts", "Tool handles", "Assemblies"],
    colors: "3+"
  },
  {
    name: "Flexible Resin",
    type: "Specialty",
    properties: {
      detail: 80,
      strength: 50,
      flexibility: 90,
      finish: 80
    },
    specs: {
      cureTime: "12-18s/layer",
      hardness: "60-70 Shore A",
      tensileStrength: "5-8 MPa",
      elongation: "80-120%"
    },
    pros: ["Rubber-like", "Soft touch", "Impact absorption", "Tear resistant"],
    cons: ["Difficult to clean", "Sticky when wet", "Limited applications"],
    applications: ["Grips", "Soft-touch parts", "Cushioning", "Wearables"],
    colors: "2+"
  },
  {
    name: "Castable Resin",
    type: "Specialty",
    properties: {
      detail: 98,
      strength: 40,
      flexibility: 20,
      finish: 95
    },
    specs: {
      cureTime: "8-10s/layer",
      hardness: "85-90 Shore D",
      burnout: "Clean at 700°C",
      ash: "<0.1%"
    },
    pros: ["Ultra high detail", "Clean burnout", "Investment casting", "Minimal ash"],
    cons: ["Expensive", "Fragile", "Single color", "Specialized use"],
    applications: ["Jewelry casting", "Dental crowns", "Investment casting", "Precision parts"],
    colors: "1"
  }
];

export function MaterialLibraryPage() {
  const PropertyBar = ({ value, label }: { value: number; label: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-red-600 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">Material Specifications</Badge>
            <h1 className="tracking-tight mb-6">Material Library</h1>
            <p className="text-muted-foreground mb-8">
              Comprehensive guide to our available materials, their properties, and best applications. Choose the right material for your project.
            </p>
          </div>
        </div>
      </section>

      {/* Material Tabs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="fdm" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="fdm">FDM Materials</TabsTrigger>
              <TabsTrigger value="resin">Resin Materials</TabsTrigger>
            </TabsList>

            {/* FDM Materials */}
            <TabsContent value="fdm" className="space-y-8">
              {fdmMaterials.map((material) => (
                <Card key={material.name}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{material.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Badge>{material.type}</Badge>
                          <span>{material.colors} colors available</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Properties */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="mb-4">Material Properties</h3>
                          <div className="space-y-3">
                            <PropertyBar value={material.properties.strength} label="Strength" />
                            <PropertyBar value={material.properties.flexibility} label="Flexibility" />
                            <PropertyBar value={material.properties.temperature} label="Heat Resistance" />
                            <PropertyBar value={material.properties.durability} label="Durability" />
                          </div>
                        </div>

                        {/* Technical Specs */}
                        <div>
                          <h3 className="mb-4">Technical Specifications</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <ThermometerIcon className="w-4 h-4 text-blue-500" />
                              <div>
                                <div className="text-xs text-muted-foreground">Print Temp</div>
                                <div>{material.specs.printTemp}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <ThermometerIcon className="w-4 h-4 text-orange-500" />
                              <div>
                                <div className="text-xs text-muted-foreground">Bed Temp</div>
                                <div>{material.specs.bedTemp}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Droplets className="w-4 h-4 text-blue-500" />
                              <div>
                                <div className="text-xs text-muted-foreground">Density</div>
                                <div>{material.specs.density}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <div>
                                <div className="text-xs text-muted-foreground">Tensile Strength</div>
                                <div>{material.specs.tensileStrength}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pros, Cons, Applications */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="mb-2 flex items-center gap-2 text-green-600">
                            <Shield className="w-4 h-4" />
                            Advantages
                          </h3>
                          <ul className="space-y-1 text-sm">
                            {material.pros.map((pro) => (
                              <li key={pro} className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="mb-2 text-orange-600">Limitations</h3>
                          <ul className="space-y-1 text-sm">
                            {material.cons.map((con) => (
                              <li key={con} className="flex items-start gap-2">
                                <span className="text-orange-500 mt-1">!</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="mb-2">Best Applications</h3>
                          <div className="flex flex-wrap gap-2">
                            {material.applications.map((app) => (
                              <Badge key={app} variant="secondary">
                                {app}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Resin Materials */}
            <TabsContent value="resin" className="space-y-8">
              {resinMaterials.map((material) => (
                <Card key={material.name}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{material.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Badge>{material.type}</Badge>
                          <span>{material.colors} colors available</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Properties */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="mb-4">Material Properties</h3>
                          <div className="space-y-3">
                            <PropertyBar value={material.properties.detail} label="Detail Level" />
                            <PropertyBar value={material.properties.strength} label="Strength" />
                            <PropertyBar value={material.properties.flexibility} label="Flexibility" />
                            <PropertyBar value={material.properties.finish} label="Surface Finish" />
                          </div>
                        </div>

                        {/* Technical Specs */}
                        <div>
                          <h3 className="mb-4">Technical Specifications</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Cure Time</span>
                              <span>{material.specs.cureTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Hardness</span>
                              <span>{material.specs.hardness}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tensile Strength</span>
                              <span>{material.specs.tensileStrength}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Elongation</span>
                              <span>{material.specs.elongation}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pros, Cons, Applications */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="mb-2 flex items-center gap-2 text-green-600">
                            <Shield className="w-4 h-4" />
                            Advantages
                          </h3>
                          <ul className="space-y-1 text-sm">
                            {material.pros.map((pro) => (
                              <li key={pro} className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="mb-2 text-orange-600">Limitations</h3>
                          <ul className="space-y-1 text-sm">
                            {material.cons.map((con) => (
                              <li key={con} className="flex items-start gap-2">
                                <span className="text-orange-500 mt-1">!</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="mb-2">Best Applications</h3>
                          <div className="flex flex-wrap gap-2">
                            {material.applications.map((app) => (
                              <Badge key={app} variant="secondary">
                                {app}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}