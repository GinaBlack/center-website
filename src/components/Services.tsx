import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Package, Layers, Zap, Boxes, Palette, CheckCircle } from "lucide-react";

const services = [
  {
    icon: Package,
    title: "Rapid Prototyping",
    description: "Fast iteration and testing of product designs with high-quality prototypes delivered in 24-48 hours.",
    features: ["FDM & SLA printing", "Multiple material options", "Quick turnaround"],
  },
  {
    icon: Layers,
    title: "Production Parts",
    description: "Scalable manufacturing solutions for end-use parts with industrial-grade materials and finishes.",
    features: ["Batch production", "Quality assurance", "Consistent results"],
  },
  {
    icon: Zap,
    title: "Custom Fabrication",
    description: "Tailored solutions for unique projects including complex geometries and multi-material prints.",
    features: ["Design consultation", "Material selection", "Custom finishing"],
  },
  {
    icon: Boxes,
    title: "Architectural Models",
    description: "Detailed scale models for presentations and planning with precision and architectural accuracy.",
    features: ["Scale accuracy", "Fine detailing", "Professional finish"],
  },
  {
    icon: Palette,
    title: "Post-Processing",
    description: "Professional finishing services including sanding, painting, and surface treatments.",
    features: ["Sanding & smoothing", "Custom painting", "Assembly services"],
  },
  {
    icon: CheckCircle,
    title: "Design Support",
    description: "Expert guidance to optimize your designs for 3D printing and manufacturability.",
    features: ["3D modeling", "File optimization", "Technical consultation"],
  },
];

export function Services() {
  return (
    <section id="services" className="py-12 lg:py-12 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="tracking-tight mb-4">Our Services</h2>
          <p className="text-muted-foreground">
            Comprehensive 3D printing solutions tailored to your needs, from concept to finished product
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}