import { useState } from "react";
import { ImageWithFallback } from "./ImgSrc/ImageWithFallback";
import { Badge } from "./ui/badge";

const projects = [
  {
    id: 1,
    title: "Industrial Prototype",
    category: "Industrial",
    image: "../assets/gallery/industrial/tubes.jpg",
    description: "Functional prototype for industrial equipment",
  },
  {
    id: 2,
    title: "Product Design",
    category: "Education & Rsearch",
    image: "../assets/gallery/custom/Screenshot 2025-12-01 022202.png",
    description: "Custom consumer product prototype",
  },
  {
    id: 3,
    title: "Manufacturing Parts",
    category: "Industrial",
    image: "../assets/gallery/industrial/gear.png",
    description: "End-use parts for industrial applications",
  },
  {
    id: 4,
    title: "Workshops & Training ",
    category: "Education & Rsearch",
    image: "../assets/gallery/edu&research/Screenshot 2025-12-01 022021.png",
    description: "High-fidelity product design mockup and production training ",
  },
  {
    id: 6,
    title: "Dentures",
    category: "Health",
    image: "../assets/gallery/health/dentals.jpg",
    description: "Advanced 3D printing technology ",
  },
  {
    id: 7,
    title: "Robotic Hand",
    category: "Robotics",
    image:"../assets/gallery/robotics/hand.jpg",
    description: "Advanced 3D printing technology ",
  },
];

const categories = ["All", "Industrial", "Robotics", "Art & Custom", "Education & Rsearch", "Consumer Products","Rent Spaces", "Architecture","Health"];

export function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  return (
    <section id="portfolio" className="py-12 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="tracking-tight mb-4">Our Portfolio</h2>
          <p className="text-muted-foreground">
            Explore our recent projects and see the quality of work we deliver to our clients
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <ImageWithFallback
                src={project.image}
                alt={project.title}
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <Badge variant="secondary" className="mb-2">
                    {project.category}
                  </Badge>
                  <h3 className="tracking-tight mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-200">{project.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { useState } from "react";
import { ImageWithFallback } from "./ImgSrc/ImageWithFallback";
import { Badge } from "./ui/badge";

const projects = [
  {
    id: 1,
    title: "Industrial Prototype",
    category: "Industrial",
    image: "../assets/gallery/industrial/tubes.jpg",
    description: "Functional prototype for industrial equipment",
  },
  {
    id: 2,
    title: "Product Design",
    category: "Education & Rsearch",
    image: "../assets/gallery/custom/Screenshot 2025-12-01 022202.png",
    description: "Custom consumer product prototype",
  },
  {
    id: 3,
    title: "Manufacturing Parts",
    category: "Industrial",
    image: "../assets/gallery/industrial/gear.png",
    description: "End-use parts for industrial applications",
  },
  {
    id: 4,
    title: "Workshops & Training ",
    category: "Education & Rsearch",
    image: "../assets/gallery/edu&research/Screenshot 2025-12-01 022021.png",
    description: "High-fidelity product design mockup and production training ",
  },
  {
    id: 5,
    title: "Rentable Spaces",
    category: "Rent Spaces",
    image: "../assets/gallery/rentspace/DSC_0109.jpg",
    description: "Available Workspaces for 3D Printing Projects",
  },
  {
    id: 6,
    title: "Dentures",
    category: "Health",
    image: "../assets/gallery/health/dentals.jpg",
    description: "Advanced 3D printing technology ",
  },
  {
    id: 7,
    title: "Robotic Hand",
    category: "Robotics",
    image:"../assets/gallery/robotics/hand.jpg",
    description: "Advanced 3D printing technology ",
  },
];

const categories = ["All", "Industrial", "Robotics", "Art & Custom", "Education & Rsearch", "Consumer Products","Rent Spaces", "Architecture","Health"];

export function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  return (
    <section id="portfolio" className="py-12 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="tracking-tight mb-4">Our Portfolio</h2>
          <p className="text-muted-foreground">
            Explore our recent projects and see the quality of work we deliver to our clients
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <ImageWithFallback
                src={project.image}
                alt={project.title}
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <Badge variant="secondary" className="mb-2">
                    {project.category}
                  </Badge>
                  <h3 className="tracking-tight mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-200">{project.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
