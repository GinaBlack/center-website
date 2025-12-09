import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ThermometerIcon, Droplets, Zap, Shield, Printer, Scan, Ruler, Package } from "lucide-react";

// 打印机数据
const printers = [
  {
    name: "FORTUS F450mc series",
    quantity: 2,
    dimensions: "406 x 356 x 406 mm",
    materials: [
      "ABS-M30", "ABS-M30i", "ABS-ESD7", "ASA", "FDM Nylon 12", "FDM Nylon 12CF",
      "PC-ABS", "PC-ISO", "ST-130", "ULTEM 9085 resin", "ULTEM 1010 resin",
      "SR20", "SR30", "SR35", "SR100", "SR110", "PC-BASS", "SUP8500B", "SUPPORT MATERIAL ULTEM 1010 filament"
    ],
    type: "Industrial FDM"
  },
  {
    name: "F270 SERIES",
    quantity: 2,
    dimensions: "308 x 254 x 356 mm",
    materials: [
      "ABS-CF10", "ABS-ESD7", "ABS-M30", "ASA", "PLA", "PC-ABS", "TPU",
      "Diran 410MF07", "QRS Support"
    ],
    type: "Industrial FDM"
  },
  {
    name: "Uprint SE series",
    quantity: 8,
    dimensions: "203 x 152 x 152 mm",
    materials: ["ABSPlus P430", "SR-30", "SR-20", "Support"],
    type: "Professional FDM"
  },
  {
    name: "CONNEX 260 SERIES",
    quantity: 2,
    dimensions: "255 x 255 x 200 mm",
    materials: [
      "VERO Family", "Rigur And Durus", "Digital ABS Plus", "TANGO Family",
      "Transparent", "Support 705 and 706"
    ],
    type: "PolyJet"
  },
  {
    name: "Objet 350 Connex",
    quantity: 1,
    dimensions: "340 x 340 x 200 mm",
    materials: [
      "Vero family", "Rigur and Durus", "Digital ABS plus", "Tango family",
      "Transparent", "Support 705 and 706"
    ],
    type: "PolyJet"
  },
  {
    name: "OBJET DESKTOP30 SERIES",
    quantity: 8,
    dimensions: "300 x 200 x 150 mm",
    materials: [
      "VERO WHITE PLUS", "VERO BLUE", "VERO GRAY", "VERO BLACK PLUS",
      "VERO CLEAR", "DURUS WHITE", "RGD 525", "SUPPORT MODEL"
    ],
    type: "Desktop PolyJet"
  }
];

const scanners = [
  {
    name: "3D SCANNERS",
    quantity: 2,
    capabilities: "DIGITIZING COMPLEX OBJECTS",
    features: [
      "High level of details",
      "Accuracy of 0.050 mm (0.002 in)",
      "Color acquisition",
      "No set-up required",
      "Worldwide support",
      "Resolution of 0.1 mm (0.0039 in)",
      "1,500,000 measurements/s",
      "Part size range of 0.1-4 m (0.3-13ft)"
    ],
    type: "3D Scanner"
  }
];

const fdmMaterials = [
  {
    name: "PLA (Polylactic Acid)",
    type: "Standard",
    compatiblePrinters: ["F270 SERIES"],
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
    compatiblePrinters: ["FORTUS F450mc series", "F270 SERIES", "Uprint SE series"],
    variants: ["ABS-M30", "ABS-M30i", "ABS-ESD7", "ABS-CF10", "ABSPlus P430", "Digital ABS Plus"],
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
    compatiblePrinters: [],
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
    compatiblePrinters: ["F270 SERIES"],
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
    compatiblePrinters: ["FORTUS F450mc series"],
    variants: ["FDM Nylon 12", "FDM Nylon 12CF"],
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
    compatiblePrinters: ["FORTUS F450mc series"],
    variants: ["ABS-CF10", "FDM Nylon 12CF"],
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
  },
  {
    name: "ASA",
    type: "Engineering",
    compatiblePrinters: ["FORTUS F450mc series", "F270 SERIES"],
    properties: {
      strength: 78,
      flexibility: 45,
      temperature: 90,
      durability: 85
    },
    specs: {
      printTemp: "230-250°C",
      bedTemp: "80-100°C",
      density: "1.07 g/cm³",
      tensileStrength: "45-52 MPa"
    },
    pros: ["UV resistant", "Weather resistant", "Good heat resistance", "Impact resistant"],
    cons: ["Strong fumes", "Requires ventilation", "Warping tendency"],
    applications: ["Outdoor parts", "Automotive exterior", "Signage", "Garden equipment"],
    colors: "8+"
  },
  {
    name: "PC-ABS",
    type: "Engineering",
    compatiblePrinters: ["FORTUS F450mc series", "F270 SERIES"],
    properties: {
      strength: 85,
      flexibility: 55,
      temperature: 95,
      durability: 88
    },
    specs: {
      printTemp: "250-270°C",
      bedTemp: "90-110°C",
      density: "1.10 g/cm³",
      tensileStrength: "55-65 MPa"
    },
    pros: ["High impact resistance", "Good thermal properties", "Strong", "Durable"],
    cons: ["Requires high temperatures", "Hygroscopic", "Needs dry storage"],
    applications: ["Automotive parts", "Electronic housings", "Functional prototypes", "Tooling"],
    colors: "6+"
  },
  {
    name: "ULTEM (PEI)",
    type: "High-Performance",
    compatiblePrinters: ["FORTUS F450mc series"],
    variants: ["ULTEM 9085 resin", "ULTEM 1010 resin"],
    properties: {
      strength: 92,
      flexibility: 40,
      temperature: 180,
      durability: 98
    },
    specs: {
      printTemp: "340-400°C",
      bedTemp: "160-180°C",
      density: "1.27-1.30 g/cm³",
      tensileStrength: "90-105 MPa"
    },
    pros: ["Highest heat resistance", "Flame retardant", "Chemical resistant", "Aerospace certified"],
    cons: ["Very expensive", "Requires specialized printer", "High printing temps"],
    applications: ["Aerospace components", "Medical devices", "Automotive under-hood", "Electrical insulators"],
    colors: "2+"
  }
];

const resinMaterials = [
  {
    name: "VERO Family Resins",
    type: "PolyJet Rigid",
    compatiblePrinters: ["CONNEX 260 SERIES", "Objet 350 Connex", "OBJET DESKTOP30 SERIES"],
    variants: ["VERO WHITE PLUS", "VERO BLUE", "VERO GRAY", "VERO BLACK PLUS", "VERO CLEAR"],
    properties: {
      detail: 95,
      strength: 70,
      flexibility: 35,
      finish: 98
    },
    specs: {
      cureTime: "Varies by printer",
      hardness: "75-85 Shore D",
      tensileStrength: "50-65 MPa",
      elongation: "10-25%"
    },
    pros: ["High detail", "Smooth finish", "Wide color range", "Multi-material capable"],
    cons: ["Requires support removal", "UV sensitive", "Post-processing needed"],
    applications: ["Prototypes", "Display models", "Medical models", "Consumer products"],
    colors: "5+ standard"
  },
  {
    name: "Digital ABS Plus",
    type: "Engineering PolyJet",
    compatiblePrinters: ["CONNEX 260 SERIES", "Objet 350 Connex"],
    properties: {
      detail: 90,
      strength: 85,
      flexibility: 45,
      finish: 90
    },
    specs: {
      cureTime: "Varies by printer",
      hardness: "75-80 Shore D",
      tensileStrength: "55-60 MPa",
      elongation: "20-30%"
    },
    pros: ["ABS-like properties", "High temperature resistance", "Good impact strength", "Functional testing"],
    cons: ["More expensive", "Requires support material", "Limited colors"],
    applications: ["Functional prototypes", "Snap-fit assemblies", "Housings", "Tooling masters"],
    colors: "Limited"
  },
  {
    name: "TANGO Family Resins",
    type: "PolyJet Flexible",
    compatiblePrinters: ["CONNEX 260 SERIES", "Objet 350 Connex"],
    variants: ["TANGO Black", "TANGO Gray", "TANGO Plus"],
    properties: {
      detail: 88,
      strength: 40,
      flexibility: 95,
      finish: 85
    },
    specs: {
      cureTime: "Varies by printer",
      hardness: "27-75 Shore A",
      tensileStrength: "0.8-4.5 MPa",
      elongation: "100-220%"
    },
    pros: ["Rubber-like flexibility", "Multiple shore hardness", "Good tear resistance", "Multi-material capable"],
    cons: ["Limited durability", "UV sensitive", "Requires careful handling"],
    applications: ["Gaskets", "Seals", "Soft-touch surfaces", "Wearables"],
    colors: "3+"
  },
  {
    name: "Rigur / Durus Resins",
    type: "PolyJet Tough",
    compatiblePrinters: ["CONNEX 260 SERIES", "Objet 350 Connex", "OBJET DESKTOP30 SERIES"],
    variants: ["DURUS WHITE", "Rigur", "RGD 525"],
    properties: {
      detail: 92,
      strength: 80,
      flexibility: 50,
      finish: 92
    },
    specs: {
      cureTime: "Varies by printer",
      hardness: "70-78 Shore D",
      tensileStrength: "45-55 MPa",
      elongation: "15-25%"
    },
    pros: ["High toughness", "Good impact resistance", "Durable", "Good for functional parts"],
    cons: ["Limited flexibility", "Higher cost", "Specific applications"],
    applications: ["Jigs and fixtures", "Functional prototypes", "Housings", "Connectors"],
    colors: "Limited"
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
      <section className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="tracking-tight text-lgx text-white mb-6">Equipment & Material Library</h1>
            <p className="text-muted-foreground text-smx mb-8">
              Comprehensive guide to our 3D printing equipment, available materials, their properties, and compatibility.
              Select the right combination for your project needs.
            </p>
          </div>
        </div>
      </section>

      {/* Equipment Tabs */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="printers" className="space-y-8">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
              <TabsTrigger value="printers" className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Printers
              </TabsTrigger>
              <TabsTrigger value="scanners" className="flex items-center gap-2">
                <Scan className="w-4 h-4" />
                Scanners
              </TabsTrigger>
              <TabsTrigger value="fdm" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                FDM Materials
              </TabsTrigger>
              <TabsTrigger value="resin" className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Resin Materials
              </TabsTrigger>
            </TabsList>

            {/* 3D Printers */}
            <TabsContent value="printers" className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">3D Printer Fleet</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {printers.map((printer) => (
                  <Card key={printer.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{printer.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{printer.type}</Badge>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Printer className="w-3 h-3" />
                              {printer.quantity} units
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Ruler className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-xs text-muted-foreground">Build Volume</div>
                          <div className="font-medium">{printer.dimensions}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Compatible Materials</h4>
                        <div className="flex flex-wrap gap-1">
                          {printer.materials.slice(0, 5).map((material, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                          {printer.materials.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{printer.materials.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground">
                          Total materials supported: {printer.materials.length}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 3D Scanners */}
            <TabsContent value="scanners" className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">3D Scanning Equipment</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {scanners.map((scanner) => (
                  <Card key={scanner.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{scanner.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{scanner.type}</Badge>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Scan className="w-3 h-3" />
                              {scanner.quantity} units
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Capabilities</h4>
                        <div className="text-sm font-medium text-primary">{scanner.capabilities}</div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Key Features</h4>
                        <ul className="space-y-1 text-sm">
                          {scanner.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* FDM Materials */}
            <TabsContent value="fdm" className="space-y-8">
              {fdmMaterials.map((material) => (
                <Card key={material.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{material.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Badge>{material.type}</Badge>
                          {material.variants && (
                            <Badge variant="outline">{material.variants.length} variants</Badge>
                          )}
                          <span>{material.colors} colors available</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Left Column: Properties & Specs */}
                      <div className="space-y-6">
                        {/* Compatible Printers */}
                        {material.compatiblePrinters.length > 0 && (
                          <div>
                            <h3 className="mb-2 flex items-center gap-2 text-blue-600">
                              <Printer className="w-4 h-4" />
                              Compatible Printers
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {material.compatiblePrinters.map((printer) => (
                                <Badge key={printer} variant="secondary">
                                  {printer}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Material Variants */}
                        {material.variants && (
                          <div>
                            <h3 className="mb-2">Available Variants</h3>
                            <div className="flex flex-wrap gap-2">
                              {material.variants.map((variant) => (
                                <Badge key={variant} variant="outline" className="text-xs">
                                  {variant}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Properties */}
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

                      {/* Right Column: Pros, Cons, Applications */}
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
                <Card key={material.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{material.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Badge>{material.type}</Badge>
                          {material.variants && (
                            <Badge variant="outline">{material.variants.length} variants</Badge>
                          )}
                          <span>{material.colors} colors available</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Left Column: Properties & Specs */}
                      <div className="space-y-6">
                        {/* Compatible Printers */}
                        {material.compatiblePrinters.length > 0 && (
                          <div>
                            <h3 className="mb-2 flex items-center gap-2 text-blue-600">
                              <Printer className="w-4 h-4" />
                              Compatible PolyJet Printers
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {material.compatiblePrinters.map((printer) => (
                                <Badge key={printer} variant="secondary">
                                  {printer}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Material Variants */}
                        {material.variants && (
                          <div>
                            <h3 className="mb-2">Available Variants</h3>
                            <div className="flex flex-wrap gap-2">
                              {material.variants.map((variant) => (
                                <Badge key={variant} variant="outline" className="text-xs">
                                  {variant}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Properties */}
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

                      {/* Right Column: Pros, Cons, Applications */}
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