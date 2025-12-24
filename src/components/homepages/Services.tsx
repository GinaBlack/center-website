import { ImageWithFallback } from "../ImgSrc/ImageWithFallback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {Button} from "../../components/ui/button";
import { Award, Boxes, Camera, ToyBrick, CheckCircle, ArrowRight, Printer, Box, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";



//service images
import s1 from  "../../assets/Services/s1.jpg"
import s2 from  "../../assets/Services/s2.jpeg"
import s3 from  "../../assets/Services/s3.png"
import s4 from  "../../assets/Services/s4.png"
import s5 from  "../../assets/Services/s5.png"
import s6 from  "../../assets/Services/s6.jpg"
import path from "path";
const services = [
  {
    image: s1,
    title: "Rapid Prototyping",
    description: "Realistic, rapid production using a variety of 3D printing technologies and materials.",
    button: "Submit Your Project",
    path: "/dashboard/projects/upload" 
  },
  {
    image: s2,
    title: "Production Parts",
    description: "Scalable manufacturing solutions for end-use parts with industrial-grade materials and finishes.",
    button: "Submit Your Project",
    path: "/dashboard/projects/upload"
  },
  {
    image: s3,
    title: "Trainings",
    description: "Beginner to advanced level training programs in 3D printing, CAD, and High-Tech.",
    button: "View Our Training Courses",
    path: "/workshops" 
  },
  {
    image: s4,
    title: "Post Processing",
    description: "Comprehensive post-processing services to achieve the desired finish.",
    button: "See Available Options",
    path: "/contact"
  },
  {
    image: s5,
    title: "Design Support",
    description: "Expert guidance to optimize your designs for 3D printing and manufacturability.",
    button: "Get Design Assistance",
    path: "/contact"
  },
  {
    image: s6,
    title: "3D Scanning",
    description: "High-precision 3D scanning services for reverse engineering, quality control, and digital archiving.",
    button: "Request a Scan",
    path: "/dashboard/scanning"
  },
];

const assets = [
  {
    icon: Printer,
    title: "3D Printers",
    description: "20+ industrial-grade 3D printers utilizing FDM, SLA, SLS, and PolyJet technologies to cater to diverse prototyping and production needs.",
    button: "See Printers",
    path: "/materials" 
  },
  {
    icon: Boxes,
    title: "Materials",
    description: "25+ material options including various thermoplastics, resins, and composites to suit different application requirements and in a variety of colours.",
    button: "See Materials",
    path: "/materials"
  },
  {
    icon: Home,
    title: "Rental Spaces",
    description: "Equipped workstations, Available Halls for Seminars, Meeting, Workshops, Research, and Team projects with 24/7 access to our facility and expert support.",
    button: "See Available Spaces",
    path: "/gallery"
  },
  {
    icon: Camera,
    title: "3D Scanners",
    description: "2+ high-precision 3D scanners for accurate digital capture of physical objects, ideal for reverse engineering and quality inspection.",
    button: "Request for 3D Scanning",
    path: "/dashboard/scanning"
  },
  {
    icon: Award,
    title: "Certifications",
    description: "Recognized certifications in 3D printing technologies and design software, ensuring high standards of quality and expertise.",
    button: "View Training Certification Courses",
    path: "/workshops"
  },
];

const technologies = [
  {
    icon: Printer,
    title: "FDM Technology",
    description: "An extrusion-based additive process that is easy to use and accessible. It employs a broad range of thermoplastics suitable for durable applications ranging from functional prototyping to tooling to production parts.",
  },
  {
    icon: ToyBrick,
    title: "PolyJet Technology",
    description: "A high-resolution, photopolymer-based additive process that is precise and versatile. It employs a wide range of liquid resins capable of simulating diverse material properties, from rigid to flexible and opaque to transparent, making it ideal for creating complex prototypes, molds, and multi-material parts",
  },
];
export function Services() {

  const navigate = useNavigate(); 
  
  const navigateTo = (path: string) => {
    navigate(path); 
  };
  return (
    <>
    <section id="services" className="py-8 lg:py-8 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4">
        <div className=" max-w-3xl  mb-6">
          <h2 className="tracking-tight text-lgx ml-2">Our Services</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.title} className="hover:shadow-lg transition-shadow">
              <ImageWithFallback src={service.image} alt={service.title} className="w-full h-temp object-fit overflow-hidden" />
              <CardHeader>
                <CardTitle className="text-lg pb-4" >{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pt-6 justify-right flex">
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => navigateTo(service.path)}
                  >
                    {service.button}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    <section id="assets" className="py-8 lg:py-8 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4">
        <div className=" max-w-3xl  mb-6">
          <h2 className="tracking-tight text-lgx ml-2">We Have</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((assets) => (
            <Card key={assets.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black  border-2  rounded-lg flex items-center justify-center flex-shrink-0 ">
                  <assets.icon className="w-8 h-8 text-white " />
                </div>
                <CardTitle className="text-lg">{assets.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{assets.description}</CardDescription>
                <div className="justify-right  flex">
                  <button 
                  className="text-blue-500 flex pt-6 text-md items-center gap-2 hover:underline"
                  onClick={() => navigateTo(assets.path)}
                  >
                    {assets.button}
                    <ArrowRight className="w-6 h-6 "/>
                    </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
    <section className="py-8 lg:py-8 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4">
        <div className=" max-w-3xl  mb-6">
          <h2 className="tracking-tight text-lgx ml-2">Available Technologies</h2>
        </div>
          <div className=" grid  gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">
                      {technologies.map((service) => (
                        <Card key={service.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className=" p-4 ">
                            <div className="flex items-center justify-start gap-4">
                                <div className="w-12 h-12 bg-black  border-2 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <service.icon className="w-8 h-8 text-white" />
                                </div>
                                  <h2 className="tracking-tight text-xl font-semibold">{service.title}</h2>
                              </div>
                              <div className="flex items-center gap-8 mt-4">
                                  <p className="text-muted-foreground mt-1">{service.description}</p>
                              </div>
                          </div>
                        </Card>
                      ))}
                    </div>
        </div>
    </section>
    </>
  );
}