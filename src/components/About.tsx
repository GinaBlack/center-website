import { Card } from "./ui/card";
import { Award, Users, Zap, Target } from "lucide-react";

const values = [
  {
    icon: Award,
    title: "Innovation Driven",
    description: "We transform ideas into tangible solutions through experimentation, research, production, and skill development.",
  },
  {
    icon: Users,
    title: "Collaboration & Growth",
    description: "A bridge between academic research, industry needs, and creative exploration.",
  },
  {
    icon: Zap,
    title: "Rapid Prototyping",
    description: "From concept to model — we reduce development cycles and accelerate production through advanced additive manufacturing.",
  },
  {
    icon: Target,
    title: "Precision Manufacturing",
    description: "State-of-the-art FDM & PolyJet 3D printers deliver detailed, multi-material, high-accuracy results.",
  },
];

export function About() {
  return (
    <section id="about" className="py-12 lg:py-12 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TOP SECTION */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="tracking-tight">About the 3D Printing High-Tech Center</h2>
            <p className="text-muted-foreground">
              We are the innovation showcase of the National Higher Polytechnic School of Yaoundé
              a hub where imagination meets engineered reality. Our center empowers creators,
              researchers, engineers, and industries to prototype, experiment, learn, and produce
              with world-class additive manufacturing tools.
            </p>
            <p className="text-muted-foreground">
              Our mission is simple yet powerful: accelerate transformation from concept to final
              product through cutting-edge 3D printing, advanced research, and high-impact training.
              We aim to become a leading force in technological and industrial innovation.
            </p>
          </div>

          {/* CORE VALUES CARDS */}
          <div className="grid grid-cols-2 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="p-6">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="tracking-tight mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="grid md:grid-cols-3 gap-8 p-8 py-8 glossy-simple rounded-2xl shadow-sm">
          <div className="text-center">
            <div className="text-foreground font-semibold text-xl mb-2">FDM & PolyJet</div>
            <div className="text-muted-foreground text-sm">Dual high-end printing technologies</div>
          </div>
          <div className="text-center">
            <div className="text-foreground font-semibold text-xl mb-2">20+ Printers</div>
            <div className="text-muted-foreground text-sm">Industrial-grade manufacturing capacity</div>
          </div>
          <div className="text-center">
            <div className="text-foreground font-semibold text-xl mb-2">25+ Materials</div>
            <div className="text-muted-foreground text-sm">Versatile printing & multi-material capability</div>
          </div>
        </div>
      </div>
    </section>
  );
}
