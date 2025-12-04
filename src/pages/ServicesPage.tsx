import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CheckCircle, ArrowRight, Printer, Scan, Box, Palette, ChevronDown, ChevronUp, Book, Home } from "lucide-react";
import { useState } from "react";

const services = [
  {
    id: "fdm",
    icon: Printer,
    title: "FDM Printing",
    description: "Fused Deposition Modeling for durable, functional parts",
    features: [
      "Build volume: up to 300x300x400mm",
      "Layer resolution: 0.1-0.4mm",
      "20+ material options (PLA, ABS, PETG, Nylon, etc.)",
      "Multi-color printing available",
      "Ideal for prototypes and functional parts"
    ],
    materials: ["PLA", "ABS", "PETG", "TPU", "Nylon", "Carbon Fiber"],
    link: "submit-project",
  },
  {
    id: "resin",
    icon: Box,
    title: "Resin Printing (SLA/DLP)",
    description: "High-resolution prints with exceptional surface finish",
    features: [
      "Build volume: up to 200x200x200mm",
      "Layer resolution: 0.025-0.1mm",
      "Smooth surface finish",
      "Multiple resin types (standard, tough, flexible)",
      "Perfect for detailed miniatures and jewelry"
    ],
    materials: ["Standard Resin", "Tough Resin", "Flexible Resin", "Castable Resin"],
    link: "submit-project",
  },
  {
    id: "scanning",
    icon: Scan,
    title: "3D Scanning",
    description: "Capture physical objects digitally for reverse engineering",
    features: [
      "Accuracy: up to 0.05mm",
      "Scan volume: 50x50x50mm to 500x500x500mm",
      "Color texture capture",
      "File cleanup and optimization",
      "CAD-ready mesh generation"
    ],
    materials: ["Digital Files Only"],
        link: "submit-project",
  },
  {
    id: "finishing",
    icon: Palette,
    title: "Post-Processing",
    description: "Professional finishing services for production-ready parts",
    features: [
      "Sanding and smoothing",
      "Priming and painting",
      "Vapor smoothing (ABS)",
    ],
    materials: ["All Materials"],
        link: "submit-project",
  },
  {
    id: "training",
    icon: Book,
    title: "Wokshops & Training",
    description: "Hands-on sessions to master 3D printing technologies",
    features: [
      "Beginner to advanced levels",
      "Small group sizes for personalized instruction",
      "Covers design, printing, and post-processing",
      "Access to our printers during sessions",
    ],
    materials: ["Learning Materials Provided"],
        link: "workshops",
  },
  {
    id: "spaces",
    icon: Home,
    title: "Rental Spaces",
    description: "Access our 3D printing facilities and equipment, perfect for seminars or team projects.",
    features: [
      "Hourly and daily rental options",
      "Access to a variety of 3D printers",
      "On-site technical support",
      "Ideal for workshops and collaborative projects",
    ],
    materials: ["Access to All Equipment"],
        link: "contact"
  }
];

export function ServicesPage() {
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const navigateTo = (page: string) => {
    window.location.hash = page;
  };

  const toggleExpand = (serviceId: string) => {
    if (expandedService === serviceId) {
      setExpandedService(null);
    } else {
      setExpandedService(serviceId);
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="tracking-tight mb-4 text-2xl">Our Services</h1>
            <p className="text-muted-foreground mb-6 text-lg">
              From rapid prototyping to production-grade parts, we offer comprehensive 3D printing services
              with state-of-the-art technology and expert craftsmanship<br/> From concept to finished product, we provide training and workshops.<br/>
              Spaces available for workshops, seminars and collaborative projects. 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="black" onClick={() => navigateTo("submit-project")}>
                Submit Your Project
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigateTo("pricing")}>
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="p-4 cursor-pointer" 
                  onClick={() => toggleExpand(service.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                        <service.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-left">
                        <h2 className="tracking-tight text-xl font-semibold">{service.title}</h2>
                        <p className="text-muted-foreground mt-1">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex gap-2">
                        {service.materials.slice(0, 2).map((material) => (
                          <Badge key={material} variant="secondary" className="whitespace-nowrap">
                            {material}
                          </Badge>
                        ))}
                        {service.materials.length > 2 && (
                          <Badge variant="outline" className="whitespace-nowrap">
                            +{service.materials.length - 2} more
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(service.id);
                        }}
                      >
                        {expandedService === service.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedService === service.id && (
                    <div className="mt-6 pt-6 border-t animate-in fade-in-0 duration-300">
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Features Section */}
                        <div>
                          <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                            Key Features
                          </h3>
                          <ul className="space-y-3">
                            {service.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Materials Section */}
                        <div>
                          <h3 className="font-medium text-lg mb-4">Available Materials</h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {service.materials.map((material) => (
                              <Badge 
                                key={material} 
                                variant="secondary" 
                                className="px-3 py-1.5 text-sm"
                              >
                                {material}
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Quick Action */}
                          <div className="mt-6">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => navigateTo(service.link)}
                            >
                              Request {service.title}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="tracking-tight text-white mb-4 text-2xl">Ready to Start Your Project?</h2>
          <p className="text-white/90 mb-8 text-lg">
            Upload your 3D files and get an instant quote. Our team is ready to bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default" onClick={() => navigateTo("submit-project")}>
              Submit Project Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}