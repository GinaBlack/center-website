import { Printer, Layers, Cog, LibraryBig, ArrowRight, Target, Eye, Zap, FlaskConical, Scan, Building2, HeartPulse, Car, Palette, Cpu, GraduationCap, Factory, Diamond } from "lucide-react";
import { Button } from "../../components/ui/button";
import center from "../../assets/images/plack.jpg";

export function AboutPage() {
  const navigateTo = (page: string) => {
    window.location.hash = page;
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative border bg-black/60 py-12 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
              <span className="text-lgx bg-clip-text text-transparent">
                3D Printing High-Tech Center
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Bridging imagination and reality through cutting-edge additive manufacturing technologies.
              Transforming ideas, concepts, and digital models into tangible, high-precision products.
            </p>
          </div>
        </div>
      </section>

      {/* About Introduction */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">About The Center</h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                The 3D Printing High-Tech Center stands as the technological showcase of the
                <span className="font-semibold text-blue-500"> Ecole Nationale Supérieure Polytechnique de Yaoundé</span>,
                and a driving force for innovation in research, experimentation, industrial production, and advanced training.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Built on a foundation of innovation, excellence, sustainability, and knowledge-sharing,
                we provide an ecosystem where creativity meets engineering, where industry meets academia,
                and where future-focused solutions are brought to life.
              </p>
              <div className="pt-4">
                <Button size="lg" onClick={() => navigateTo("submit-project")}>
                  Start Your Project <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full w-full">
                {/* Single Image Container */}
                <div>
                  <img
                    src={center}
                    alt="center photo"
                    className="w-full h-fit object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30"></div>
                </div>

                {/* Bottom Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Our Guiding Principles</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Driving innovation through purpose-driven technology and visionary thinking
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Our Mission</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    To accelerate the transformation of ideas into real, functional solutions
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-blue-500" />
                  </div>
                  Advanced research and experimentation
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-blue-500" />
                  </div>
                  Rapid prototyping and industrial-grade production
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-blue-500" />
                  </div>
                  Training and capacity building for innovators
                </li>
              </ul>
            </div>

            {/* Vision Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Our Vision</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    To become a leading reference hub for technological and industrial innovation
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-purple-500/20">
                <p className="text-sm text-foreground font-medium">
                  Offering the most powerful ecosystem for 3D modeling, manufacturing, product development,
                  and high-impact engineering in the region.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Capabilities */}
      <section className="py-12 dark:bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">What We Offer</h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              One of the most diverse and capable additive manufacturing units in the region
            </p>
          </div>

          {/* First Row: 3 Technology Stack Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="relative group p-8 rounded-2xl bg-gray-500 text-white overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 bg-grid-8"></div>
              <Printer className="w-12 h-12 mb-4 relative" />
              <h4 className="text-lg font-bold mb-2">FDM & PolyJet Technologies</h4>
              <p className="text-white">Dual fabrication architecture for versatility</p>
            </div>
            <div className="relative group p-8 rounded-2xl bg-gray-500 text-white overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10"></div>
              <Layers className="w-12 h-12 mb-4 relative" />
              <h4 className="text-lg font-bold mb-2">20+ Industrial Printers</h4>
              <p className="text-white">High-performance print fleet</p>
            </div>
            <div className="relative group p-8 rounded-2xl bg-gray-500 text-white overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 bg-grid-8"></div>
              <Cog className="w-12 h-12 mb-4 relative" />
              <h4 className="text-lg font-bold mb-2">25+ Materials</h4>
              <p className="text-white">Full multi-material support system</p>
            </div>
          </div>

          {/* Second Row: 3D Scanner and Printer Fleet side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 3D Scanner Card */}
            <div className=" bg-gray-500 dark:bg rounded-2xl p-8 border border-gray-200 h-full">
              <h3 className=" text-2xl text-white font-bold mb-6 flex items-center gap-4">
                <Scan className="w-8 h-8 text-blue-500" />
                High-Precision 3D Scanners
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Millions of measurements per second</p>
                    <p className="text-sm text-gray-300">Ultra-fast scanning</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">0.05mm accuracy</p>
                    <p className="text-sm text-gray-300">High precision capture</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Printer Fleet Card */}
            <div className="bg-gray-500 dark:bg rounded-2xl p-8 border border-gray-200 h-full">
              <h3 className="text-2xl text-white font-bold mb-6 flex items-center gap-4">
                <FlaskConical className="w-8 h-8 text-white" />
                Industrial Printer Fleet
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-1 bg-gray-600/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-white">Fortus F450mc series</span>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-600/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-white">F270 Series</span>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-600/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-white">Uprint SE Series</span>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-600/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-white">Connex 260 Series</span>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-600/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-white">Objet 350 Connex</span>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-600/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  <span className="text-white">Objet Desktop30 Series</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas of Application */}
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Areas of Application</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Powering innovation across multiple sectors with advanced additive manufacturing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              {
                icon: <HeartPulse className="w-8 h-8 text-red-500" />,
                title: "Health & Medicine",
                description: "Prostheses, medical implants, anatomical models",
                color: "border-red-500/20"
              },
              {
                icon: <Car className="w-8 h-8 text-blue-500" />,
                title: "Automotive",
                description: "Custom parts & rapid prototyping",
                color: "border-blue-500/20"
              },
              {
                icon: <Building2 className="w-8 h-8 text-orange-500" />,
                title: "Architecture & Construction",
                description: "Scale models & design visualization",
                color: "border-orange-500/20"
              },
              {
                icon: <Cpu className="w-8 h-8 text-green-500" />,
                title: "Electronics & Robotics",
                description: "PCB housings, functional components",
                color: "border-green-500/20"
              },
              {
                icon: <GraduationCap className="w-8 h-8 text-green-600" />,
                title: "Education & Research",
                description: "Experimental models & teaching tools",
                color: "border-purple-500/20"
              },
              {
                icon: <Palette className="w-8 h-8 text-destructive" />,
                title: "Art, Design & Jewelry",
                description: "Intricate personalized creations",
                color: "border-pink-500/20"
              },
              {
                icon: <Factory className="w-8 h-8 text-blue-600" />,
                title: "Industrial Manufacturing",
                description: "Tooling, molds & production components",
                color: "border-cyan-500/20"
              },
              {
                icon: <Diamond className="w-8 h-8 text-yellow-500" />,
                title: "Consumer Products",
                description: "Customized goods & personalization",
                color: "border-yellow-500/20"
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`group bg-gray-900 p-6 rounded-xl border ${item.color} hover:scale-[1.02] transition-all duration-300 hover:shadow-xl`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training & Education */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Professional Training Tracks</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Upskill with project-based, industry-certified programs designed for the future
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <LibraryBig className="w-8 h-8 text-blue-600" />,
                title: "Robotics & AI Integration",
                description: "Machine Learning, Computer Vision, Mechatronics",
                features: ["Autonomous Systems", "Sensor Integration", "AI Algorithms"],
                color: "border-l-blue-500"
              },
              {
                icon: <Printer className="w-8 h-8 text-red-500" />,
                title: "3D Design & Modeling",
                description: "Industry-standard CAD/CAM software mastery",
                features: ["Fusion 360", "Blender", "SolidWorks", "TinkerCAD"],
                color: "border-l-red-500"
              },
              {
                icon: <Cog className="w-8 h-8 text-green-600" />,
                title: "Software & Simulation",
                description: "Advanced engineering software proficiency",
                features: ["MATLAB", "AutoCAD", "FEA Analysis", "CFD Simulation"],
                color: "border-l-purple-500"
              }
            ].map((track, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 ${track.color} border-l-4`}
              >
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex  items-center justify-center mb-4">
                    {track.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-2">{track.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{track.description}</p>
                </div>
                <div className="space-y-2">
                  {track.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 border relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 text-white mb-8 shadow-lg">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Why We Exist</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white text-smx font-bold tracking-tight mb-6">
            Because innovation needs more than imagination
          </h2>
          <p className=" text-white text-sm mb-8 leading-relaxed">
            It needs space, tools, expertise, and the freedom to experiment.
            At the 3D Printing High-Tech Center, we turn creativity into production,
            concepts into models, and challenges into engineered solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigateTo("submit-project")} className="px-8">
              Start Your Innovation Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigateTo("materials")}>
              Explore Our Materials Library
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
export default AboutPage
