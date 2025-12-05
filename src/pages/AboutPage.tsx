import { Printer, Layers, Cog, LibraryBig, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";

export function AboutPage() {
  const navigateTo = (page: string) => {
    window.location.hash = page;
  };
  return (
    <div className="pt-16">

      {/* WHO WE ARE */}
      <section className="py-12 ">
        <div className="max-w-6xl mx-auto px-6 space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Who We Are</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            A hub for innovation, engineering, fabrication and high-level research
            bridging creativity and technology through world-class additive manufacturing.
          </p>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-20 bg-black backdrop-blur-sm">
        <div className="max-w-6xl mx-32 px-6 grid md:grid-cols-2 gap-12">
          <div className="p-8 rounded-xl  shadow-sm bg-card hover:scale-[1.02] duration-500">
            <h3 className="text-2xl font-semibold mb-3 tracking-tight">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To transform ideas into functional products through advanced 3D printing,
              rapid prototyping, research and specialized training.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-sm bg-card hover:scale-[1.02] duration-500">
            <h3 className="text-2xl font-semibold mb-3 tracking-tight">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              To become the most influential additive manufacturing ecosystem
              powering Africa’s next generation of researchers, creators and innovators.
            </p>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY STACK */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-6">

          <h2 className="text-2xl font-semibold tracking-tight">Technology & Capabilities</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Our fabrication ecosystem supports high-precision, multi-material workflow suitable for
            engineering, medical, research and industrial manufacturing.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-8 rounded-xl border bg-background/60 hover:border-blue-500 duration-300 shadow-md hover:-translate-y-1">
              <Printer className="mx-auto h-10 w-10 text-blue-600 mb-4" />
              <h4 className="font-semibold">FDM & PolyJet</h4>
              <p className="text-muted-foreground text-sm">Dual fabrication architecture</p>
            </div>
            <div className="p-8 rounded-xl border bg-background/60 hover:border-red-500 duration-300 shadow-md hover:-translate-y-1">
              <Layers className="mx-auto h-10 w-10 text-red-600 mb-4" />
              <h4 className="font-semibold">20+ Printers</h4>
              <p className="text-muted-foreground text-sm">Industrial-grade print volume</p>
            </div>
            <div className="p-8 rounded-xl border bg-background/60 hover:border-purple-500 duration-300 shadow-md hover:-translate-y-1">
              <Cog className="mx-auto h-10 w-10 text-purple-600 mb-4" />
              <h4 className="font-semibold">25+ Materials</h4>
              <p className="text-muted-foreground text-sm">Full multi-material support</p>
            </div>
          </div>

        </div>
      </section>

      {/* APPLICATIONS */}
      <section className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-8">

          <h2 className="text-2xl font-semibold  text-white tracking-tight">Where We Create Impact</h2>
          <p className="text-muted-foreground text-white max-w-3xl mx-auto text-lg">
            Innovation powered by application of real-world output across multiple industries.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-card p-8 rounded-xl shadow hover:shadow-lg duration-300">
              <h4 className="font-semibold mb-2">Medical & Bio-Fabrication</h4>
              <p className="text-muted-foreground text-sm">Implants, prosthesis, surgical models</p>
            </div>
            <div className="bg-card p-8 rounded-xl shadow hover:shadow-lg duration-300">
              <h4 className="font-semibold mb-2">Engineering & Industry</h4>
              <p className="text-muted-foreground text-sm">Molds, tooling, mechanical assemblies</p>
            </div>
            <div className="bg-card p-8 rounded-xl shadow hover:shadow-lg duration-300">
              <h4 className="font-semibold mb-2">Design & Architecture</h4>
              <p className="text-muted-foreground text-sm">Models, jewelry, artistic sculpting</p>
            </div>
          </div>

        </div>
      </section>

      {/* TRAINING */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-8 text-center">

          <h2 className="text-2xl font-semibold tracking-tight">Professional Training Tracks</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Upskill with project-based, industry-certified programs.
          </p>

          <div className="grid md:grid-cols-3 gap-12 text-left">
            <div className="p-6 rounded-xl bg-background shadow-md border-l-4 border-blue-600">
              <LibraryBig className="text-blue-600 mb-2" />
              <h4 className="font-semibold">Robotics & AI</h4>
              <p className="text-muted-foreground text-sm">Machine Learning, Mechatronics</p>
            </div>
            <div className="p-6 rounded-xl bg-background shadow-md border-l-4 border-red-600">
              <LibraryBig className="text-red-600 mb-2" />
              <h4 className="font-semibold">3D Modelling</h4>
              <p className="text-muted-foreground text-sm">Fusion 360, Blender, TinkerCAD</p>
            </div>
            <div className="p-6 rounded-xl bg-background shadow-md border-l-4 border-purple-600">
              <LibraryBig className="text-purple-600 mb-2" />
              <h4 className="font-semibold">Software & Simulation</h4>
              <p className="text-muted-foreground text-sm">MATLAB, AutoCAD & SolidWorks</p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA CONTACT */}
      <section className="py-8 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="tracking-tight text-white text-lg mb-4">Ready to Build, Prototype, Innovate?</h2>
          <p className=" text-primary-foreground text-s mb-8">
            Work with us and access the machines, knowledge and engineering culture that builds the future.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigateTo("submit-project")}>
            Get Sarted <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
